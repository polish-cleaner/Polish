//! Execute a previewed cleanup: pack findings into a `.pq` bundle via
//! [`PqPort`], then delete originals on the host filesystem.
//!
//! Pre-flights each finding by attempting to open it for reading. Files
//! that can't be opened (locked by another process, permission denied)
//! land in `locked_files`. If any are locked and `skip_locked` is
//! false, the call short-circuits with `needs_user_decision = true`
//! and the bundle is NOT written — caller (CLI / UI) decides whether
//! to retry with `skip_locked = true`.
//!
//! Delete order is "pack first, delete after" — if `pack` fails, originals
//! survive. Per-finding remove errors are returned without rollback (the
//! bundle still holds the data, so user can restore).

use std::path::{Path, PathBuf};

use rayon::iter::Either;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use wc_core::pipeline::Previewed;
use wc_core::ports::pq_port::{PqError, PqPort};
use wc_core::Cleanup;

#[derive(Debug, thiserror::Error)]
pub enum ExecuteError {
    #[error("bundle pack failed")]
    Pack(#[source] PqError),
    #[error("failed to delete {path}: {source}")]
    Delete {
        path: PathBuf,
        #[source]
        source: std::io::Error,
    },
}

/// Result of a quarantine attempt. Returned via Ok so that the
/// "needs user decision" case isn't conflated with hard errors.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecuteOutcome {
    /// Files quarantined and deleted from disk.
    pub packed_count: usize,
    /// Files that couldn't be opened for reading. Populated either as
    /// the "decision pending" list (when `needs_user_decision`) or as
    /// the "actually skipped" list (when `skip_locked` was true).
    pub locked_files: Vec<PathBuf>,
    /// True iff the function short-circuited because `skip_locked`
    /// was false and at least one file was locked. Bundle was NOT
    /// written; originals were NOT touched.
    pub needs_user_decision: bool,
}

pub fn run<P: PqPort>(
    plan: Cleanup<Previewed>,
    port: &P,
    bundle: &Path,
    skip_locked: bool,
) -> Result<ExecuteOutcome, ExecuteError> {
    let paths: Vec<PathBuf> = plan.findings().iter().map(|f| f.path.clone()).collect();
    let (readable, locked) = partition_readable(&paths);

    if !locked.is_empty() && !skip_locked {
        return Ok(ExecuteOutcome {
            packed_count: 0,
            locked_files: locked,
            needs_user_decision: true,
        });
    }

    port.pack(readable.clone(), bundle)
        .map_err(ExecuteError::Pack)?;
    for path in &readable {
        std::fs::remove_file(path).map_err(|source| ExecuteError::Delete {
            path: path.clone(),
            source,
        })?;
    }
    Ok(ExecuteOutcome {
        packed_count: readable.len(),
        locked_files: locked,
        needs_user_decision: false,
    })
}

/// Split `paths` into (readable, locked). A path is "locked" when
/// `File::open` fails with `PermissionDenied` or the Windows
/// sharing-violation code (raw os error 32). Any other open error
/// (e.g., `NotFound`) lands in `readable` so the downstream pack
/// surfaces it as a normal Pack error with full path context.
///
/// Parallelized with rayon because Windows Defender amplifies each
/// `File::open` by 10–100 ms on cache directories. Sequential over
/// 24k Chrome cache files = minutes; parallel = seconds.
fn partition_readable(paths: &[PathBuf]) -> (Vec<PathBuf>, Vec<PathBuf>) {
    paths
        .par_iter()
        .map(|p| {
            if is_locked(p) {
                Either::Right(p.clone())
            } else {
                Either::Left(p.clone())
            }
        })
        .partition_map(|e| e)
}

fn is_locked(path: &Path) -> bool {
    match std::fs::File::open(path) {
        Ok(_) => false,
        Err(e) => {
            let kind = e.kind();
            let os = e.raw_os_error();
            kind == std::io::ErrorKind::PermissionDenied || os == Some(32)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;
    use wc_core::pipeline::Scanned;
    use wc_core::Finding;

    fn make_plan(paths: &[PathBuf]) -> Cleanup<Previewed> {
        let findings: Vec<Finding> = paths
            .iter()
            .map(|p| Finding {
                path: p.clone(),
                size: 0,
                category_id: "test".into(),
            })
            .collect();
        Cleanup::<Scanned>::new(findings).preview()
    }

    /// Stub PqPort that records what was packed and never fails.
    /// `Mutex` (not `RefCell`) so the type stays `Sync` — `PqPort`
    /// is `Send + Sync` per its trait bounds.
    #[derive(Default)]
    struct OkPort {
        packed: std::sync::Mutex<Vec<PathBuf>>,
    }

    impl PqPort for OkPort {
        fn pack(&self, items: Vec<PathBuf>, _out: &Path) -> Result<(), PqError> {
            *self.packed.lock().expect("mutex") = items;
            Ok(())
        }
        fn unpack(&self, _bundle: &Path, _dest_root: &Path) -> Result<(), PqError> {
            Ok(())
        }
        fn verify(&self, _bundle: &Path) -> Result<(), PqError> {
            Ok(())
        }
    }

    #[test]
    fn packs_and_deletes_when_everything_readable() {
        let tmp = TempDir::new().expect("tmp");
        let a = tmp.path().join("a.bin");
        let b = tmp.path().join("b.bin");
        fs::write(&a, b"alpha").expect("write a");
        fs::write(&b, b"beta").expect("write b");

        let plan = make_plan(&[a.clone(), b.clone()]);
        let port = OkPort::default();
        let outcome = run(plan, &port, &tmp.path().join("out.pq"), false).expect("run");

        assert_eq!(outcome.packed_count, 2);
        assert!(outcome.locked_files.is_empty());
        assert!(!outcome.needs_user_decision);
        assert!(!a.exists(), "original a should be deleted");
        assert!(!b.exists(), "original b should be deleted");
    }

    #[test]
    fn empty_findings_succeeds_with_zero_outcome() {
        let tmp = TempDir::new().expect("tmp");
        let plan = make_plan(&[]);
        let port = OkPort::default();
        let outcome = run(plan, &port, &tmp.path().join("out.pq"), false).expect("run");

        assert_eq!(outcome.packed_count, 0);
        assert!(outcome.locked_files.is_empty());
        assert!(!outcome.needs_user_decision);
    }

    #[test]
    fn missing_file_does_not_count_as_locked_and_propagates_as_pack_error() {
        // is_locked() returns false for NotFound; so it falls through
        // to pack(), which would return Err. To assert this in the use
        // case, swap in a port that errors on pack.
        struct ErrPort;
        impl PqPort for ErrPort {
            fn pack(&self, _i: Vec<PathBuf>, _o: &Path) -> Result<(), PqError> {
                Err(PqError::Io(std::io::Error::new(
                    std::io::ErrorKind::NotFound,
                    "missing",
                )))
            }
            fn unpack(&self, _b: &Path, _d: &Path) -> Result<(), PqError> {
                Ok(())
            }
            fn verify(&self, _b: &Path) -> Result<(), PqError> {
                Ok(())
            }
        }
        let tmp = TempDir::new().expect("tmp");
        let phantom = tmp.path().join("does-not-exist.bin");
        let plan = make_plan(&[phantom]);
        let port = ErrPort;
        let err = run(plan, &port, &tmp.path().join("out.pq"), false)
            .expect_err("expected pack error to surface");
        assert!(matches!(err, ExecuteError::Pack(_)));
    }
}
