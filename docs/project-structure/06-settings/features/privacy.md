# Settings → Privacy

> **Version:** v1.0 (crash reports opt-in shipped; usage stats v1.1+)
> **Tier:** Free
> **Page:** [Settings](../README.md)
> **Status:** designed
> **PLAN.md:** §12 Privacy, §13.3, §15.2

## Settings

| Setting | Type | Default | Notes |
|---|---|---|---|
| Send anonymous usage statistics | toggle | **off — opt-in only** | v1.1+ (usage telemetry shipped); v1.0 ships toggle as no-op visible-only for transparency |
| Send crash reports | toggle | **off — opt-in only** | v1.0; Sentry / GlitchTip |
| Telemetry endpoint URL (read-only display) | text (read-only) | `https://telemetry.polish.io` (or self-hosted) | Users can verify destination |
| "What we collect" link | external link | docs.polish.io/privacy | Schema published; PLAN §15.2 |
| Diagnostic info export | button | n/a | Manual; produces a sanitized snapshot for bug reports |

## Behaviour

- Both opt-in toggles default off. Toggling on shows a one-time confirmation modal: "Polish will send X to Y. We never send file paths, file names, env variables, hostname, or IP address. [Read full schema] [Enable] [Cancel]".
- "Diagnostic info export" packages: service logs (sanitized — no paths), settings snapshot, system info (OS version, Polish version, free space per drive). Zipped to a user-picked location. No auto-upload.
- Endpoint URL is editable only by direct settings.json edit (advanced users redirecting to self-hosted); UI shows it read-only.

## IPC

- Read: `settings.get("privacy.*")`
- Write: `settings.set("privacy.*", value)`
- `diagnostics.export({ destination })` — for the export button

## Edge cases

- **User toggles crash reports on, then service crashes before next opt-out check:** report sent with the consent already recorded.
- **User exports diagnostic info to a network drive that's full:** error inline; "Try local instead".
- **User edits settings.json to set telemetry endpoint to a malicious URL:** Polish verifies URL is HTTPS + matches a configured allowlist on first send; if not, refuses send + logs warning.

## What we NEVER collect (LOCKED per PLAN §13.3)

- File paths
- File names
- File contents
- Environment variable values
- Hostname
- Username
- IP address
- Quarantine bundle contents

## Cross-links

- Related: [[advanced]] (diagnostic info button is duplicated there too)
- PLAN.md: §13.3 Privacy, §15.2 Telemetry
- PROJECT.md: §5 v1.0 trust-first delivery
