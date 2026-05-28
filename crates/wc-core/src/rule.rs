//! `CleanupRule` trait — rules a category emits to describe a finding's
//! disposition. Stub for v1.0 scaffold; full shape lands with first real
//! category implementation.

/// Marker trait for rules emitted by a [`crate::Category`].
pub trait CleanupRule: Send + Sync {}
