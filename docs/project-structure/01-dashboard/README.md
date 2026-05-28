# Page: Dashboard

> **Version introduced:** v1.0
> **Tier:** Free
> **Sidebar position:** 🏠 Dashboard (1st)
> **Route (in-app):** `dashboard` (React state-based router; no URL path)
> **Spec in PLAN.md:** §7.1
> **Prototype source:** `.vskill-data/Polish-prototype/src/dashboard.jsx`
> **Design tokens:** `.vskill-data/design/v2/design-tokens.json` (variant: editorial-cream)

## Purpose

Default landing page. At-a-glance status, top reclaim opportunities, primary CTAs. The user should know within 3 seconds: how much they can reclaim, drive pressure on C:, what's in quarantine, and progress over time.

## Layout sketch

Single-column page (`max-width: 1240px`, padded), composed of seven stacked widget zones. No bento auto-reflow — the layout is fixed; only the spacing scale flexes via the `--density` tweak (compact / regular / comfy).

```
┌─ HERO STRIP ─────────────────────────────────────────────────────────────┐
│  DASHBOARD · Last scanned 14m ago · Background scanner is on              │
│                                                                            │
│  You can reclaim 42.7 GB across 12 categories.       [⟲ Rescan]  [Review & clean →] │
└────────────────────────────────────────────────────────────────────────────┘

┌─ KPI BAND  (4 cards, equal width) ────────────────────────────────────────┐
│  Reclaimable now    │ C: drive free    │ In quarantine    │ Freed 90 days │
│  42.7 GB ↑18%       │ 4.0 GB critical  │ 43.1 GB (3 runs) │ 128 GB ↑31%   │
└────────────────────────────────────────────────────────────────────────────┘

┌─ CHART ROW 1  (1.7fr / 1fr) ─────────────────────────────────────────────┐
│ ┌─ What's on C: ──────────────────┐ ┌─ Reclaim trend ──────────────────┐ │
│ │  Donut breakdown · 371 GB used  │ │  128 GB ↑31% vs prior 12w        │ │
│ │  segments by category           │ │  Area sparkline · past 12 weeks  │ │
│ └──────────────────────────────────┘ └───────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘

┌─ CHART ROW 2  (1.7fr / 1fr) ─────────────────────────────────────────────┐
│ ┌─ Largest opportunities ────────┐  ┌─ 30-day scan activity ───────────┐ │
│ │  Horizontal bars               │  │  GitHub-style day grid           │ │
│ │  Colored by safety tier        │  │  Cell shade = found bytes that day│ │
│ │  (always-safe · devs · large   │  │  Legend: less ▢▢▢▢ more          │ │
│ │   user · system)               │  │                                   │ │
│ └─────────────────────────────────┘  └───────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘

┌─ ALL DRIVES ──────────────────────────────────────────────────────────────┐
│  Per-drive horizontal gauge (label · used/total · % bar)                  │
│  C: 371 / 375 GB  ████████████████████░  99%                              │
│  D:  29 /  99 GB  █████░░░░░░░░░░░░░░░  29%                              │
│  E:   0 /  14 GB  ░░░░░░░░░░░░░░░░░░░░   0%                              │
└────────────────────────────────────────────────────────────────────────────┘

┌─ TOP RECLAIM OPPORTUNITIES (table) ───────────────────────────────────────┐
│  [✓] 🤖 LM Studio cached models  · 4 models                23.7 GB  devs  │
│  [✓] 📦 Docker images (unused)   · 12 images, 90d+         12.1 GB  devs  │
│  [✓] 🗑️ Temp files               · system + user             4.2 GB  safe  │
│  [ ] 📁 Old Downloads >90 days   · 17 files                  1.8 GB  user │
│  [✓] ⚡ Browser caches           · Chrome + Edge             1.0 GB  safe  │
│  ──────────────────────────────────────────────────────────────────────── │
│  3 of 5 selected   │   WILL RECLAIM  29.0 GB         [Clean selected →]  │
└────────────────────────────────────────────────────────────────────────────┘

┌─ QUARANTINE  (1fr) ──────────────┐  ┌─ FORMAT PREP CTA  (1fr, ink card) ─┐
│  QUARANTINE              3 runs   │  │  🚀 PREPARE FOR FORMAT      [Pro]  │
│  43.1 GB restorable on D:\        │  │                                     │
│  ▮▮▮  bar chart (last 3 runs)     │  │  Don't lose anything.               │
│  17d ago · 10d ago · 3d ago       │  │  (italic display)                   │
│  ────────────────────────────────  │  │                                     │
│  [Browse]  [⟲ Restore last]       │  │  Inventory, back up, verify, plan,  │
│                                    │  │  then format with confidence.       │
│                                    │  │  Start the wizard →                 │
└────────────────────────────────────┘  └─────────────────────────────────────┘
```

