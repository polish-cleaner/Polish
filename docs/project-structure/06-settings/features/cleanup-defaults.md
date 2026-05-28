# Settings → Cleanup defaults

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Settings](../README.md)
> **Status:** designed
> **PLAN.md:** §12 Cleanup defaults

## Settings

| Setting | Type | Default | Notes |
|---|---|---|---|
| Default mode on Clean page | radio (Light / Balanced / Aggressive / Custom-last) | Balanced | Pre-selected mode on `/clean` entry |
| Default quarantine destination strategy | radio (auto-recommend / always same drive / always other drive / always external / ask each time) | auto-recommend | See PLAN §10.2 |
| Retention per mode — Light | input (days) | 7 | Per-mode override |
| Retention per mode — Balanced | input (days) | 14 | |
| Retention per mode — Aggressive (v1.1+) | input (days) | 30 | |
| Retention per mode — Custom (v1.1+) | input (days) | user-set | |
| Hold-to-confirm duration for irreversible actions | slider 3–10 sec | 5 | Per [[../../02-clean/features/special-case-confirms]] |
| Show "Star us on GitHub" prompt | toggle + count (after N cleans) | on, 3 | Per PLAN §7.2 Result step |

## Behaviour

- Mode default applies on next `/clean` entry; if Custom-last selected, pre-selects the user's most recently-used mode.
- Retention input range: 1–365 days; clamped.
- Hold-to-confirm clamped 3–10 sec (going below 3 defeats the safety; above 10 is too annoying).

## IPC

- Read: `settings.get("clean.*")`
- Write: `settings.set("clean.*", value)`

## Edge cases

- **Retention reduced to 7 days while runs at 14 days exist:** existing runs keep their original purge_at (set at creation); new runs use new value.
- **Star prompt count set to 0:** prompt never fires (matches "disable" intent).

## Cross-links

- Related: [[../../02-clean/features/mode-picker]], [[quarantine]], [[../../04-quarantine/features/auto-purge-policy]]
- PLAN.md: §12 Cleanup defaults
