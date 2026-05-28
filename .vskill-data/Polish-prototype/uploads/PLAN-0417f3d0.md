# Polish — Project Plan

> **Working brand:** Polish · **Repo root:** `D:\VIKASH\windows-cleaner\` · **License:** MIT (OSS engine + UI) + proprietary (`polish-pro.exe` from v1.2) · **Status:** Pre-development design lock — **post-debate v2** · **Last updated:** 2026-05-28 (post-debate revision)

> **Post-debate revision (2026-05-28).** PLAN.md scope was stress-tested by 3-agent adversarial review (Market Analyst + Technical Architect + Business Strategist) against a "most profitable SaaS" framing. Verdict: **PIVOT.** Original v1.0 scope (Cleanup + Format Prep + Dev/AI + scanner + Pro tier in 16 weeks) is incompatible with solo-dev velocity. Validated plan lives in `PROJECT.md` (root) + `.vskill-data/debate/v2/PROJECT.md`. Key reconciled changes propagated below: Format Prep wizard → v1.2; full Dev/AI catalog → v1.2/v1.3 as wrappers over Microsoft-native primitives; background scanner + daily digest → v1.1; Pro tier → v1.2 in **separate closed-source binary** consuming the MIT engine as library; MSP/Enterprise tiers **deferred indefinitely** until re-entry gate (§22). Sections directly updated: §1, §3, §19, §20, §21, §22. Architecture (§4–§17) unchanged — those specs apply when their respective features ship.

Polish is an open-source Windows maintenance suite. v1.0 ships **free OSS**: Cleanup (Light/Balanced) + atomic quarantine + one developer category (npm/pnpm/cargo) as proof-of-wedge. v1.2 introduces a **paid Pro tier** in a separate closed-source binary (Format Prep wizard + full Dev/AI catalog + encrypted `.pq` + CLI). MSP/Enterprise tiers are removed from the active roadmap. The goal remains: be the cleanup tool Windows users actually trust — distinctive UI, transparent behaviour, never-delete-without-quarantine safety, no nag screens, no fake urgency, no upsell theatre.

This file is the design source of truth. **`PROJECT.md` is the validation + go-to-market source of truth.** If the two diverge on scope or sequencing, `PROJECT.md` wins and this file is updated. Every decision below was resolved during the design grill (Q1–Q15), May 2026 web research, or the 2026-05-28 adversarial debate.

---

## Table of Contents

1. [Vision & positioning](#1-vision--positioning)
2. [Brand & identity](#2-brand--identity)
3. [Scope by phase](#3-scope-by-phase)
4. [Architecture](#4-architecture)
5. [Tech stack](#5-tech-stack)
6. [Repository layout](#6-repository-layout)
7. [Information architecture & pages](#7-information-architecture--pages)
8. [Cleanup modes & category catalog](#8-cleanup-modes--category-catalog)
9. [Format Prep wizard](#9-format-prep-wizard)
10. [Quarantine system & `.pq` format](#10-quarantine-system--pq-format)
11. [Background scanner & notifications](#11-background-scanner--notifications)
12. [Settings catalog](#12-settings-catalog)
13. [Security & privacy](#13-security--privacy)
14. [Distribution, signing, updates](#14-distribution-signing-updates)
15. [Telemetry, logging, crash reporting](#15-telemetry-logging-crash-reporting)
16. [Internationalization](#16-internationalization)
17. [Testing & CI/CD](#17-testing--cicd)
18. [Documentation](#18-documentation)
19. [Competitive landscape & opportunity](#19-competitive-landscape--opportunity)
20. [MVP scope (v1.0)](#20-mvp-scope-v10)
21. [Roadmap](#21-roadmap)
22. [Open risks & decisions still pending](#22-open-risks--decisions-still-pending)
23. [References](#23-references)

---

## 1. Vision & positioning

**One-liner.** Polish keeps Windows clean, safe, and ready for whatever comes next — without nagging, lying, or deleting anything it can't take back.

**Wedge.** The space is crowded (CCleaner, BleachBit, Wise, Glary, PrivaZer, built-in Storage Sense). None own the workflow that a Windows user actually faces a few times in a PC's life: "I'm about to format this machine. Help me not lose anything." Polish leads with **Prepare for Format** as a first-class top-level journey, with everyday Cleanup as its second pillar. No other tool combines them.

**Brand promise.** Three rules we never break:
1. **Never delete without recovery.** Every action is quarantined first (see §10). Even uninstalls write a restore manifest.
2. **No invented urgency.** We don't paint browser cache red. We don't show "PC at risk" toasts. We don't re-enable disabled features on update.
3. **Local-first, account-optional.** Everything works fully without an account. Cloud features (v2+) are opt-in extras, never blockers.

**Audience.** Three concentric circles:
- **Inner:** developers, power users, IT-curious folks on r/Windows / r/Sysadmin who already know CCleaner is sus and BleachBit feels dated.
- **Middle:** mainstream Windows users a friend installs Polish for, who want the disk back without thinking about it.
- **Outer (Phase 3):** small IT teams managing a fleet of PCs.

---

## 2. Brand & identity

| Attribute | Value |
|---|---|
| Name | **Polish** |
| Tagline | "Polish your PC." (verb-led, disambiguates from nationality adjective) |
| Domain | `polish.io` (TBD — must verify availability before launch) |
| GitHub org | candidates: `polish-app`, `getpolish`, `polishtools` — verify availability |
| Service name | `PolishService` (display: "Polish Maintenance Service") |
| Binaries | `polish-svc.exe` (service), `polish-ui.exe` (UI) |
| CLI | `polish` |
| Quarantine bundle | `.pq` (Polish Quarantine) + sidecar `.pqmanifest.json` |
| Custom profile | `.polishprofile` |
| File icons | distinct .pq icon, distinct .polishprofile icon |
| Logo direction | polished gem / lacquered surface — premium, calm, distinctive |

**Visual language — "Lacquer / Gem":**
- **Primary:** Deep emerald `#0F5132` — depth, polish, calm.
- **Accent:** Polished gold `#D4AF37` — sparingly, only on "shine" highlights and primary CTAs.
- **Neutrals:** Slate `#0F172A` (dark surface), `#F8FAFC` (light surface).
- **Status:** `#22C55E` green / `#F59E0B` amber / `#EF4444` red — standard, but red is RESERVED for security/data-loss warnings only (never cosmetic findings).
- **Typography:** Display = Geist (Vercel), Body = Inter, Mono = JetBrains Mono.
- **Motion:** subtle spring physics, 200–300 ms transitions, no bouncy curves. "Premium calm." All numeric values (sizes, counts) use mono font for that system-reading feel.

**Pre-launch checks (do these before public push):**
- GitHub org name availability
- `polish.io` WHOIS + alternatives (`getpolish.com`, `polishapp.io`, `polish.tools`)
- USPTO TESS + EUIPO trademark search, software class 9/42
- Microsoft Store reserved-name check (if we ever submit there)
- Crates.io `polish` name reservation
- npm `@polish/*` org reservation (if we ever publish helpers)

---

## 3. Scope by phase

> Phase scoping reflects post-debate v2 reconciliation (see top banner). Prior PLAN.md had Format Prep + Dev/AI + Pro all in v1.0/v2.0; debate consensus moved Format Prep → v1.2, Pro → v1.2 (closed-source binary), MSP/Enterprise → deferred.

### Phase 1 — Cleanup + Quarantine MVP (v1.0)
- Background service + tray UI + main window (architecture per §4)
- Dashboard, Clean (Light + Balanced modes only), Quarantine, History, Settings, About
- Quarantine + System Restore Point + JSON manifest safety model (per §10)
- `.pq` bundle format **with segmented sub-archive architecture** (corruption-resistance) — encryption deferred to v1.1
- One developer category in v1.0: npm + pnpm + cargo build cache (proof-of-wedge, low-risk safety profile)
- Manual scan only (background scanner deferred to v1.1)
- Local-only. No account. MIT-licensed. Free. **No Pro tier in v1.0.**

### Phase 1.1 — Table stakes & community (v1.1)
- Aggressive mode + Custom mode
- Startup app manager + Uninstaller with leftover sweep
- Idle-aware background scanner + daily digest toast (DND-aware, snooze, threshold-gated, AUMID-registered)
- Encrypted `.pq` bundles (AES-256-GCM, Argon2id KDF)
- `.polishprofile` import/export (community gallery on site)
- Additional always-safe categories from issue tracker (Firefox/Brave/Opera/Arc cache, DNS+font cache, Slack/Spotify/Zoom/Steam shadercache/Adobe app caches)
- More installer channels (Scoop bucket, Chocolatey manifest)

### Phase 1.2 — Pro tier launch + Format Prep (v1.2)
- **Open-core architecture lands.** Pro features ship in a separate closed-source companion binary `polish-pro.exe` that links the MIT `polish-engine` library and IPCs with `polish-svc.exe`. The MIT desktop UI and engine remain open. Accepts ~30% community-fork rate as cost of OSS halo. (See §4.5 once written; alternative — license-server runtime check — explicitly rejected.)
- **Format Prep wizard (7-step, per §9)** — Pro-only feature
- **Full Dev/AI catalog** — Pro-only: WSL2 VHDX (wrapper over `wsl --shrink` when GA; custom fallback otherwise), Docker VHDX (wrapper over `Optimize-VHD`), LM Studio/Ollama model audit, IDE caches, go-build, orphan node_modules detection
- CLI (`polish` command) — Pro
- Cloud profile sync (E2E-encrypted) — Pro
- Pricing: $29/yr annual primary; first 500 seats lifetime-of-v1.x-major at $79 (capped promo, then withdrawn)
- Stripe + Paddle billing; offline-tolerant license-file model

### Phase 2 — Cloud + anti-malware (v2.0, 2028+)
- Optional Polish Account: cross-PC config sync, cloud backup of `.pq` quarantines, E2E-encrypted (master-password-derived key, server cannot read).
- Anti-malware scanner module: file-hash blocklist, YARA rules, optional ClamAV integration. Strictly second-opinion — never replaces Defender.

