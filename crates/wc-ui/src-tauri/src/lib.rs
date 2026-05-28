//! Tauri shell entrypoint. Exposes engine use cases as `tauri::command`s
//! consumable from the React frontend via `invoke('<name>')`.

use wc_core::{Environment, Finding};

#[tauri::command]
fn scan() -> Vec<Finding> {
    wc_adapters::ensure_linked();
    let env = wc_adapters::detect_environment();
    wc_app::usecase::scan_disk::run(env)
}

#[tauri::command]
fn detect_env() -> Environment {
    wc_adapters::detect_environment()
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
        .invoke_handler(tauri::generate_handler![scan, detect_env])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
