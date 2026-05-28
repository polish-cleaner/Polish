# Bulk Actions

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Quarantine](../README.md)
> **Status:** designed
> **PLAN.md:** §7.4

## Purpose

Operate on multiple quarantine runs at once: batch restore, batch purge, batch export. Power-user productivity feature.

## Behaviour

Buttons appear in the table footer when one or more rows are selected:

- **Restore selected (N runs)** — for each selected run, fires `quarantine.restore({ runId, items: "all" })` sequentially (not parallel — predictable + sequential conflict handling).
- **Purge selected (N runs)** — irreversible; requires confirm modal with run count + total bytes + per-run summary.
- **Export `.pq` (N runs)** — opens OS folder picker; writes each `.pq` (and sidecar) into the picked folder; preserves filenames.

Confirm modals show explicit counts and totals. Hold-to-confirm only for purge (5-second hold, same as DISM ResetBase, see [[../02-clean/features/special-case-confirms]]).

## Inputs

- **IPC calls consumed:** none directly (selection is UI state)
- **State read:** `useQuarantineStore.selectedRunIds`

## Outputs

- **IPC calls fired:**
  - `quarantine.restore` (per selected run, sequential)
  - `quarantine.purge({ runIds })` (single call, server batches)
  - `quarantine.export({ runIds, destination })` (single call, server iterates)

## UI states

| State | When | What user sees |
|---|---|---|
| Hidden | No selection | Action buttons not visible |
| Visible | 1+ selected | Footer with "Restore (N)" / "Purge (N)" / "Export (N)" |
| Confirming | User clicked Restore / Purge / Export | Modal with totals and confirmation |
| Running | Action in flight | Per-run progress list |
| Complete | All actions done | Toast summary + selection cleared |

## Edge cases

- **One run in selection fails:** action continues for the rest; final summary shows successes + failures.
- **User adds / removes runs during bulk action:** action processes the snapshot of selection at start; subsequent toggles affect the next action.
- **Selecting > 50 runs and clicking Purge:** modal includes additional warning "Purging 75 runs (totaling 312 GB). This cannot be undone."
- **Export destination has insufficient space:** abort with pre-check; partial files removed.

## Accessibility

- Buttons clearly labelled with current count.
- Confirm modals trap focus; large-count purge has the 5-second hold-to-confirm pattern.

## Telemetry (opt-in, v1.1+)

- Event: `quarantine.bulk.action` — `{ action: "restore" | "purge" | "export", count }`

## Cross-links

- Related: [[run-list]], [[restore-actions]], [[../02-clean/features/special-case-confirms]]
- PLAN.md: §7.4