### Phase 3 — Enterprise / MSP (DEFERRED INDEFINITELY)
- Originally planned as v3.0 (B2B SaaS dashboard, Group Policy / Intune, fleet reports). **Removed from active roadmap.** Debate consensus: MSPs do not have a standalone-cleanup budget line; standalone B2B from a solo OSS shop is structurally non-viable.
- **Re-entry gate** (all required, all required simultaneously):
  - $10K MRR sustained on Pro tier
  - 3 signed 6-month paid pilot contracts with named MSPs (LOIs do not count)
  - Listing accepted in at least one of: NinjaOne / Atera / Kaseya / ConnectWise integration marketplace
  - At least one full-time backend engineer hired

---

## 4. Architecture

### 4.1 Process model — two-process

```
┌──────────────────────────────────────┐        ┌──────────────────────────────────────┐
│  polish-svc.exe                       │        │  polish-ui.exe                        │
│  (Rust, Windows Service)              │◀──IPC─▶│  (Rust + Tauri 2 + React)             │
│  Runs as LocalSystem                  │  pipe  │  Runs as current user                 │
│  Auto-start at boot                   │        │  Tray icon + main window              │
│                                       │        │  Auto-start at user login             │
│  Modules:                             │        │  Modules:                             │
│    • background scanner (idle-aware)  │        │    • Dashboard, Clean, Format Prep    │
│    • quarantine engine (only writer)  │        │    • Quarantine viewer, History       │
│    • restore-point manager            │        │    • Settings, About                   │
│    • manifest log writer              │        │    • Tray menu, notifications          │
│    • IPC server (JSON-RPC over pipe)  │        │    • IPC client                       │
│    • notification dispatcher          │        │                                       │
└──────────────────────────────────────┘        └──────────────────────────────────────┘
```

**Why two processes:**
- Always-on background scanning requires SYSTEM-level access to read locked files; impossible from a user-mode app.
- Security boundary: the React/web UI surface is huge; isolating it from SYSTEM minimizes blast radius if the UI ever gets compromised.
- One UAC prompt at install only. Normal usage never prompts.

### 4.2 IPC — named pipe + JSON-RPC

