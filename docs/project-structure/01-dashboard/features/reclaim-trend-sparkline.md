# Reclaim Trend Sparkline

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Dashboard](../README.md)
> **Status:** designed
> **PLAN.md:** §7.1
> **Prototype:** `.vskill-data/Polish-prototype/src/dashboard.jsx` (right card of Chart Row 1) + `src/charts.jsx::AreaSparkline`

## Purpose

Show progress over time. How much disk has Polish freed in the last 12 weeks? Is the curve rising? Is the user maintaining their machine?

## Layout (per prototype)

```
┌─ RECLAIM TREND                                            ┐
│  Past 12 weeks · weekly total                              │
│                                                            │
│  128 GB   ↑ 31% vs prior 12w                               │
│                                                            │
│        ●        ●                                          │
│       ╱ ╲    ╱╲╱ ╲          ●                              │
│   ●━━╯   ╲══╯    ╲━━━━●━━━━╱                              │
│                                                            │
│  w−11                                              w−0    │
└────────────────────────────────────────────────────────────┘
```

- Card padding `22px`, flex column.
- Section label "Reclaim trend" + sub "Past 12 weeks · weekly total" (12.5px ink-muted).
- Big mono value `128 GB` (28px) + green "↑ 31% vs prior 12w" delta to the right.
- `<AreaSparkline data={RECLAIM_TREND} width={340} height={88} color="var(--accent)" fillOpacity={0.10} showDots showAxis />`.
- Axis ticks: first and last week labels (10px mono, ink-faint) below the chart.

## User story

"As a user, I want to see whether I'm keeping up with cleanup or letting the disk fill back up between scans."

## Behaviour

- One data point per week (`RECLAIM_TREND[i].week`, `RECLAIM_TREND[i].value`). Week ends Sunday local.
- Path drawn with smoothed curve (Catmull-Rom); area fill at `fillOpacity=0.10`.
- Dots only at data points; latest week's dot styled larger.
- Trend delta computed as `(sum_last_12w - sum_prior_12w) / sum_prior_12w`.
- Click on the card → navigate to `history` page with the 90-day window pre-filtered.

## Inputs

- **IPC calls consumed:** `scan.history(window=24w)` (need 24w to compute delta vs prior 12w)
- **State read:** `useHistoryStore.weekly`
- **Service events subscribed:** `event.clean-complete` triggers refetch

## Outputs

- **IPC calls fired:** none from chart; navigation only on card click
- **State written:** none
- **Events emitted:** none

## UI states

| State | When | What user sees |
|---|---|---|
| Loading | Initial fetch | Skeleton line (flat grey) + "—" total |
| Populated | Data resolved | Animated draw (no entrance keyframes; instant per rule) |
| Sparse | < 4 weeks of data | "Tracking — come back in <Nw>" overlay |
| Flat | All zeros | Horizontal line at baseline; trend reads "no activity yet" |
| Error | `scan.history` failed | "Couldn't load history — [Retry]" |

## Edge cases

- **Newly installed Polish (< 1 week):** "Tracking — first results next Sunday."
- **Negative trend (less freed than prior period):** delta shows `↓ N%` in ink-muted; not alarming — could mean nothing to free.
- **Outlier spike (one big run dominates):** axis auto-scales; smaller weeks stay visible.
- **Daylight savings boundary:** week buckets always anchored to Sunday 00:00 local; no double-counting.

## Accessibility

- Card has `aria-labelledby` referencing the section label.
- Chart SVG has `role="img"` + `aria-label="Reclaim trend, last 12 weeks: rising from X GB to Y GB"`.
- Tooltip per dot (on hover/focus) reads "Week ending YYYY-MM-DD: X GB freed".
- Trend delta string is text (not color-alone).

## Telemetry (opt-in, v1.1+)

- Event: `dashboard.reclaim-trend.card.clicked`
- Mount: `{ weeks_with_data, total_freed_bucket }`

## Cross-links

- Companion: [[kpi-band]] (Tile 4 mirrors the total + trend), [[scan-activity-heatmap]] (daily view of the same data)
- Detail surface: [[../05-history/README]]
- Source: `src/charts.jsx::AreaSparkline`, `src/data.jsx::RECLAIM_TREND`
- PLAN.md: §7.1, §4.3 (`scan.history`)
- Prototype: `src/dashboard.jsx` right card of the first chart row

## Open questions

- Window length: 12 weeks fixed, or user-configurable (4 / 12 / 26 weeks)? Current: fixed 12w; configurable would clutter the dashboard. History page has full controls.
- Show the rolling average line behind the weekly bars? Current: no — sparkline already feels right at 88px height.
- Hover-tooltip vs always-visible labels for major weeks? Current: hover only — keeps the chart calm.
