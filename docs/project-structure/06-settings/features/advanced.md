# Settings → Advanced

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Settings](../README.md)
> **Status:** designed
> **PLAN.md:** §12 Advanced

## Items

| Item | Type | Notes |
|---|---|---|
| Open `%ProgramData%\Polish\` in Explorer | button | Shell out |
| Open log directory | button | Same as Settings → Service equivalent (duplicated for discoverability) |
| Open quarantine root | button | Opens whichever drive currently hosts `\PolishQuarantine\` |
| Export current settings to JSON | button → file picker | Plain JSON of all `settings.*` values |
| Import settings from JSON | button → file picker | Validates schema before applying; revertible (atomic) |
| Reset all settings to defaults | button (with confirm) | Full reset; History preserved; Quarantine bundles preserved |
| `.polishprofile` import/export (v1.1+) | buttons | Custom profile sharing format |
| Developer options (visible if env `POLISH_DEV=1`) | toggle list | Mock data, force-fail toggles, log level. NEVER exposed in shipped builds. |

## Behaviour

- Import settings: validated against Zod schema before write; if invalid, error inline with first failing key.
- Reset to defaults: confirms "This will reset all Settings. History, Quarantine, and login items unaffected. [Reset] [Cancel]"; one-step (no nested undo).
- Developer options: gated by env variable check on UI launch; absent in normal users' builds.

## IPC

- `settings.export({ destination })`
- `settings.import({ source })`
- `settings.reset` (UI-side helper that writes defaults via repeated `settings.set`)

## Edge cases

- **Imported JSON has unknown keys (older Polish version):** ignored with warning toast "N unknown keys ignored. Compatibility maintained."
- **Imported JSON tries to set Auto-clean to Full-auto with no understanding-gate toggle:** import refuses + reverts; user must enable manually.
- **Developer options accidentally shipped on:** UI on launch checks build flavor; if "release" + dev options set, ignores them.

## Cross-links

- Related: [[service]], [[privacy]]
- PLAN.md: §12 Advanced
