# History Export

> **Version:** v1.0
> **Tier:** Free
> **Page:** [History](../README.md)
> **Status:** designed
> **PLAN.md:** §7.5

## Purpose

Export the current filtered/searched view to CSV or JSON. Useful for: bug reports, compliance audits, personal records.

## Behaviour

- Two buttons in page footer: `Export CSV` / `Export JSON`.
- Opens OS file picker (default filename `polish-history-<date>.csv` or `.json`).
- Exports **the current filtered/searched result set**, not the entire history (full export available via "Clear all filters" first).
- CSV columns: timestamp, actor, action, target, outcome, severity. UTF-8 with BOM (Excel compatibility).
- JSON: array of event objects with full structured fields.
- No upload, no cloud — strictly local file write.

## Inputs

- **IPC calls consumed:** `history.export({ format, filter, search, destination })` — service computes and writes the file
- **State read:** `useHistoryStore.filters`, `useHistoryStore.search`

## Outputs

- **IPC calls fired:** `history.export`
- **File written** to user-picked destination
- Toast on completion: "Exported N events to `<path>`. [Open folder]"

## UI states

| State | When | What user sees |
|---|---|---|
| Idle | Default | Two buttons enabled |
| Selecting destination | File picker open | OS dialog |
| Exporting | Service writing | Brief progress (rare unless very large) |
| Complete | File written | Toast |
| Error | Write failed | "Export failed. [Retry] [Open logs]" |

## Edge cases

- **Destination drive full:** error with explicit message.
- **User cancels file picker:** no-op.
- **Very large export (>1M events):** progress bar; service uses streaming writer (no full-mem load).

## Accessibility

- Buttons clearly labelled.
- Toast announced via `aria-live="polite"`.

## Telemetry (opt-in, v1.1+)

- Event: `history.export.completed` — `{ format, event_count_bucket }`

## Cross-links

- Related: [[activity-log]], [[filters]], [[search]]
- PLAN.md: §7.5
