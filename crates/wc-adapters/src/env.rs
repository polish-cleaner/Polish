//! Environment detection. Probes filesystem for tool presence.
//!
//! v1.0 scope: npm / pnpm / cargo / WSL / Chrome / Edge / Firefox.
//! Windows build via `ver`-style API deferred (no consumer yet).

use std::path::{Path, PathBuf};
use wc_core::Environment;

/// Detect the current user's environment by probing well-known paths.
///
/// Honors `USERPROFILE` and `LOCALAPPDATA`. Returns a default-zeroed
/// Environment if `USERPROFILE` is missing.
pub fn detect_environment() -> Environment {
    let Some(home) = user_profile() else {
        return Environment::default();
    };
    let local = local_appdata();
    Environment {
        has_npm: home.join(".npm").is_dir(),
        has_pnpm: home.join(".pnpm-store").is_dir() || home.join("AppData/Local/pnpm").is_dir(),
        has_cargo: home.join(".cargo").is_dir(),
        has_wsl: wsl_present(),
        has_chrome: local
            .as_ref()
            .map(|l| l.join("Google/Chrome/User Data").is_dir())
            .unwrap_or(false),
        has_edge: local
            .as_ref()
            .map(|l| l.join("Microsoft/Edge/User Data").is_dir())
            .unwrap_or(false),
        has_firefox: local
            .as_ref()
            .map(|l| l.join("Mozilla/Firefox/Profiles").is_dir())
            .unwrap_or(false),
        windows_build: None,
    }
}

fn user_profile() -> Option<PathBuf> {
    std::env::var_os("USERPROFILE").map(PathBuf::from)
}

fn local_appdata() -> Option<PathBuf> {
    std::env::var_os("LOCALAPPDATA").map(PathBuf::from)
}

fn wsl_present() -> bool {
    let system_root = std::env::var_os("SystemRoot").unwrap_or_else(|| "C:\\Windows".into());
    Path::new(&system_root).join("System32/wsl.exe").is_file()
}
