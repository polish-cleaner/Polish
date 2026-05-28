//! npm cache category. Cleans `$USERPROFILE\.npm\_cacache` (npm 5+
//! content-addressable cache). Safe to delete; regenerated on next install.

use std::path::PathBuf;
use wc_core::{
    Category, CategoryEntry, CategoryId, Environment, Finding, SafetyTier, ScanContext, Version,
};

use crate::scan_util::scan_dir;

pub struct NpmCacheCategory;

impl NpmCacheCategory {
    pub const ID: CategoryId = "dev.npm.cache";

    fn cache_root() -> Option<PathBuf> {
        if let Some(test) = std::env::var_os("WC_TEST_NPM_CACHE_ROOT") {
            return Some(PathBuf::from(test));
        }
        let home = std::env::var_os("USERPROFILE")?;
        Some(PathBuf::from(home).join(".npm").join("_cacache"))
    }
}

impl Category for NpmCacheCategory {
    fn id(&self) -> CategoryId {
        Self::ID
    }
    fn name(&self) -> &'static str {
        "npm cache (~/.npm/_cacache)"
    }
    fn safety_tier(&self) -> SafetyTier {
        SafetyTier::Balanced
    }
    fn version_intro(&self) -> Version {
        Version::V1_0
    }
    fn supports(&self, env: &Environment) -> bool {
        env.has_npm()
    }
    fn scan(&self, _ctx: &ScanContext) -> Vec<Finding> {
        let Some(root) = Self::cache_root() else {
            return Vec::new();
        };
        scan_dir(&root, Self::ID)
    }
}

inventory::submit! { CategoryEntry { category: &NpmCacheCategory } }

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn supports_only_when_npm_present() {
        let mut env = Environment::default();
        assert!(!NpmCacheCategory.supports(&env));
        env.has_npm = true;
        assert!(NpmCacheCategory.supports(&env));
    }

    #[test]
    fn scan_honors_test_env_var() {
        let tmp = TempDir::new().expect("tempdir");
        fs::create_dir_all(tmp.path().join("pkg")).expect("mkdir");
        fs::write(tmp.path().join("pkg/index.json"), b"{}").expect("write");

        std::env::set_var("WC_TEST_NPM_CACHE_ROOT", tmp.path());
        let findings = NpmCacheCategory.scan(&ScanContext::default());
        std::env::remove_var("WC_TEST_NPM_CACHE_ROOT");

        assert_eq!(findings.len(), 1);
        assert_eq!(findings[0].category_id, NpmCacheCategory::ID);
    }
}
