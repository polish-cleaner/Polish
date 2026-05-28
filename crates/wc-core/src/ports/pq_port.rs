//! `.pq` bundle writer port.
//!
//! Segmented sub-archive + BLAKE3 verify-on-restore per PROJECT.md §9
//! (`.pq` corruption mitigation row). Concrete impl in `wc-adapters::pq_writer`.

use std::path::{Path, PathBuf};

#[derive(Debug, thiserror::Error)]
pub enum PqError {
    #[error("bundle integrity check failed")]
    Corrupt,
    #[error("manifest malformed: {0}")]
    Manifest(String),
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

#[cfg_attr(test, mockall::automock)]
pub trait PqPort: Send + Sync {
    /// Pack `items` into a `.pq` bundle at `out`.
    fn pack(&self, items: Vec<PathBuf>, out: &Path) -> Result<(), PqError>;
    /// Unpack `bundle` under `dest_root`, restoring original layout.
    fn unpack(&self, bundle: &Path, dest_root: &Path) -> Result<(), PqError>;
    /// Verify bundle integrity without unpacking.
    fn verify(&self, bundle: &Path) -> Result<(), PqError>;
}
