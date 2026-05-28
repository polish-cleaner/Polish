# Settings → Notifications

> **Version:** v1.1 (not in v1.0 — scanner + toasts deferred)
> **Tier:** Free
> **Page:** [Settings](../README.md)
> **Status:** designed
> **PLAN.md:** §12 Notifications, §11.2

## Settings

| Setting | Type | Default | Notes |
|---|---|---|---|
| Daily summary toast | toggle | on | Master toggle for digest |
| Daily summary time | time | 10:00 | Local time |
| Threshold to fire (min reclaim) | input (GB) | 1 | Don't notify unless > N GB reclaimable |
| Weekend notifications | toggle | off | Skip Sat/Sun by default |
| Critical-issue interrupts | toggle | on | Disk near full, large dump — can disable separately |
| Per-category notification mutes | list of toggles | all on | Granular per category id |

## Behaviour

- All toasts respect DND globally (PLAN §11.2 — Polish queries `ToastNotificationMode` before send).
- Quiet hours from Scanning section also apply to toasts (overnight no-toast guarantee).
- Per-category mutes affect daily digest; do not affect critical-issue toasts (those are always-on unless master Critical toggle off).

## IPC

- Read: `settings.get("notifications.*")`
- Write: `settings.set("notifications.*", value)`

## Edge cases

- **Per-category mute for a category that no longer exists** (renamed in a future release): stale entry visible with "(no longer used)" — user can clean up.
- **User disables Critical toggle then later disk is full:** no toast, but Dashboard still shows the issue via the Service Status widget.

## Cross-links

- Related: [[../../_shared/toast-notifications]], [[scanning]]
- PLAN.md: §11.2, §12 Notifications