## Features

| Feature | Version | Tier | Status |
|---|---|---|---|
| [Hero strip + last-scan timestamp](features/last-scan-widget.md) | v1.0 | Free | designed |
| [KPI band (4 cards)](features/kpi-band.md) — Reclaimable / C: free / Quarantine / Freed 90d | v1.0 | Free | designed |
| [Disk breakdown donut — "What's on C:"](features/disk-breakdown-donut.md) | v1.0 | Free | designed |
| [Reclaim trend sparkline (12 weeks)](features/reclaim-trend-sparkline.md) | v1.0 | Free | designed |
| [Largest opportunities — horizontal bars by safety tier](features/largest-opportunities-bars.md) | v1.0 | Free | designed |
| [30-day scan activity heatmap](features/scan-activity-heatmap.md) | v1.0 | Free | designed |
| [All drives — per-drive gauges](features/disk-usage-widget.md) | v1.0 | Free | designed |
| [Top reclaim opportunities table](features/top-reclaim-opportunities.md) | v1.0 | Free | designed |
| [Quarantine widget (bar chart + actions)](features/quarantine-widget.md) | v1.0 | Free | designed |
| [Format Prep CTA — "Don't lose anything."](features/format-prep-cta.md) | v1.2-Pro | Pro | designed |

**Removed from dashboard since first draft:**

- ~~Service Status Widget~~ — moved to Settings → System. Service health surfaced only on error (toast + KPI band recolor).
- ~~Last Scan Widget (standalone card)~~ — collapsed into the hero strip timestamp ("Last scanned 14m ago · Background scanner is on").

## Data dependencies (reads)

- `scan.results` — KPI "Reclaimable now", Top reclaim table, Largest opportunities bars
- `scan.history` (90d) — KPI "Freed last 90 days", Reclaim trend sparkline, 30-day activity heatmap
- `drives.list` — All drives card + KPI "C: drive free"
- `disk.breakdown(C:)` — Donut "What's on C:"
- `quarantine.summary` — KPI "In quarantine", Quarantine widget (3-run bar chart, total restorable, next purge)
- `scan.last` — hero timestamp `fmtAgo(SCAN_LAST.minsAgo)`
- Service event stream: `event.scan-progress`, `event.scan-complete`, `event.found-junk`, `event.background-scanner-state`

## Data writes

- `scan.start` — on "Rescan" (hero ghost button) — navigates to `clean` page
- `clean.preview` — on Top Reclaim row checkbox toggle (recomputes `selectedReclaim` + `reclaimSelectedBytes`)
- `clean.start({ mode: 'balanced', selected })` — on hero "Review & clean" or table footer "Clean selected" — opens `clean` page pre-seeded with selection
- (Navigation only, no IPC) — on Browse / Restore last / Start the wizard CTAs

## Cross-page navigation

| Trigger | Destination | Pre-seed |
|---|---|---|
| Rescan (hero ghost) | `clean` | none — opens scan flow |
| Review & clean (hero primary) | `clean` | mode=`balanced`, selected=current `selectedReclaim` set |
| Clean selected (table footer) | `clean` | mode=`balanced`, selected=table selection |
| Browse (Quarantine widget) | `quarantine` | — |
| Restore last (Quarantine widget) | (in-page action, then toast) | calls `quarantine.restore-last`, no nav |
| Start the wizard (Format Prep CTA) | `format-prep` | — |

