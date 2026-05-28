//! Quarantine domain model. `.pq` bundle = quarantine package.
//!
//! Real implementation lives in `wc-adapters::pq_writer` per ARCHITECTURE.md §2.

use std::path::PathBuf;

#[derive(Debug, thiserror::Error)]
pub enum QuarantineError {
    #[error("source path does not exist: {path}")]
    SourceMissing { path: PathBuf },

    #[error("insufficient disk space: need {needed} bytes, have {available}")]
    InsufficientSpace { needed: u64, available: u64 },

    #[error("cross-volume move failed")]
    CrossVolume {
        #[source]
        source: std::io::Error,
    },

    #[error("bundle integrity check failed")]
    BundleCorrupt,

    #[error(transparent)]
    Io(#[from] std::io::Error),
}
