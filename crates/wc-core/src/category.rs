//! Cleanup category trait + distributed registration via `inventory`.
//!
//! See ARCHITECTURE.md §4. Contributors add one file to
//! `wc-adapters/src/categories/` and call `inventory::submit!` — no central
//! registry edit required.

use crate::environment::Environment;
use crate::pipeline::Finding;

/// Safety tier classifying how aggressive a category is.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SafetyTier {
    /// Safe-by-default. Caches, recycle bin.
    Light,
    /// User confirms aggregate. Browser data, package caches.
    Balanced,
    /// Per-item confirm. Telemetry, OEM bloat.
    Aggressive,
    /// Pro-tier only. Format Prep, full Dev/AI catalog (v1.2+).
    Pro,
}

/// Product version a category was introduced in.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[allow(non_camel_case_types)]
pub enum Version {
    V1_0,
    V1_1,
    V1_2_Pro,
    V2_0,
}

/// Stable identifier for a category. Format: `<scope>.<tool>.<artifact>`.
pub type CategoryId = &'static str;

/// Read-only context passed to `Category::scan()`. Extended as needed.
#[non_exhaustive]
#[derive(Debug, Default)]
pub struct ScanContext {
    pub environment: Environment,
}

/// A cleanup category. Implemented in `wc-adapters/src/categories/<id>.rs`.
pub trait Category: Send + Sync + 'static {
    fn id(&self) -> CategoryId;
    fn name(&self) -> &'static str;
    fn safety_tier(&self) -> SafetyTier;
    fn version_intro(&self) -> Version;
    fn supports(&self, env: &Environment) -> bool;
    fn scan(&self, ctx: &ScanContext) -> Vec<Finding>;
}

/// Inventory entry. Each category submits one of these from its module.
pub struct CategoryEntry {
    pub category: &'static dyn Category,
}

inventory::collect!(CategoryEntry);

/// Iterate every registered category at runtime.
pub fn registered_categories() -> impl Iterator<Item = &'static dyn Category> {
    inventory::iter::<CategoryEntry>
        .into_iter()
        .map(|e| e.category)
}
