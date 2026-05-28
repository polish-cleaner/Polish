//! Edge browser cache. Same Chromium layout as Chrome — `Cache\Cache_Data` +
//! `Code Cache\js` per `User Data\<profile>` (Default + `Profile N`).
//!
//! Safe to delete — Edge regenerates on next load. Does NOT touch cookies,
//! history, bookmarks, or extensions.

use std::path::{Path, PathBuf};
use wc_core::{
    Category, CategoryEntry, CategoryId, Environment, Finding, SafetyTier, ScanContext, Version,
};

use crate::scan_util::scan_many;

pub struct EdgeCacheCategory;

impl EdgeCacheCategory {
    pub const ID: CategoryId = "browser.edge.cache";

    fn cache_roots() -> Vec<PathBuf> {
        let user_data = if let Some(test) = std::env::var_os("WC_TEST_EDGE_CACHE_ROOT") {
            PathBuf::from(test)
        } else {
            let Some(local) = std::env::var_os("LOCALAPPDATA") else {
                return Vec::new();
            };
            PathBuf::from(local)
                .join("Microsoft")
                .join("Edge")
                .join("User Data")
        };
        enumerate_edge_caches(&user_data)
    }
}

fn enumerate_edge_caches(user_data: &Path) -> Vec<PathBuf> {
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

impl Category for EdgeCacheCategory {
    fn id(&self) -> CategoryId {
        Self::ID
    }
    fn name(&self) -> &'static str {
        "Edge browser cache (User Data/<profile>/Cache + Code Cache)"
    }
    fn safety_tier(&self) -> SafetyTier {
        SafetyTier::Balanced
    }
    fn version_intro(&self) -> Version {
        Version::V1_0
    }
    fn supports(&self, env: &Environment) -> bool {
        env.has_edge()
    }
    fn scan(&self, _ctx: &ScanContext) -> Vec<Finding> {
        let roots = Self::cache_roots();
        let refs: Vec<&Path> = roots.iter().map(|p| p.as_path()).collect();
        scan_many(&refs, Self::ID)
    }
}

inventory::submit! { CategoryEntry { category: &EdgeCacheCategory } }

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn supports_only_when_edge_present() {
        let mut env = Environment::default();
        assert!(!EdgeCacheCategory.supports(&env));
        env.has_edge = true;
        assert!(EdgeCacheCategory.supports(&env));
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

        std::env::set_var("WC_TEST_EDGE_CACHE_ROOT", tmp.path());
        let findings = EdgeCacheCategory.scan(&ScanContext::default());
        std::env::remove_var("WC_TEST_EDGE_CACHE_ROOT");

        assert!(!findings.is_empty());
        assert!(findings
            .iter()
            .all(|f| f.category_id == EdgeCacheCategory::ID));
    }
}
