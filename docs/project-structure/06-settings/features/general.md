# Settings → General

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Settings](../README.md)
> **Status:** designed
> **PLAN.md:** §12 General

## Settings

| Setting | Type | Default | Notes |
|---|---|---|---|
| Start Polish at Windows boot | toggle | on | Maps to service auto-start registry |
| Launch UI at login | toggle | on | Maps to `HKCU\Run` entry for `polish-ui.exe` |
| Theme | radio (Auto / Light / Dark) | Auto | Auto follows Windows app theme |
| Language | dropdown (auto-detect, override list) | Auto-detect from Windows | en-US only at v1.0; other locales appear when shipped |
| Accent color | radio (Polish emerald / Polish gold / System accent) | Polish emerald | Affects active states + CTAs |

## Behaviour

- All controls auto-save on change (debounced 200 ms).
- Theme change applies immediately without restart.
- Language change applies on next UI relaunch (with toast prompt "Restart UI to apply").
- "Start at boot" off → service stays installed but `start= demand`; user can re-enable anytime.

## IPC

- Read: `settings.get("general.*")`
- Write: `settings.set("general.*", value)`
- Side-effect IPC: toggling Start at boot fires `service.setStartType({ type: "auto" | "demand" })`.

## Edge cases

- **User toggles Start at boot off, then closes the tray UI:** service stops at next reboot. UI restart manually starts the service via `sc start polish-svc` on `polish-ui.exe` launch.
- **Theme = Auto + Windows accent color changes mid-session:** UI updates accent live.

## Cross-links

- Related: [[../../_shared/sidebar]] (accent color affects sidebar active state)
- PLAN.md: §12 General
