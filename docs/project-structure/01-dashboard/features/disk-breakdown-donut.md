# Disk Breakdown Donut — "What's on C:"

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Dashboard](../README.md)
> **Status:** designed
> **PLAN.md:** §7.1
> **Prototype:** `.vskill-data/Polish-prototype/src/dashboard.jsx` (left card of Chart Row 1) + `src/charts.jsx::DonutChart`

## Purpose

Answer the question "What is using up my C: drive?" visually. One donut, categorical breakdown, big mono center number.

## Layout (per prototype)

```
┌─ WHAT'S ON C:                              [371 GB used] ┐
│  Inventoried during last full scan · 14m ago              │
│                                                            │
│             ╭───────────╮                                  │
│           ╱               ╲                                │
│          │     371          │   ← center label/value/unit  │
│          │     GB           │                              │
│           ╲               ╱                                │
│             ╰───────────╯                                  │
│        (donut, 180px, thickness 22)                        │
└────────────────────────────────────────────────────────────┘
```

- Card padding `22px`.
- Header row: section label "What's on C:" + ink-muted sub-line "Inventoried during last full scan · `<relative>`" on the left; right-aligned `Badge` "371 GB used".
- `<DonutChart segments={DISK_BREAKDOWN} size={180} thickness={22} centerLabel="C: used" centerValue="371" centerUnit="GB" />`.
- Segments tinted by category (system / user / apps / dev / unknown). Hover any segment → tooltip with bytes + percentage.

## User story

"As a user, I want one image to tell me what's actually on my system drive — not just total used vs free, but what categories take up that space."

## Behaviour

- Segments sourced from `DISK_BREAKDOWN` (see `src/data.jsx` for shape).
- Smallest segments (< 1%) coalesce into "Other" automatically.
- Click a segment → navigates to `clean` page with that category pre-expanded (no preselection).
- Donut redraws (240ms ease-out) on `event.scan-complete`.
- Center value tracks total used; uses `NumDisplay` mono with unit suffix.

## Inputs

- **IPC calls consumed:** `disk.breakdown('C:')` → `[{ category_id, label, bytes, color_hint }]`
- **State read:** `useDiskStore.breakdownC`
- **Service events subscribed:** `event.scan-complete` triggers refetch

## Outputs

- **IPC calls fired:** none from this widget; clicking a segment fires `App.navigate('clean')` with a category hint
- **State written:** none
- **Events emitted:** none

## UI states

| State | When | What user sees |
|---|---|---|
| Loading | Initial fetch | Skeleton donut (grey ring) + center "—" |
| Populated | Data resolved | Animated draw-in of segments (no entrance keyframes — instant render per project rule) |
| Sparse | < 3 categories detected | Donut renders as fewer segments; legend hidden |
| Empty | Disk inventory not yet complete | "Run a scan to inventory" overlay |
| Error | `disk.breakdown` failed | "Couldn't inventory C: — [Retry]" |

## Edge cases

- **One dominant segment (> 90%):** still draws as a donut; visual ring shows the thin remaining slices accurately.
- **C: not present (rare — system drive mapped elsewhere):** widget reads system-drive letter from `service.status.system_drive` and renames "What's on C:" to "What's on `<letter>:`".
- **Categories overlap (same file double-counted):** dedup happens server-side in the engine; widget trusts the response.

## Accessibility

- Donut SVG has `role="img"` + `aria-labelledby` referencing the card heading.
- Each segment has a `<title>` child for screen readers: "System files, 87 GB, 23%".
- Color is not the sole indicator — legend (if shown) pairs swatch + label.

## Telemetry (opt-in, v1.1+)

- Event: `dashboard.disk-donut.segment.clicked` — `{ category_id, segment_pct_bucket }`

## Cross-links

- Companion: [[disk-usage-widget]] (per-drive bars below), [[kpi-band]] (Tile 2 = C: free)
- Source: `src/charts.jsx::DonutChart`, `src/data.jsx::DISK_BREAKDOWN`
- PLAN.md: §7.1, §4.3 (`disk.breakdown`)
- Prototype: `src/dashboard.jsx` left card of the first chart row

## Open questions

- Multi-drive donut (show breakdown for D: too) on systems with > 1 fixed drive? Current: C: only — focused; multi-drive surfaces live in Settings → Drives.
- Show a "projected" donut (after current selection) overlaid as a paler ring? Tempting; defer to v1.1 — risk of visual clutter.
- Should "Other" segment be clickable? Current: yes, navigates to `clean` with an "all uncategorised" filter.
