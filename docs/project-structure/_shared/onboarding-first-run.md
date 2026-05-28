# Shared: First-Run Onboarding

> **Version:** v1.0
> **Tier:** Free
> **PLAN.md:** §7.1 (Dashboard empty states), §11.3 (Tray icon onboarding card)

## Purpose

Greet new users without spammy modals; explain the trust posture (quarantine-first, no nag), run the first scan in the background, and surface the one pinned-tray-icon nudge that Win11 requires. Single onboarding card; never re-shown unless user explicitly resets.

## When it fires

- First launch after install — user clicks tray icon OR installer auto-launches `polish-ui.exe`.
- After "Reset onboarding" action in Settings → Advanced (v1.1+).

## What the user sees

### Dashboard, first launch

```
┌────────────────────────────────────────────────────────────────┐
│  Welcome to Polish                                              │
│                                                                  │
│  We're running your first scan in the background. ~2 minutes.   │
│  Nothing will be cleaned without your explicit OK.              │
│                                                                  │
│  Three rules we never break:                                     │
│    1. Never delete without recovery (every action quarantined). │
│    2. No invented urgency (we don't paint cache red).            │
│    3. Local-first (no account, no telemetry by default).        │
│                                                                  │
│  [ Got it ]                       (button dismisses card forever)│
└────────────────────────────────────────────────────────────────┘
```

### Tray-icon pin nudge (one-time card on Dashboard)

```
┌────────────────────────────────────────────────────────────────┐
│  ℹ️  Want Polish in your taskbar?                              │
│                                                                  │
│  Windows 11 hides new tray icons by default. To pin Polish:     │
│   Settings → Personalization → Taskbar → Other system tray      │
│   icons → toggle Polish on.                                      │
│                                                                  │
│  [ Open Taskbar settings ]   [ Don't show again ]                │
└────────────────────────────────────────────────────────────────┘
```

The "Open Taskbar settings" button shells `ms-settings:taskbar`.

## Behaviour

- Onboarding card persisted state: `settings.get("ui.onboarding.dashboardCard.dismissed")` (bool).
- Tray pin card persisted state: `settings.get("ui.onboarding.trayPinCard.dismissed")` (bool).
- No modal blockers; both cards live inline on the Dashboard and can be dismissed without consequence.
- Background first scan starts automatically on first launch via `scan.start` IPC. Result populates Dashboard once `event.scan-complete` fires.
- No account prompt, no email prompt, no telemetry prompt at first run. Telemetry is opt-in via Settings (PLAN §13.3).

## What we do NOT do at first run

- No "Create an account" modal.
- No email-capture popup.
- No EULA modal beyond what NSIS handled at install.
- No "Activate Pro" upsell (Pro is a separate binary anyway; v1.0 doesn't even know Pro exists).
- No telemetry / crash-reporting prompt — opt-in lives in Settings, not first-run.
- No "Star us on GitHub" — that's the after-3-successful-cleans subtle prompt (PLAN §7.2 Result step), not first-run.

## IPC

- On first launch: `scan.start` (auto)
- On "Open Taskbar settings": no IPC (shell-out via UI-side `Command::new("explorer.exe")` or similar Tauri shell API).

## States

| State | Visual |
|---|---|
| First launch, scan running | Welcome card + "First scan running… ~2 minutes ⏳" placeholder bento |
| First launch, scan complete | Welcome card still present + populated bento grid |
| Dismissed | Normal Dashboard |

## Telemetry (opt-in only, when telemetry lands)

- `onboarding.dismissed` — `{ card: "welcome" | "tray-pin" }`
- No PII, no timing data.

## Accessibility

- Welcome card is a `<section>` with `aria-labelledby`. Focus moves to it on first launch (auto-focus first interactive element).
- "Got it" button is keyboard-reachable; pressing Esc also dismisses.

## Open questions

- Should the welcome card mention the version (v1.0) so users know they're early? Current decision: no — keeps the message timeless.
- Do we want a brief 3-step product-tour overlay (Dashboard → Clean → Quarantine)? Current decision: NO for v1.0 (anti-spam principle); revisit for v1.2 Pro onboarding.
