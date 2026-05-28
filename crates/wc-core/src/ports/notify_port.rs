//! Windows toast notification port (WinRT + AUMID).
//! Concrete impl in `wc-adapters::notification`.

#[derive(Debug, thiserror::Error)]
pub enum NotifyError {
    #[error("WinRT call failed: {0}")]
    WinRt(String),
}

#[cfg_attr(test, mockall::automock)]
pub trait NotifyPort: Send + Sync {
    fn toast(&self, title: &str, body: &str) -> Result<(), NotifyError>;
}
