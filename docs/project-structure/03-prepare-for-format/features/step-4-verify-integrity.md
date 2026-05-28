# Step 4 — Verify Backup Integrity

> **Version:** v1.2-Pro
> **Tier:** Pro
> **Page:** [Prepare for Format](../README.md)
> **Status:** designed
> **PLAN.md:** §9 Step 4

## Purpose

SHA-256 every backed-up file, compare against source. Verification gate: if any mismatch, user must resolve before continuing — no "skip" option for failed verification.

## User story

"As a Pro user about to wipe my source machine, I want cryptographic proof that the backup is identical to the source — because re-doing it after a wipe is impossible."

## Behaviour

- Iterates every file in the backup destination.
- Computes SHA-256 in stream during read.
- Compares against source-file hash captured during Step 3.
- Reports: total verified, total mismatches, missing files.
- If mismatches: shows per-file list + actions: "Re-copy this file" / "Investigate" (opens explorer to the file pair).
- "Next: Cleanup" gated: requires zero mismatches AND zero missing.

## Inputs

- **IPC calls consumed:** `format-prep.verify.run({ runId })`; events `event.format-prep-verify-progress`, `event.format-prep-verify-mismatch`
- **State read:** `useFormatPrepStore.session.backup`

## Outputs

- **IPC calls fired:** `format-prep.verify.run`, `format-prep.verify.recopy({ files: [...] })`
- **State written:** `useFormatPrepStore.session.verify = { progress, mismatches, missing }`

## UI states

| State | When | What user sees |
|---|---|---|
| Not started | Step entered | "Click 'Start verification' to begin." |
| Running | Hashing in progress | Progress bar + count "X / Y files verified" |
| Mismatch found (running) | At least one file failed | Inline list grows during run; not an error UI yet |
| Complete, all matched | 100% verified | "✓ Backup verified. All Y files match source." + Next |
| Complete, mismatches | Some files failed | Red banner + per-file action list + "Re-copy selected" |
| Re-copying | After Re-copy action | Per-file copy progress; re-verify after |

## Edge cases

- **Source file changed between Step 3 and Step 4** (user kept working): expected mismatch. Wizard notes "Source has changed since backup. [Re-copy from current source] [Keep backup as-is — file diverged]".
- **Backup destination unmounted:** "Destination unreachable. Reconnect and [Retry]".
- **Hash algorithm degradation suspicion (future):** SHA-256 is current; if changed in future versions, manifest stores algorithm name for forward compatibility.

## Accessibility

- Progress bar properly labelled.
- Mismatch list announced via `aria-live="polite"`.

## Telemetry (opt-in, v1.2+)

- Event: `format-prep.step4.verify.completed` — `{ files_verified, mismatches, missing }`
- No file paths, no hash values.

## Cross-links

- Related features: [[step-3-backup-execution]], [[step-5-cleanup]]
- PLAN.md: §9 Step 4

## Open questions

- Should we offer BLAKE3 as a faster alternative? PLAN §5 uses BLAKE3 in quarantine; consistency might dictate same here. Decision: stick with SHA-256 for Format Prep because users may verify externally with `sha256sum` / `Get-FileHash`.
- Time-budget on verification: large backups (200 GB+) take 20-40 minutes to hash. Show estimate based on rate? Current: yes, ETA in progress bar.
