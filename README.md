# Polish

**Trust-first, MIT-licensed Windows maintenance suite.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE-MIT)
[![Rust 1.90+](https://img.shields.io/badge/rust-1.90+-orange.svg)](rust-toolchain.toml)
[![Tauri 2](https://img.shields.io/badge/tauri-2-24c8db.svg)](https://tauri.app)

> **Status: pre-release / in development.** No binaries shipped yet. v1.0 target ship: see [PROJECT.md §11](PROJECT.md).

Polish is a Windows cleanup tool built around three opinions:

1. **Atomic quarantine first.** Every cleanup writes to a `.pq` bundle (BLAKE3-verified, atomically renamed, journaled) before anything is deleted. If you change your mind, `polish restore` puts it back.
2. **Developer-aware.** First-class scanners for `npm`, `pnpm`, `cargo`, browser caches (Chrome / Edge / Firefox), and user-scope Windows temp/logs — without touching anything Windows already manages safely.
3. **No dark patterns.** MIT engine, no telemetry by default, no bundled offers, no nag, no FUD.

## What Polish deliberately is *not*

These are locked anti-features ([PROJECT.md §5](PROJECT.md)):

- ❌ No registry tweaks
- ❌ No driver-level access
- ❌ No "RAM cleaner" / "PC accelerator" snake-oil
- ❌ No FUD-based scoring or fake error counts
- ❌ No bundled offers, no third-party installers
- ❌ No default-on telemetry

## v1.0 categories (shipped)

| ID | Tier | What |
|---|---|---|
| `dev.npm.cache` | Balanced | `~/.npm/_cacache` |
| `dev.pnpm.cache` | Balanced | `%LOCALAPPDATA%\pnpm\store` + `~/.pnpm-store` |
| `dev.cargo.cache` | Balanced | `~/.cargo/registry/{cache,src}` |
| `browser.chrome.cache` | Balanced | All Chrome profiles `Cache` + `Code Cache` |
| `browser.edge.cache` | Balanced | All Edge profiles `Cache` + `Code Cache` |
| `browser.firefox.cache` | Balanced | All Firefox profiles `cache2` |
| `windows.temp` | Light | `%TEMP%` (user scope) |
| `windows.logs` | Light | `%WINDIR%\Logs\{CBS,DISM,WindowsUpdate}` |

## Quick try (from source)

```powershell
git clone https://github.com/polish-cleaner/Polish.git
cd Polish
cargo run -p wc-cli -- scan       # list findings
cargo run -p wc-cli -- preview    # per-category breakdown
```

Destructive ops require `--yes`:

```powershell
cargo run -p wc-cli -- execute --bundle .\cleanup.pq --yes
cargo run -p wc-cli -- verify  --bundle .\cleanup.pq
cargo run -p wc-cli -- restore --bundle .\cleanup.pq --dest .\restored
```

## Build the UI shell (Tauri 2)

```powershell
cd crates\wc-ui
npm install
npm run tauri dev
```

## Architecture

- [ARCHITECTURE.md](ARCHITECTURE.md) — hexagonal layout, ports & adapters, typestate pipeline, `inventory`-driven category registration
- [PROJECT.md](PROJECT.md) — strategy, scope, risks, 16-week MVP plan
- [AGENTS.md](AGENTS.md) — contributor + agent operating rules (anti-feature list lock, codename mapping, do-not-edit list)

## Contributing

Read [AGENTS.md](AGENTS.md) before opening a PR. Adding a cleanup category is intentionally one new file in `crates/wc-adapters/src/categories/` — no central registry edit. See [ARCHITECTURE.md §7](ARCHITECTURE.md).

## License

[MIT](LICENSE-MIT). Pro-tier features (v1.2+) will ship as a separate closed-source binary consuming the MIT engine as a library — the engine stays MIT forever.
