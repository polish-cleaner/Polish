//! `.pq` bundle writer port.
//!
//! Segmented sub-archive + BLAKE3 verify-on-restore per PROJECT.md §9
//! (`.pq` corruption mitigation row). Concrete impl in `wc-adapters::pq_writer`.

use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

#[derive(Debug, thiserror::Error)]
pub enum PqError {
    #[error("bundle integrity check failed")]
    Corrupt,
    #[error("manifest malformed: {0}")]
    Manifest(String),
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

/// Per-pack result. `skipped` carries paths the writer chose to drop
/// rather than fail the whole bundle for: NotFound (file vanished
/// mid-pack — common in `%TEMP%` which churns under us) and
/// PermissionDenied (locked by another process race). Anything else
/// remains a hard error via `PqError`.
#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct PackOutcome {
    pub packed_count: usize,
    pub skipped: Vec<PathBuf>,
}

#[cfg_attr(test, mockall::automock)]
pub trait PqPort: Send + Sync {
    /// Pack `items` into a `.pq` bundle at `out`. Returns the count
    /// actually written + the list of items the writer silently
    /// skipped (race-deleted or race-locked between caller's
    /// pre-flight and the writer's read).
    fn pack(&self, items: Vec<PathBuf>, out: &Path) -> Result<PackOutcome, PqError>;
    /// Unpack `bundle` under `dest_root`, restoring original layout.
    fn unpack(&self, bundle: &Path, dest_root: &Path) -> Result<(), PqError>;
    /// Verify bundle integrity without unpacking.
    fn verify(&self, bundle: &Path) -> Result<(), PqError>;
}
