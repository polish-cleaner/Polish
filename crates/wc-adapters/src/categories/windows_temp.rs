//! User-scope Windows temp. Scans `%TEMP%` (falls back to
//! `%USERPROFILE%\AppData\Local\Temp`). Does NOT touch `%WINDIR%\Temp`
//! (system-scope, requires SYSTEM rights — deferred).

use std::path::PathBuf;
use wc_core::{
    Category, CategoryEntry, CategoryId, Environment, Finding, SafetyTier, ScanContext, Version,
};

use crate::scan_util::scan_dir;

pub struct WindowsTempCategory;

impl WindowsTempCategory {
    pub const ID: CategoryId = "windows.temp";

    fn cache_root() -> Option<PathBuf> {
        if let Some(test) = std::env::var_os("WC_TEST_WINDOWS_TEMP_ROOT") {
            return Some(PathBuf::from(test));
        }
        if let Some(temp) = std::env::var_os("TEMP") {
            return Some(PathBuf::from(temp));
        }
        let home = std::env::var_os("USERPROFILE")?;
        Some(
            PathBuf::from(home)
                .join("AppData")
                .join("Local")
                .join("Temp"),
        )
    }
}

impl Category for WindowsTempCategory {
    fn id(&self) -> CategoryId {
        Self::ID
    }
    fn name(&self) -> &'static str {
        "Windows user temp (%TEMP%)"
    }
    fn safety_tier(&self) -> SafetyTier {
        SafetyTier::Light
    }
    fn version_intro(&self) -> Version {
        Version::V1_0
    }
    fn supports(&self, _env: &Environment) -> bool {
        cfg!(target_os = "windows")
    }
    fn scan(&self, _ctx: &ScanContext) -> Vec<Finding> {
        let Some(root) = Self::cache_root() else {
            return Vec::new();
        };
        scan_dir(&root, Self::ID)
    }
}

inventory::submit! { CategoryEntry { category: &WindowsTempCategory } }

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn supports_returns_cfg_target() {
        assert_eq!(
            WindowsTempCategory.supports(&Environment::default()),
            cfg!(target_os = "windows")
        );
    }

    #[test]
    fn scan_honors_test_env_var() {
        let tmp = TempDir::new().expect("tempdir");
        fs::write(tmp.path().join("scratch.tmp"), [0u8; 4]).expect("write");

        std::env::set_var("WC_TEST_WINDOWS_TEMP_ROOT", tmp.path());
        let findings = WindowsTempCategory.scan(&ScanContext::default());
        std::env::remove_var("WC_TEST_WINDOWS_TEMP_ROOT");

        assert_eq!(findings.len(), 1);
        assert_eq!(findings[0].category_id, WindowsTempCategory::ID);
    }
}
