//! WSL port. Wraps `wsl --manage --resize` (GA in WSL 2.5+).
//! Concrete impl in `wc-adapters::wsl`.

#[derive(Debug, thiserror::Error)]
pub enum WslError {
    #[error("wsl not installed")]
    NotInstalled,
    #[error("distro not found: {0}")]
    DistroNotFound(String),
    #[error("wsl command failed: {0}")]
    CommandFailed(String),
}

#[cfg_attr(test, mockall::automock)]
pub trait WslPort: Send + Sync {
    fn list_distros(&self) -> Result<Vec<String>, WslError>;
    /// Shrink a distro's VHDX. Returns bytes reclaimed.
    fn shrink(&self, distro: &str) -> Result<u64, WslError>;
}
