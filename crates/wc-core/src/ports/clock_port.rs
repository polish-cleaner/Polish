//! Clock port — testable time. Manifest uses ISO-8601 UTC.

#[cfg_attr(test, mockall::automock)]
pub trait ClockPort: Send + Sync {
    fn now_iso8601(&self) -> String;
}
