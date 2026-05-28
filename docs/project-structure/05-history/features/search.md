# History Search

> **Version:** v1.0
> **Tier:** Free
> **Page:** [History](../README.md)
> **Status:** designed
> **PLAN.md:** §7.5

## Purpose

Free-text search across all event fields. Useful for "what happened around 2pm Tuesday" or "find the time I restored that thing".

## Behaviour

- Search box at the top of the page; fixed (sticky) while scrolling.
- Matches against: actor, action, target string, outcome string, runId, category-id.
- Case-insensitive. Substring match.
- Debounced 300 ms.
- Results combine with active filters (AND logic).
- Highlights matching text in rendered rows.
- Empty query returns the unfiltered (or filter-only) list.

## Inputs

- **IPC calls consumed:** `history.query({ search })`
- **State read:** `useHistoryStore.search`

## Outputs

- **IPC calls fired:** `history.query` (debounced 300 ms)
- **State written:** `useHistoryStore.setSearch(...)`

## UI states

| State | When | What user sees |
|---|---|---|
| Empty | No query | Standard list |
| Typing | Debouncing | Subtle "Searching…" indicator |
| Populated | Results | Rows with highlighted matches |
| No results | Search yields zero | "No matches for '<query>'. [Clear]" |

## Edge cases

- **Query with regex-special chars:** treated literally (escaped).
- **Search across virtualized list:** server-side query, not client-side filtering — supports 100K+ events.
- **Search + filters that contradict each other:** AND semantics produce empty; "Clear filters" affordance offered.

## Accessibility

- Search box has `role="searchbox"` + `aria-label`.
- Results count announced via `aria-live="polite"`.

## Telemetry (opt-in, v1.1+)

- Event: `history.search.used` — `{ query_length, results_count_bucket }`
- No query text leaked.

## Cross-links

- Related: [[activity-log]], [[filters]]
- PLAN.md: §7.5
