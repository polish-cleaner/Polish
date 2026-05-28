# Settings → Service

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Settings](../README.md)
> **Status:** designed
> **PLAN.md:** §12 Service, §4.1

## Settings / Actions

| Item | Type | Notes |
|---|---|---|
| Service status (live) | read-only display | Mirrors [[../../01-dashboard/features/service-status-widget]] |
| Restart service | button | UI shells `sc.exe stop` + `sc.exe start` |
| Service logs path | clickable link | Opens `%ProgramData%\Polish\logs\` in Explorer |
| Reinstall service | button (with confirm) | Re-registers via NSIS postinstall hook |
| Version of running service binary | read-only display | From `service.status` |

## Behaviour

- Restart service: confirms with "This will pause Polish briefly. Continue?" — typical downtime ~3 s.
- Reinstall service: confirms more strongly with "This will stop the service, remove it, and reinstall it. Quarantine and settings preserved." — recovery action for damaged installs.
- Logs path button: shells `explorer.exe /select,<log-dir>` so user can copy the latest log to share in a bug report.

## IPC

- `service.status` — live read every 5 s while page open
- `service.restart` — UI-side (sc.exe via Tauri shell command)
- `service.reinstall` — UI-side (calls NSIS installer's repair mode)

## Edge cases

- **Restart fails (sc.exe error):** show stderr + "Try Reinstall service".
- **Reinstall fails (user denied UAC):** "Reinstall requires admin. Re-run Polish as admin and retry."
- **Service version differs from UI version:** read-only display shows both with mismatch warning + "Check for updates" link.

## Cross-links

- Related: [[../../01-dashboard/features/service-status-widget]], [[updates]]
- PLAN.md: §4.1, §12 Service
