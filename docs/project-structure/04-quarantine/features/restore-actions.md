# Restore Actions

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Quarantine](../README.md)
> **Status:** designed
> **PLAN.md:** §7.4, §10.4

## Purpose

The "undo" button. Restore one item, multiple items, or an entire run from a `.pq` bundle back to its original path. Critical trust feature — Polish's promise is that any cleanup is reversible.

## Behaviour

- **Restore all (run-level):** restores every item in a `.pq` bundle to its original path; confirms first ("Restore N items, X.X GB?").
- **Restore selected (item-level):** restores only ticked items from the detail-drawer tree.
- Conflict handling per restored file (PLAN §10.4):
  - Original path empty → restore directly
  - Original path occupied with newer file → prompt: Skip / Overwrite / Restore-with-suffix (default Restore-with-suffix per file or "Apply to all")
- Restore is itself logged as a History action (so a "restore that was wrong" can be re-quarantined per [[../05-history/features/activity-log]]).
- Partial restore supported per category, per item.
- After restore: drawer / row updates with "Restored" status badge; run is NOT auto-purged just because items were restored (user can still re-restore the remaining items until expiry).

## Inputs

- **IPC calls consumed:** `quarantine.restore({ runId, items: "all" | [itemIds], conflictPolicy })` — returns `{ restoreRunId, summary }`; events `event.quarantine-restore-progress`, `event.quarantine-restore-complete`
- **State read:** `useQuarantineStore.itemSelection`

## Outputs

- **IPC calls fired:** `quarantine.restore`
- **State written:** `useQuarantineStore.runs[runId].restored = true` (partial flag if items < total)

## UI states

| State | When | What user sees |
|---|---|---|
| Idle | Drawer open, action available | Restore buttons active |
| Confirm | User clicked Restore | Modal "Restore N items, X.X GB? [Restore] [Cancel]" |
| Conflict prompt | A file conflict detected | Per-file resolution prompt with "Apply to all" |
| Running | Restore in progress | Progress bar + count + cancel |
| Complete | Restore done | "✓ Restored N items. [Done]" + restore-run logged to History |
| Partial failure | Some items couldn't be restored | List of failed items with reason (file in use, permission denied) + retry option |

## Edge cases

- **Original path's parent directory was deleted** (e.g., a project folder was wiped): per-file conflict prompt offers "Restore to original path (creates parents)" / "Skip" / "Restore to different location".
- **Restore touches a file currently in use by another process:** specific error per file with "Close `<process>` and retry" hint.
- **User cancels mid-restore:** atomic per-file; already-restored files stay restored, the rest stay in the `.pq`.
- **Restore would exceed source drive capacity:** pre-check at start; refuse with "Not enough space on `<drive>`. Free up X GB or restore to another location."

## Accessibility

- Confirm modal traps focus, Esc cancels.
- Progress bar properly labelled.
- Conflict prompts are individual modals with clear options.

## Telemetry (opt-in, v1.1+)

- Event: `quarantine.restore.completed` — `{ items_restored, items_failed, conflict_resolutions }`
- No file paths.

## Cross-links

- Related: [[detail-drawer]], [[bulk-actions]], [[../05-history/features/activity-log]]
- PLAN.md: §7.4, §10.4
