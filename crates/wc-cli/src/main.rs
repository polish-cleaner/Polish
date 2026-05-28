//! `polish` CLI. v1.0 free build — manual subcommands over the engine.
//!
//! Subcommands:
//! - `scan` — list findings (current Phase 1 behaviour)
//! - `preview` — scan + show per-category breakdown
//! - `execute --bundle <path> --yes` — pack findings into a `.pq` then delete
//!   originals (DESTRUCTIVE — requires `--yes` flag)
//! - `restore --bundle <path> --dest <dir>` — unpack a `.pq` to dest
//! - `verify --bundle <path>` — integrity check (BLAKE3 verify-on-restore)

use std::path::PathBuf;

use anyhow::{Context, Result};
use clap::{Parser, Subcommand};

use wc_adapters::pq_writer::PqWriterAdapter;
use wc_app::usecase::{execute_cleanup, preview_cleanup, restore_quarantine, scan_disk};
use wc_core::ports::pq_port::PqPort;
use wc_core::Finding;

#[derive(Parser)]
#[command(name = "polish", version, about = "Polish — Windows maintenance suite")]
struct Cli {
    #[command(subcommand)]
    command: Cmd,
}

#[derive(Subcommand)]
enum Cmd {
    /// Scan and list findings.
    Scan,
    /// Scan + group by category and show totals.
    Preview,
    /// Scan + pack findings into a `.pq` bundle then delete originals.
    Execute {
        /// Output bundle path (e.g. `cleanup.pq`).
        #[arg(long)]
        bundle: PathBuf,
        /// Required confirmation flag; without it execute refuses.
        #[arg(long)]
        yes: bool,
        /// Skip files we can't open (locked by another process or
        /// permission-denied). Without this flag, execute aborts when
        /// any finding is locked and prints the list so you can close
        /// the locking app and retry.
        #[arg(long)]
        skip_locked: bool,
    },
    /// Restore a `.pq` bundle to a destination directory.
    Restore {
        #[arg(long)]
        bundle: PathBuf,
        #[arg(long)]
        dest: PathBuf,
    },
    /// Verify a `.pq` bundle's integrity.
    Verify {
        #[arg(long)]
        bundle: PathBuf,
    },
}

fn main() -> Result<()> {
    wc_adapters::ensure_linked();
    let cli = Cli::parse();

    match cli.command {
        Cmd::Scan => cmd_scan(),
        Cmd::Preview => cmd_preview(),
        Cmd::Execute {
            bundle,
            yes,
            skip_locked,
        } => cmd_execute(bundle, yes, skip_locked),
        Cmd::Restore { bundle, dest } => cmd_restore(bundle, dest),
        Cmd::Verify { bundle } => cmd_verify(bundle),
    }
}

fn cmd_scan() -> Result<()> {
    let env = wc_adapters::detect_environment();
    print_environment(&env);
    let findings = scan_disk::run(env);
    print_summary(&findings);
    print_first_findings(&findings, 20);
    Ok(())
}

fn cmd_preview() -> Result<()> {
    let env = wc_adapters::detect_environment();
    print_environment(&env);
    let findings = scan_disk::run(env);
    if findings.is_empty() {
        println!("No findings.");
        return Ok(());
    }
    print_summary(&findings);
    print_per_category(&findings);
    Ok(())
}

fn cmd_execute(bundle: PathBuf, yes: bool, skip_locked: bool) -> Result<()> {
    if !yes {
        anyhow::bail!(
            "refusing to execute: pass `--yes` to confirm. This packs findings into {} and deletes originals.",
            bundle.display()
        );
    }
    let env = wc_adapters::detect_environment();
    let findings = scan_disk::run(env);
    if findings.is_empty() {
        println!("No findings — nothing to do.");
        return Ok(());
    }
    let total: u64 = findings.iter().map(|f| f.size).sum();
    println!(
        "Packing {} files ({:.2} MiB) into {} ...",
        findings.len(),
        total as f64 / 1_048_576.0,
        bundle.display()
    );
    let plan = preview_cleanup::run(findings);
    let port = PqWriterAdapter::new();
    let outcome = execute_cleanup::run(plan, &port, &bundle, skip_locked)
        .with_context(|| format!("execute failed (bundle: {})", bundle.display()))?;

    if outcome.needs_user_decision {
        eprintln!(
            "Aborted: {} file(s) are locked (open by another process). \
             Close the locking app and retry, or pass --skip-locked.",
            outcome.locked_files.len()
        );
        for p in outcome.locked_files.iter().take(20) {
            eprintln!("  locked: {}", p.display());
        }
        if outcome.locked_files.len() > 20 {
            eprintln!("  ... and {} more", outcome.locked_files.len() - 20);
        }
        std::process::exit(2);
    }

    println!(
        "Done. {} files quarantined; {} skipped (locked).",
        outcome.packed_count,
        outcome.locked_files.len()
    );
    println!(
        "Bundle: {}\nTo restore: polish restore --bundle {} --dest <dir>",
        bundle.display(),
        bundle.display()
    );
    Ok(())
}

fn cmd_restore(bundle: PathBuf, dest: PathBuf) -> Result<()> {
    std::fs::create_dir_all(&dest)
        .with_context(|| format!("create dest dir: {}", dest.display()))?;
    let port = PqWriterAdapter::new();
    restore_quarantine::run(&port, &bundle, &dest)
        .with_context(|| format!("restore failed (bundle: {})", bundle.display()))?;
    println!("Restored to {}", dest.display());
    Ok(())
}

fn cmd_verify(bundle: PathBuf) -> Result<()> {
    let port = PqWriterAdapter::new();
    port.verify(&bundle)
        .with_context(|| format!("verify failed (bundle: {})", bundle.display()))?;
    println!("OK — {} is intact.", bundle.display());
    Ok(())
}

fn print_environment(env: &wc_core::Environment) {
    println!("Environment:");
    println!("  npm:     {}", env.has_npm());
    println!("  pnpm:    {}", env.has_pnpm());
    println!("  cargo:   {}", env.has_cargo());
    println!("  wsl:     {}", env.has_wsl());
    println!("  chrome:  {}", env.has_chrome());
    println!("  edge:    {}", env.has_edge());
    println!("  firefox: {}", env.has_firefox());
    println!();
}

fn print_summary(findings: &[Finding]) {
    let total: u64 = findings.iter().map(|f| f.size).sum();
    println!(
        "Findings: {} ({:.2} MiB)",
        findings.len(),
        total as f64 / 1_048_576.0
    );
}

fn print_first_findings(findings: &[Finding], n: usize) {
    for f in findings.iter().take(n) {
        println!(
            "  [{}] {} ({} bytes)",
            f.category_id,
            f.path.display(),
            f.size
        );
    }
    if findings.len() > n {
        println!("  ... and {} more", findings.len() - n);
    }
}

fn print_per_category(findings: &[Finding]) {
    use std::collections::BTreeMap;
    let mut groups: BTreeMap<&str, (usize, u64)> = BTreeMap::new();
    for f in findings {
        let entry = groups.entry(f.category_id.as_str()).or_insert((0, 0));
        entry.0 += 1;
        entry.1 += f.size;
    }
    println!("Per category:");
    for (id, (count, size)) in groups {
        println!(
            "  {:30}  {:>6} files   {:>8.2} MiB",
            id,
            count,
            size as f64 / 1_048_576.0
        );
    }
}
