//! `wc-adapters` — concrete adapters implementing `wc-core` ports.
//!
//! v1.0 in-progress modules below. The deeper plumbing (pq_writer, notification,
//! signing) lands after the Tauri+service IPC critical spike
//! (PROJECT.md §11 Week 1–3).

// `deny` (not `forbid`) so the single MoveFileExW call in pq_writer::atomic
// can opt in via `#[allow(unsafe_code)]` on that one function only.
#![deny(unsafe_code)]

pub mod categories;
pub mod env;
pub mod pq_writer;
pub mod scan_util;
// pub mod fs;
// pub mod registry;
// pub mod wsl;
// pub mod notification;
// pub mod signing;

pub use env::detect_environment;

/// Force the linker to keep `wc-adapters` symbols in the final binary so
/// `inventory::submit!` entries register. Call once near the top of `main()`.
pub fn ensure_linked() {}
