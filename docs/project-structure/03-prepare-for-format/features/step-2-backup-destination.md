# Step 2 — Backup Destination

> **Version:** v1.2-Pro
> **Tier:** Pro
> **Page:** [Prepare for Format](../README.md)
> **Status:** designed
> **PLAN.md:** §9 Step 2

## Purpose

User picks where the backup lands. Polish auto-detects fixed + external/removable drives, shows free space, estimates backup size, and lets the user toggle encryption + compression.

## User story

"As a Pro user about to back up sensitive credentials and dev configs, I want to choose a destination I trust (preferably external) with optional encryption."

## Behaviour

- Drive list with: drive letter, label, total / free space, drive type (fixed / external / removable), warning if free space < estimated backup size + 20% buffer.
- Polish strongly recommends an external drive for portability (color-coded green); shows the recommendation inline.
- Estimated backup size: pre-computed from Step 1 inventory + default backup categories from Step 3 (preliminary estimate; user refines in Step 3).
- **Encryption opt-in toggle:** AES-256-GCM, Argon2id KDF. Password stored in Windows Credential Manager keyed by session ID; user must remember/record it (we don't email password recovery).
- **Compression level slider:** 1 (fast, ~70% of original) → 9 (slow, ~50% of original). Default: 6.
- Optional: select a sub-folder name (default `polish-format-prep-YYYY-MM-DD-HHMM`).

## Inputs

- **IPC calls consumed:** `service.status` (drive enumeration); `format-prep.inventory.estimate-size` (from Step 1 data)
- **State read:** `useFormatPrepStore.session.inventory`

## Outputs

- **IPC calls fired:** `format-prep.session.advance({ step: 2, destination: { drive, path, encrypted, compression } })`
- **State written:** `useFormatPrepStore.session.destination`

## UI states

| State | When | What user sees |
|---|---|---|
| Default | First entry | Drive list with recommended drive highlighted |
| External recommended but not present | No external drive detected | "No external drive detected. We recommend one for safety. [Use internal anyway]" |
| Insufficient space | All drives smaller than estimate + 20% | Red banner; user can adjust Step 3 scope to fit |
| Encryption enabled | User toggled on | Password input + confirm + "Save password to Credential Manager? [yes / no]" |
| Resumed | Returning to Step 2 mid-session | Previous selection pre-populated |

## Edge cases

- **External drive plugged in after Step 2 entered:** drive list auto-refreshes via service event.
- **User picks a drive that's mounted but encrypted (BitLocker) and locked:** prompt to unlock first.
- **User picks a network drive:** allowed with a "Network drives can be slow; consider local first" advisory.
- **User enables encryption then forgets password:** unrecoverable. The Step 2 UI explicitly states "We don't have a recovery option — if you lose this password, the backup is gone."

## Accessibility

- Drive list is `<table>` with selectable rows (`role="radiogroup"` + `role="radio"` per row).
- Encryption toggle is `<input type="checkbox">` with proper label association.

## Telemetry (opt-in, v1.2+)

- Event: `format-prep.step2.destination-selected` — `{ drive_type: "fixed" | "external" | "removable" | "network", encrypted: bool, compression_level }`
- No drive paths, no labels.

## Cross-links

- Related features: [[step-1-system-snapshot]], [[step-3-backup-execution]]
- PLAN.md: §9 Step 2, §10.2 (quarantine destination logic, similar)

## Open questions

- Should we support multi-destination (mirror to two drives simultaneously)? Defer to v1.3 — power-user feature.
- Should we offer cloud destinations (Polish cloud backup integration from v2.0)? Yes once v2.0 ships; v1.2 is local-only.
