# Page: Clean

> **Version introduced:** v1.0 (Light/Balanced) + v1.1 (Aggressive/Custom modes) + v1.2 (Pro Dev/AI categories)
> **Tier:** Free (Light/Balanced/Aggressive/Custom) + Pro (Dev/AI categories, custom profile cloud sync)
> **Sidebar position:** 🧹 Clean (2nd)
> **Route:** `/clean`
> **Spec in PLAN.md:** §7.2, §8

## Purpose

The primary cleanup workflow. 4-step wizard that takes the user from "I want to clean" to "I freed X.X GB" with one quarantine-safe operation. Every action is reversible until auto-purge expires.

## Layout sketch

```
Step indicator: (1) Select → (2) Preview → (3) Run → (4) Result

Step 1 — Select
┌──────────────────────────────────────────────────────────────────┐
│  Mode: [ Light ] [ Balanced ✓ ] [ Aggressive ] [ Custom ]        │
│                                                                    │
│  ▼ Always Safe                                            12.4 GB │
│      ☑ Recycle Bin                                         3.1 GB │
│      ☑ %TEMP%                                              5.7 GB │
│      ☑ Browser cache (Chrome, Edge)                        3.6 GB │
│                                                                    │
│  ▼ Safe for Devs                                          18.2 GB │
│      ☑ npm cache                                           4.1 GB │
│      ☑ pnpm store                                          8.3 GB │
│      ☑ cargo build cache                                   5.8 GB │
│                                                                    │
│  ▼ System Cleanup (Balanced+)                              ~10 GB │
│      ☐ DISM ResetBase                  ⚠ Irreversible             │
│      ☐ Hibernation file                                           │
│                                                                    │
│  Selected: 30.6 GB                              [ Next: Preview ] │
└──────────────────────────────────────────────────────────────────┘
```

## Features

| Feature | Version | Tier | Status |
|---|---|---|---|
| [Mode Picker](features/mode-picker.md) | v1.0 (Light/Balanced) + v1.1 (Aggressive/Custom) | Free | designed |
| [Category Tree](features/category-tree.md) | v1.0 | Free | designed |
| [Preview Step](features/preview-step.md) | v1.0 | Free | designed |
| [Run Step](features/run-step.md) | v1.0 | Free | designed |
| [Result Step](features/result-step.md) | v1.0 | Free | designed |
| [Special-Case Confirms](features/special-case-confirms.md) | v1.0 | Free | designed |
| Dev/AI category integration (Pro) | v1.2-Pro | Pro | spec'd in [[../_feature-version-matrix]] |

## Data dependencies (reads)

- `scan.results` — pre-populates category tree
- `clean.preview` — on selection change, computes impact (size, item count, destination drive, retention)
- `service.status` — to check service health before allowing `clean.execute`
- Service events: `event.scan-complete` (refresh tree), `event.clean-progress`, `event.clean-complete`

## Data writes

- `clean.execute` — fires from Step 2 → Step 3
- `clean.cancel` — fires from Step 3 abort button
- `settings.set("clean.lastMode")` — persists user's last-used mode

## Cross-page navigation

| CTA | Destination |
|---|---|
| Next: Preview (Step 1 → 2) | stays in `/clean`, advances wizard |
| Next: Run (Step 2 → 3) | stays in `/clean`, fires `clean.execute` |
| Restore (Step 4 Result) | `/quarantine` filtered to this run |
| View manifest (Step 4 Result) | `/quarantine` detail drawer for this run |
| Done (Step 4 Result) | `/dashboard` |

## Empty / loading / error states

See [[empty-states]] for canonical rules. Clean-specific:

- **No scan results:** Step 1 shows "Run a scan first. [Scan now]" CTA — clicking fires `scan.start` and re-routes back to Clean Step 1 on completion.
- **Clean in flight:** Mode picker disabled, wizard locked to Step 3 progress until `event.clean-complete` or user cancels.
- **Clean execution failed:** error state in Step 3 with rollback details; quarantine bundle for that run is purged automatically (atomic principle, PLAN §10.1).
- **Pro Dev/AI category requested but Pro inactive:** category rows greyed out with "Pro feature" tag (NOT a buy-now nag — link to docs explaining Pro).

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Tab` | Step through mode picker / category checkboxes |
| `Space` | Toggle focused checkbox |
| `Enter` | Advance to next step (if "Next" enabled) |
| `Esc` (Step 3) | Trigger Cancel (with confirmation) |

## Open questions

- Step 2 Preview banner copy: how much detail about quarantine destination is too much? Current: "8 categories, 41.2 GB, destination D:\PolishQuarantine\, retention 14 days" — concise but informative. Reconsider if users skip it.
- For "Restart required" actions (DISM, hibernation toggle): does the wizard offer "Restart now" or only inform? Current: inform only — never auto-restart the user's machine.
