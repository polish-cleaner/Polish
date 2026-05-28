# Shared: Toast Notifications

> **Version:** v1.1 (daily digest + critical-issue toast) — NOT in v1.0 (background scanner deferred)
> **Tier:** Free
> **PLAN.md:** §11.2

## Purpose

The user-facing surface of the always-on service. Daily digest tells users when there's something worth cleaning; critical-issue toasts interrupt only for genuine emergencies (disk near full, large dump files). Designed to NOT be the trust-eroding spam every competitor ships.

## Two toast types

### 1. Daily digest (default policy)

Fires at most once per day at user-configured time (default 10:00 local). Batched — aggregates the day's findings.

```
Polish — Daily summary
You can reclaim ~14.8 GB across 5 categories.
[ Clean now ]  [ Snooze ▾ ]  [ Dismiss ]
```

Threshold to fire: reclaim opportunity > 1 GB (user-configurable in Settings).

### 2. Critical-issue toast (separate flow)

Fires immediately when:
- C: drive has < 5% free
- Large crash dump file (> 500 MB) detected
- Service experiencing repeated errors

```
Polish — Disk almost full
C: has 1.2 GB free (0.3%). Cleanup recommended.
[ Start cleanup ]  [ Dismiss ]
```

## Behaviour rules

- **One daily toast max** — replaces (does not stack) any previous unread toast for the same category. Uses Windows toast `tag` + `group` properties.
- **Quiet hours: 22:00–08:00 local.** No toasts fire in this window. Critical-issue toasts queue but do not interrupt; they fire at quiet-hours-end.
- **Weekends:** off by default; user toggle in Settings.
- **DND-aware.** Polish queries `ToastNotificationMode` before every send. If not `Default`, route to Action Center silently (no banner, no sound). Polish never requests priority-app status.
- **Snooze** uses system-handled snooze (`activationType="system" arguments="snooze"`), persisted across restarts. If user snoozes the same notification twice in a row, auto-extend snooze and offer "Stop suggesting this for 30 days."
- **AUMID registration** done at install (PLAN §11.2). Without it Win11 silently drops toasts.

## Toast button actions

| Button | Action |
|---|---|
| Clean now (digest) | Opens main window → Clean → Step 1 with items pre-selected matching the digest categories |
| Start cleanup (critical) | Opens main window → Clean → Step 1 pre-selected to whatever resolves the critical issue |
| Snooze ▾ | System snooze submenu (1h / 4h / Until tomorrow) |
| Dismiss | Standard dismiss |

## Anti-patterns (hard refused)

- Never use "PC at risk!" / scare-language.
- Never count normal cookies as threats.
- Never red-badge cosmetic findings.
- Never collapse free ↔ paid upsell into the toast UX.
- Never auto-re-enable notifications a user disabled.

## IPC

- Service emits `event.notification-fired` with `{ toastId, type, summary }` when a toast is sent (for History page logging).
- UI's "Clean now" / "Start cleanup" buttons activate the app via AUMID activation; UI handles the deep-link to Clean wizard.

## Telemetry (opt-in only)

If user opts in to telemetry (v1.0 has crash reports only; usage stats land v1.1+):
- Event: `toast.dispatched` — `{ type, dismissed | snoozed | acted, latency_ms }`
- No file paths, no category labels (just toast type).

## States

| State | When |
|---|---|
| Suppressed | DND active OR quiet hours OR user paused |
| Queued | DND ends — fires deferred toast |
| Fired | User received it |
| Acted | User clicked CTA |
| Snoozed | User snoozed; recurrence on snooze-expiry |
| Dismissed | User dismissed |
| Expired | Toast aged out before user interacted |

## Open questions

- Should daily digest support per-category opt-outs in v1.1, or only "off entirely"? — Current design (PLAN §12 Notifications): per-category mutes. Confirm scope.
- For users running multiple monitors / multiple Windows accounts: which session does the toast fire on? (Probably current interactive user's; verify behaviour with `ToastNotificationManager`.)
