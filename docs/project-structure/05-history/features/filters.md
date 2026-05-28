# History Filters

> **Version:** v1.0
> **Tier:** Free
> **Page:** [History](../README.md)
> **Status:** designed
> **PLAN.md:** §7.5

## Purpose

Narrow the activity log to a relevant subset for inspection or export.

## Filter controls

- **Date** — All / Last 24 h / Last 7 days / Last 30 days / Custom range
- **Action** — All / Scan / Clean / Restore / Purge / Settings / Service / Update
- **Severity** — All / Info / Warn / Error
- **Actor** — All / User / Service / System

Active filter chips below; "Clear all" link.

## Behaviour

- Filter changes debounced 200 ms, fire `history.query`.
- Filter state persists across page revisits in the same session; resets on UI restart.

## Inputs

- **IPC calls consumed:** none directly (filter UI state is local)
- **State read:** `useHistoryStore.filters`

## Outputs

- **IPC calls fired:** `history.query` (re-fetched on filter change)
- **State written:** `useHistoryStore.setFilters(...)`

## UI states

| State | When | What user sees |
|---|---|---|
| Default | No filter | Dropdowns show "All" |
| Active | Filters set | Chips visible; list filtered |
| Empty | No results match | "No history matches current filters." |

## Edge cases

- **Custom date range with end < start:** validation inline; not applied until valid.

## Accessibility

- Standard accessible dropdowns / combobox semantics.

## Telemetry (opt-in, v1.1+)

- Event: `history.filter.applied` — `{ filter_type }`

## Cross-links

- Related: [[activity-log]], [[search]]
- PLAN.md: §7.5
