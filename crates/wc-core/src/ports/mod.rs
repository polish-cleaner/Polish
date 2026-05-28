//! Outbound port trait definitions.
//!
//! Domain owns these traits. `wc-adapters` provides concrete impls per
//! ARCHITECTURE.md §2. Every port carries `#[cfg_attr(test, mockall::automock)]`
//! so use-case tests can swap in fakes.

pub mod clock_port;
pub mod fs_port;
pub mod notify_port;
pub mod pq_port;
pub mod reg_port;
pub mod signing_port;
pub mod wsl_port;

pub use clock_port::ClockPort;
pub use fs_port::{FsError, FsPort};
pub use notify_port::{NotifyError, NotifyPort};
pub use pq_port::{PqError, PqPort};
pub use reg_port::{RegError, RegPort};
pub use signing_port::{SigningError, SigningPort};
pub use wsl_port::{WslError, WslPort};
