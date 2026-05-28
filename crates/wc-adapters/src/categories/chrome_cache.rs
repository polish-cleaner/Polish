//! Chrome browser cache. Scans `Cache\Cache_Data` and `Code Cache\js` under
//! every `User Data\<profile>` directory (Default + `Profile N`).
//!
//! Safe to delete — Chrome regenerates on next load. Does NOT touch
//! cookies, history, bookmarks, or extensions.

use std::path::{Path, PathBuf};
use wc_core::{
    Category, CategoryEntry, CategoryId, Environment, Finding, SafetyTier, ScanContext, Version,
};

use crate::scan_util::scan_many;

pub struct ChromeCacheCategory;

impl ChromeCacheCategory {
    pub const ID: CategoryId = "browser.chrome.cache";

    fn cache_roots() -> Vec<PathBuf> {
        let user_data = if let Some(test) = std::env::var_os("WC_TEST_CHROME_CACHE_ROOT") {
            PathBuf::from(test)
        } else {
            let Some(local) = std::env::var_os("LOCALAPPDATA") else {
                return Vec::new();
            };
            PathBuf::from(local)
                .join("Google")
                .join("Chrome")
                .join("User Data")
        };
        enumerate_chromium_caches(&user_data)
    }
}

fn enumerate_chromium_caches(user_data: &Path) -> Vec<PathBuf> {
    let mut out = Vec::new();
    let Ok(entries) = std::fs::read_dir(user_data) else {
        return out;
    };
    for entry in entries.flatten() {
        let name = entry.file_name();
        let name_str = name.to_string_lossy();
        let is_profile = name_str == "Default" || name_str.starts_with("Profile ");
        if !is_profile {
            continue;
        }
        if !entry.file_type().map(|ft| ft.is_dir()).unwrap_or(false) {
            continue;
        }
        let p = entry.path();
        out.push(p.join("Cache").join("Cache_Data"));
        out.push(p.join("Code Cache").join("js"));
    }
    out
}

impl Category for ChromeCacheCategory {
    fn id(&self) -> CategoryId {
        Self::ID
    }
    fn name(&self) -> &'static str {
        "Chrome browser cache (User Data/<profile>/Cache + Code Cache)"
    }
    fn safety_tier(&self) -> SafetyTier {
        SafetyTier::Balanced
    }
    fn version_intro(&self) -> Version {
        Version::V1_0
    }
    fn supports(&self, env: &Environment) -> bool {
        env.has_chrome()
    }
    fn scan(&self, _ctx: &ScanContext) -> Vec<Finding> {
        let roots = Self::cache_roots();
        let refs: Vec<&Path> = roots.iter().map(|p| p.as_path()).collect();
        scan_many(&refs, Self::ID)
    }
}

inventory::submit! { CategoryEntry { category: &ChromeCacheCategory } }

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn supports_only_when_chrome_present() {
        let mut env = Environment::default();
        assert!(!ChromeCacheCategory.supports(&env));
        env.has_chrome = true;
        assert!(ChromeCacheCategory.supports(&env));
    }

    #[test]
    fn scan_honors_test_env_var() {
        let tmp = TempDir::new().expect("tempdir");
        fs::create_dir_all(tmp.path().join("Default/Cache/Cache_Data")).expect("mkdir");
        fs::write(
            tmp.path().join("Default/Cache/Cache_Data/blob.dat"),
            [0u8; 8],
        )
        .expect("write");

        std::env::set_var("WC_TEST_CHROME_CACHE_ROOT", tmp.path());
        let findings = ChromeCacheCategory.scan(&ScanContext::default());
        std::env::remove_var("WC_TEST_CHROME_CACHE_ROOT");

        assert!(!findings.is_empty());
        assert!(findings
            .iter()
            .all(|f| f.category_id == ChromeCacheCategory::ID));
    }
}
