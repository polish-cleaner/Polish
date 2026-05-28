# Result Step (Step 4)

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Clean](../README.md)
> **Status:** designed
> **PLAN.md:** §7.2

## Purpose

The payoff. Show the user how much they reclaimed, with before/after disk gauges, and give clean exits: Restore (undo), View manifest (audit), or Done.

## User story

"As a user, I want a clear, satisfying confirmation of what just happened — and I want one click to undo it if I want."

## Behaviour

- Animated count-up of "X.X GB reclaimed" (spring physics, 600 ms duration, mono font).
- Before/after side-by-side disk gauges (only the affected drives) with the freed delta highlighted.
- Per-category summary: emoji + label + bytes freed + "Restore" mini-action.
- Three primary CTAs at bottom: **Restore** (entire run) · **View manifest** · **Done**.
- Once per 3 successful cleans, a subtle "Star us on GitHub" prompt appears (PLAN §7.2). No-op-able forever via `settings.set("ui.prompts.starUs.disabled", true)`.
- No telemetry, no email capture, no Pro upsell.

## Inputs

- **IPC calls consumed:** `quarantine.detail(runId)` — for the per-category summary + manifest path
- **State read:** `useCleanRunStore.activeRun`

## Outputs

- **IPC calls fired:**
  - `quarantine.restore({ runId, items: "all" })` on Restore button (with confirm dialog)
  - Navigation to `/quarantine?run=<runId>` on View Manifest button
- **State written:** `useCleanRunStore.complete()`
- **Events emitted:** none

## UI states

| State | When | What user sees |
|---|---|---|
| Success | `event.clean-complete` with success | Count-up + gauges + CTAs |
| Partial success | Some categories failed but bundle is valid | Count-up of what succeeded + per-row error annotations + CTAs |
| Failed (no rollback ran yet) | `event.clean-complete` with error and no rollback | Error banner + "[Restore] [Logs]" |
| Failed (rollback complete) | After cancellation in Step 3 | "Cancelled. Filesystem restored." + Done |

## Edge cases

- **Reclaim was 0 GB** (theoretically — every category came up empty at execution): "Nothing changed — destinations were already clean. [Done]".
- **Before/after gauges look identical** because of intervening writes: still show the delta as a number with a small "(other processes wrote ~X MB during cleanup)" footnote.
- **Star-us prompt fires for the 3rd time and user dismisses without starring:** prompt does not auto-disable — only the user-explicit "Don't show again" hides it permanently.
- **User navigates away (Dashboard / sidebar click) without clicking Done:** completion is implicit; the wizard state resets on next Clean entry.

## Accessibility

- Count-up has `aria-live="polite"` with throttled announcements (every 100 ms → final value only).
- Before/after gauges have `aria-label` describing the delta.
- Star prompt is dismissable via `Esc` key.

## Telemetry (opt-in, v1.1+)

- Event: `clean.result.viewed` — `{ total_bytes_freed_bucket, success_categories, failed_categories }`
- Event: `clean.result.restore-all.clicked`
- Event: `clean.result.star-us.dismissed` — `{ permanent: bool }`

## Cross-links

- Related features: [[run-step]], [[../04-quarantine/features/restore-actions]], [[../04-quarantine/features/detail-drawer]]
- PLAN.md: §7.2
- PROJECT.md: §5 v1.0 MVP feature #1

## Open questions

- The Star-us prompt: should it ever appear in the Result step, or migrate to a less-immediate moment (e.g., the next Dashboard load)? Current: Result step, per PLAN.md original spec — but a debate-style anti-nag review could move it.
- Do we offer "Email me a summary" anywhere? Current: NO — local-first principle, no email collection.
