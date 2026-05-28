//! Tauri shell entrypoint. Exposes engine use cases as `tauri::command`s
//! consumable from the React frontend via `invoke('<name>')`.

use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use wc_adapters::pq_writer::PqWriterAdapter;
use wc_app::usecase::{execute_cleanup, preview_cleanup, restore_quarantine, scan_disk};
use wc_core::ports::pq_port::PqPort;
use wc_core::{Environment, Finding};

#[tauri::command]
fn scan() -> Vec<Finding> {
    wc_adapters::ensure_linked();
    let env = wc_adapters::detect_environment();
    scan_disk::run(env)
}

#[tauri::command]
fn detect_env() -> Environment {
    wc_adapters::detect_environment()
}

/// Pack `findings` into a `.pq` quarantine bundle then delete the
/// originals. Returns the absolute bundle path on success so the UI
/// can show "Saved to: …" and offer a `restore` command from the CLI.
#[tauri::command]
fn execute(findings: Vec<Finding>) -> Result<String, String> {
    wc_adapters::ensure_linked();
    let bundle = default_bundle_path()?;
    let plan = preview_cleanup::run(findings);
    let port = PqWriterAdapter::new();
    execute_cleanup::run(plan, &port, &bundle).map_err(|e| error_chain(&e))?;
    Ok(bundle.to_string_lossy().into_owned())
}

/// Restore a `.pq` bundle's contents to `dest_root`. BLAKE3
/// verify-on-restore is performed by the port.
#[tauri::command]
fn restore(bundle: PathBuf, dest_root: PathBuf) -> Result<(), String> {
    std::fs::create_dir_all(&dest_root).map_err(|e| e.to_string())?;
    let port = PqWriterAdapter::new();
    restore_quarantine::run(&port, &bundle, &dest_root).map_err(|e| error_chain(&e))
}

/// Integrity check a `.pq` bundle without unpacking.
#[tauri::command]
fn verify(bundle: PathBuf) -> Result<(), String> {
    let port = PqWriterAdapter::new();
    port.verify(&bundle).map_err(|e| error_chain(&e))
}

/// Format an error and its full `source()` chain as a single string
/// `"top: middle: leaf"`. Without this, frontend gets only the
/// top-level message (e.g. `"bundle pack failed"`) and loses every
/// detail about *which* file or *why* it failed.
fn error_chain(err: &dyn std::error::Error) -> String {
    let mut msg = err.to_string();
    let mut source = err.source();
    while let Some(s) = source {
        msg.push_str(": ");
        msg.push_str(&s.to_string());
        source = s.source();
    }
    msg
}

fn default_bundle_path() -> Result<PathBuf, String> {
    let ts = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_secs();
    Ok(std::env::temp_dir().join(format!("polish-cleanup-{}.pq", ts)))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            scan, detect_env, execute, restore, verify
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io;
    use wc_app::usecase::execute_cleanup::ExecuteError;
    use wc_core::ports::pq_port::PqError;

    #[test]
    fn error_chain_single_layer_returns_top_message() {
        let io_err = io::Error::new(io::ErrorKind::NotFound, "missing");
        assert_eq!(error_chain(&io_err), "missing");
    }

    #[test]
    fn error_chain_walks_full_source_chain() {
        let io_err = io::Error::new(
            io::ErrorKind::PermissionDenied,
            "C:\\Users\\v\\.cache\\f_0001: access is denied",
        );
        let pq_err = PqError::Io(io_err);
        let exec_err = ExecuteError::Pack(pq_err);
        let chain = error_chain(&exec_err);
        assert!(chain.starts_with("bundle pack failed: "), "got: {chain}");
        assert!(
            chain.contains("C:\\Users\\v\\.cache\\f_0001"),
            "got: {chain}"
        );
        assert!(chain.contains("access is denied"), "got: {chain}");
    }

    #[test]
    fn error_chain_preserves_separator_between_layers() {
        let io_err = io::Error::other("leaf");
        let pq_err = PqError::Io(io_err);
        let exec_err = ExecuteError::Pack(pq_err);
        let chain = error_chain(&exec_err);
        let parts: Vec<&str> = chain.split(": ").collect();
        assert!(parts.len() >= 2, "expected ≥2 layers, got: {chain}");
    }
}
