# Page: Prepare for Format

> **Version introduced:** v1.2-Pro
> **Tier:** Pro only
> **Sidebar position:** 🚀 Prepare for Format (3rd, gold accent — hidden if Pro not installed)
> **Route:** `/format-prep`
> **Spec in PLAN.md:** §7.3, §9

## Purpose

7-step guided wizard that takes a user from "I'm about to wipe this machine" to "I have a verified backup + a restore plan." The flagship Pro feature; no competitor ships anything like it.

## Layout sketch

```
[1] Snapshot → [2] Destination → [3] Backup → [4] Verify → [5] Cleanup → [6] Restore Plan → [7] Greenlight

Distinct gold accent border on every step (visual differentiation from everyday Cleanup).

Persistent "Save & resume later" affordance on every step — wizard state stored service-side.
```

## Features (one per wizard step)

| Step | Feature | Version | Tier | Status |
|---|---|---|---|---|
| 1 | [System Snapshot](features/step-1-system-snapshot.md) | v1.2-Pro | Pro | designed |
| 2 | [Backup Destination](features/step-2-backup-destination.md) | v1.2-Pro | Pro | designed |
| 3 | [Backup Execution](features/step-3-backup-execution.md) | v1.2-Pro | Pro | designed |
| 4 | [Verify Backup Integrity](features/step-4-verify-integrity.md) | v1.2-Pro | Pro | designed |
| 5 | [Cleanup (optional)](features/step-5-cleanup.md) | v1.2-Pro | Pro | designed |
| 6 | [Generate Restore Plan](features/step-6-restore-plan.md) | v1.2-Pro | Pro | designed |
| 7 | [Final Greenlight](features/step-7-final-greenlight.md) | v1.2-Pro | Pro | designed |

## Data dependencies (reads)

- `format-prep.session.get` — fetches resumable session if one exists
- `format-prep.inventory` — Step 1 inventory data
- `service.status` — verifies Pro license valid + disk space queries
- `format-prep.backup.status` — Step 3 progress, Step 4 verification

## Data writes

- `format-prep.session.start` — creates new session
- `format-prep.session.advance({ step })` — persists per-step completion
- `format-prep.backup.execute` — Step 3 starts backup
- `format-prep.verify.run` — Step 4 integrity verification
- `format-prep.restore-plan.generate` — Step 6 output writes
- `format-prep.session.complete` — Step 7 finalize

## Cross-page navigation

| CTA | Destination |
|---|---|
| Save & resume later (any step) | `/dashboard` with toast "Format prep session saved" |
| Resume from Step X (Dashboard CTA → Format Prep) | resumes at the latest incomplete step |
| OK to format ✓ (Step 7 final) | exports restore-plan ZIP to a user-chosen location; no auto-format trigger (Polish never wipes the user's drive itself) |

## Empty / loading / error states

- **No active session:** Step 1 starts fresh.
- **Resumable session exists:** Dashboard CTA reads "Resume Format Prep — Step X of 7 →".
- **Inventory scan failed (Step 1):** specific error per source (e.g., "Could not enumerate winget packages — service may need elevation. [Retry] [Skip winget]").
- **Backup destination disconnected mid-Step-3:** pause + alert; resume when reconnected.
- **Verification mismatch (Step 4):** red banner with file list; must resolve before advancing.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Tab` | Step through checkboxes / inputs |
| `Enter` | Advance step (if eligible) |
| `Esc` | Save & resume later confirmation |
| `Ctrl+S` | Explicit Save (in case user is paranoid) |

## Open questions

- Should Step 5 (Cleanup) reuse the Clean wizard UI inline, or have its own simpler subset? Current: own subset — Aggressive mode pre-selected with a checklist style; reuses the Clean engine via IPC but with a Format-Prep-specific UI shell.
- Step 7 "OK to format" output: should we offer to create a bootable USB installer (Win11 ISO download + Rufus-style flashing)? Current: NO in v1.2 — too much liability + Microsoft already has tools; we generate the restore plan, user wipes themselves.
- For users with multi-boot systems: do we detect and warn? Current: yes, Step 1 surfaces any non-Windows boot entries; Step 7 reminds user to back up those too.
