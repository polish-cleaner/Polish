# KPI Band — 4-card metric strip

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Dashboard](../README.md)
> **Status:** designed
> **PLAN.md:** §7.1
> **Prototype:** `.vskill-data/Polish-prototype/src/dashboard.jsx` (KPI band block) + `src/components.jsx::KpiCard`

## Purpose

The first scannable surface under the hero. Four equal-width tiles communicating: how much can be reclaimed now, how full C: is, what's recoverable in quarantine, and progress over the last 90 days. The "headline numbers" of the app.

## Layout (per prototype)

```
┌────────────────┬────────────────┬────────────────┬────────────────┐
│ ✦ RECLAIMABLE  │ 💾 C: DRIVE    │ 📦 IN          │ ⟲ FREED LAST   │
│   NOW          │   FREE         │   QUARANTINE   │   90 DAYS      │
│                │                │                │                │
│ 42.7 GB        │ 4.0 GB         │ 43.1 GB        │ 128 GB         │
│ ↑ 18%          │ critical       │ —              │ ↑ 31%          │
│                │                │                │                │
│ 12 categories  │ 1.1% of 375 GB │ 3 runs ·       │ across 9       │
│                │                │ purge in 4d    │ cleans         │
└────────────────┴────────────────┴────────────────┴────────────────┘
```

`<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>` with a `<KpiCard>` per tile.

## `<KpiCard>` props (from `src/components.jsx`)

| Prop | Type | Notes |
|---|---|---|
| `label` | string | Uppercase tracked eyebrow (10.5px / +12% tracking / `var(--ink-muted)`) |
| `value` | string \| number | Big mono number — passed to `NumDisplay` |
| `unit` | string | Suffix unit (`GB`, `MB`, etc.) — smaller, body font, ink-muted |
| `sub` | string | Secondary line below the number (12.5px ink-muted) |
| `trend` | string | Optional ("↑ 18%", "↓ 4%", "critical") |
| `trendKind` | `"up" \| "down" \| "neutral"` | Drives trend color |
| `icon` | ReactNode | Leading icon (13px) in the eyebrow row |
| `accent` | css color | Used by the leading icon and the trend chip |

## Tile definitions

| # | Label | Value source | Unit | Sub | Trend | Accent |
|---|---|---|---|---|---|---|
| 1 | RECLAIMABLE NOW | `totalReclaim` (sum of all categories) | GB | `${SCAN_LAST.categoryCount} categories` | `↑ 18%` vs last full scan | `var(--accent)` |
| 2 | C: DRIVE FREE | `DRIVES[0].total - DRIVES[0].used` | GB | `${pct.toFixed(1)}% of ${total} GB` | `critical` (when ≤ 5% free), else `low` (≤ 15%), else hidden | `var(--status-danger)` when critical else `var(--ink-soft)` |
| 3 | IN QUARANTINE | `quarantine.summary.restorable` | GB | `${runs} runs · purge in ${next_purge_in_d}d` | — | `var(--ink-soft)` |
| 4 | FREED LAST 90 DAYS | sum of `RECLAIM_TREND` (90d) | GB | `across ${cleansLast90} cleans` | `↑ 31%` vs prior 90d | `var(--accent)` |

## User story

"As a user, I want four numbers at the top of the dashboard that tell me, in one glance, the entire state of my disk and Polish's recent work."

## Behaviour

- Tile 1 ("Reclaimable now") and Tile 4 ("Freed 90 days") share `var(--accent)` color — they're the "positive momentum" numbers.
- Tile 2 ("C: drive free") flips to danger color and `critical` trend chip when free space ≤ 5%.
- Tile 3 ("In quarantine") never flips alarming; quarantine is informational.
- Tiles are read-only — no click targets in v1.0. (Clicking the dashboard hero or table is the action; KPIs are signals.)
- All numbers use mono tabular numerals (`tnum`, `zero` features) — prevents jitter when values change.

## Inputs

- **IPC calls consumed:** `scan.results`, `drives.list`, `quarantine.summary`, `scan.history(window=90d)`
- **State read:** `useScanStore`, `useDriveStore`, `useQuarantineStore`
- **Service events subscribed:** `event.scan-complete`, `event.scan-progress` (live update on Tile 1 during scan)

## Outputs

- **IPC calls fired:** none (read-only band)
- **State written:** none
- **Events emitted:** none

## UI states

| State | When | What user sees |
|---|---|---|
| Loading | Initial mount before any data | All four tiles show `—` placeholder; sub-lines say "calculating…" |
| Scanning | Scan in flight | Tile 1 value pulses gently (1.6s loop, opacity 0.6 ↔ 1.0) |
| Healthy | Everything resolved | All numbers populated, trends shown |
| C: critical | Free ≤ 5% | Tile 2 turns danger color; "critical" trend chip in red |
| Service down | IPC fails | All four tiles render muted (`opacity: 0.55`); sub-lines say "cached" with timestamp |
| Empty quarantine | No active runs | Tile 3 value = "0 GB"; sub = "no active runs" |

## Edge cases

- **Reclaimable > 1 TB:** unit auto-switches `GB → TB` via `fmtBytes` (helper in `src/data.jsx`).
- **Negative trend on Tile 4:** rendered with `↓` and `var(--status-good)` reversed (less freed = less to do = positive). Final tone tbd in copy review.
- **No history (fresh install):** Tile 4 shows `0 GB` with sub "first 90 days are tracking".
- **Quarantine purge < 24h:** sub line tints amber + text "purge in <Nh>".

## Accessibility

- Each tile is `role="group"` + `aria-labelledby` referencing its eyebrow text.
- Live numbers updating during scan use `aria-live="polite"` on the value element.
- Trend chips include text + icon (not color-alone).

## Telemetry (opt-in, v1.1+)

- Event: `dashboard.kpi-band.mount` — `{ reclaimable_bucket: 1|5|10|50|100, c_free_pct_bucket: 0|10|25|50, quarantine_runs }`
- No file paths, no precise bytes.

## Cross-links

- Companion: [[disk-usage-widget]] (Tile 2 mirrors that card's C: drive), [[quarantine-widget]] (Tile 3 mirrors restorable), [[reclaim-trend-sparkline]] (Tile 4's trend visualized below)
- Source: `src/components.jsx::KpiCard`
- PLAN.md: §7.1
- Prototype: `src/dashboard.jsx` KPI band block

## Open questions

- Should Tile 1 click drill into the Top Reclaim section (scroll-into-view)? Current: no — KPIs read-only; click target redundant with hero CTA.
- 5th tile for "running scans this month"? Current: no — 4-tile grid is locked; additional metrics belong in dedicated charts below.
- Trend sparkline mini-inside the tile? Current: no — sparklines live in the chart row to keep tiles dense and number-first.
