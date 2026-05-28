//! `wc-svc` — Polish Windows Service binary.
//!
//! v1.0 target: install via NSIS, run as LocalSystem, expose named-pipe IPC
//! to `wc-ui`. Real service registration + IPC land after the Tauri+service
//! update-pattern critical spike (PROJECT.md §11 Week 1–3).

fn main() -> anyhow::Result<()> {
    println!("wc-svc placeholder. Windows service install + named-pipe IPC: TODO (Week 1-3 spike).");
    Ok(())
}
