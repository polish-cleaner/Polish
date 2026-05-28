//! cargo registry cache + extracted sources. Both are regenerable.
//!
//! Scans `~/.cargo/registry/cache` (downloaded `.crate` tarballs) and
//! `~/.cargo/registry/src` (unpacked sources). Does **not** touch
//! `~/.cargo/bin` (installed binaries) or `~/.cargo/git/` (clones — slower
//! to regenerate; defer to Aggressive tier).

use std::path::PathBuf;
use wc_core::{
    Category, CategoryEntry, CategoryId, Environment, Finding, SafetyTier, ScanContext, Version,
};

use crate::scan_util::scan_many;

pub struct CargoCacheCategory;

impl CargoCacheCategory {
    pub const ID: CategoryId = "dev.cargo.cache";

    fn cache_roots() -> Vec<PathBuf> {
        if let Some(test) = std::env::var_os("WC_TEST_CARGO_REGISTRY_ROOT") {
            let root = PathBuf::from(test);
            return vec![root.join("cache"), root.join("src")];
        }
        let Some(cargo_home) = cargo_home() else {
            return Vec::new();
        };
        let registry = cargo_home.join("registry");
        vec![registry.join("cache"), registry.join("src")]
    }
}

fn cargo_home() -> Option<PathBuf> {
    if let Some(explicit) = std::env::var_os("CARGO_HOME") {
        return Some(PathBuf::from(explicit));
    }
    std::env::var_os("USERPROFILE").map(|home| PathBuf::from(home).join(".cargo"))
}

impl Category for CargoCacheCategory {
    fn id(&self) -> CategoryId {
        Self::ID
    }
    fn name(&self) -> &'static str {
        "cargo registry cache (~/.cargo/registry/{cache,src})"
    }
    fn safety_tier(&self) -> SafetyTier {
        SafetyTier::Balanced
    }
    fn version_intro(&self) -> Version {
        Version::V1_0
    }
    fn supports(&self, env: &Environment) -> bool {
        env.has_cargo()
    }
    fn scan(&self, _ctx: &ScanContext) -> Vec<Finding> {
        let roots = Self::cache_roots();
        let refs: Vec<&std::path::Path> = roots.iter().map(|p| p.as_path()).collect();
        scan_many(&refs, Self::ID)
    }
}

inventory::submit! { CategoryEntry { category: &CargoCacheCategory } }

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn supports_only_when_cargo_present() {
        let mut env = Environment::default();
        assert!(!CargoCacheCategory.supports(&env));
        env.has_cargo = true;
        assert!(CargoCacheCategory.supports(&env));
    }

    #[test]
    fn scan_honors_test_env_var_across_cache_and_src() {
        let tmp = TempDir::new().expect("tempdir");
        fs::create_dir_all(tmp.path().join("cache/index.crates.io")).expect("mkdir");
        fs::create_dir_all(tmp.path().join("src/index.crates.io/foo-0.1.0")).expect("mkdir");
        fs::write(
            tmp.path().join("cache/index.crates.io/foo-0.1.0.crate"),
            [0u8; 32],
        )
        .expect("write");
        fs::write(
            tmp.path().join("src/index.crates.io/foo-0.1.0/lib.rs"),
            b"fn main(){}",
        )
        .expect("write");

        std::env::set_var("WC_TEST_CARGO_REGISTRY_ROOT", tmp.path());
        let findings = CargoCacheCategory.scan(&ScanContext::default());
        std::env::remove_var("WC_TEST_CARGO_REGISTRY_ROOT");

        assert_eq!(findings.len(), 2);
        assert!(findings
            .iter()
            .all(|f| f.category_id == CargoCacheCategory::ID));
    }
}
