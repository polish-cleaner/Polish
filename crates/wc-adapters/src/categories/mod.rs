//! Cleanup categories. One file per category per ARCHITECTURE.md §4 + §7.
//!
//! v1.0 ships three: npm, pnpm, cargo. Add modules here as they land.

pub mod cargo_cache;
pub mod npm_cache;
pub mod pnpm_cache;
