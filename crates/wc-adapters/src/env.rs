//! Environment detection. Probes filesystem for tool presence.
//!
//! v1.0 scope: npm / pnpm / cargo / WSL. Windows build via `ver`-style API
//! deferred (no consumer yet).

use std::path::{Path, PathBuf};
use wc_core::Environment;

/// Detect the current user's environment by probing well-known paths.
///
/// Honors `USERPROFILE`. Returns a default-zeroed Environment if the var
/// is missing.
pub fn detect_environment() -> Environment {
    let Some(home) = user_profile() else {
        return Environment::default();
    };
    Environment {
        has_npm: home.join(".npm").is_dir(),
        has_pnpm: home.join(".pnpm-store").is_dir() || home.join("AppData/Local/pnpm").is_dir(),
        has_cargo: home.join(".cargo").is_dir(),
        has_wsl: wsl_present(),
        windows_build: None,
    }
}

fn user_profile() -> Option<PathBuf> {
    std::env::var_os("USERPROFILE").map(PathBuf::from)
}

fn wsl_present() -> bool {
    // wsl.exe lives in System32 when WSL is installed.
    let system_root = std::env::var_os("SystemRoot").unwrap_or_else(|| "C:\\Windows".into());
    Path::new(&system_root).join("System32/wsl.exe").is_file()
}
