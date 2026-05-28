# Step 7 — Final Greenlight

> **Version:** v1.2-Pro
> **Tier:** Pro
> **Page:** [Prepare for Format](../README.md)
> **Status:** designed
> **PLAN.md:** §9 Step 7

## Purpose

The final go/no-go gate. Printable / exportable summary checklist confirming every prior step is green; the "OK to format" affordance only enables when every checkpoint is verified.

## User story

"As a Pro user, I want a single screen confirming I'm safe to wipe — and one final reminder to do the things Polish can't do for me (unplug the backup drive, find the Windows install media)."

## Behaviour

- Top: "🟢 Ready to format" / "🔴 Not ready — see below" banner.
- Checklist:
  - ✓ Inventory complete (Step 1) — date + size
  - ✓ Destination verified (Step 2) — drive + space used
  - ✓ Backup complete (Step 3) — file count + total size
  - ✓ Backup verified (Step 4) — 100% hash match
  - ✓/⊘ Cleanup complete or skipped (Step 5)
  - ✓ Restore plan generated (Step 6) — file count + SHA-256 of zip
- Below: reminder section with explicit pre-flight warnings:
  - "⚠ Unplug the backup drive after this — do NOT leave it connected when you format"
  - "⚠ Have your Windows installation media ready"
  - "⚠ Verify the SHA-256 of polish-restore-<date>.zip independently: `Get-FileHash <path>` should equal `<sha>`"
- "Export summary" button — saves a printable PDF / Markdown file of the full session.
- "OK to format ✓" button — enabled only when every prior checkpoint is green; clicking it doesn't actually format (Polish never wipes the user's drive) — it marks the session complete and offers to open the restore plan folder.

## Inputs

- **IPC calls consumed:** `format-prep.session.get` (full session state); `format-prep.session.summary` (rendered summary)
- **State read:** `useFormatPrepStore.session`

## Outputs

- **IPC calls fired:** `format-prep.session.complete({ sessionId })`
- **State written:** `useFormatPrepStore.session.completed = true`

## UI states

| State | When | What user sees |
|---|---|---|
| Not ready | Any prior checkpoint not green | Red banner + checklist showing the missing item with "Back to Step X" link |
| Ready | All checkpoints green | Green banner + checklist + reminders + "OK to format ✓" enabled |
| Completed | User clicked OK to format | "Session marked complete. [Open restore plan folder] [Done]" — no auto-action beyond that |
| Export rendering | User clicked Export summary | Spinner; file ready in a few seconds |

## Edge cases

- **User comes back to Step 7 after a re-run of an earlier step:** checklist reflects current state; if anything regressed (e.g., Step 6 re-run added/changed files), Step 7 prompts "Step 6 was re-run — verify the new restore plan SHA before continuing".
- **User exports summary but never clicks OK to format:** session stays open; can be resumed later.
- **User closes the wizard at Step 7:** session is auto-marked complete only if all checkpoints are green; otherwise stays open for resume.

## Accessibility

- Banner has `role="status"` with `aria-live="polite"`.
- Checklist items use `<li>` with status icons that have `aria-label`.
- Reminder section uses `<aside role="region" aria-labelledby="reminders-heading">`.

## Telemetry (opt-in, v1.2+)

- Event: `format-prep.step7.completed` — `{ total_duration_seconds, skipped_cleanup: bool, exported_summary: bool }`

## Cross-links

- Related features: all six prior steps
- PLAN.md: §9 Step 7

## Open questions

- Should we send the user an email summary (if they opted in to a Polish Account in v2.0)? Yes once v2.0 ships; v1.2 is local-only — Export summary is the v1.2 mechanism.
- Should "OK to format" trigger a system shutdown / reboot prompt? Current decision: NO — Polish never controls the user's reboot. Reminder text only.
