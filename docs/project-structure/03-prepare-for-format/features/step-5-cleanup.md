# Step 5 — Cleanup (optional)

> **Version:** v1.2-Pro
> **Tier:** Pro
> **Page:** [Prepare for Format](../README.md)
> **Status:** designed
> **PLAN.md:** §9 Step 5

## Purpose

Optional pre-format cleanup pass to reduce backup size on the next machine (and free space on the way out). Defaults to Aggressive mode pre-selected; user reviews and approves — or skips entirely.

## User story

"As a Pro user, since I'm wiping anyway, I might as well clean aggressively first so I don't restore junk to my new install."

## Behaviour

- Pre-checked Aggressive-mode equivalent: all categories Polish's Aggressive mode would touch, plus Format-Prep-specific items (e.g., LM Studio models we don't want to re-download on new install — user can untick to keep them).
- Renders the same [[../02-clean/features/category-tree]] UI but in a Format-Prep-scoped shell.
- Embeds the same [[../02-clean/features/special-case-confirms]] flow for irreversibles.
- Two CTAs: "Skip cleanup" → advance to Step 6. "Run cleanup" → fires the standard Clean wizard inline, returns here on completion.
- Quarantine bundles produced here are normal `.pq` bundles; restored same way.

## Inputs

- **IPC calls consumed:** `scan.results`, `clean.preview`
- **State read:** `useFormatPrepStore.session`, `useSelectionStore.selected`

## Outputs

- **IPC calls fired:** `clean.execute` (when user runs cleanup); standard flow per [[../02-clean/features/run-step]]
- **State written:** `useFormatPrepStore.session.cleanup = { skipped: bool, runId?: string }`

## UI states

Same as standard Clean (see [[../02-clean/README]]) plus:

| State | When | What user sees |
|---|---|---|
| Skip available | Step entered | Two-button choice: "Skip cleanup" vs "Run cleanup" |
| In cleanup | Cleanup running | Standard Step 3 progress UI |
| Cleanup done | event.clean-complete | "Cleanup complete. [Next: Restore Plan]" |
| Skipped | User picked Skip | "Cleanup skipped. [Next: Restore Plan]" |

## Edge cases

- **User skips Step 5, comes back via "Save & resume":** "Cleanup was skipped previously. Continue or run now?"
- **Cleanup fails mid-run:** standard rollback; Format Prep treats this as "cleanup attempted, partial result"; user can re-run or skip.
- **User cancels cleanup mid-run:** atomic rollback; Step 5 returns to its initial choice.

## Accessibility

- Buttons keyboard-reachable, with clear text labels.

## Telemetry (opt-in, v1.2+)

- Event: `format-prep.step5.cleanup` — `{ action: "skipped" | "ran" | "ran-cancelled", bytes_freed_bucket }`

## Cross-links

- Related features: [[../02-clean/features/run-step]], [[../02-clean/features/special-case-confirms]]
- PLAN.md: §9 Step 5

## Open questions

- Should the Aggressive default here include "Uninstall apps not in winget" (true bloat)? Current: yes — user can untick individuals.
- For users who plan to install a different OS post-wipe (e.g., Linux): do we offer a "no point cleaning Windows-specific stuff" preset? Defer to v1.3.
