//! Cleanup categories. One file per category per ARCHITECTURE.md §4 + §7.
//!
//! v1.0 ships:
//! - Dev caches: npm, pnpm, cargo
//! - Browser caches: chrome, edge, firefox
//! - Windows system: temp, logs

pub mod cargo_cache;
pub mod chrome_cache;
pub mod edge_cache;
pub mod firefox_cache;
pub mod npm_cache;
pub mod pnpm_cache;
pub mod windows_logs;
pub mod windows_temp;
