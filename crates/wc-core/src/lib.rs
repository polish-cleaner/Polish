//! `wc-core` — Polish pure domain layer.
//!
//! Codename `wc-core`; design docs (ARCHITECTURE.md, PLAN.md) refer to this
//! crate as `polish-core`. Same crate, two names — see AGENTS.md.
//!
//! Hexagonal architecture (ARCHITECTURE.md §1): this crate has **zero**
//! workspace dependencies. It defines domain types and outbound port traits;
//! infrastructure crates implement the ports.

#![forbid(unsafe_code)]

pub mod category;
pub mod environment;
pub mod manifest;
pub mod pipeline;
pub mod ports;
pub mod quarantine;
pub mod rule;

pub use category::{
    registered_categories, Category, CategoryEntry, CategoryId, SafetyTier, ScanContext, Version,
};
pub use environment::Environment;
pub use pipeline::{Cleanup, Finding};
pub use rule::CleanupRule;