- **Pipe path:** `\\.\pipe\polish.v1` (version-suffixed so a stale old service can't collide mid-upgrade).
- **Protocol:** JSON-RPC 2.0 over a length-prefixed frame, plus a schema-version header.
- **Crate:** `interprocess` (with Tokio integration) — cross-platform if we ever port the scanner, exposes `SECURITY_ATTRIBUTES`, async-named-pipe support. Fallback: `tokio::net::windows::named_pipe` if we drop the portability goal.
- **Security descriptor:** custom DACL. Grants `FILE_GENERIC_READ | FILE_GENERIC_WRITE` only to the interactive logon SID. Anonymous and Everyone are denied. NEVER use the default NULL descriptor — that is the exact bug class CyberArk used to exploit Docker Desktop.
- **Client SID validation:** every privileged call validates the caller via `GetNamedPipeClientProcessId` + token SID check before executing. UI's permission to call "delete files in C:\Windows" is checked per-call, not per-connection.
- **Schema validation:** every request and response is validated against a Zod schema (TS) / serde-derived struct (Rust). Reject and log on schema mismatch.

### 4.3 RPC surface (initial)

| Method | Direction | Purpose |
|---|---|---|
| `service.status` | UI → svc | Health, uptime, version, last scan timestamp |
| `service.subscribe` | UI → svc | Open event stream (push notifications back) |
| `scan.start` | UI → svc | Trigger immediate scan; returns `scanId` |
| `scan.cancel` | UI → svc | Cancel running scan |
| `scan.results` | UI → svc | Latest scan results, by category, with sizes |
| `clean.preview` | UI → svc | Given selected categories + mode, return dry-run impact |
| `clean.execute` | UI → svc | Execute cleanup; returns `runId`; events stream progress |
| `clean.cancel` | UI → svc | Abort in-flight clean; rolls back partial quarantine |
| `quarantine.list` | UI → svc | List past runs (paged) |
| `quarantine.detail` | UI → svc | Manifest of one run |
| `quarantine.restore` | UI → svc | Restore selected items from a run |
| `quarantine.purge` | UI → svc | Purge selected runs (irreversible) |
| `history.query` | UI → svc | Activity log with filters |
| `settings.get/set` | UI → svc | Read/write settings (persisted by service) |
| `event.*` | svc → UI | Scan-progress, clean-progress, scan-complete, found-junk, notification-fired |

All methods return `{ ok: true, data }` or `{ ok: false, error: { code, message } }`. Codes are typed constants shared between TS and Rust via codegen.

### 4.4 Privilege model

- **Service:** LocalSystem. Has `SeImpersonatePrivilege` (treat as priv-esc grade — see §4.2).
- **UI:** runs as logged-in user, no elevation, ever.
- **Install:** one UAC prompt for the installer, which registers the service.
- **Uninstall:** removes service cleanly (`sc stop && sc delete`), removes Run-key, deletes program files, asks user whether to purge quarantine.

---

## 5. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Service language | Rust | Memory safety on a SYSTEM-level binary is non-negotiable |
| Service runtime | Tokio | Async IO for IPC + scanner |
| Service framework | `windows-service` crate | De facto standard, Mullvad uses it in production |
| Windows API access | `windows` crate (Microsoft official) | For SCM, security descriptors, restore points, toast API |
| IPC | `interprocess` + JSON-RPC 2.0 | See §4.2 |
| Compression | `zip` crate (with Zstd feature) | ZIP method 93 (Zstandard) |
| Hashing | `blake3` or `sha2` | sha2 for compatibility, blake3 if speed wins |
| Logging | `tracing` + `tracing-subscriber` + `tracing-appender` | structured JSON logs, rotated |
| Notifications | `tauri-winrt-notification` | wraps WinRT toast API; AUMID registration required |
| Tray | `tray-icon` (Tauri ecosystem) | de facto standard |
| UI framework | Tauri 2 | small binary, Rust core, webview UI |
| UI lang | TypeScript + React 18 | |
| UI components | shadcn/ui (copy-paste) | components live in our repo, no upstream lock-in |
| UI styling | Tailwind CSS v4 | utility-first, smallest bundle, container queries native |
| UI primitives | Radix UI | accessibility battery-included |
| UI icons | Lucide React | tree-shakable SVGs |
| UI motion | Framer Motion | 60 fps spring physics in WebView |
| UI state | Zustand | smaller than Redux, no provider tree |
| IPC client cache | TanStack Query | retry, stale-while-revalidate, optimistic updates |
| Schema validation | Zod (TS) ↔ serde (Rust) | runtime validation across the IPC boundary |
| Date | `date-fns` | |
| Bundler | Vite + `vite-plugin-react` | |
| Installer | Tauri NSIS bundler + custom `installerHooks` | hooks call `sc.exe` to register service |
| Auto-update | Custom service-aware pattern (see §14.3) | Tauri's default updater isn't service-aware |

---

## 6. Repository layout

```
D:\VIKASH\windows-cleaner\
├─ apps/
│  ├─ ui/                        Tauri 2 + React UI
│  │  ├─ src/
│  │  │  ├─ components/ui/       shadcn-generated components
│  │  │  ├─ components/app/      app-specific composed components
│  │  │  ├─ pages/               Dashboard, Clean, FormatPrep, Quarantine, History, Settings, About
│  │  │  ├─ hooks/               useIpc, useScanResults, useQuarantine, etc.
│  │  │  ├─ ipc/                 typed RPC client + Zod schemas (codegen from Rust)
│  │  │  ├─ state/               Zustand stores
│  │  │  ├─ design/              tokens, theme provider, motion presets
│  │  │  └─ i18n/                strings (en-US is canonical)
│  │  ├─ src-tauri/              Tauri host (thin — most logic in svc)
│  │  └─ vite.config.ts
│  └─ svc/                       Windows Service binary
│     ├─ src/main.rs             SCM entry, lifecycle
│     └─ Cargo.toml
├─ crates/                       Shared Rust crates
│  ├─ polish-ipc/                JSON-RPC schemas + transport, used by svc and ui side
│  ├─ polish-scanner/            disk scan, category detection
│  ├─ polish-quarantine/         .pq read/write, restore engine
│  ├─ polish-manifest/           manifest JSON spec + writer
│  ├─ polish-rules/              cleanup rule engine + built-in rule catalog
│  └─ polish-platform/           Windows-specific (SCM, restore points, ACLs, AUMID)
├─ packages/                     Shared TS packages
│  ├─ ipc-types/                 codegen'd from polish-ipc (Zod + types)
│  └─ design-tokens/             colors, spacing, motion — single source for Tailwind theme
├─ installer/                    NSIS template + hook scripts + sign config
│  ├─ installer.nsi
│  ├─ hooks/postinstall.nsh      sc.exe create + start
│  ├─ hooks/preuninstall.nsh     sc stop + sc delete
│  └─ resources/                 icons, license, banner
├─ docs/                         user docs (Astro Starlight), see §18
├─ scripts/                      build/sign/release helpers
├─ .github/
│  ├─ workflows/                 ci.yml, release.yml
│  └─ ISSUE_TEMPLATE/
├─ Cargo.toml                    workspace manifest
├─ pnpm-workspace.yaml
├─ package.json
├─ PLAN.md                       (this file)
├─ ROADMAP.md                    (derived from §21)
├─ README.md
├─ SECURITY.md
├─ CONTRIBUTING.md
├─ CODE_OF_CONDUCT.md
└─ LICENSE                       (MIT)
```

Monorepo via **pnpm workspaces** (TS) + **Cargo workspace** (Rust). Single repo for UI, service, shared schemas, installer, docs. CI runs both toolchains.

---

## 7. Information architecture & pages

**Main window layout:** collapsible left sidebar + content area. Sidebar collapses to icon-only (40px). Min window size 900×600. State persisted.

### Sidebar destinations (top to bottom)

| Icon | Destination | Purpose |
|---|---|---|
| 🏠 | **Dashboard** | Default landing — at-a-glance status, top reclaim opportunities, primary CTAs |
| 🧹 | **Clean** | Mode picker → category checklist → preview → run → result (4-step wizard) |
| 🚀 | **Prepare for Format** | 7-step guided wizard (see §9). Accent gold border, visual differentiation |
| 📦 | **Quarantine** | Browse past runs, restore selected items, purge, set retention |
| 📜 | **History** | Append-only activity log, filterable, exportable to CSV/JSON |
| ⚙️ | **Settings** | All preferences (see §12) |
| ℹ️ | **About** | Version, license, contributors, GitHub link, donate |

**Bottom of sidebar (always visible):**
- Service status pulse: green = healthy, amber = paused, red = error
- C: drive mini-gauge (xx% used)

### Tray menu (right-click)

```
●  Status: Idle (last scan 14m ago)
──────────────────────
   Scan now
   Open Polish                       (bold / default action)
──────────────────────
   Pause notifications  ▸  [1h / 4h / Until tomorrow / Always]
   Pause background scans  ▸  [1h / 4h / Until restart]
──────────────────────
   Settings…
   About / Check for updates
──────────────────────
   Quit Polish
```

Left-click on tray icon = open main window (current 2024+ convention).

### 7.1 Dashboard

Bento grid, 12-column responsive (re-flows to 8 / 4 cols at narrower widths).

```
┌──── DISK USAGE  (8 cols) ─────────────┐  ┌── QUARANTINE  (4 cols) ──┐
│ ⊙ animated emerald gauge, 97% full    │  │  3 runs, 4.2 GB           │
│  C: 371 / 375 GB                       │  │  Next auto-purge: 4d       │
│  D:  29 /  99 GB                       │  │  [ Browse → ]              │
│  E:   0 /  14 GB                       │  │                            │
│  [ Scan now ]                          │  │                            │
└────────────────────────────────────────┘  └────────────────────────────┘

┌──── TOP RECLAIM OPPORTUNITIES  (12 cols) ─────────────────────────────┐
│  🗑️  Temp files                            4.2 GB    [✓]               │
│  📦  Docker images (unused)              12.1 GB    [✓]               │
│  🤖  LM Studio cached models            23.7 GB    [ ]               │
│  📁  Old Downloads (>90 days)             1.8 GB    [✓]               │
│                                                                       │
│  Selected: 18.1 GB    →    [ Review & Clean ]                          │
└─────────────────────────────────────────────────────────────────────────┘

┌── LAST SCAN ─┐  ┌── SERVICE ──┐  ┌── ABOUT TO FORMAT? ──┐
│ 14m ago      │  │ ● Healthy   │  │ Start guided format    │
│ Found 41.8GB │  │ Uptime 3d4h │  │ prep wizard →          │
│ [Details →]  │  │ CPU 0.2%    │  │                        │
└──────────────┘  └─────────────┘  └────────────────────────┘
```

Empty states: first-run shows "Welcome — running first scan, ~2 min ⏳". All-clean state shows "All clear ✨ Nothing to reclaim. Last verified Xm ago."

### 7.2 Clean (4-step wizard)

1. **Select** — mode segmented control (Light / Balanced / Aggressive / Custom) + category tree grouped by safety tier (see §8).
2. **Preview** — sticky summary banner: "8 categories, 41.2 GB, destination D:\PolishQuarantine\, retention 14 days." Per-irreversible-action banner ⚠.
3. **Run** — full-page progress: total bar + ETA + current item; animated file-flow visualization; live activity log; Pause / Cancel buttons (Cancel rolls back partial quarantine — bundle is atomic).
4. **Result** — animated count-up of "X.X GB reclaimed", before/after disk gauges, CTAs (Restore / View manifest / Done). Once per 3 successful cleans: subtle "Star us on GitHub" prompt (no-op-able forever from settings).

**Special-case confirms** (any mode):
- DISM ResetBase: "Permanently removes superseded update files. Cannot be undone. Frees ~10 GB." 5-second hold-to-confirm button.
- Hibernation toggle: explainer about Fast Boot trade-off + confirm.
- App uninstall: per-app review modal, multi-select OK.

### 7.3 Prepare for Format

Full wizard — see §9 for steps. Distinct accent gold border on every screen. Persistent "Save & resume later" — wizard state stored in service.

### 7.4 Quarantine

List of past runs (newest first). Filters: date range, drive, mode, size, status (active / purged / restored). Per-row: timestamp, mode badge, bytes, item count, destination drive, days until auto-purge.

Click row → right-side detail drawer:
- Manifest tree: categories → items → file count + size
- "Restore all" / "Restore selected" / "Purge now" / "Export .pq to chosen location" actions
- Restore is itself logged as a quarantine event (so a "restore that was wrong" can be re-quarantined)

Bulk: select multiple runs → batch restore / batch purge / batch export.

### 7.5 History

Append-only activity log. Filters: date range, action type (scan, clean, restore, settings change, service event), severity (info, warn, error). Per-row: timestamp, actor (service/user), action, target, outcome.

Actions:
- Export filtered view to CSV / JSON
- Click a row → full structured detail
- Search across all fields

Useful for bug reports — "what did Polish do at 2pm Tuesday."

### 7.6 Settings

Left sub-nav within Settings page. See §12 for the full catalog.

### 7.7 About

- Version, build hash, build timestamp
- Signing certificate identity (so users can verify trust chain)
- License (MIT) with full text inline-viewable
- Third-party licenses (acknowledgements list — auto-generated)
- Contributors (auto-pulled from GitHub at build time)
- GitHub repo link, docs link, issue tracker link
- "Copy diagnostic info" button (for bug reports — produces a sanitized snapshot)
- Donate / Star — subtle, never urgent

---

## 8. Cleanup modes & category catalog

### 8.1 Modes (locked: **Light / Balanced / Aggressive / Custom**)

Default on first launch: **Balanced**.

| Mode | Time | Typical recovery | Includes | Quarantine retention |
|---|---|---|---|---|
| **Light** | ~5 min | 15–40 GB | Always-safe categories only | 7 days |
| **Balanced** | ~15 min | 35–80 GB | Light + dev caches + DISM cleanup + hibernation toggle (with confirm) | 14 days |
| **Aggressive** | ~30 min | 60–150 GB | Balanced + duplicate detection + Docker prune + WSL audit + uninstall offers | 30 days |
| **Custom** | varies | varies | User-defined; saveable as `.polishprofile` | user-set |

**Three universal rules** (all modes, no exceptions):
1. Nothing is deleted without quarantine first.
2. Irreversible actions always require a separate confirm dialog (DISM ResetBase, MSI uninstalls, hibernation toggle, WSL unregister) — 5-second hold-to-confirm for the worst.
3. Nothing in any mode ever touches: `.ssh/`, `.gitconfig`, `.aws/`, `.azure/`, browser passwords/cookies/history, Documents folder, any user-created file outside known cache paths.

### 8.2 Category catalog (initial, will grow)

Categories are grouped by **safety tier** in the UI (user-friendly mental model), not by technical type. Internal rule engine in `crates/polish-rules` exposes each as a typed `CleanupRule` with: id, label, tier, default-mode-membership, est-size-fn, scan-fn, action-kind (delete/move/uninstall/toggle), irreversible bool, requires-confirm bool.

**Always Safe** (in Light+)
- Recycle Bin contents
- `%TEMP%` and `C:\Windows\Temp` (older than session boundary)
- Browser caches: Chrome, Edge (Default profile only; never cookies/passwords/history)
- Windows Update download cache (`SoftwareDistribution\Download`)
- Delivery Optimization cache
- Crash dumps + Windows Error Reporting queue
- Thumbnail cache (rebuilds automatically)
- Prefetch (with note: rebuilds itself)
- Icon cache
- Old log files in `C:\Windows\Logs\` (>30 days)

**Safe for Devs** (in Balanced+)
- npm cache (`%AppData%\npm-cache`)
- pnpm content-addressable store (`%LocalAppData%\pnpm\store`)
- pip cache (`%LocalAppData%\pip\Cache`)
- Cargo registry cache (`.cargo\registry\cache`, `\src`, `git`)
- Yarn cache, Bun cache, Composer cache, NuGet cache
- VS Code / Cursor workspace caches (NOT settings, NOT extensions)
- Vite / Webpack / Next.js build caches in known project roots (scoped to recognized dev folders)

**System Cleanup** (in Balanced+ with extra confirms)
- DISM `/StartComponentCleanup /ResetBase` — irreversible
- Hibernation file toggle (`powercfg /h off`) — irreversible without re-enable
- Old Windows install (`Windows.old`, `$WINDOWS.~BT`, `$WINDOWS.~WS`) — irreversible
- Optional features inventory: surface installed-but-unused (Internet Explorer mode, WMI providers, etc.)

**Duplicate Installs** (Aggressive)
- Detect multiple major-version installs of: Python, Node, .NET runtimes, Visual Studio, Visual Studio Build Tools, Windows SDKs, MongoDB, MySQL, PostgreSQL
- Surface as "Keep one, uninstall others" picker — never auto-pick

**Large User Content** (Aggressive, always prompts)
- LM Studio models (`.lmstudio\models\`)
- Ollama models (`.ollama\models\`)
- Old Downloads (>90 days, user reviews list)
- Discord / Teams / Slack caches
- Postman local cache (NOT collections)
- Spotify cache
- Steam shadercache + workshop downloads (NOT installed games — too risky)

**Application Caches** (Balanced+)
- WhatsApp media cache (NOT messages)
- Telegram cache
- OneDrive thumbnail cache
- Microsoft Office cache
- Adobe creative-cloud cache

**Bloat removal** (Aggressive, prompt per-item)
- HP Support Assistant suite, OEM bloat (Dell SupportAssist, Lenovo Vantage, etc.)
- WildTangent Games and entries
- McAfee WebAdvisor (when present, not installed Defender)
- Manufacturer-installed "promotion" Appx packages

### 8.3 Cleanup actions Polish will NEVER ship

These are competitor anti-features. Hard exclusion list — even feature-flagged off.

- **Registry cleaners.** Modern Windows is unaffected by orphan registry entries. CCleaner-style "issues found" lists are pure theatre. Skip.
- **"Speed up your PC by N%"** claims. We measure space, not speed. We never quantify a vague speedup.
- **Driver updater.** High-risk (bad drivers brick systems), low-reward, and built into Windows Update + OEM tools. Skip.
- **"Tracker cookies as threats."** Cookies are not malware. We'll surface cookies as one category in Custom mode with neutral labelling; never red-badge.
- **Free-tier upsell toasts disguised as system warnings.** Polish has no upsell because Polish is free.
- **"Active monitoring" enabled by default with no opt-out.** Our background scan IS opt-out-able (Quit from tray = service exits).
- **Self-re-enable after updates.** Disabled features stay disabled across updates.

---

## 9. Format Prep wizard

7 steps. State persists across launches (`save & resume later` works at every step).

### Step 1 — System Snapshot
- Auto-runs full inventory: installed apps (winget + registry + Appx), VS Code/Cursor/JetBrains extensions, browser profiles + extensions, dev toolchain versions (Node, Python, Rust, .NET, Git, Docker, WSL distros), env vars, services, scheduled tasks, drivers (HP / Dell etc.), pinned taskbar items.
- Output: `inventory.json` + human-readable `inventory.md` written to chosen working dir.

### Step 2 — Backup Destination
- Drive picker: auto-detect fixed drives + external/removable. Show free space + estimated backup size.
- Encryption opt-in (AES-256, password stored in Windows Credential Manager).
- Compression level slider.

### Step 3 — Backup Execution
Checklist of what to copy (user can uncheck):
- **Credentials & keys** (DO NOT LOSE): `.ssh/`, `.gitconfig`, `.aws/`, `.azure/`, `.docker/`, `.npmrc`, `.gnupg/`, `.kube/`
- **AI/dev tool configs**: `.claude/`, `.cursor/`, `.vscode/`, VS Code / Cursor user settings, PowerShell profiles
- **App data folders**: Postman (collections), MobaXterm (sessions), FileZilla sitemanager, NinjaTrader / MetaTrader / Bookmap workspaces, Discord (skip — phone-verify after install), Notion, MongoDB Compass favourites
- **Browser data**: prompt to use built-in sync first; offer profile-folder copy as fallback; export bookmarks HTML; export passwords (encrypted)
- **Databases**: MySQL `mysqldump`, MongoDB `mongodump`, list any local SQLite files in Documents
- **XAMPP / htdocs**: if present
- **WSL distros**: `wsl --export` each
- **Docker**: save needed images + volumes (user-selects)

Progress UI shows per-item: bytes copied, ETA, integrity check.

### Step 4 — Verify Backup Integrity
- SHA-256 over every backed-up file
- Compare against source
- Red flag if any mismatch — must resolve before continuing

### Step 5 — Cleanup
- Optional. Defaults to Aggressive mode pre-selected, user reviews & approves.
- Skip option for users who just want backup + restore plan, not cleanup.

### Step 6 — Generate Restore Plan
Outputs to working dir:
- `winget-export.json` (one-command restore: `winget import -i winget-export.json`)
- `vscode-extensions.txt` + restore script
- `cursor-extensions.txt` + restore script
- `npm-globals.txt` + restore script
- `pip-freeze.txt` + restore script
- `env-vars.reg` (user PATH and key env vars, importable)
- `taskbar-pins.txt` (manual re-pin list)
- `manual-install-list.md` (apps with no winget ID, e.g. NinjaTrader, Bookmap, MetaTrader)
- `RESTORE-README.md` (step-by-step playbook with command snippets)

### Step 7 — Final Greenlight
- Printable / exportable summary checklist
- Big "OK to format" greenlight only after every prior step's checkpoint is green
- Reminder: "Verify backup destination is unplugged or moved off this machine before formatting"

---

## 10. Quarantine system & `.pq` format

### 10.1 Safety model

Every cleanup action is **quarantined first**. Three layers:

1. **Windows System Restore Point** auto-created before any run that touches system files (DISM, hibernation, uninstalls). Free, native, undoable from Windows recovery.
2. **`.pq` quarantine bundle** — user files moved into the bundle (not deleted). Atomic per run. Restore is one click.
3. **JSON manifest sidecar** — every action logged: timestamp, path, size, before-hash, action-kind, category-id. Manifest is human-readable, loadable without extracting the bundle.

### 10.2 Quarantine destination

User picks per run (with smart auto-detect & recommendation):

1. **Same drive** (default if free space ≥ 10% of quarantine size)
2. **Other internal drive** (recommended if a different fixed drive has ≥ 2× quarantine size free)
3. **External drive** (recommended for portability / archival)

Service auto-creates `\<chosen-drive>\PolishQuarantine\` on first use. Per-run subdirectory: `<chosen>\PolishQuarantine\polish-YYYY-MM-DD-HHMM\`.

**Same-drive optimization:** quarantine performs `MoveFile` instead of copy when source and destination are on the same volume. Zero space overhead; instant. Cross-volume cases fall back to copy + verify + delete, with explicit space-check first.

If no destination has space: block + tell user which drives lack space and how much they need.

### 10.3 `.pq` format spec (v1)

A `.pq` file is a **ZIP container** using ZIP method 93 (Zstandard) when "max compression" is selected, else Deflate. Inside the ZIP, the directory structure mirrors the original file system relative to a per-category root.

```
polish-2026-05-28-14-32.pq               (ZIP container)
├─ _manifest.json                        (embedded copy of the sidecar manifest)
├─ _signatures.json                      (BLAKE3 hashes of every entry)
├─ always-safe/
│  ├─ recycle-bin/...
│  ├─ temp/...
│  └─ browser-cache/...
├─ safe-for-devs/
│  ├─ npm-cache/...
│  ├─ pip-cache/...
│  └─ ...
└─ ...
```

Sidecar `polish-2026-05-28-14-32.pqmanifest.json` lives next to the `.pq`, never inside it (so the manifest is readable without decompression):

```json
{
  "pq_version": 1,
  "run_id": "polish-2026-05-28-14-32",
  "started_at": "2026-05-28T14:32:00+05:30",
  "completed_at": "2026-05-28T14:38:21+05:30",
  "mode": "balanced",
  "host": "VIKASH-OFFICE-L",
  "user": "vikas",
  "destination": "D:\\PolishQuarantine\\",
  "retention_days": 14,
  "purge_at": "2026-06-11T14:38:21+05:30",
  "encrypted": false,
  "compression": "zstd",
  "total_bytes": 41241948160,
  "item_count": 12483,
  "categories": [
    {
      "id": "browser-cache.chrome.default",
      "label": "Chrome cache (Default profile)",
      "tier": "always-safe",
      "action": "move",
      "bytes": 1438298112,
      "item_count": 4821,
      "items_log": "_logs/browser-cache.chrome.default.jsonl"
    }
  ],
  "system_restore_point": { "id": "12847", "created_at": "2026-05-28T14:32:01+05:30" },
  "signatures": { "manifest_sha256": "..." }
}
```

Each category has a JSONL items log inside the bundle (`_logs/<category-id>.jsonl`) with one line per file: original path, size, blake3, action, error-if-any.

**Encryption:** optional, AES-256-GCM via ZIP encryption layer (or our own envelope if ZIP AES support is patchy). Key derived from user-supplied passphrase via Argon2id; stored in Windows Credential Manager keyed by run-id so the user doesn't have to re-enter it.

**Format extensibility:** `pq_version` integer at top. v2+ bumps trigger explicit migration. Old `.pq` files are always readable in newer Polish (forward-compat read).

### 10.4 Restore semantics

- Restore reads manifest first. Confirms destination paths still resolvable.
- Restores into the **original path** by default. If original path is occupied by a newer file, prompts user (skip / overwrite / restore-with-suffix).
- Restore is itself logged as a new action in History.
- Partial restore supported (per category, per item).

### 10.5 Auto-purge

- Each run has a `purge_at` timestamp.
- Background scheduler purges expired runs daily at 03:00 local (configurable).
- User is warned 24 h before purge if any item from that run was not restored.

---

## 11. Background scanner & notifications

### 11.1 Scanner policy

- **Idle detection:** CPU < 20%, no fullscreen app, AC power (or > 50% battery).
- **Throttle:** capped at 5% CPU; uses Windows job objects to enforce.
- **Cadence:**
  - Light incremental scan every 30 min (checks "easy" categories — temp, recycle, cache)
  - Full scan every 24 h during idle window
  - On-demand: `scan.start` IPC from UI = immediate
- **Persistence:** scan results stored in service-side SQLite (`%ProgramData%\Polish\state.db`), survives restarts.

### 11.2 Notifications

**Default policy:** notify-only. Service never deletes without user click (user can opt into Safe-auto or Full-auto-whitelist in Settings).

**Notification rules** (defaults, all overridable in Settings):
- **One toast per day max**, batched at user's chosen time (default 10:00 local).
- **Threshold:** notify only when reclaim opportunity > 1 GB OR critical issue (disk < 5% free, dump file > 500 MB).
- **Quiet hours:** 22:00–08:00 local — no toasts.
- **Weekends:** skip by default; user can enable.
- **DND-aware:** query `ToastNotificationMode` before every send. If not `Default`, route to Action Center silently (no sound, no banner). Polish never requests priority-app status.
- **Snooze:** uses system-handled snooze (`activationType="system" arguments="snooze"`), persists across restarts. If user snoozes the same notification twice, auto-extend snooze and offer "Stop suggesting this for 30 days."
- **Tag/group:** new toast for same category collapses (replaces) old; never stacks.
- **AUMID registration:** required and done at install time. Without it, Win11 silently drops toasts. Reg path: `HKCU\Software\Classes\AppUserModelId\polish.app` with `DisplayName` + `IconUri`.

**Toast content** (one batched daily digest):

```
Polish — Daily summary
You can reclaim ~14.8 GB across 5 categories.
[ Clean now ]  [ Snooze ▾ ]  [ Dismiss ]
```

Buttons:
- `Clean now` → opens main window on Clean → Step 1 with the items pre-selected
- `Snooze` → system snooze submenu (1h / 4h / Until tomorrow)
- `Dismiss` → standard

**Critical-issue toast** (separate from daily digest, fires immediately):

```
Polish — Disk almost full
C: has 1.2 GB free (0.3%). Cleanup recommended.
[ Start cleanup ]  [ Dismiss ]
```

This is the only type that may interrupt outside the daily digest window — and even then, respects DND.

### 11.3 Tray icon

- Win11 hides new tray icons in the overflow flyout by default. We accept this — never auto-pin, never nag.
- **First-run onboarding card** in main window shows a screenshot pointing to Settings → Personalization → Taskbar → Other system tray icons, with a "Copy taskbar settings path" button (`ms-settings:taskbar`). Shown once.
- Tray icon states: idle (emerald), scanning (animated pulse), paused (gray), error (amber). Never red — red is reserved for security.

---

## 12. Settings catalog

Settings page has a left sub-nav with these sections:

### General
- Start Polish at Windows boot (default: on)
- Launch UI at login (default: on)
- Theme (Auto / Light / Dark)
- Language (auto-detect, override list)
- Accent color tweak (Polish emerald / Polish gold / system accent)

### Scanning
- Enable background scanning (default: on)
- Scan cadence: incremental every (15 / 30 / 60 min); full every (12 / 24 / 48 h)
- Throttle: max CPU % during scan (default 5%)
- Scan on battery (default: off)
- Idle threshold: minutes of inactivity before deep scan (default 5)
- Quiet hours: start / end times (default 22:00–08:00)
- Skip drives: per-drive opt-out list

### Cleanup defaults
- Default mode on Clean page (Light / Balanced / Aggressive / Custom-last)
- Default quarantine destination strategy (auto-recommend / always same drive / always other drive / always external / ask each time)
- Retention per mode (Light 7d / Balanced 14d / Aggressive 30d / Custom user-set)
- Hold-to-confirm duration for irreversible actions (default 5s)
- Show "Star us on GitHub" prompt after N successful cleans (default 3; can be disabled)

### Notifications
- Daily summary toast (on / off)
- Daily summary time (default 10:00 local)
- Threshold to fire: minimum reclaim size to notify (default 1 GB)
- Weekend notifications (off by default)
- Critical-issue interrupts (disk-near-full, large dump) — on by default, can disable separately
- Per-category notification mutes (granular)

### Auto-clean (advanced — explicit warning on opening)
- Policy: Notify-only (default) / Safe-auto / Full-auto-with-whitelist
- If Safe-auto: list of categories that may auto-clean (default: Always Safe tier only)
- If Full-auto: editable whitelist of categories
- Daily auto-clean time (default 04:00 local)
- "I understand this runs without confirmation" toggle gate

### Quarantine
- Default destination drive priority list (drag-to-reorder)
- Compression algorithm (Deflate / Zstd — default Zstd)
- Compression level (1–9, default 6)
- Encryption enabled (off by default)
- Password (if encryption on) — stored in Windows Credential Manager
- Auto-purge time (default 03:00 local)
- 24h pre-purge warning (default on)

### Privacy
- Send anonymous usage statistics (default: off — opt-in only)
- Send crash reports (default: off — opt-in only)
- Telemetry endpoint URL (read-only display so users can verify destination)
- Diagnostic info export — manual button only
- "What we collect" link → docs.polish.io/privacy with full schema

### Service
- Service status (live)
- Restart service (button)
- Service logs path (clickable to open in Explorer)
- "Reinstall service" recovery button
- Version of running service binary

### Updates
- Check for updates (button + last-checked timestamp)
- Auto-check (default: daily)
- Update channel: Stable / Beta (default: Stable)
- Install timing: Next launch / Scheduled (default 04:00 local) / Manual
- Update notes link

### Advanced
- Open `%ProgramData%\Polish\` in Explorer
- Open log directory
- Open quarantine root
- Export current settings to JSON (for backup or sharing)
- Import settings from JSON
- Reset all settings to defaults (with confirm)
- Developer options (only visible if env var `POLISH_DEV=1`): mock data, force-fail toggles, log level

### About (sub-section, also accessible from sidebar)
Same content as §7.7.

---

## 13. Security & privacy

### 13.1 Threat model

- **In-scope threats:**
  - Local malware tries to talk to our SYSTEM service via the named pipe (privilege escalation).
  - Compromised UI process (e.g., XSS in a webview render) tries to invoke privileged actions.
  - Tampered update binary tricks users into running malicious code.
  - Data exfiltration via quarantine bundles (sensitive files swept in).
- **Out-of-scope (v1):**
  - Remote attackers (no network listener in Phase 1).
  - Kernel-level rootkits (we are user-mode + service; not a security tool yet).
  - Supply-chain attacks on Rust/npm deps (mitigated by lockfiles, SBOM in §17, but not solved).

### 13.2 Mitigations

- **IPC DACL:** named pipe security descriptor grants only the interactive logon SID R/W; anonymous denied. NO default NULL descriptor (CyberArk/Docker bug class).
- **Per-call SID validation:** every privileged RPC call validates caller SID, not just connection. Refuses if caller token != UI process token.
- **Schema validation everywhere:** every IPC message validated by Zod/serde. Reject + log on mismatch.
- **Service binary integrity check:** on start, service verifies its own signature; refuses to start if signature missing/invalid (with override for dev builds).
- **No sensitive files in quarantine:** scanner skips `.ssh/`, `.aws/`, `.azure/`, `.gitconfig`, browser password/cookie/history DBs, Documents folder, user-created files outside known cache paths. Whitelist-based, not blacklist.
- **Encrypted quarantine option:** for users who include sensitive paths in Custom mode — AES-256-GCM, Argon2id KDF, key in Credential Manager.
- **Signed binaries** (service, UI, installer) — see §14.2.
- **Update verification:** updater verifies signature of downloaded artifact before swap. Signature mismatch = abort + alert.
- **No outbound network calls without explicit user opt-in.** Phase 1: zero network calls by default. Update check, telemetry, crash reporting all opt-in (telemetry/crash) or have clear in-UI trigger (update check).

### 13.3 Privacy

- **Local-first by default.** Polish works fully without an account or network.
- **No telemetry by default.** Opt-in only, with a "what we collect" link showing the literal JSON schema.
- **What we will NEVER collect:** file paths, file names, file contents, environment variables, hostname, user name, IP address.
- **What we MAY collect (opt-in):** OS version, app version, anonymous install ID (rotatable), counts (scans run, items cleaned, GB freed — bucketed), feature usage (which pages opened — booleans only), crash stack traces (sanitized).
- **Self-hostable telemetry backend** later — for paranoid users / fork operators.
- **Public privacy policy** at `docs.polish.io/privacy` from day 1.
- **GDPR/CCPA:** export-my-data + delete-my-data endpoints when cloud account exists (Phase 2).

### 13.4 Disclosure policy

- `SECURITY.md` in repo with contact (`security@polish.io` or a TBD address) + PGP key.
- 90-day coordinated disclosure window.
- Hall of fame for reporters; no bounty in v1 (no budget).

---

## 14. Distribution, signing, updates

### 14.1 Distribution channels (v1)

| Channel | Priority | Notes |
|---|---|---|
| **GitHub Releases** | P0 (primary) | Signed NSIS installer + portable ZIP. Source of truth. |
| **winget** | P0 | Submit manifest to `microsoft/winget-pkgs` on each release |
| **Scoop** | P1 | Maintain own bucket (`polish-app/scoop-bucket`) |
| **Chocolatey** | P1 | Community package, requires moderation |
| **polish.io download** | P1 | Convenience redirect to latest GitHub release |
| **Microsoft Store** | P2 (Phase 2) | Restrictive policies for cleaner-class apps + slow review. Defer to after product-market fit. |

### 14.2 Code signing

**Decision:** apply to **SignPath Foundation** (free for OSS, HSM-backed, GitHub Actions CI integration). MIT license + active maintenance + reproducible builds qualifies. SignPath Foundation appears as the publisher; project name appears in subject. Used by Notepad++, Greenshot, AutoHotkey.

**Fallback if rejected:** **Certum Open Source** cert (~€69 initial + €29/yr). Issued to individual; YOUR name is publisher.

**Hard skips:**
- Azure Trusted / Artifact Signing — currently org-only with ≥3-yr verifiable history requirement. Blocked.
- EV certificates ($279+/yr) — no longer bypass SmartScreen (Microsoft removed instant-trust around 2024). Not worth the cost.

**What gets signed:**
- `polish-svc.exe` (service)
- `polish-ui.exe` (UI)
- `polish-cli.exe` (if shipped)
- Every sidecar binary
- NSIS installer
- All signatures use RFC 3161 timestamping so signatures survive cert expiry.

**Reality check for users:** expect SmartScreen warnings for weeks/months while reputation builds. README will include a "Right-click → Properties → Unblock" guide for early adopters.

**2026 deadline:** effective March 1 2026, max code-signing cert validity dropped from 39 months to ~460 days (CA/B Forum). Re-issuance is now ~annual. Plan for it.

### 14.3 Update mechanism

Tauri's built-in updater is **not service-aware** — replacing `polish-svc.exe` while the service holds the file lock causes sharing-violation errors.

**Custom service-aware pattern:**

1. UI checks for updates (manual or scheduled).
2. New version found → UI prompts user to update.
3. On confirm, UI sends `service.prepareForUpdate` IPC.
4. Service flushes state to disk, releases handles, exits with SCM-known "no-restart" code (`sc config polish-svc start= demand` temporarily).
5. UI runs NSIS updater in passive mode (`/P`).
6. NSIS `POSTINSTALL` hook re-registers service auto-start (`sc config polish-svc start= auto`) and starts it (`sc start polish-svc`).
7. UI reconnects to new service over pipe.
8. If any step fails, service is restored to previous binary + auto-start setting; user is alerted.

Update channels: **Stable** (default) and **Beta** (opt-in). Patch releases auto-install at scheduled time (default 04:00 local); minor/major updates always prompt.

---

## 15. Telemetry, logging, crash reporting

### 15.1 Logging

- **Library:** `tracing` + `tracing-subscriber` + `tracing-appender` (Rust). On UI side: a thin TS wrapper that forwards logs to service via IPC for unified collection.
- **Format:** structured JSON (one event per line). Includes timestamp, severity, module, message, fields.
- **Rotation:** daily, retain 14 days, max 50 MB total. Auto-prune oldest first.
- **Location:** `%ProgramData%\Polish\logs\` (service) — readable by user via "Open log directory" in Settings.
- **Levels:** ERROR / WARN / INFO / DEBUG. Default INFO. DEBUG only if env var `POLISH_LOG=debug` set or in dev builds.
- **PII filter:** never log file contents. File paths are logged only at DEBUG level. INFO-and-up logs use category IDs not paths.

### 15.2 Telemetry (opt-in only, Phase 1 = none by default)

- **Library:** none from day 1. Code structured so adding it later doesn't require schema gymnastics.
- **When added (Phase 1.5 or 2):** prefer self-hostable (Plausible Analytics, PostHog self-hosted) over SaaS. If SaaS for cost reasons, document endpoint clearly.
- **Schema:** publicly documented before code lands. Privacy policy URL in toggle UI.

### 15.3 Crash reporting (opt-in only)

- **Library candidate:** Sentry (sentry.io free tier for OSS) OR self-hosted GlitchTip. Both speak the Sentry SDK protocol so swap is trivial.
- **What's sent:** stack trace, OS version, Polish version, anonymous install ID. Source paths sanitized (no usernames in paths).
- **User control:** opt-in toggle. Every crash report shows a "see what was sent" preview before send, with cancel button.

---

## 16. Internationalization

- **v1 ships English (en-US) only.**
- All UI strings extracted to i18n files from day 1 — never hardcoded.
- **Library:** `i18next` + `react-i18next`.
- **Structure:** namespaces per page (`dashboard.json`, `clean.json`, etc.); shared `common.json` for buttons/labels.
- **Source language:** en-US is canonical. All other locales are translations of en-US.
- **Community translations:** post-launch via Crowdin (free for OSS) or weblate. PR-based for low-volume languages.
- **Locale switcher** in Settings > General, with "Auto-detect from Windows" default.
- **Right-to-left** layout: Tailwind v4 supports logical properties; we use them from day 1 so RTL "just works" once an RTL language lands.

---

## 17. Testing & CI/CD

### 17.1 Testing strategy

| Layer | Tooling | Coverage target |
|---|---|---|
| Rust unit | `cargo test` | 70% statements, 100% on `polish-rules` rule definitions |
| Rust integration | `cargo test --features integration` against a temp dir filesystem | every cleanup rule has a "scan → preview → execute → restore" round-trip test |
| IPC contract | shared test harness — service starts in-process, UI calls each RPC method | every RPC method has happy + error path tests |
| TS unit | Vitest + `@testing-library/react` | 60% statements on `pages/`, 80% on `hooks/` |
| E2E | Playwright on the built Tauri app, via `tauri-driver` | smoke tests of Dashboard, Clean wizard happy path, Quarantine restore, Settings persistence |
| Manual QA matrix | per release | Windows 10 22H2 / 11 23H2 / 11 24H2 / 11 25H1; user / admin install; UAC standard / elevated; with/without OneDrive |

### 17.2 CI/CD

- **GitHub Actions** workflows in `.github/workflows/`.
- **`ci.yml`** on every PR: lint (clippy + ESLint), format check (rustfmt + Prettier), test (cargo test + vitest), build (cargo build + vite build), no signing.
- **`release.yml`** on tag push (`v*`): full test + build matrix → sign via SignPath GitHub Action → NSIS bundle → upload to GitHub Releases → submit winget PR → publish Scoop manifest update.
- **Pre-release on push to `main`:** unsigned dev build, posted as a draft GitHub release with `[ci skip]` opt-out.
- **SBOM generation:** CycloneDX SBOM (Rust via `cargo-cyclonedx`, npm via `@cyclonedx/cyclonedx-npm`) attached to every release.
- **Dependency review:** Dependabot enabled. Major updates require manual review; patch/minor auto-PRed.

---

## 18. Documentation

- **Site:** `docs.polish.io` (or `polish.io/docs`) built with **Astro Starlight** (MIT, clean defaults, free hosting on GitHub Pages or Cloudflare Pages).
- **Sections:**
  - Getting started (install, first scan, first cleanup)
  - User guide (Dashboard, Clean modes, Format Prep wizard, Quarantine, Settings)
  - Privacy policy (what we collect, never collect, opt-in mechanics)
  - Security policy + responsible disclosure (mirrors `SECURITY.md`)
  - `.pq` format spec (so users can verify / extract independently)
  - Cleanup rule catalog (one page per rule with what/why/safety notes)
  - Contributing guide (Rust + TS setup, how to add a cleanup rule, how to add a translation)
  - Architecture overview (service ↔ UI, IPC, signing chain)
  - FAQ / troubleshooting
  - Changelog (auto-generated from Conventional Commits)
- **README in repo:** terse — what it is, install link, screenshot, link to docs site for everything else.

---

## 19. Competitive landscape & opportunity

Per-competitor summary (May 2026 research):

| Tool | License / Price | Architecture | Killer feature | Worst sin |
|---|---|---|---|---|
| **CCleaner** | Free / $24.95–$39.95 yr (Pro / Pro Plus) | Installer + background svc + tray | "Health Check" 1-click flow | Bundled offers, Pro nag toasts, 2017 supply-chain backdoor still cited, registry-cleaner snake oil, Avast/Gen Digital baggage |
| **BleachBit** | GPLv3, free | Single installer or portable, Python-based | Trust + breadth (70+ per-app cleaners) | Ugly Tk UI, intimidating checkbox list, no scheduling, no startup/uninstall manager |
| **Wise Disk Cleaner / Care 365** | Free / $39.95 yr | Installer + tray + sched tasks | Fast scans, clean budget UI | Bundled-offer installer, registry-cleaner bogus claims, Chinese-ownership opacity, aggressive upsell |
| **Glary Utilities** | Free / $39.95 yr (3 PCs) | Installer + tray + sched tasks | Broadest single-app toolset | Weekly nag updates, "memory optimizer" snake oil, broken-English support, ads/popups, opacity |
| **PrivaZer** | Free (donations) / Pro / Donor | Installer + portable, no service | Forensic-grade free-space wipe + residual-trace removal nobody else does | Dated cluttered UI, "advanced" mode overwhelms novices, slow (because thorough) |
| **WinDirStat / WizTree / SpaceSniffer** | Free (WizTree Pro $25 one-time) | Portable .exe or installer | WizTree's MFT-direct scan is the speed benchmark | Pure visualizers — show, don't clean. No integration with cleaners. |
| **Storage Sense (built-in Win11)** | Free, OS-bundled | OS service, low-disk reactive | Zero install, integrated | Off by default, only system drive, misses everything dev-relevant (WSL2 VHDX, Docker VHDX, IDE caches, npm/pip/cargo, node_modules), opaque |

### Table-stakes features (every Windows cleaner ships these → Polish must too)
1. Temp/junk file cleaner (Windows + per-app)
2. Browser cache/cookies/history (Edge, Chrome, Firefox, Brave at minimum)
3. Recycle Bin emptier with size preview per drive
4. Startup app manager (enable/disable/measure impact)
5. Uninstaller with leftover-file sweep

### Five things users want that NOBODY ships (Polish's offensive moves)
1. **Developer-aware cleanup** — `node_modules`, `.venv`, `__pycache__`, `target/`, Docker/WSL2 VHDX compaction, npm/pnpm/pip/cargo caches. Polish §8.2 "Safe for Devs" + "Large User Content" tiers cover this.
2. **Treemap visualization fused with one-click cleanup** — WizTree shows, CCleaner cleans, no one bridges. Polish should add a treemap view (post-v1.0 in Phase 1.5).
3. **Trustworthy diff/preview before delete with per-category restore points** — Polish quarantine + manifest + restore is exactly this.
4. **Schedule-aware quiet mode** (idle / AC-powered / disk-pressure aware) with audit log — Polish §11.1 + §7.5.
5. **Fast cross-drive duplicate finder** (MFT-based, content-hash, dedupe-aware) — post-v1.0 addition.

### Three things competitors do badly (Polish's wedge)
1. **Trust & transparency** — bundled offers (CCleaner, Wise, Glary), opaque telemetry, Chinese-ownership opacity (Glary, Wise), Avast/Gen Digital baggage (CCleaner). MIT + OSS + verbose dry-run + signed binaries = differentiator.
2. **Dev / power-user workloads** — every commercial tool targets grandma; nobody handles WSL2, Docker, IDE caches, package-manager debris. Polish leans into this audience.
3. **Honest claims** — "Speed up 300%!", "Fix 4,287 registry errors!", "Update all drivers!" are all snake oil. Polish refuses to lie. Numbers reported are real bytes freed, not invented scores.

### Top 10 cleanup categories v1 MUST support (validated against catalog in §8.2)
1. Windows temp (`%TEMP%`, `C:\Windows\Temp`, prefetch where safe) ✓
2. Browser caches (Edge, Chrome, Firefox, Brave, Opera, Arc) — extend §8.2 from just Chrome+Edge to include Firefox, Brave, Opera, Arc
3. Recycle Bin (per-drive) ✓
4. Windows Update leftovers (`SoftwareDistribution\Download`, superseded WinSxS via DISM) ✓
5. Old logs/crash dumps (CBS, DISM, Windows Error Reporting, minidumps) ✓
6. Thumbnail/icon cache + DNS cache + font cache — extend §8.2 to add DNS cache + font cache
7. Per-app caches (Teams, Discord, Slack, Spotify, Zoom, Steam shadercache, Adobe) — extend §8.2 to add Slack, Spotify, Zoom, Steam shadercache, Adobe
8. Developer caches (npm, pnpm, yarn, pip, cargo, go-build, WSL2/Docker VHDX compaction, orphan `node_modules`) — extend §8.2 to add go-build, WSL2/Docker VHDX compaction explicitly, orphan node_modules detection
9. Duplicate file finder (content-hash, configurable threshold) — add to §8.2 "Aggressive" tier
10. Large-file/treemap analyzer with delete action — add to roadmap Phase 1.5 (`v1.x`), not v1.0

> **PLAN delta noted.** The above adds the following to the v1.0 MUST-have list in §20: Firefox/Brave/Opera/Arc browser cache, DNS+font cache, Slack/Spotify/Zoom/Steam shadercache/Adobe app caches, go-build cache, WSL2 VHDX compaction, Docker VHDX compaction, orphan node_modules detection. Duplicate finder and treemap analyzer are deferred to v1.x.

### Top 5 features Polish must NEVER build (hard rules)
1. **Registry "cleaner"** — Microsoft says don't, Malwarebytes calls it snake oil, measurable benefit is zero, downside is bricked systems.
2. **Driver updater** — proven scam category (XDA), malware vector; defer to Windows Update / OEM tools.
3. **"Speed boost / RAM optimizer / Game Booster"** — modern Windows manages memory; flushing working sets *hurts* performance. Marketing fiction.
4. **Bogus threat/privacy scores** — counting normal cookies as "23 trackers found!" (CCleaner's MO). Erodes trust.
5. **Bundled offers / nagware / "Pro" upsell popups** — #1 complaint across every commercial competitor. Don't even build the plumbing.

### Anti-pattern hard rules (lifted from §11.2 / §8.3 and reinforced)
- Never invent urgency. No red badges for non-security findings.
- Never re-enable disabled features on update.
- Never auto-enable monitoring without opt-out.
- Never bundle/promote 3rd-party software in installer.
- Never make "speed up by N%" claims.
- Never use scare-tactic language ("YOUR PC IS AT RISK!").
- Never count normal cookies as "threats."
- Never collapse free-tier ↔ paid upsell into the toast UX.

### Post-debate corrections (2026-05-28)

- **EV cert + SmartScreen reputation is the real market entry tax**, not feature breadth. CCleaner / Wise / Glary all have multi-year signing reputation. New entrants face 3–6 months of SmartScreen seasoning during which install-completion rates run 30–60% lower. Built into v1.0 launch calendar (§20, §21).
- **NinjaOne / Atera / Kaseya / ConnectWise are NOT cleanup competitors.** They are full RMM suites that bundle cleanup as one of 40+ features. MSPs do not have a standalone-cleanup budget line. If Polish ever pursues MSP (deferred — see §3 Phase 3 gate), the only viable route is **marketplace integration listings**, not standalone B2B sales.
- **BleachBit overlap.** Polish's "open source + trust + quarantine" wedge overlaps BleachBit's existing positioning on 3 of 4 points. The genuine, defensible wedges are: (1) dev-cache + AI-model categories, (2) atomic quarantine (no competitor has it), (3) Format Prep wizard (no competitor has it). Wedge statement is led by these, not by "open source" generically.
- **TAM correction.** Real Windows PC utilities / optimization market is ~$1.05B / 5.8% CAGR (Mordor Intelligence, Apr 2024) — not "$1–3B / 8–10%." Trend is flat-to-declining, not growing, as Microsoft ships native cleanup primitives (Dev Drive in 23H2, `wsl --shrink` in preview, Storage Sense expanding).
- **CCleaner complaint sourcing.** Prior internal references to "1,035 Trustpilot complaints" conflated review count with complaint count. Replace with sentiment breakdown pulled fresh pre-launch (avg rating + top 3 complaint themes by % of negative reviews + pull date).

---

## 20. MVP scope (v1.0)

> Post-debate v2 descope. Prior v1.0 included Format Prep wizard, full Dev/AI catalog, Aggressive/Custom modes, background scanner, Pro tier. All moved to v1.1 (table stakes) or v1.2 (Pro + Format Prep + Dev/AI). v1.0 is now a **free OSS narrow MVP** focused on shipping signed, seasoning SmartScreen reputation, and proving the trust + dev-category wedge.

**Ship criteria:** every checkbox below green.

### Must-have (v1.0)
- [ ] Two-process architecture (service + UI) installs cleanly via signed NSIS in one click + one UAC prompt
- [ ] Service starts at boot, UI launches at login, both survive reboots
- [ ] Named-pipe IPC with custom DACL + per-call SID validation (security-reviewed)
- [ ] **Tauri service-aware update pattern proven end-to-end on a throwaway binary (Week 1–3 critical spike — kill switch if fails)**
- [ ] **Light + Balanced modes only** (Aggressive + Custom defer to v1.1) with the categories listed in §8.2 minus Phase-deferred items
- [ ] **One Dev category in v1.0: npm + pnpm + cargo build cache.** WSL2 VHDX, Docker VHDX, LM Studio/Ollama, IDE caches — all defer to v1.2 as Pro features with safer wrapper architecture
- [ ] Quarantine engine writes valid `.pq` bundles + sidecar manifests; restore round-trip works. **Segmented sub-archive layout** (corruption-resistance under power loss). Failure-mode coverage: cross-volume MoveFile fallback under low free space, NTFS reparse/junctions/symlinks, ACL preservation, files-in-use, kill-9 mid-write recovery, 50GB+ bundle round-trip
- [ ] System Restore Point creation before any system-touching action
- [ ] Dashboard, Clean (4-step wizard, modes limited), Quarantine, History, Settings, About pages built
- [ ] Manual scan only (background scanner + daily-digest toast defer to v1.1)
- [ ] Tray icon with the locked menu structure
- [ ] Signed installer (SignPath or Certum fallback) + signed binaries
- [ ] **Microsoft MAPS + VirusTotal partner submissions completed pre-launch** (Defender false-positive mitigation)
- [ ] **3–6 month SmartScreen reputation seasoning window built into launch calendar** — no Pro launch until seasoned
- [ ] Auto-update with the service-aware pattern (validated via Week 1–3 spike)
- [ ] Privacy policy live; zero default telemetry
- [ ] **Opt-in crash reporting (Sentry self-hosted or GlitchTip) shipped in v1.0** — was previously nice-to-have; debate elevated to required (telemetry blind-spot risk)
- [ ] `SECURITY.md` with disclosure policy
- [ ] EN-US localization complete; i18n scaffolding in place
- [ ] CI green on `main`; release workflow tested end-to-end
- [ ] docs.polish.io live with all sections from §18
- [ ] README + LICENSE + CONTRIBUTING + CODE_OF_CONDUCT
- [ ] **Trademark search (USPTO TESS + EUIPO) complete; rename candidates ready (Lacquer / Sweep / Tidy / Clear / Buff)**
- [ ] **Founder runway disclosed and confirmed: $60–90K self-funded for 12–18 months**

### Moved to v1.1 (was Must-have in prior PLAN.md)
- [ ] Aggressive mode + Custom mode
- [ ] Startup app manager + Uninstaller with leftover sweep
- [ ] Background scanner runs idle-aware with 5% CPU cap
- [ ] Daily-digest toast notification with snooze; AUMID registered; DND-respected
- [ ] Encrypted `.pq` bundles
- [ ] `.polishprofile` import/export
- [ ] winget submission, Scoop bucket, Chocolatey package
- [ ] Beta update channel

### Moved to v1.2 (Pro tier launch)
- [ ] Format Prep wizard end-to-end (7 steps); restore plan files generated correctly — **Pro feature**
- [ ] Full Dev/AI catalog (WSL2 VHDX wrapper, Docker VHDX wrapper, LM Studio/Ollama audit, IDE caches, go-build, orphan node_modules) — **Pro features**
- [ ] CLI (`polish` command) — **Pro**
- [ ] Open-core architecture: separate closed-source `polish-pro.exe` companion binary linking MIT engine — **Pro**
- [ ] Stripe + Paddle billing + offline-tolerant license-file validation — **Pro infrastructure**

### Explicitly out of scope (v1.0 through v1.3)
- Cloud sync / account system (Phase 2, v2.0)
- Anti-malware module (Phase 2, v2.0)
- **MSP / Teams / Enterprise B2B dashboard (DEFERRED INDEFINITELY — see §3 Phase 3 re-entry gate)**
- Microsoft Store submission (Phase 2 at earliest)
- Non-English locales (community Phase 1.1+)
- Mobile companion (never)
- Linux/macOS port (maybe Phase 2+ for the scanner crate)
- Lifetime pricing past first-500-seat capped promo at v1.2 launch

---

## 21. Roadmap

> Revised post-debate. Prior dates compressed Pro tier into v2.0 / 2027 Q4 and B2B into v3.0 / 2028. Revised plan launches Pro in v1.2 (separate closed-source binary), defers B2B indefinitely, extends v0.x → v1.0 cycle to allow SmartScreen reputation seasoning + critical Tauri service-update spike.

| Version | Theme | Target | Notes |
|---|---|---|---|
| **v0.x** | Bootstrap + critical spikes | 2026 Q3 | Repo bootstrap, IPC scaffolding, **Tauri service-update spike (Week 1–3 — kill switch)**, signing application (SignPath + Certum fallback), trademark search, founder runway gate |
| **v1.0** | Free OSS MVP (descoped) | **2027 Q1** | Cleanup (Light/Balanced) + Quarantine + npm/pnpm/cargo dev category. Signed. Microsoft MAPS submitted. SmartScreen seasoning begins. |
| **v1.1** | Table stakes + community | 2027 Q2–Q3 | Aggressive/Custom modes, startup mgr, uninstaller, background scanner + daily digest, encrypted `.pq`, `.polishprofile`, winget/Scoop/Choco |
| **v1.2** | Pro tier launch + Format Prep | **2027 Q4** | **Open-core flip lands** (separate closed-source `polish-pro.exe`). Format Prep wizard, full Dev/AI catalog (WSL2/Docker/LM Studio/Ollama as wrappers over MS-native primitives where available), CLI, Custom profile sync. $29/yr + first-500-seat $79 lifetime promo. |
| **v1.3** | Localization + UX polish | 2028 Q2 | EN/community translations live, UI refinements, performance, additional Pro categories per user demand |
| **v2.0** | Cloud + anti-malware (optional) | 2028 Q4 | Polish Account opt-in, `.pq` cloud backup, anti-malware second-opinion module. Gated on $10K MRR sustained from Pro v1.2. |
| **v3.0** | **MSP / Enterprise — DEFERRED INDEFINITELY** | TBD | Re-entry requires all of §3 Phase 3 gate (MRR + paid pilots + RMM marketplace listing + backend hire). No date until gate triggers. |

Dates are aspirational and conditional on:
- Tauri service-update spike succeeding by Week 3 (else architecture pivot or project halt)
- Founder maintaining $60–90K runway across 12–18 months
- SignPath approval or Certum fallback in place by month 3
- Microsoft not shipping `wsl --shrink` GA + Storage Sense dev-aware before v1.2 (else Dev/AI wedge pivots — see §22)

Solo-dev velocity dependent. Re-evaluate quarterly.

---

## 22. Open risks & decisions still pending

> Updated post-debate with risks surfaced by adversarial review. Probability/impact recalibrated where evidence warranted (Storage Sense Low → Medium, Tauri service-update Medium → High).

| Risk / decision | Severity | Mitigation / next step |
|---|---|---|
| **Tauri 2 service-aware update pattern fails the Week 1–3 spike** | **High (probability) / High (impact)** | Single highest technical unknown. If spike fails: revert to single-process architecture (lose SYSTEM-level features) OR accept manual updates as the model. This is a kill-switch gate before further v1.0 investment. |
| **Defender / 3rd-party AV flags `polish-svc.exe` as PUP/HackTool** (NEW post-debate) | **High / High** | Submit to Microsoft MAPS pre-launch. VirusTotal partner submissions. Request whitelist from Defender + major AVs 6+ weeks before public release. Pre-stage signing-chain + SHA verification doc. Top reason indie SYSTEM-level tools die at launch. |
| **EV cert + SmartScreen reputation seasoning (3–6 month install-friction window)** (NEW post-debate) | **High / Medium** | Sign dev builds from month 1. Submit to MS Defender AV trust early. README "Unblock" guide. **No Pro launch until SmartScreen seasoned (~month 6+).** Certum-signed binaries do NOT inherit existing reputation — new-cert friction lasts 3–6 months. |
| **Microsoft ships native parity for Dev/AI categories before v1.2** (`wsl --shrink` GA, Dev Drive expanded, Storage Sense dev-aware) (UPGRADED Low → Medium) | **Medium / High** | Architect Dev/AI catalog as **wrapper over MS-native commands** where available, custom only where not. Kill-switch scenario: if MS ships first, pivot Polish to Format Prep + general cleanup, drop dev-tool framing. |
| **MIT desktop + Pro features = open-core enforcement broken** (NEW post-debate) | High (if Pro in same binary) / Medium | Resolved: Pro features in **separate proprietary `polish-pro.exe`** linking MIT engine as library. Accept ~30% community-fork rate. License-server runtime check explicitly rejected (any fork strips it). |
| **`.pq` corruption mid-write under power loss / 200GB single-bundle pathology** (NEW post-debate) | Medium / High | **Segmented sub-archive architecture** (per-category sub-archives, atomic rename only after sub-archive write+verify, journal file for in-flight ops, BLAKE3 verify-on-restore not verify-on-write). Replaces "100% test coverage" mitigation with specific failure-mode coverage. |
| **Quarantine engine — comprehensive failure-mode coverage required** (refined post-debate) | High / Fatal | 6-week dogfood on 3 dev machines covering: cross-volume `MoveFile` fallback under low free space, NTFS reparse points / junctions / symlinks, ACL preservation, files-in-use during copy, kill-9 mid-write recovery, 50GB+ bundle round-trip. Independent security review before v1.0. |
| **Windows API churn (24H2 / 25H1 / Windows 12 toast / AUMID / Storage API breakage)** (NEW post-debate) | Medium / Medium | Vendor `windows` crate at known-good version; test matrix includes latest Insider build; review cadence per Windows release. |
| **Telemetry blind-spot — no opt-in collection at v1.0 = invisible long-tail failures** (NEW post-debate, was previously deferred) | Medium / Medium | Ship opt-in Sentry / GlitchTip crash reporting in v1.0 (2-week subsystem). "Send anonymous crash reports" opt-in toggle in onboarding. Without this, the only feedback loop is Reddit threads. |
| **Founder runway runs out before v1.2 Pro ships** (NEW post-debate) | Medium–High / Fatal | Disclose runway in months at start. **Required: $60–90K self-funded for 12–18 months.** Below $60K: do not start. If runway depletes mid-build: pause monetization, keep OSS alive at reduced cadence. |
| **Free tier cannibalizes Pro (originally shipped Format Prep + Dev catalog free)** | Resolved | Format Prep + full Dev/AI catalog + encrypted `.pq` + CLI gated to Pro in v1.2. Quarantine + Light/Balanced cleanup + npm/pnpm/cargo stays Free (trust-critical; gating quarantine is brand-killer). |
| **MSP / Teams customer acquisition impossible at solo-dev scale** | High (if pursued) / Fatal-to-that-line | **DEFERRED indefinitely.** Re-entry gate explicit in §3 Phase 3. No further design or marketing investment until gate triggers. |
| SignPath Foundation acceptance not guaranteed | High / High | Apply month 1 (4–8 week processing); Certum Open Source fallback (~€69 upfront + €29/yr + 1–2 weeks KMS-only CI plumbing). Certum reputation does NOT inherit. |
| `polish.io` domain may be taken | Medium / Medium | Verify WHOIS immediately; backup names (`polishapp.io`, `getpolish.com`, `polish.tools`) |
| Trademark conflict on "Polish" in software class | High / High | USPTO TESS + EUIPO search before public push; rename candidates: Lacquer / Sweep / Tidy / Clear / Buff |
| Solo-dev maintenance burden (worsened by Pro tier in v1.2) | High / High | CONTRIBUTING.md welcoming; "good first issue" labels; pin "help wanted" features; Pro support load isolated to v1.2+ when seasoning + reputation + free-user mass justifies it |
| Cleanup of duplicate Visual Studio installs may break user dev environments | High / High | NEVER auto-select VS in any mode. Per-app confirm with "this may break dev environments" warning. |
| LM Studio / Ollama models flagged as "junk" risks user anger (40GB+ models, user-downloaded) | High / High | NEVER auto-checked. Always explicit user check + per-model size disclosure. Pro-tier only (v1.2+). |
| WSL distro unregister is destructive | High / Fatal | NEVER auto-checked. Require export-first flow. Disable in Light/Balanced. Pro-tier only (v1.2+) and wraps `wsl --shrink` (non-destructive) where available. |
| Notification spam will tank trust if defaults are wrong | High / High | Default = one digest per day, threshold 1GB, DND-aware. Aggressively prune in beta (v1.1+). |
| Avast / Gen Digital ships a "trust reset" rebrand and recaptures narrative | Medium / High | Move fast on launch; tie launch press to FTC ruling + Polish transparency; brand as the post-CCleaner cleaner. |

**Still pending decisions** (will resolve during build, not blocking the plan):
- Exact SQLite schema for service state DB
- Default scan exclusion list for user-installed games on D:/E: drives
- Specific telemetry events when crash reporting lands (v1.0)
- Final logo design (engaging a designer or doing it inhouse?)
- Pricing for Pro tier annual sub: currently $29/yr; revisit if conversion <0.3% by month 3 post-v1.2 (re-gate or kill paid)
- Whether to publish to Microsoft Store post-reputation-seasoning (v1.3+)
- License-server runtime check vs separate-binary architecture for Pro — **resolved post-debate to separate binary**

---

## 23. References

### Code signing
- [Azure Artifact Signing pricing & FAQ](https://azure.microsoft.com/en-us/pricing/details/artifact-signing/) — 3-yr org rule blocks indie devs
- [SmartScreen reputation (Microsoft Learn)](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation) — EV no longer bypasses
- [SignPath Foundation for OSS](https://signpath.io/solutions/open-source-community) — free, HSM-backed
- [Certum Open Source Code Signing](https://certum.store/open-source-code-signing-code.html) — cheap fallback
- [CA/B Forum 458-day validity cap (March 2026)](https://cabforum.org/)

### Architecture
- [`windows-service` crate](https://crates.io/crates/windows-service) — Rust Windows Service standard
- [Mullvad VPN windows-service-rs example](https://github.com/mullvad/windows-service-rs)
- [Tauri 2 Windows Installer hooks](https://v2.tauri.app/distribute/windows-installer/)
- [Tauri Issue #11520 — service install limitations](https://github.com/tauri-apps/tauri/issues/11520)
- [`interprocess` crate](https://docs.rs/interprocess) — named-pipe IPC
- [Named Pipe Security & Access Rights (MSDN)](https://learn.microsoft.com/en-us/windows/win32/ipc/named-pipe-security-and-access-rights)
- [CyberArk: Breaking Docker Named Pipes](https://www.cyberark.com/resources/endpoint-security/breaking-docker-named-pipes-systematically-docker-desktop-privilege-escalation-part-1) — bug class to avoid

### Notifications / Tray
- [Adaptive & interactive toast notifications (Microsoft)](https://learn.microsoft.com/en-us/windows/apps/develop/notifications/app-notifications/adaptive-interactive-toasts)
- [ToastNotificationMode / DND (Microsoft Q&A)](https://learn.microsoft.com/en-us/answers/questions/3897802/relation-between-toastnotificationmode-and-do-not)
- [`tauri-winrt-notification` crate](https://crates.io/crates/tauri-winrt-notification)
- [Cotera — Linear-Slack notification firehose post-mortem](https://cotera.co/articles/linear-slack-integration-guide)

### Anti-patterns (cleaners)
- [CCleaner — "Stop the health check nag screen"](https://community.ccleaner.com/t/stop-the-health-check-nag-screen/153788)
- [Discord support — "Honor Win11's System Tray Setting"](https://support.discord.com/hc/en-us/community/posts/22025126316311-Honor-Win11-s-System-Tray-Setting)

### UI / Design
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Radix UI primitives](https://www.radix-ui.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide icons](https://lucide.dev/)
- [Geist font](https://vercel.com/font)
- [Inter font](https://rsms.me/inter/)

---

*End of PLAN.md v1. This is a living document — update on every significant decision change. If reality diverges from plan, prefer updating PLAN.md to documenting drift in commit messages.*
