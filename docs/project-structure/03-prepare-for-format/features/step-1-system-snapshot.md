# Step 1 — System Snapshot

> **Version:** v1.2-Pro
> **Tier:** Pro
> **Page:** [Prepare for Format](../README.md)
> **Status:** designed
> **PLAN.md:** §9 Step 1

## Purpose

Inventory everything important about the user's current system that would be costly to recreate after a format. Output is a machine-readable manifest + human-readable summary.

## User story

"As a Pro user about to wipe my machine, I want Polish to automatically discover everything installed, configured, and important — so I don't have to remember what I need to back up."

## Behaviour

- Runs a comprehensive read-only inventory in parallel across categories:
  - Installed apps (winget + registry uninstall keys + Appx packages)
  - VS Code / Cursor / JetBrains IDE extensions per profile
  - Browser profiles + extensions (Chrome, Edge, Firefox, Brave, Opera, Arc)
  - Dev toolchain versions (Node, Python, Rust, .NET, Git, Docker, WSL distros, Go, Java)
  - Environment variables (user + system PATH, key vars)
  - Services (running + autostart, third-party only)
  - Scheduled tasks (user-created, non-Microsoft)
  - Drivers (OEM specific — HP, Dell, Lenovo)
  - Pinned taskbar items
  - WSL2 distros + versions
  - Docker images + volumes (list, no sizes — that's Step 5)
- Per-source progress indicator while running.
- Output: writes `inventory.json` + `inventory.md` (human-readable) to a temp working dir (user picks the final working dir in Step 2).
- User reviews summary; can re-run individual sources if any failed.

## Inputs

- **IPC calls consumed:** `format-prep.inventory.run({ sources: [...] })` — initiates parallel inventory; emits `event.format-prep-inventory-progress` per source
- **State read:** `useFormatPrepStore.session`

## Outputs

- **IPC calls fired:** `format-prep.inventory.run`
- **State written:** `useFormatPrepStore.session.inventory = { sources, status, manifestPath }`
- **Events emitted:** none from UI

## UI states

| State | When | What user sees |
|---|---|---|
| Not started | Wizard entered fresh | "Click 'Start inventory' to begin." + button |
| Running | Inventory in progress | Per-source progress list with checkmarks as each completes |
| Per-source failed | A specific source errored | Inline retry on that row + continue option |
| Complete | All sources done | Summary table + "Review summary" toggle + "Next: Destination" button |
| Resumed | User re-entered after Save & resume | "Inventory already done at YYYY-MM-DD HH:MM. [Re-run] [Continue]" |

## Edge cases

- **Service needs elevation for a source** (rare — Appx enumeration normally fine): inline "This source requires elevation. [Elevate]" — fires UAC prompt; if denied, source marked skipped with note.
- **Inventory takes > 5 minutes**: large dev machines may have hundreds of packages. Progress bar + per-source clock to reassure.
- **User re-runs inventory after partial completion:** all sources re-run from scratch (idempotent); previous data overwritten.
- **Network drives / mapped drives present but offline:** noted in inventory with "unreachable" flag — does not block.

## Accessibility

- Per-source progress rows use `aria-live="polite"` for completion announcements.
- Summary table is a proper `<table>` with `<th>` headers.

## Telemetry (opt-in, v1.2+)

- Event: `format-prep.step1.inventory.completed` — `{ duration_seconds, source_counts: { winget: N, vscode: N, ... } }`
- No package names, no extension names.

## Cross-links

- Related features: [[step-2-backup-destination]], [[step-6-restore-plan]] (uses inventory to generate restore scripts)
- PLAN.md: §9 Step 1
- PROJECT.md: §5 v1.2 Pro feature

## Open questions

- Should we hash or fingerprint anything sensitive (e.g., env var values containing secrets)? Current decision: env-var **names** are stored, **values** prompted per-value at Step 6 with "include or skip" (user-controlled to avoid leaking secrets into restore plans).
- For browser extensions: do we enumerate only enabled extensions, or also disabled ones? Current: only enabled.
- Should this step also list installed Windows features (e.g., WSL feature, Hyper-V) so they can be re-enabled post-format? Current: yes, included.
