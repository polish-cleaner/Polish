//! Restore a `.pq` bundle. Delegates to [`PqPort::unpack`] which performs
//! BLAKE3 verify-on-restore per PROJECT.md §9.

use std::path::Path;
use wc_core::ports::pq_port::{PqError, PqPort};

#[derive(Debug, thiserror::Error)]
pub enum RestoreError {
    #[error("bundle unpack failed")]
    Unpack(#[source] PqError),
}

pub fn run<P: PqPort>(port: &P, bundle: &Path, dest_root: &Path) -> Result<(), RestoreError> {
    port.unpack(bundle, dest_root).map_err(RestoreError::Unpack)
}
