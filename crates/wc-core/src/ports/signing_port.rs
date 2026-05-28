//! Code-signing provider port.
//!
//! v1.0 primary: Microsoft Artifact Signing (PLAN.md §14.2).
//! Fallback 1: Certum Open Source. Fallback 2: SignPath Foundation.
//! Concrete impl in `wc-adapters::signing`.

#[derive(Debug, thiserror::Error)]
pub enum SigningError {
    #[error("signing provider unavailable")]
    Unavailable,
    #[error("identity validation pending")]
    PendingValidation,
    #[error("provider returned error: {0}")]
    Provider(String),
}

#[cfg_attr(test, mockall::automock)]
pub trait SigningPort: Send + Sync {
    fn sign(&self, artifact_bytes: &[u8]) -> Result<Vec<u8>, SigningError>;
}
