//! Execute a previewed cleanup: pack findings into a `.pq` bundle via
//! [`PqPort`], then delete originals on the host filesystem.
//!
//! Delete order is "pack first, delete after" — if `pack` fails, originals
//! survive. Per-finding remove errors are returned without rollback (the
//! bundle still holds the data, so user can restore).

use std::path::{Path, PathBuf};
use wc_core::pipeline::{Executed, Previewed};
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

pub fn run<P: PqPort>(
    plan: Cleanup<Previewed>,
    port: &P,
    bundle: &Path,
) -> Result<Cleanup<Executed>, ExecuteError> {
    let paths: Vec<PathBuf> = plan.findings().iter().map(|f| f.path.clone()).collect();
    port.pack(paths.clone(), bundle)
        .map_err(ExecuteError::Pack)?;
    for path in &paths {
        std::fs::remove_file(path).map_err(|source| ExecuteError::Delete {
            path: path.clone(),
            source,
        })?;
    }
    Ok(plan.execute())
}
