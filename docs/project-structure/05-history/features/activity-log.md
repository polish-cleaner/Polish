# Activity Log

> **Version:** v1.0
> **Tier:** Free
> **Page:** [History](../README.md)
> **Status:** designed
> **PLAN.md:** §7.5, §15.1

## Purpose

Append-only chronological list of every event in the system. Single rendered list with per-row expand-to-detail.

## Event shape

Each row has:
- **timestamp** — ISO-8601 with timezone
- **actor** — `service` / `user` / `system` (Windows scheduler, etc.)
- **action** — e.g., `scan.start`, `scan.complete`, `clean.execute`, `clean.cancel`, `quarantine.restore`, `quarantine.purge`, `settings.set`, `service.start`, `service.stop`, `update.installed`
- **target** — category ID, run ID, setting key, file count, etc. (no file paths at INFO; paths only at DEBUG)
- **outcome** — `OK` / `FAIL` / `CANCELLED` / `WARNING` + details
- **severity** — `info` / `warn` / `error`

## Behaviour

- Default sort: timestamp descending (newest first).
- Per-row expand reveals: full structured detail (raw event JSON, formatted for readability).
- Color/icon by severity: emerald for info, amber for warn, red for error. (Red only for genuine errors, not cosmetic.)
- Virtualized list: handles 100K+ events smoothly.
- Pagination + virtualization hybrid: query returns 100-row pages, virtual scroller within a page.

## Inputs

- **IPC calls consumed:** `history.query({ page, pageSize, filter, search })`
- **State read:** `useHistoryStore.filters`, `useHistoryStore.search`

## Outputs

- **IPC calls fired:** none from log itself (filters and search emit their own queries)
- **State written:** `useHistoryStore.expandedRowIds`

## UI states

| State | When | What user sees |
|---|---|---|
| Loading | Initial / filter change | Skeleton rows |
| Populated | Data fetched | Rows |
| Empty | No events match | "No activity matches current filters. [Clear filters]" |
| Error | `history.query` failed | "Couldn't load history. [Retry]" |

## Edge cases

- **Service restart mid-session:** History gets `service.start` event; UI auto-prepends to the list.
- **Large number of events (e.g., a stress-clean):** virtualization handles; user can scroll fast without UI lag.
- **A `clean.execute` event references a runId that was later purged:** row still exists with the runId; clicking goes to History detail page (no `/quarantine?run=` redirect since the run is gone).
- **Cross-session timing differences (machine off for days):** rows show "5d ago" not "5 days, 4 hours, 12 minutes ago"; absolute timestamp in tooltip.

## Accessibility

- Table semantics with `<th>` headers.
- Expand-to-detail uses `aria-expanded`.
- Severity color is supplemented by icon + text label.

## Telemetry (opt-in, v1.1+)

- Event: `history.row.expanded` — `{ action_type }`

## Cross-links

- Related: [[filters]], [[search]], [[export]]
- PLAN.md: §7.5, §15.1 (PII filter rules apply to what's logged)
