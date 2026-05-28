//! `polish` CLI. Stub for v1.2 Pro tier; v1.0 dev use only.
//!
//! Current behaviour: detect env → run scan_disk → print findings.

use wc_app::usecase::scan_disk;

fn main() -> anyhow::Result<()> {
    wc_adapters::ensure_linked();

    let env = wc_adapters::detect_environment();
    println!("Detected environment:");
    println!("  npm:   {}", env.has_npm());
    println!("  pnpm:  {}", env.has_pnpm());
    println!("  cargo: {}", env.has_cargo());
    println!("  wsl:   {}", env.has_wsl());
    println!();

    let findings = scan_disk::run(env);
    if findings.is_empty() {
        println!("No findings.");
        return Ok(());
    }

    let total: u64 = findings.iter().map(|f| f.size).sum();
    println!(
        "Findings: {} ({:.2} MiB)",
        findings.len(),
        total as f64 / 1_048_576.0
    );
    for f in findings.iter().take(20) {
        println!(
            "  [{}] {} ({} bytes)",
            f.category_id,
            f.path.display(),
            f.size
        );
    }
    if findings.len() > 20 {
        println!("  ... and {} more", findings.len() - 20);
    }
    Ok(())
}
