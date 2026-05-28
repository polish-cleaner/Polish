# 30-Day Scan Activity Heatmap

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Dashboard](../README.md)
> **Status:** designed
> **PLAN.md:** §7.1
> **Prototype:** `.vskill-data/Polish-prototype/src/dashboard.jsx` (right card of Chart Row 2) + `src/charts.jsx::DayGrid`

## Purpose

Show consistency of background scanning over the last 30 days as a GitHub-style heatmap. One cell per day; darker shade = more bytes found that day. Reinforces the "Polish is quietly working" trust signal.

## Layout (per prototype)

```
┌─ 30-DAY SCAN ACTIVITY                                     ┐
│  21 scans · darker = more found                            │
│                                                            │
│  ▢▢▢▢▢▢▢                                                  │
│  ▣▣▣▢▣▢▣                                                  │
│  ▣▣▩▩▩▢▩                                                  │
│  ▩▣▩■■■■                                                  │
│  ▣▩■■  (5×7 cells, 20px square, 4px gap)                  │
│                                                            │
│  30d ago               less ▢▢▢▢ more              today  │
└────────────────────────────────────────────────────────────┘
```

- Card padding `22px`.
- Header row: section label "30-day scan activity" + sub `<scannedDays> scans · darker = more found` (mono `scannedDays` number).
- `<DayGrid data={DAY_ACTIVITY} cellSize={20} gap={4} color="oklch(0.42 0.085 155)" />` — 30 cells laid out as 5 rows × 7 cols (or whatever fits the data window — controlled by `DayGrid`).
- Below the grid: mono footer with "30d ago" on the left, "less ▢▢▢▢ more" legend in the middle (4 sample cells using `color-mix(in oklch, var(--accent) <pct>%, var(--surface))`), "today" on the right.

## User story

"As a user, I want to see whether Polish has been scanning consistently and which days were 'big-find' days — at a glance."

## Behaviour

- One cell per day for the last 30 days (oldest top-left, today bottom-right).
- Cell shade computed from `bytesFound / max(bytesFound across 30d)`, bucketed to 4 levels via `color-mix`.
- Days with no scan render at zero opacity (paper-white) with a thin `var(--line-soft)` border.
- Hover tooltip per cell: "Tue, May 21 — 4.2 GB found across 2 scans" (or "no scan this day").
- Clicking a cell → navigate to `history` page filtered to that day.

## Inputs

- **IPC calls consumed:** `scan.history(window=30d)` returning per-day aggregates `{ date, scans_count, bytes_found, scanned: bool }`
- **State read:** `useHistoryStore.daily30d`
- **Service events subscribed:** `event.scan-complete` triggers refetch

## Outputs

- **IPC calls fired:** none from grid; navigation only on cell click
- **State written:** none
- **Events emitted:** none

## UI states

| State | When | What user sees |
|---|---|---|
| Loading | Initial fetch | 30 skeleton cells (uniform faint shade, no border) |
| Populated | Data resolved | Heatmap rendered with hover affordances |
| Sparse | < 7 scans in 30d | Most cells unscanned; sub-text reads "Background scanner has been off" with link to Settings |
| Empty | No scans in 30d | "No scans yet — your timeline starts when Polish runs its first scan." |
| Error | `scan.history` failed | "Couldn't load activity — [Retry]" |

## Edge cases

- **Today's cell during an active scan:** cell shows current cumulative bytes; pulses gently (1.6s) until `event.scan-complete`.
- **Cells span a daylight-savings transition:** day buckets always 00:00–23:59:59 local; no double-count.
- **Service was uninstalled mid-window:** affected days show as "service inactive" (different glyph — small `×` overlay).
- **`color-mix(in oklch, ...)` not supported (very old WebView2):** fall back to `color-mix(in srgb, ...)` then to a 4-shade palette baked into design tokens.

## Accessibility

- Card has `aria-labelledby` referencing the section label.
- Grid is `role="grid"`; each row is `role="row"`; each cell is `role="gridcell"` with `aria-label="May 21 2026, 4.2 GB found"` (or "no scan").
- Cells are keyboard-navigable (arrow keys move focus); Enter on a cell triggers the History navigation.

## Telemetry (opt-in, v1.1+)

- Event: `dashboard.activity-heatmap.cell.clicked` — `{ days_ago }`
- Mount: `{ scanned_days_count, max_day_bytes_bucket }`

## Cross-links

- Companion: [[reclaim-trend-sparkline]] (weekly view of same data), [[kpi-band]] (Tile 4 = freed 90d), [[../05-history/README]]
- Source: `src/charts.jsx::DayGrid`, `src/data.jsx::DAY_ACTIVITY`
- PLAN.md: §7.1, §4.3 (`scan.history`)
- Prototype: `src/dashboard.jsx` right card of the second chart row

## Open questions

- Window: 30 days, or extend to 12 weeks like the sparkline? Current: 30 (denser, more recent). Sparkline carries the longer view.
- Show two heatmaps (scans + cleans)? Current: scans only — found-bytes is the proxy for both.
- Click-into-history vs popover with that day's scan list inline? Current: nav-out — keeps the dashboard simple. Popover could be a power-user v1.1 affordance.
- Color-mix fallback chain — do we ship the explicit 4-shade palette in `design-tokens.json` or compute on the fly? Current: compute on the fly; if older WebView2 in field, bake.
