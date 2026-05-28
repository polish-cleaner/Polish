//! Firefox browser cache. Scans `cache2` under every
//! `%LOCALAPPDATA%\Mozilla\Firefox\Profiles\<id>` directory.
//!
//! Safe to delete — Firefox regenerates on next load. Does NOT touch
//! cookies, history, bookmarks, or extensions.

use std::path::{Path, PathBuf};
use wc_core::{
    Category, CategoryEntry, CategoryId, Environment, Finding, SafetyTier, ScanContext, Version,
};

use crate::scan_util::scan_many;

pub struct FirefoxCacheCategory;

impl FirefoxCacheCategory {
    pub const ID: CategoryId = "browser.firefox.cache";

    fn cache_roots() -> Vec<PathBuf> {
        let profiles = if let Some(test) = std::env::var_os("WC_TEST_FIREFOX_CACHE_ROOT") {
            PathBuf::from(test)
        } else {
            let Some(local) = std::env::var_os("LOCALAPPDATA") else {
                return Vec::new();
            };
            PathBuf::from(local)
                .join("Mozilla")
                .join("Firefox")
                .join("Profiles")
        };
        enumerate_firefox_caches(&profiles)
    }
}

fn enumerate_firefox_caches(profiles: &Path) -> Vec<PathBuf> {
    let mut out = Vec::new();
    let Ok(entries) = std::fs::read_dir(profiles) else {
        return out;
    };
    for entry in entries.flatten() {
        if !entry.file_type().map(|ft| ft.is_dir()).unwrap_or(false) {
            continue;
        }
        out.push(entry.path().join("cache2"));
    }
    out
}

impl Category for FirefoxCacheCategory {
    fn id(&self) -> CategoryId {
        Self::ID
    }
    fn name(&self) -> &'static str {
        "Firefox browser cache (Profiles/<id>/cache2)"
    }
    fn safety_tier(&self) -> SafetyTier {
        SafetyTier::Balanced
    }
    fn version_intro(&self) -> Version {
        Version::V1_0
    }
    fn supports(&self, env: &Environment) -> bool {
        env.has_firefox()
    }
    fn scan(&self, _ctx: &ScanContext) -> Vec<Finding> {
        let roots = Self::cache_roots();
        let refs: Vec<&Path> = roots.iter().map(|p| p.as_path()).collect();
        scan_many(&refs, Self::ID)
    }
}

inventory::submit! { CategoryEntry { category: &FirefoxCacheCategory } }

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn supports_only_when_firefox_present() {
        let mut env = Environment::default();
        assert!(!FirefoxCacheCategory.supports(&env));
        env.has_firefox = true;
        assert!(FirefoxCacheCategory.supports(&env));
    }

    #[test]
    fn scan_honors_test_env_var() {
        let tmp = TempDir::new().expect("tempdir");
        fs::create_dir_all(tmp.path().join("abc.default/cache2/entries")).expect("mkdir");
        fs::write(tmp.path().join("abc.default/cache2/entries/blob"), [0u8; 8]).expect("write");

        std::env::set_var("WC_TEST_FIREFOX_CACHE_ROOT", tmp.path());
        let findings = FirefoxCacheCategory.scan(&ScanContext::default());
        std::env::remove_var("WC_TEST_FIREFOX_CACHE_ROOT");

        assert!(!findings.is_empty());
        assert!(findings
            .iter()
            .all(|f| f.category_id == FirefoxCacheCategory::ID));
    }
}
