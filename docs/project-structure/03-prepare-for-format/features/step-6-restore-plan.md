# Step 6 — Generate Restore Plan

> **Version:** v1.2-Pro
> **Tier:** Pro
> **Page:** [Prepare for Format](../README.md)
> **Status:** designed
> **PLAN.md:** §9 Step 6

## Purpose

Generate every script, list, and snippet needed to restore the user's environment on a fresh install. Output is a self-contained folder users can run from a fresh Windows install to rebuild their machine in hours not days.

## User story

"As a Pro user post-format, I want a single folder of scripts I can run on the new install — `winget import`, IDE extensions, env vars, manual-install list — so I'm not piecing my dev setup back together for a week."

## Behaviour

Generates files into the user's working dir from Step 2:

- **`winget-export.json`** — generated via `winget export`; one-command restore on new machine: `winget import -i winget-export.json`
- **`vscode-extensions.txt`** + restore script (`restore-vscode-extensions.ps1`)
- **`cursor-extensions.txt`** + restore script
- **`npm-globals.txt`** + restore script (`npm install -g ...`)
- **`pip-freeze.txt`** + restore script (`pip install -r ...`)
- **`env-vars.reg`** — user PATH + key env vars, importable to Registry
- **`taskbar-pins.txt`** — list of pinned items (manual re-pin; Windows API doesn't allow programmatic taskbar pinning anymore)
- **`manual-install-list.md`** — apps with no winget ID (e.g., NinjaTrader, Bookmap, MetaTrader) — formatted as a human checklist
- **`wsl-distros/`** — per-distro `.tar` exports + `restore-wsl.ps1`
- **`docker-images/`** — exported images + restore script
- **`RESTORE-README.md`** — top-level playbook explaining the order to run scripts + manual steps

Final output: zipped into a single `polish-restore-<date>.zip` next to the backup, with a SHA-256 sidecar.

## Inputs

- **IPC calls consumed:** `format-prep.restore-plan.generate({ inventoryPath, outputDir })`
- **State read:** `useFormatPrepStore.session.inventory`, `useFormatPrepStore.session.destination`

## Outputs

- **IPC calls fired:** `format-prep.restore-plan.generate`
- **State written:** `useFormatPrepStore.session.restorePlan = { path, sha256, fileCount }`

## UI states

| State | When | What user sees |
|---|---|---|
| Not started | Step entered | "Click 'Generate restore plan' to build the playbook." |
| Generating | In progress | Per-file progress list as each artifact is written |
| Complete | Done | File list + open-in-explorer button + SHA-256 of the zip |
| Per-item failed | A specific generator errored (e.g., VS Code not detected) | Inline note "Skipped — VS Code not found"; doesn't block |

## Edge cases

- **User has multiple VS Code profiles:** generate per-profile extension lists separately + a "for each profile" instruction in RESTORE-README.md.
- **User uses Cursor + VS Code + JetBrains all together:** all enumerated, all separate restore scripts; RESTORE-README orders them sensibly.
- **Empty env-vars (rare):** registry file still generated but with a comment "no user-added PATH entries detected".
- **Taskbar pins enumeration fails on Win11 25H1+** (Microsoft has restricted these APIs across versions): note in manual-install-list.md with screenshot reference, not a fatal error.

## Accessibility

- Per-file progress and result lists are proper `<ul>` with announceable status.

## Telemetry (opt-in, v1.2+)

- Event: `format-prep.step6.restore-plan.generated` — `{ file_count, total_bytes_bucket }`
- No file names.

## Cross-links

- Related features: [[step-1-system-snapshot]] (inventory feeds this), [[step-7-final-greenlight]]
- PLAN.md: §9 Step 6

## Open questions

- Should RESTORE-README.md include estimated time for each phase (winget import: 30 min, VS Code: 5 min, etc.)? Yes — helps the user plan their restore session.
- For Linux/macOS dev tools cross-installed: include those exports? Current: yes, but flagged "Linux/macOS-specific — skip on Windows".
- Should we offer to upload the restore plan to Polish cloud (v2.0 feature)? Yes once v2.0 ships; v1.2 is local-only.
