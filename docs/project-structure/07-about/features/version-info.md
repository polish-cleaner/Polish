# Version & Build Info

> **Version:** v1.0
> **Tier:** Free
> **Page:** [About](../README.md)
> **Status:** designed
> **PLAN.md:** §7.7

## Purpose

Show the user exactly which version, build, and commit they're running. Critical for bug reports, support, and trust ("am I running the same build the GitHub release page describes?").

## Displayed values

- **Product name and version** (e.g., `Polish v1.0.3`)
- **Build timestamp** (ISO-8601, UTC) — when the binary was produced by CI
- **Git commit hash** — short SHA (`a1b2c3d4`)
- **Build channel** — Stable / Beta
- **Service binary version** vs **UI binary version** — shown side-by-side; if they differ (after a partial update), highlighted with warning
- **Signing certificate identity + SHA-256 of the cert** — so users can verify trust chain (matches what Windows showed at install)

## Inputs

- **IPC calls consumed:** `service.status` (returns `serviceVersion`, `buildTimestamp`, `commitSha`, `signingCertSha`)
- **Bundled at UI build time:** `uiVersion`, `uiBuildTimestamp`, `uiCommitSha`

## Outputs

- None (read-only).
- "Copy version info" subtle link copies the version block to clipboard as plain text — for pasting into bug reports.

## UI states

| State | When | What user sees |
|---|---|---|
| Default | Service reachable | All values populated |
| Service unreachable | Cannot read service-side info | UI values shown; service section "Service unreachable" |
| Mismatch | UI vs service version differ | Amber banner "UI version X.X · Service version Y.Y — update may be partially applied. [Check for updates]" |

## Edge cases

- **Build with unsigned dev binaries (POLISH_DEV=1):** signing-cert section shows "Unsigned dev build — do not run in production".
- **Commit SHA is a non-fast-forward (rebased) build:** shown as-is; users with concerns can verify via GitHub repo.

## Cross-links

- Related: [[license]], [[diagnostic-info]], [[../../06-settings/features/updates]]
- PLAN.md: §7.7
