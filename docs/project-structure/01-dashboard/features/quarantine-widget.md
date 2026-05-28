# Quarantine Widget

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Dashboard](../README.md)
> **Status:** designed
> **PLAN.md:** §7.1, §10
> **Prototype:** `.vskill-data/Polish-prototype/src/dashboard.jsx` (Quarantine summary Card, left half of the duo) + `src/charts.jsx::BarChart`

## Purpose

Surface the active quarantine state at the bottom of the Dashboard so users always know what's recoverable and have a one-click path to restore the most recent run. Trust signal: "Polish hasn't deleted anything — it's all here."

## Layout (per prototype)

```
┌─ QUARANTINE                           [3 runs] ┐
│                                                 │
│  43.1 GB  restorable on D:\                     │
│                                                 │
│  ▮▮▮                                            │
│  ▮▮▮   ▮▮▮                                      │
│  ▮▮▮   ▮▮▮   ▮▮▮                                │
│  17d ago · 10d ago · 3d ago                     │
│  ───────────────────────────────────────────── │
│  [Browse]   [⟲ Restore last]                    │
└─────────────────────────────────────────────────┘
```

- Card padding `22px`.
- Section label `QUARANTINE` (uppercase 10.5px tracked).
- Right-aligned `Badge` showing total active runs (e.g., "3 runs").
- Large `NumDisplay` (mono, 30px, `var(--ink)`) for restorable size + unit + "restorable on `<drive>`" sub-line in `var(--ink-muted)`.
- `BarChart` (from `src/charts.jsx`) — last 3 runs, 48px bar width, 20px gap, accent color, 56px height.
- Below the bars: 3-column mono row labelling each bar's age (17d ago / 10d ago / 3d ago).
- Footer separator (`var(--line-soft)`) then two buttons: `Browse` (secondary, sm) and `Restore last` (ghost, sm, leading icon).

> **Was previously specced as a compact card with "Next auto-purge: Xd" + amber "Purging tomorrow" badge.** Per the prototype, the auto-purge countdown is no longer prominent on the dashboard — it shows in the Quarantine page header instead. Imminent-purge warning becomes a toast at T-24h.

## User story

"As a user, I want to see how much I can still recover and how recent my cleanups have been, and I want to roll back the last cleanup in one click if something broke."

## Behaviour

- Pull `quarantine.list` (active runs only, paged) on mount and on every `event.scan-complete`. Poll every 60s while mounted.
- `BarChart` data: most recent 3 active runs (or N < 3 if fewer exist). Each bar height proportional to that run's `restorable_bytes`. Bars sort newest → oldest left-to-right.
- "Browse" → `quarantine` page.
- "Restore last" → calls `quarantine.restore-last` (most recent active run). Confirmation modal then toast on completion. Includes a 10-second undo window via toast action.

## Inputs

- **IPC calls consumed:** `quarantine.list` (active runs); on Restore Last click → `quarantine.restore-last`
- **State read:** `useQuarantineStore.runs`
- **Service events subscribed:** `event.scan-complete`

## Outputs

- **IPC calls fired:** `quarantine.restore-last` on the Restore Last action
- **State written:** `useQuarantineStore.setRuns(...)` on poll/refresh; clears after a successful restore-last
- **Events emitted:** `event.notification-fired` (toast) when restore completes

## UI states

| State | When | What user sees |
|---|---|---|
| Empty | No active runs | "No active quarantine. Polish creates one for every cleanup." Bar chart hidden. Buttons disabled. |
| Populated | ≥ 1 active run | Restorable bytes + bar chart + Browse + Restore last |
| Imminent purge | < 24h to nearest `purge_at` AND nothing restored from that run | Toast surfaces; widget itself shows no extra ornament |
| Restore in flight | Restore last fired | Restore button shows spinner; Browse stays enabled |
| Loading | Initial fetch | Skeleton bars + skeleton value |
| Error | `quarantine.list` failed | "Couldn't load quarantine — [Retry]" replaces the chart |

## Edge cases

- **Quarantine destination drive removed (external unplugged):** widget shows "Quarantine unreachable — Y.Y GB on `<drive>`" with Browse-only (no restore until drive returns).
- **Manifest sidecar missing for the most recent run:** Restore Last greys out with tooltip "Manifest missing — restore from Quarantine page".
- **100+ active runs (unusual):** badge caps at "100+ runs"; bar chart still shows the most recent 3.
- **Only 1–2 active runs:** bar chart renders that many bars; the age row labels collapse accordingly.
- **Restore-last in-flight, user clicks Browse:** Browse still navigates; restore continues in background; toast on completion.

## Accessibility

- Card has `aria-labelledby` referencing the `QUARANTINE` label.
- `BarChart` SVG includes `<title>` per bar: "Run on 2026-05-25, 18.4 GB restorable".
- Restore Last button: `aria-label="Restore last cleanup run"`; `aria-busy` while in flight.

## Telemetry (opt-in, v1.1+)

- Event: `dashboard.quarantine.browse.clicked`
- Event: `dashboard.quarantine.restore-last.clicked` — `{ run_age_days_bucket: 0|1|7|30 }` (no precise bytes)
- Event: `dashboard.quarantine.restore-last.undo.clicked`

## Cross-links

- Full surface: [[../04-quarantine/README]], [[../04-quarantine/features/run-list]], [[../04-quarantine/features/auto-purge-policy]]
- Companion KPI: [[kpi-band]] (the "In quarantine" tile mirrors total restorable)
- PLAN.md: §7.1, §10.5 (auto-purge), §4.3 (`quarantine.list`, `quarantine.restore-last`)
- Prototype: `src/dashboard.jsx` Quarantine summary Card; `src/charts.jsx::BarChart`

## Open questions

- Restore Last undo window: 10s in toast, or full 24h via History? Prototype implies toast-undo only; final policy lives in [[../04-quarantine/features/restore-flow]].
- If the latest run is very small (< 100 MB) and clicking Restore Last would only roll back a trivial change, do we still confirm? Current: always confirm — quarantine is trust-critical.
- Should the chart show more than 3 bars on wider windows? Current: fixed at 3 per the prototype; no responsive bump in v1.0.
