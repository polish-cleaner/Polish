//! Windows registry port. Concrete impl in `wc-adapters::registry`.

#[derive(Debug, thiserror::Error)]
pub enum RegError {
    #[error("key not found: {key}")]
    NotFound { key: String },
    #[error("access denied")]
    AccessDenied,
}

#[cfg_attr(test, mockall::automock)]
pub trait RegPort: Send + Sync {
    fn read_string(&self, hive: &str, key: &str, value: &str) -> Result<String, RegError>;
}
