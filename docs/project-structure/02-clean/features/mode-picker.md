# Mode Picker

> **Version:** v1.0 (Light + Balanced) · v1.1 (Aggressive + Custom)
> **Tier:** Free
> **Page:** [Clean](../README.md)
> **Status:** designed
> **PLAN.md:** §8.1

## Purpose

Top-of-Step-1 segmented control that pre-fills the category tree with sensible defaults. Modes are PLAN.md-locked: Light / Balanced / Aggressive / Custom.

## User story

"As a user, I want one click to pick how aggressive I want cleanup to be, so I don't have to think about individual categories unless I want to."

## Behaviour

- Segmented control with 4 options (2 in v1.0, 4 from v1.1).
- Default on first launch: **Balanced** (PLAN §8.1).
- Last-used mode persisted via `settings.set("clean.lastMode")` and pre-selected on subsequent launches unless user disabled this in Settings.
- Switching mode immediately re-applies the default checkbox state for that mode — but if the user has manually altered any checkbox, switching modes prompts "You've customized this selection. Switch and lose changes? [Cancel] [Switch]".
- Custom mode: starts blank; user-defined selections are saved per-profile via `.polishprofile` (v1.1+).

## Modes

| Mode | Time | Recovery | Includes | Retention |
|---|---|---|---|---|
| **Light** | ~5 min | 15–40 GB | Always-Safe categories only | 7 days |
| **Balanced** (default) | ~15 min | 35–80 GB | Light + dev caches + DISM cleanup + hibernation toggle | 14 days |
| **Aggressive** (v1.1) | ~30 min | 60–150 GB | Balanced + duplicate detection + Docker prune + WSL audit + uninstall offers | 30 days |
| **Custom** (v1.1) | varies | varies | User-defined; saveable as `.polishprofile` | user-set |

## Inputs

- **IPC calls consumed:** `scan.results` (informs which categories are available); `settings.get("clean.lastMode")`
- **State read:** `useScanStore.results`, `useSelectionStore.dirty` (has the user manually altered anything?)

## Outputs

- **IPC calls fired:** `settings.set("clean.lastMode")` on mode change
- **State written:** `useSelectionStore.applyMode(mode)` — replaces selection with mode defaults
- **Events emitted:** none

## UI states

| State | When | What user sees |
|---|---|---|
| Default | Page loaded, last mode applied | Segmented control with one option highlighted |
| Hover | Mouse over an option | Subtle background tint |
| Active | User clicked an option | Emerald accent, animated transition |
| Disabled | Clean in flight | All options greyed |
| Confirm | User changes mode after manual edits | Inline confirm "Switch and lose changes?" |

## Edge cases

- **`scan.results` is empty:** mode picker still renders but all categories show "scan first to see sizes"; the modes themselves are still pickable (selection applies once scan completes).
- **Aggressive or Custom selected in v1.0 build (impossible via UI, but defensive):** falls back to Balanced with a console warning.
- **Mode-default category not present in this user's scan:** silently skipped — no error, no missing-feature complaint.

## Accessibility

- Segmented control uses `role="tablist"` + each option `role="tab"` + `aria-selected`.
- Keyboard arrow keys navigate between options.
- Mode description visible as text below the picker (not tooltip-only) for screen-reader users.

## Telemetry (opt-in, v1.1+)

- Event: `clean.mode.changed` — `{ from, to, had_dirty_selection }`

## Cross-links

- Related features: [[category-tree]], [[preview-step]]
- PLAN.md: §8.1
- PROJECT.md: §5 (revised — v1.0 ships Light/Balanced only)

## Open questions

- Should "Custom" mode in v1.1 show a "New profile..." link inline, or push profile creation into Settings? Current: inline link from Custom mode, persistence in Settings → Advanced.
- Switching from Custom back to Light/Balanced/Aggressive: prompt to save current selection as a profile? Current: yes, single dialog "Save as profile [name]? [Save] [Discard]".
