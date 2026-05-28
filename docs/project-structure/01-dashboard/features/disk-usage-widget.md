# All Drives Card

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Dashboard](../README.md)
> **Status:** designed
> **PLAN.md:** §7.1
> **Prototype:** `.vskill-data/Polish-prototype/src/dashboard.jsx` (the "All drives" Card block) + `src/charts.jsx::DiskGauge`

## Purpose

Show every fixed drive at a glance: label, used / total, percent bar. Companion to the [Disk breakdown donut](disk-breakdown-donut.md) (which is C:-only) and the KPI "C: drive free" tile.

> **Naming note.** This file used to describe a single emerald gauge with a "Scan now" CTA. The prototype split that widget into three: this all-drives stack, the C:-only donut, and the KPI band. "Scan now" moved to the hero strip ("Rescan" ghost button).

## User story

"As a Windows user, I want to see how full every fixed drive is, sorted with the system drive first, so I can decide whether cleanup is urgent or which drive to focus on."

## Behaviour

- Render as a single `Card` with section label "All drives" and a right-aligned status text (e.g. `C: 99% full`, ink-muted; danger-tinted when C: ≥ 95%).
- Inside the card: one `<DiskGauge drive={d} large />` per fixed drive, separated by a thin `divider` (`var(--line-soft)`).
- Drive order: system drive (`C:`) first, then alphabetical by drive letter.
- Removable / network / mapped drives excluded.
- No primary CTA inside this card (rescan lives in the hero).

## Inputs

- **IPC calls consumed:** `drives.list` → `[{ id, letter, label, used, total, fileSystem }]`
- **State read:** `useDriveStore.drives` (Zustand cache; subscribe-refresh on mount)
- **Service events subscribed:** `event.scan-complete` triggers `drives.list` refetch (scan may have changed `used`)

## Outputs

- **IPC calls fired:** none
- **State written:** none
- **Events emitted:** none

## UI states

| State | When | What user sees |
|---|---|---|
| Loading | First `drives.list` in flight | One skeleton `DiskGauge` row, shimmer pulse |
| Healthy | Drives enumerated | Stacked `DiskGauge` rows; right-aligned status pill |
| Critical | Any drive ≥ 95% | That drive's bar tinted `var(--status-danger)`; sub-header status uses danger color |
| Drive removed | A previously listed external removed | Row fades out (240ms); list shrinks; no error |
| Error | `drives.list` IPC failed | Card shows "Couldn't enumerate drives — [Retry]" |

## Edge cases

- **No fixed drives detected:** "No fixed drives detected." with link to docs (storage spaces / network drives excluded).
- **Drive > 99.9% full:** bar saturates at 100%; mono label shows precise bytes via tooltip.
- **Drive > 2 TB:** mono `1,847 GB / 1,953 GB` (no TB unit conversion in v1.0).
- **Drive letter changed (rare on Windows):** treat as removal + addition; no merge attempt.

## Accessibility

- Card has `role="region"` + `aria-labelledby` pointing at "All drives" label.
- Each `DiskGauge` has `role="meter"` + `aria-valuenow`/`aria-valuemax` + `aria-label="Disk C, 97 percent full"`.
- Status sub-header is text (not color-only).

## Telemetry (opt-in, v1.1+)

- Event: none directly from this card (read-only widget). Surface drive count + max-fill bucket only via the dashboard mount event.

## Cross-links

- Companion widgets: [[disk-breakdown-donut]], [[kpi-band]] (C: drive free tile)
- Related: [[top-reclaim-opportunities]], [[../_shared/sidebar]]
- PLAN.md: §7.1, §4.3 (`drives.list`)
- Prototype: `src/dashboard.jsx` "All drives" Card; `src/charts.jsx::DiskGauge`

## Open questions

- Show network / mapped drives behind a "Show all drives" toggle? Current: excluded entirely in v1.0; revisit if requested.
- Tooltip on a drive row — show inode/file count? Current: no — bytes only keeps the surface focused.
- "Projected after cleanup" overlay marker on the per-drive bar (where it'd land after current selection)? Defer to v1.1.
