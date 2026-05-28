# Run Step (Step 3)

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Clean](../README.md)
> **Status:** designed
> **PLAN.md:** §7.2, §10.1 (atomic quarantine principle)

## Purpose

The execution step. Shows live progress as the service moves files to quarantine. Provides Pause / Cancel actions. Atomic guarantee: if user cancels mid-run, the partial quarantine bundle is rolled back — the user's filesystem ends in either the pre-clean state or the post-clean state, never partial.

## User story

"As a user, I want to watch the cleanup happen, pause if my machine gets busy, and cancel safely without losing anything, so I trust I'm in control."

## Behaviour

- Full-page progress view (no other widgets — this step is undivided attention).
- Components:
  - Total progress bar with byte counter + ETA
  - "Current item: `<path or category name>`" — uses category-id-level abstraction at INFO log level, file paths only at DEBUG (PLAN §15.1 PII filter — preserved here in UI as a UX choice: don't blast file paths into the foreground)
  - Animated file-flow visualization (subtle, no bouncy curves — PLAN §2 motion)
  - Live activity log feed (collapsible, "Show details ▾")
  - **Pause** button — IPC-pauses execution mid-stream
  - **Cancel** button — triggers atomic rollback; requires confirm dialog

## Inputs

- **IPC calls consumed:**
  - `clean.execute` (fired at Step 2→3 transition; returns `{ runId }`)
  - Service events: `event.clean-progress` (continuous stream — `{ runId, bytesDone, bytesTotal, itemsDone, itemsTotal, currentCategoryId }`)
  - Service event: `event.clean-complete` (`{ runId, result, summary }`)
- **State read:** `useSelectionStore.selected`, `useCleanRunStore.activeRunId`

## Outputs

- **IPC calls fired:**
  - `clean.execute` at step entry
  - `clean.pause(runId)` on Pause button (where supported — atomic between categories, not mid-category)
  - `clean.cancel(runId)` on Cancel + confirm
- **State written:** `useCleanRunStore.set({ runId, progress })`
- **Events emitted:** none from UI to service beyond IPC

## UI states

| State | When | What user sees |
|---|---|---|
| Starting | After `clean.execute` returns, before first progress event | "Preparing quarantine destination…" |
| Running | Progress events streaming | Bar + current item + log |
| Paused | After `clean.pause` ack | Bar frozen + "Paused" badge + "Resume" button |
| Cancelling | After Cancel + confirm | "Rolling back…" + spinner |
| Cancelled | After rollback complete | "Cancelled. Filesystem restored. [Back to Dashboard]" |
| Completed | `event.clean-complete` received | Auto-advances to Step 4 Result |
| Failed | `event.clean-complete` with error result | Error banner + rollback details + "[View logs] [Report bug]" |

## Edge cases

- **Service crashes mid-run:** UI reconnects via `service.subscribe`; on reconnect, queries `clean.execute` state for the runId; if service has restarted, the run is treated as "interrupted" — quarantine bundle is partial; service-side recovery on next start completes the rollback. UI shows "Cleanup interrupted — rolling back on service restart."
- **Disk fills up mid-clean:** service emits a specific error event (`event.clean-error: out-of-space`); UI shows banner "Quarantine destination filled — pausing. [Choose new destination]".
- **User closes UI window during run:** the run continues service-side; tray icon shows "Cleaning…" pulse; user reopens window and lands directly on Step 3 with live state.
- **Cancel pressed during the last 5% of a category:** atomic-per-category — current category completes, then cancel processes. Total run is partially advanced but the bundle is still valid (just smaller than originally planned).

## Accessibility

- Progress bar has `role="progressbar"` + `aria-valuenow`/`aria-valuemax`.
- "Current item" announcements use `aria-live="polite"` with throttling (max one announcement / 3 s).
- Pause / Cancel buttons keyboard-reachable; Cancel has confirm dialog with focus trap.

## Telemetry (opt-in, v1.1+)

- Event: `clean.run.started` — `{ category_count, total_bytes_bucket }`
- Event: `clean.run.cancelled` — `{ pct_complete_at_cancel }`
- Event: `clean.run.completed` — `{ total_bytes_freed_bucket, duration_seconds }`

## Cross-links

- Related features: [[preview-step]], [[result-step]], [[../04-quarantine/features/restore-actions]]
- PLAN.md: §7.2, §10.1, §4.3 (`clean.execute`, `clean.cancel`, `event.clean-progress`)
- PROJECT.md: §9 Risk — atomic quarantine + .pq corruption mid-write

## Open questions

- Should we offer a "Run in background" affordance that returns the user to Dashboard while cleanup continues? Current: yes via window close (above), no explicit button — keeps UI simple.
- For huge runs (> 100 GB): show a "this will take ~30 minutes" warning at Step 2 → 3 transition? Current: ETA in Step 3 covers it, no upfront block.
