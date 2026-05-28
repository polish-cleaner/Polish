# Category Tree

> **Version:** v1.0 (Always-Safe + Safe for Devs npm/pnpm/cargo) · v1.1 (full catalog) · v1.2-Pro (Dev/AI Pro categories)
> **Tier:** Free (core) + Pro (Dev/AI subset)
> **Page:** [Clean](../README.md)
> **Status:** designed
> **PLAN.md:** §7.2, §8.2

## Purpose

The full list of cleanup categories grouped by safety tier. The user reviews, edits the selection, sees sizes per category, and proceeds.

## User story

"As a user, I want to see every category Polish will clean — grouped by how safe it is — with sizes, and I want full control over what I include or exclude."

## Behaviour

- Categories grouped by **safety tier** (Always Safe / Safe for Devs / System Cleanup / Duplicate Installs / Large User Content / Application Caches / Bloat Removal) — UI grouping, not technical type.
- Each tier is collapsible. Default collapsed state: Always-Safe + Safe for Devs expanded; rest collapsed.
- Each row: emoji + label + size + per-row warning badge (⚠ for irreversible) + checkbox.
- Tier-level checkbox toggles all rows in that tier.
- Mode picker selection ([[mode-picker]]) sets default checkbox state for each row.
- Pro-only rows (v1.2+ Dev/AI catalog): visible with "Pro" badge; checkbox disabled if Pro not installed; clicking the row links to docs (not a buy modal).

## v1.0 categories (free, narrow MVP)

Per PLAN §8.2 + post-debate descope:

- **Always Safe** (Light+): Recycle Bin, %TEMP% + C:\Windows\Temp, Chrome/Edge browser cache (Default profile only), Windows Update download cache, Delivery Optimization cache, crash dumps + WER queue, thumbnail cache, prefetch (with rebuild note), icon cache, old logs (>30 d)
- **Safe for Devs** (Balanced+, **v1.0 ships these three only**): npm cache, pnpm store, cargo registry + build cache
- **System Cleanup** (Balanced+ with extra confirms): DISM `/StartComponentCleanup /ResetBase`, Hibernation file toggle, Windows.old / $WINDOWS.~BT / $WINDOWS.~WS
- **Duplicate Installs**, **Large User Content**, **Application Caches**, **Bloat Removal**: NOT in v1.0 (deferred to v1.1 / v1.2-Pro per PLAN §3).

## Inputs

- **IPC calls consumed:** `scan.results` (returns per-category bytes + item counts)
- **State read:** `useSelectionStore.selected`, `useProStore.licenseValid`

## Outputs

- **IPC calls fired:** none directly (selection changes are local until "Next: Preview")
- **State written:** `useSelectionStore.toggle(categoryId)`, debounced 200 ms `clean.preview` to refresh selection summary banner

## UI states

| State | When | What user sees |
|---|---|---|
| Populated | Scan complete | Full tree with sizes |
| Loading | Scan in progress | Skeleton rows; sizes appear as `event.found-junk` fires per category |
| Empty | Scan complete, all categories zero | "All clear ✨ Nothing to reclaim." with mode-bump suggestion |
| Pro-locked | Pro category, license invalid | Row greyed + "Pro" badge + tooltip "Install Polish Pro to enable" |
| Disabled | Clean in flight | All checkboxes disabled |

## Edge cases

- **Scan partially complete (e.g., big category still being computed):** row shows "Computing… X.X GB so far" with a spinner; selection is allowed but final size may shift.
- **Category cleanup safety changed between scan and execute (e.g., file became in-use):** runtime handles per-item via quarantine engine; user sees a per-row note in Result step rather than a pre-execute block.
- **Irreversible row checked without prior 5-second hold:** [[special-case-confirms]] fires at Preview→Run transition, not at row toggle.
- **Tier-level toggle when some rows are Pro-locked:** unchecked rows that are Pro-locked stay unchecked; tier checkbox shows mixed-state.

## Accessibility

- Tree uses `role="tree"` + `role="treeitem"` per row + `aria-expanded` on group headers.
- Per-row warning badges have `aria-label="Irreversible action"`.
- Pro-locked rows have `aria-disabled="true"` + `aria-describedby` linking to a "Pro feature" caption.

## Telemetry (opt-in, v1.1+)

- Event: `clean.category.toggle` — `{ category_id, checked }`
- No file paths.

## Cross-links

- Related features: [[mode-picker]], [[preview-step]], [[special-case-confirms]]
- PLAN.md: §8.2 (full category catalog)
- PROJECT.md: §5 v1.0 MVP feature #2 (npm/pnpm/cargo proof-of-wedge)

## Open questions

- Search box inside the tree for power users with many categories? Current: defer to v1.1 (only worthwhile when full catalog ships).
- Per-row "what does this clean exactly?" expand-to-show-paths affordance? Current: yes, a small `?` icon per row opens a sub-panel listing example paths — anti-snake-oil principle requires transparency.