## Empty / loading / error states

See [[empty-states]] for canonical rules. Dashboard-specific:

- **First run:** Hero h1 reads "Run your first scan." with primary `Scan now` CTA replacing `Review & clean`. KPI cards show `—` placeholders. Charts hidden until first scan completes.
- **All clean:** Hero h1 reads "All clear. Nothing recoverable right now." KPI "Reclaimable now" = `0 GB`. Top reclaim table replaced with "✨ Last verified 14m ago" empty state.
- **Service unreachable:** KPI band recolors muted; hero subtitle replaces "Background scanner is on" with "● Service unreachable · [Restart]". Charts and table show cached values with stale-data badge. Quarantine widget shows last-known counts.
- **Scan in progress:** Indeterminate progress bar at top of page; hero CTAs disabled; KPI "Reclaimable now" pulses.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+R` | Trigger Rescan |
| `Ctrl+Enter` | Review & clean (with current selection) |
| `Ctrl+/` | Focus sidebar |
| `Space` (on table row) | Toggle selection |
| `Enter` (on table row) | Open category detail in `clean` page |
| `Esc` | Clear table selection |

## Component primitives used (from prototype)

| Component | Source | Variants used here |
|---|---|---|
| `SectionLabel` | `src/components.jsx` | uppercase 10.5px tracking label |
| `KpiCard` | `src/components.jsx` | label, value (mono num), unit, sub, trend (up/down), icon, accent |
| `Card` | `src/components.jsx` + HTML CSS | default + custom inline padding |
| `Badge` | HTML CSS | default, accent (always-safe), warn (system), pro (ink card) |
| `Checkbox` | `src/components.jsx` | default, checked |
| `Button` | `src/components.jsx` | primary, secondary, ghost, sizes: default, sm |
| `NumDisplay` | `src/components.jsx` | mono tabular value + unit suffix |
| `CategoryIcon` | `src/icons.jsx` | tier-colored category icon |
| `DonutChart` | `src/charts.jsx` | center label/value/unit, segments |
| `AreaSparkline` | `src/charts.jsx` | dots + axis, fill opacity |
| `HBars` | `src/charts.jsx` | safety-tier colored bars |
| `DayGrid` | `src/charts.jsx` | 30-cell activity heatmap |
| `DiskGauge` | `src/charts.jsx` | large horizontal drive gauge |
| `BarChart` | `src/charts.jsx` | quarantine 3-run bars |

## Visual tokens (anchored)

- Hero h1 — `font-display` (Instrument Serif) 44px / line 1.05; italic `<em>` on accent number
- Accent — deep moss `oklch(0.420 0.085 155)` (default; swappable in tweaks panel)
- Format Prep CTA card — inverted: bg `var(--ink)`, fg `#fff`, italic display headline
- KPI trend up — `var(--status-good)`; down/critical — `var(--status-danger)`
- Safety-tier colors (Largest opportunities legend): always-safe `var(--accent)`, devs `oklch(0.55 0.075 155)`, large user `oklch(0.68 0.060 155)`, system `var(--status-warn)`

## Open questions

- Format Prep CTA on free-tier users: hidden, teaser, or always shown? Prototype shows it unconditionally when `showProBadges` tweak = true. **Decision pending.** Anti-upsell principle says hide; conversion analytics says teaser. Default in prototype = show.
- 30-day activity heatmap "more / less" legend uses `color-mix(in oklch, ...)` — Tauri WebView2 (Chromium ≥111) supports it; verify on the oldest WebView2 runtime we target.
- "All drives" card position: currently below chart rows. Should it move above when C: is critical? Prototype = fixed position; status surfaces via KPI "C: drive free critical" instead.
- Restore last (Quarantine widget) — single-click destructive-undo? Or open quarantine page with last run pre-expanded? Prototype = single-click with toast confirmation; consider undo-window timer.
