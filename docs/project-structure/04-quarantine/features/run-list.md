# Quarantine Run List

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Quarantine](../README.md)
> **Status:** designed
> **PLAN.md:** §7.4

## Purpose

Sortable, filterable, paginated list of every quarantine run. The primary content of the Quarantine page.

## Behaviour

- Columns: select checkbox · Date (relative + abs tooltip) · Mode badge · Size · Item count · Destination drive · Days until auto-purge.
- Sort: default by date desc; click column header to sort by that column.
- Pagination: 25 rows per page.
- Row hover: subtle background tint + cursor pointer.
- Row click: opens [[detail-drawer]].
- Imminent purge highlight: rows with < 24 h to purge AND nothing restored show an amber ⚠ icon + tooltip.

## Inputs

- **IPC calls consumed:** `quarantine.list({ page, pageSize, sort, filter })` — paged response
- **State read:** `useQuarantineStore.filters`, `useQuarantineStore.page`

## Outputs

- **IPC calls fired:** none from row itself; selection state local
- **State written:** `useQuarantineStore.selectedRunIds`

## UI states

| State | When | What user sees |
|---|---|---|
| Loading | Initial fetch / page change | Skeleton rows |
| Populated | Data fetched | Rows |
| Empty | No runs match filter | "No runs match current filters. [Clear filters]" |
| Error | IPC failed | "Couldn't load runs. [Retry]" |

## Edge cases

- **A run is purged by service during user's session** (auto-purge fires at 03:00): list refreshes via service event; row animates out with subtle fade.
- **A run's destination drive removed:** row shows "⚠ Unreachable" badge; restore/export disabled until reconnected.
- **100+ runs total:** pagination handles; "first / prev / page X of N / next / last" controls.

## Accessibility

- Table uses proper `<table>` with `<th scope="col">` headers.
- Sort indicators have `aria-sort`.
- Row selection follows accessible-table-with-selection pattern.

## Telemetry (opt-in, v1.1+)

- Event: `quarantine.row.opened` — `{ run_age_days }`

## Cross-links

- Related: [[filters]], [[detail-drawer]], [[restore-actions]], [[bulk-actions]]
- PLAN.md: §7.4, §10
