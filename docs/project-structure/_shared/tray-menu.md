# Shared: Tray Menu

> **Version:** v1.0 (minimal) + v1.1 (pause submenus)
> **Tier:** Free
> **PLAN.md:** §7 (top of section, Tray menu), §11.3 (Tray icon states)

## Purpose

System-tray right-click menu — the only UI surface the user sees most days. Must be minimal, predictable, and never used for upsell.

## Menu layout

### v1.0 (minimal)

```
●  Status: Idle (last scan 14m ago)
──────────────────────
   Scan now
   Open Polish                       (bold = default action on left-click)
──────────────────────
   Settings…
   About / Check for updates
──────────────────────
   Quit Polish
```

### v1.1 (adds pause submenus)

```
●  Status: Idle (last scan 14m ago)
──────────────────────
   Scan now
   Open Polish                       (bold)
──────────────────────
   Pause notifications  ▸  [1h / 4h / Until tomorrow / Always]
   Pause background scans  ▸  [1h / 4h / Until restart]
──────────────────────
   Settings…
   About / Check for updates
──────────────────────
   Quit Polish
```

## Tray icon states

| State | Icon | Tooltip |
|---|---|---|
| Idle | Emerald gem | "Polish — Idle. Last scan Xm ago." |
| Scanning | Animated pulse | "Polish — Scanning…" |
| Paused | Grey gem | "Polish — Paused." |
| Error | Amber gem | "Polish — Service error. Click to view." |

**Red is reserved for security warnings only.** The tray icon never goes red.

## Behaviour

- **Left-click on icon → open main window** (Win11 convention; PLAN §11.3).
- **Right-click → menu above.**
- Status line at top is non-interactive; reflects `service.status` IPC.
- "Scan now" fires `scan.start` IPC; tray icon switches to animated state until `event.scan-complete`.
- "Quit Polish" stops the user-mode UI process. Service continues unless user toggles auto-start off in Settings (PLAN §12).
- Win11 hides new tray icons in overflow by default. Polish accepts this; the first-run onboarding card explains how to pin (see [[onboarding-first-run]]).

## Inputs (IPC)

- `service.status` — for status line + icon state
- `service.subscribe` — for `event.scan-progress`, `event.scan-complete`, `event.notification-fired`

## Outputs (IPC)

- `scan.start` — on "Scan now"
- `settings.set("notifications.snooze")` — on Pause notifications selection
- `settings.set("scanning.paused")` — on Pause background scans selection

## States

| Menu item | Enabled when |
|---|---|
| Scan now | Service is healthy AND no scan currently running |
| Pause notifications | v1.1+, notifications are enabled |
| Pause background scans | v1.1+, scanner is enabled |
| Settings | Always |
| Quit Polish | Always |

## Edge cases

- If service is unreachable: status shows "Service unreachable" in red text within the menu, "Scan now" disabled, "Settings" still works (UI-side settings can be edited and queued).
- If a clean is in progress: "Scan now" is disabled with tooltip explaining why.

## Accessibility

- Standard Windows context menu — inherits OS accessibility.

## Open questions

- Should "Quit Polish" stop the service too, or only the UI? Current decision: only the UI (service is the always-on component; PLAN §4.4). Confirm with user research in v1.1.
