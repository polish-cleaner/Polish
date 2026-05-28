# Settings → Scanning

> **Version:** v1.1 (not in v1.0 — background scanner deferred)
> **Tier:** Free
> **Page:** [Settings](../README.md)
> **Status:** designed
> **PLAN.md:** §12 Scanning, §11.1

## Settings

| Setting | Type | Default | Notes |
|---|---|---|---|
| Enable background scanning | toggle | on | Master switch — off disables both incremental + full scans |
| Incremental scan cadence | dropdown (15 / 30 / 60 min) | 30 min | Quick scan of always-safe categories |
| Full scan cadence | dropdown (12 / 24 / 48 h) | 24 h | Comprehensive scan during idle window |
| Throttle: max CPU % during scan | slider 1–20 | 5% | Enforced via Windows job objects |
| Scan on battery | toggle | off | Battery-only laptops opt-in |
| Idle threshold (min) | dropdown 1 / 5 / 15 / 30 | 5 | Inactivity required before deep scan starts |
| Quiet hours start | time | 22:00 | No scans within window |
| Quiet hours end | time | 08:00 | |
| Skip drives | per-drive toggle list | none skipped | Exclude specific drives (e.g., network mounts) |

## Behaviour

- Master toggle off → service still installed but scanner module idles; manual `scan.start` IPC still works.
- Throttle slider above 20% is intentionally not allowed (PLAN §11.1: 5% cap rule is the trust posture).
- Skip drives section lists every currently-detected fixed drive; per-drive toggle persists; new drives added later auto-default to "included".

## IPC

- Read: `settings.get("scanning.*")`
- Write: `settings.set("scanning.*", value)`
- Effective change: service reloads scanner config on `settings.set("scanning.enabled", ...)` or any cadence change.

## Edge cases

- **User sets incremental every 15 min + full every 12 h on a low-end laptop:** service merges schedules (incremental runs at 15-min intervals; full scan replaces one incremental every 12 h).
- **Quiet hours span midnight (e.g., 22:00 → 08:00):** correctly interpreted as overnight.
- **All drives skipped:** scanner produces empty results without erroring; widget on Dashboard shows "All drives skipped — change in Settings".

## Cross-links

- Related: [[notifications]] (toast threshold), [[auto-clean]]
- PLAN.md: §11.1, §12 Scanning
