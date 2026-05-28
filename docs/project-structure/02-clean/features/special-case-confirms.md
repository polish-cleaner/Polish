# Special-Case Confirms

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Clean](../README.md)
> **Status:** designed
> **PLAN.md:** §7.2, §8.1 (universal rule #2)

## Purpose

Extra confirmation dialogs for actions that are irreversible or have unusual blast radius. Polish's safety story depends on these being unmissable but not obstructive for routine actions.

## User story

"As a user about to do something destructive, I want Polish to clearly tell me what's about to happen and require a deliberate confirmation — not a single misclick away from regret."

## Triggered by

The Step 2 → Step 3 transition (or a per-row confirm earlier, depending on action). The wizard scans all selected items and fires the appropriate confirms in sequence before kicking off `clean.execute`.

## Confirm types

### 1. 5-second hold-to-confirm

For the most destructive: **DISM ResetBase** (permanently removes superseded update files).

```
┌────────────────────────────────────────────────────────────┐
│  ⚠ DISM ResetBase                                          │
│                                                              │
│  Permanently removes superseded Windows update files.       │
│  Cannot be undone (System Restore Point will still exist    │
│  but file recovery from .pq is not possible).               │
│                                                              │
│  Typical recovery: ~10 GB.                                   │
│                                                              │
│  [ Cancel ]                  [Hold to confirm (5s)]   ●     │
└────────────────────────────────────────────────────────────┘
```

The right button must be held for 5 seconds; visual ring fills clockwise. Releasing early aborts.

### 2. Toggle warning

For **Hibernation file toggle**:

```
┌────────────────────────────────────────────────────────────┐
│  ⚠ Disable Hibernation                                     │
│                                                              │
│  This removes hiberfil.sys (~8 GB typical) but also          │
│  disables Windows Fast Boot, which slightly slows startup.   │
│                                                              │
│  You can re-enable hibernation later via:                    │
│    Control Panel → Power Options → Choose what power         │
│    buttons do → Turn on hibernation                          │
│                                                              │
│  [ Cancel ]                                       [ Confirm ]│
└────────────────────────────────────────────────────────────┘
```

### 3. Multi-item review modal

For **uninstall** actions (Aggressive mode, v1.1+):

```
┌──────────────────────────────────────────────────────────────┐
│  Review apps to uninstall (3)                                 │
│                                                                │
│   ☑ HP Support Assistant         412 MB                       │
│   ☑ WildTangent Games            228 MB                       │
│   ☐ McAfee WebAdvisor            91 MB                        │
│                                                                │
│  [ Cancel ]                                          [ Confirm ]│
└──────────────────────────────────────────────────────────────┘
```

User can uncheck individual apps. Empty selection greys out Confirm.

### 4. Dev-environment warning (Aggressive, v1.1+)

For **Visual Studio duplicate removal** / **WSL distro unregister** — PLAN §22 risks: "this may break dev environments". Per-app confirm with explicit warning text.

## Inputs

- **IPC calls consumed:** `clean.preview` includes flags `{ requires_confirm: true, confirm_type: "5s-hold" | "toggle" | "review-multi" | "dev-env" }` per selected item
- **State read:** `useSelectionStore.selected`

## Outputs

- **IPC calls fired:** none from confirms themselves; `clean.execute` is fired only after all confirms pass
- **State written:** `useCleanRunStore.confirmsAccepted = true`

## UI states

| State | When | What user sees |
|---|---|---|
| Modal open | Confirm triggered | Modal as above |
| Hold in progress (5s type) | User pressing the hold button | Progress ring fills clockwise |
| Cancelled | User clicked Cancel or released early | Modal closes; user stays on Step 2 |
| Confirmed | User completed confirmation | Modal closes; next confirm fires OR clean executes |

## Edge cases

- **Multiple confirms in a single run:** fire sequentially; if any is cancelled, the user returns to Step 2 with the rejected item unchecked (offered with "We unchecked this — [Re-add] [Continue]").
- **Confirm fires for an item that's been auto-unchecked by another rule** (e.g., disk space): skipped silently.
- **User Esc during a 5-second hold:** treated as Cancel; user can re-attempt.

## Accessibility

- Modals trap focus; Esc closes (treated as Cancel).
- 5-second hold button has `aria-pressed` state + announces "Hold to confirm, 5 seconds" + per-second tick announcements.
- All confirm dialogs use `role="alertdialog"`.

## Telemetry (opt-in, v1.1+)

- Event: `clean.confirm.shown` — `{ confirm_type, item_id }`
- Event: `clean.confirm.cancelled` — `{ confirm_type }`

## Cross-links

- Related features: [[preview-step]], [[run-step]]
- PLAN.md: §7.2, §8.1, §22 risks (VS / LM Studio / WSL safety)
- PROJECT.md: §5 v1.0 trust-first delivery

## Open questions

- Do we add a global "Skip confirms for this session" power-user toggle? Current decision: NO — the friction is the trust story. Trade-off: never grant the "expert mode" anti-pattern.
- For users on a laptop with low battery (< 20%): warn before starting a long clean? Current: yes, separate warning at Step 2 → 3 transition.
