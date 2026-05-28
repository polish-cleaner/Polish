# Step 3 — Backup Execution

> **Version:** v1.2-Pro
> **Tier:** Pro
> **Page:** [Prepare for Format](../README.md)
> **Status:** designed
> **PLAN.md:** §9 Step 3

## Purpose

The actual file/data copy step. Checklist of what to copy, per-item progress, integrity checks during transfer. The most time-consuming step of the wizard.

## User story

"As a Pro user, I want a clear checklist of every credential, config, app data, and dev artifact Polish will back up — with per-item progress and ETA — so I can step away knowing nothing is missed."

## Behaviour

Checklist of categories (user can uncheck individual items):

- **Credentials & keys (DO NOT LOSE):** `.ssh/`, `.gitconfig`, `.aws/`, `.azure/`, `.docker/`, `.npmrc`, `.gnupg/`, `.kube/`
- **AI/dev tool configs:** `.claude/`, `.cursor/`, `.vscode/`, VS Code / Cursor user settings, PowerShell profiles
- **App data folders:** Postman collections, MobaXterm sessions, FileZilla site manager, NinjaTrader / MetaTrader / Bookmap workspaces, MongoDB Compass favorites
- **Browser data:** prompt to use built-in sync first; offer profile-folder copy as fallback; export bookmarks HTML; export passwords (encrypted)
- **Databases:** MySQL `mysqldump`, MongoDB `mongodump`, list local SQLite files in Documents
- **XAMPP / htdocs:** if present
- **WSL distros:** `wsl --export` each
- **Docker:** save selected images + volumes

Per-item progress UI: bytes copied, ETA, integrity check (hash computed in stream).

## Inputs

- **IPC calls consumed:** `format-prep.backup.execute({ items: [...] })`; events `event.format-prep-backup-progress`
- **State read:** `useFormatPrepStore.session.destination`, `useFormatPrepStore.session.inventory`

## Outputs

- **IPC calls fired:** `format-prep.backup.execute`, `format-prep.backup.cancel`
- **State written:** `useFormatPrepStore.session.backup = { runId, progress, completed }`

## UI states

| State | When | What user sees |
|---|---|---|
| Pre-execution | Step entered | Checklist + estimated total + "Start backup" button |
| Running | Backup in flight | Per-item progress + global progress + ETA + Cancel |
| Paused | User paused | Per-item state frozen + Resume button |
| Item failed | One item errors mid-copy | Per-row error inline + "Skip and continue" / "Retry" |
| Complete | All items done | "✓ Backup complete. X.X GB in Y minutes." + Next: Verify |

## Edge cases

- **Database service not running** (MySQL stopped): per-row error "MySQL not running. Start the service and retry?"
- **WSL distro currently in use:** `wsl --export` fails; per-row error "Shut down WSL first: `wsl --shutdown`".
- **Docker not running:** per-row error "Docker desktop not running. Start it and retry?"
- **Encrypted destination + password mismatch:** halt with error before any write.
- **Power loss mid-backup:** service recovers on restart; partial files marked invalid; user re-enters Step 3 and continues from incomplete item.

## Accessibility

- Per-item progress rows have `aria-live` (throttled).
- Cancel button is keyboard-reachable with confirm.

## Telemetry (opt-in, v1.2+)

- Event: `format-prep.step3.backup.completed` — `{ duration_seconds, total_bytes_bucket, failed_item_count }`
- Event: `format-prep.step3.backup.cancelled`

## Cross-links

- Related features: [[step-4-verify-integrity]], [[step-6-restore-plan]]
- PLAN.md: §9 Step 3
- PROJECT.md: §5 v1.2 Pro flagship

## Open questions

- Browser passwords export: Chrome / Edge now require user re-authentication for full password export. Do we automate this or instruct the user? Current: instruct (the wizard pauses with clear instructions; user-driven export back to Polish via file picker).
- Should we offer a "minimal backup" preset (just credentials + dev configs, skip app data) for speed-critical users? Current: yes, as a profile preset alongside "Full".
