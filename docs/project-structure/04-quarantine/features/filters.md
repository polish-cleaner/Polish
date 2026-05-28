# Quarantine Filters

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Quarantine](../README.md)
> **Status:** designed
> **PLAN.md:** §7.4

## Purpose

Filter and search across all quarantine runs. Enables fast navigation when users have many runs.

## Behaviour

Filter controls (above the run list):

- **Date** — dropdown: All / Last 7 days / Last 30 days / Custom range
- **Drive** — dropdown: All / per-drive letter (D: / E: ...) (only drives that have hosted a quarantine)
- **Mode** — dropdown: All / Light / Balanced / Aggressive / Custom (v1.1+) / Format Prep (v1.2+)
- **Status** — dropdown: All / Active / Restored (partially or fully) / Purged (visible only if user enables "show purged" toggle; default off — purged runs are in History)

Search box: matches by date string, run ID, drive label, or any category id in a run's manifest.

Active filters appear as removable chips below the controls.

## Inputs

- **IPC calls consumed:** `quarantine.list({ filter, search })`
- **State read:** `useQuarantineStore.filters`

## Outputs

- **IPC calls fired:** `quarantine.list` (re-fetches on filter change, debounced 200 ms)
- **State written:** `useQuarantineStore.setFilters(...)`

## UI states

| State | When | What user sees |
|---|---|---|
| Default | No filters | Controls show "All" |
| Active | One or more filter set | Chips below; list filtered |
| Empty result | Filters yield zero rows | "No runs match. [Clear filters]" |

## Edge cases

- **Custom date range with end < start:** validation message inline; not applied until valid.
- **Search box clears all chips:** explicit "Clear all" link.
- **Filter state persists across page revisits in same session** but resets when UI restarts (not persisted to settings — ephemeral by design).

## Accessibility

- Dropdowns are accessible `<select>` or fully ARIA'd combobox patterns.
- Chips have remove buttons with `aria-label="Remove filter: <X>"`.

## Telemetry (opt-in, v1.1+)

- Event: `quarantine.filter.applied` — `{ filter_type, search_used: bool }`

## Cross-links

- Related: [[run-list]]
- PLAN.md: §7.4
