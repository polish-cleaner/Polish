//! pnpm cache category. pnpm 8+ writes to `%LOCALAPPDATA%\pnpm\store`;
//! older installs used `%USERPROFILE%\.pnpm-store`. Both probed.

use std::path::PathBuf;
use wc_core::{
    Category, CategoryEntry, CategoryId, Environment, Finding, SafetyTier, ScanContext, Version,
};

use crate::scan_util::scan_many;

pub struct PnpmCacheCategory;

impl PnpmCacheCategory {
    pub const ID: CategoryId = "dev.pnpm.cache";

    fn cache_roots() -> Vec<PathBuf> {
        if let Some(test) = std::env::var_os("WC_TEST_PNPM_STORE_ROOT") {
            return vec![PathBuf::from(test)];
        }
        let mut roots = Vec::new();
        if let Some(local) = std::env::var_os("LOCALAPPDATA") {
            roots.push(PathBuf::from(local).join("pnpm").join("store"));
        }
        if let Some(home) = std::env::var_os("USERPROFILE") {
            roots.push(PathBuf::from(home).join(".pnpm-store"));
        }
        roots
    }
}

impl Category for PnpmCacheCategory {
    fn id(&self) -> CategoryId {
        Self::ID
    }
    fn name(&self) -> &'static str {
        "pnpm store (%LOCALAPPDATA%\\pnpm\\store)"
    }
    fn safety_tier(&self) -> SafetyTier {
        SafetyTier::Balanced
    }
    fn version_intro(&self) -> Version {
        Version::V1_0
    }
    fn supports(&self, env: &Environment) -> bool {
        env.has_pnpm()
    }
    fn scan(&self, _ctx: &ScanContext) -> Vec<Finding> {
        let roots = Self::cache_roots();
        let refs: Vec<&std::path::Path> = roots.iter().map(|p| p.as_path()).collect();
        scan_many(&refs, Self::ID)
    }
}

inventory::submit! { CategoryEntry { category: &PnpmCacheCategory } }

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn supports_only_when_pnpm_present() {
        let mut env = Environment::default();
        assert!(!PnpmCacheCategory.supports(&env));
        env.has_pnpm = true;
        assert!(PnpmCacheCategory.supports(&env));
    }

    #[test]
    fn scan_honors_test_env_var() {
        let tmp = TempDir::new().expect("tempdir");
        fs::create_dir_all(tmp.path().join("v3/files/aa")).expect("mkdir");
        fs::write(tmp.path().join("v3/files/aa/blob"), [0u8; 16]).expect("write");

        std::env::set_var("WC_TEST_PNPM_STORE_ROOT", tmp.path());
        let findings = PnpmCacheCategory.scan(&ScanContext::default());
        std::env::remove_var("WC_TEST_PNPM_STORE_ROOT");

        assert_eq!(findings.len(), 1);
        assert_eq!(findings[0].category_id, PnpmCacheCategory::ID);
    }
}
