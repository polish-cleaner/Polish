//! Filesystem port. Concrete impl in `wc-adapters::fs`.

use std::path::Path;

#[derive(Debug, thiserror::Error)]
pub enum FsError {
    #[error("path not found")]
    NotFound,
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

#[cfg_attr(test, mockall::automock)]
pub trait FsPort: Send + Sync {
    fn exists(&self, path: &Path) -> bool;
    fn read(&self, path: &Path) -> Result<Vec<u8>, FsError>;
    fn write(&self, path: &Path, data: &[u8]) -> Result<(), FsError>;
    fn delete(&self, path: &Path) -> Result<(), FsError>;
    fn move_file(&self, from: &Path, to: &Path) -> Result<(), FsError>;
}
