# Preview Step (Step 2)

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Clean](../README.md)
> **Status:** designed
> **PLAN.md:** §7.2

## Purpose

Last chance for the user to verify exactly what's about to happen before any cleanup action runs. Shows aggregate impact + per-category breakdown + the destination quarantine path + retention policy.

## User story

"As a user, I want to see the exact bytes-per-category and destination quarantine path before anything is moved, so I'm not surprised by what Polish does."

## Behaviour

- Sticky summary banner at top: "8 categories, 41.2 GB, destination D:\PolishQuarantine\polish-2026-05-28-14-32, retention 14 days."
- Per-category breakdown table beneath: emoji, label, size, item count, action kind (move / delete / uninstall / toggle).
- Per-irreversible-action callout banners (⚠) at top of the page if any irreversible items are checked. Each callout names the specific item (e.g., "⚠ DISM ResetBase is in this run — irreversible. [Learn more]").
- "Back" button returns to Step 1 with selection intact.
- "Next: Run" button advances to Step 3 with confirmation flow for irreversible actions (see [[special-case-confirms]]).

## Inputs

- **IPC calls consumed:** `clean.preview` (returns full dry-run impact including quarantine destination + retention)
- **State read:** `useSelectionStore.selected`

## Outputs

- **IPC calls fired:** none from Preview itself; the `Next: Run` button fires `clean.execute` (which lives in [[run-step]] in terms of UI tracking)
- **State written:** none beyond standard wizard advancement
- **Events emitted:** none

## UI states

| State | When | What user sees |
|---|---|---|
| Computing | After Step 1 "Next", before `clean.preview` returns | "Computing impact…" with skeleton banner |
| Ready | Preview returned successfully | Full banner + table + "Next: Run" enabled |
| Has irreversible | Any checked row is irreversible | Amber callout banner(s) at top + 5-second hold-to-confirm on Next button |
| Insufficient space | Selected destination drive has < quarantine_size free | Red banner "Not enough space on D:. Choose another destination [Settings]"; Next disabled |
| Error | `clean.preview` IPC failed | "Couldn't compute preview. [Retry] [Back]" |

## Edge cases

- **Quarantine destination drive removed between Step 1 and Step 2:** preview falls back to next-priority drive per `settings.get("quarantine.destinationPriority")`; banner shows "Original destination unavailable — using D: instead. [Change]".
- **A category's measured size drifts between scan and preview** (e.g., new files arrived): preview shows fresh sizes; banner notes "Sizes updated since scan."
- **Preview returns zero bytes** (everything was already cleaned by another process): "Nothing left to clean. [Back to Dashboard]".
- **User opens Settings → quarantine destination, changes it, comes back:** preview is re-computed automatically; banner refreshes.

## Accessibility

- Summary banner has `aria-live="polite"`.
- Per-irreversible callouts are `<aside role="alert">` — announced when added.
- Tables have proper `<th>` headers + `scope`.

## Telemetry (opt-in, v1.1+)

- Event: `clean.preview.viewed` — `{ category_count, total_bytes_bucket, has_irreversible: bool }`
- Event: `clean.preview.cancelled` (user went back without proceeding)

## Cross-links

- Related features: [[category-tree]], [[run-step]], [[special-case-confirms]]
- PLAN.md: §7.2, §4.3 (`clean.preview`)
- PROJECT.md: §5 v1.0 MVP feature #1 (quarantine + preview)

## Open questions

- Should the preview banner be downloadable / exportable as a "dry-run report" for security-paranoid users? Defer to v1.1 once we have feedback.
- For users who customized retention via Custom mode: do we show the per-category retention here, or only the run-level retention? Current: run-level retention (one number, simpler); per-category retention is a power-user setting in Custom mode.
