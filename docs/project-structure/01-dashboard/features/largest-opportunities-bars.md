# Largest Opportunities — Horizontal Bars

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Dashboard](../README.md)
> **Status:** designed
> **PLAN.md:** §7.1
> **Prototype:** `.vskill-data/Polish-prototype/src/dashboard.jsx` (left card of Chart Row 2) + `src/charts.jsx::HBars`

## Purpose

Visualize the top reclaim categories as horizontal bars colored by safety tier. The visual companion to the [Top Reclaim Opportunities](top-reclaim-opportunities.md) selection table — same data, no checkboxes; lets the eye absorb proportions before reading the table.

## Layout (per prototype)

```
┌─ LARGEST OPPORTUNITIES                                                  ┐
│  Colored by safety tier      ▮ always safe  ▮ devs  ▮ large user  ▮ system │
│                                                                          │
│  LM Studio cached models    ██████████████████████████████ 23.7 GB       │
│  Docker images (unused)     █████████████████ 12.1 GB                    │
│  Temp files                 ██████ 4.2 GB                                │
│  Old Downloads >90 days     ██ 1.8 GB                                    │
│  Browser caches             ▌ 1.0 GB                                     │
└──────────────────────────────────────────────────────────────────────────┘
```

- Card padding `22px`.
- Header row: section label "Largest opportunities" + ink-muted sub "Colored by safety tier" on the left; right-aligned tier legend (4 swatches × 7px + 10.5px ink-muted labels).
- `<HBars data={TOP_CATEGORIES_VIEW} height={6} />`.
- Bars are 6px tall, colored per tier, with the category label inline-left and the byte total inline-right (mono).

## Tier color mapping

| Tier | Color | Meaning |
|---|---|---|
| always-safe | `var(--accent)` (deep moss) | System / cache / temp — never harmful to remove |
| devs | `oklch(0.55 0.075 155)` (mid moss) | Dev caches (npm / pnpm / cargo / Docker) — safe if user isn't actively building |
| large-user | `oklch(0.68 0.060 155)` (light moss) | Old Downloads, user temp — user discretion |
| system | `var(--status-warn)` (amber) | OEM bloat, system-managed — confirm per-item |

## User story

"As a user, I want to absorb at a glance which categories are biggest AND how safe they are to clean, without reading every row."

## Behaviour

- Read-only widget — no selection, no click. The selection happens in the [Top Reclaim Opportunities](top-reclaim-opportunities.md) table below.
- Bars sorted descending by bytes.
- Maximum 8 bars (more would crowd; users can drill into Clean for the full list).
- Bar widths normalized to the largest entry; smallest bar still ≥ 4px wide so it's clickable… wait, no, it's not clickable. Smallest bar still ≥ 4px so it's *visible*.
- Bytes label uses `NumDisplay` mono tabular with unit suffix.

## Inputs

- **IPC calls consumed:** `scan.results`
- **State read:** `useScanStore.latestResult` → `TOP_CATEGORIES_VIEW` (selector: top 8 categories with `bytes > 0`, with tier attached)
- **Service events subscribed:** `event.scan-complete`

## Outputs

- **IPC calls fired:** none
- **State written:** none
- **Events emitted:** none

## UI states

| State | When | What user sees |
|---|---|---|
| Loading | Initial fetch | 5 skeleton bars (placeholder widths 80% → 20%) |
| Populated | Data resolved | Bars + labels + tier legend |
| Empty | No reclaimable categories | "Nothing to surface — last scan found 0 bytes." |
| Stale | Scan > 7 days old | Sub-line tints amber: "Last scanned 12d ago — [Rescan]" inline link |
| Error | `scan.results` failed | "Couldn't load — [Retry]" |

## Edge cases

- **One category dwarfs the rest (10x larger):** smaller bars still visible (min 4px width); axis not labeled (no time/size axis at all — relative bars only).
- **All categories same tier (e.g., all dev caches):** all bars the same color; legend still shown for context.
- **Category count < 5:** card grows to fit; no padding stretch.

## Accessibility

- Card has `aria-labelledby` referencing the section label.
- Bar group is a `role="list"`; each row is `role="listitem"` with `aria-label="LM Studio cached models, devs tier, 23.7 GB"`.
- Color is not the sole tier indicator — tier name is included in the `aria-label`, and tier legend pairs swatch + text.

## Telemetry (opt-in, v1.1+)

- Event: none directly (read-only widget). Surface tier-mix on dashboard mount: `{ tier_counts: { 'always-safe': 3, devs: 4, 'large-user': 1 } }`.

## Cross-links

- Companion: [[top-reclaim-opportunities]] (same data, with selection)
- Source: `src/charts.jsx::HBars`, `src/data.jsx` (selector for `TOP_CATEGORIES_VIEW`), tier definitions in `src/data.jsx::TIERS`
- PLAN.md: §7.1, §8.2 (safety tiers)
- Prototype: `src/dashboard.jsx` left card of the second chart row

## Open questions

- Show 8 bars or cap at 5 to match the table? Current: 8 in HBars (visual), 5 in table (selection) — the visual surface tolerates more density than the table.
- Click-to-filter behavior? Current: no — keeping the widget read-only avoids confusion with the table below. Reconsider if user testing shows people clicking bars.
- Animated entrance (bars fill left-to-right on mount)? Current: no per project rule (no entrance keyframes). Hover state could still pulse the bar.
