//! In-flight journal file for atomic `.pq` bundle writes.
//!
//! Records the intent to create a bundle so a crashed/interrupted pack
//! can be detected and rolled back by a future repair pass. The
//! journal is removed after the atomic rename of the final `.pq`
//! succeeds.
//!
//! Format is plain text, one field per line:
//! ```text
//! bundle_id=<uuid-or-name>
//! started_at=<ISO-8601 UTC>
//! source_count=<n>
//! ```

use std::fs::File;
use std::io::{self, Write};
use std::path::Path;
use time::format_description::well_known::Iso8601;
use time::OffsetDateTime;

/// Write a fresh journal at `path` describing a pack about to begin.
pub fn write_start(path: &Path, bundle_id: &str, source_count: usize) -> io::Result<()> {
    let now = OffsetDateTime::now_utc()
        .format(&Iso8601::DEFAULT)
        .map_err(|e| io::Error::new(io::ErrorKind::Other, e))?;
    let mut f = File::create(path)?;
    writeln!(f, "bundle_id={bundle_id}")?;
    writeln!(f, "started_at={now}")?;
    writeln!(f, "source_count={source_count}")?;
    f.sync_all()?;
    Ok(())
}

/// Remove the journal file. Tolerates the file already being gone
/// (idempotent cleanup).
pub fn remove(path: &Path) -> io::Result<()> {
    match std::fs::remove_file(path) {
        Ok(()) => Ok(()),
        Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(()),
        Err(e) => Err(e),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn write_start_creates_readable_journal() {
        let tmp = TempDir::new().expect("tempdir");
        let p = tmp.path().join("b.journal");
        write_start(&p, "bundle-xyz", 7).expect("write");
        let body = fs::read_to_string(&p).expect("read");
        assert!(body.contains("bundle_id=bundle-xyz"));
        assert!(body.contains("started_at="));
        assert!(body.contains("source_count=7"));
    }

    #[test]
    fn remove_is_idempotent() {
        let tmp = TempDir::new().expect("tempdir");
        let p = tmp.path().join("nope.journal");
        // missing
        remove(&p).expect("remove missing ok");
        // present
        fs::write(&p, b"x").expect("seed");
        remove(&p).expect("remove present ok");
        assert!(!p.exists());
    }
}
