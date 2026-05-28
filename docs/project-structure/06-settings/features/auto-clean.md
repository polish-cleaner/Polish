# Settings → Auto-clean (advanced — explicit warning on opening)

> **Version:** v1.1 (not in v1.0)
> **Tier:** Free
> **Page:** [Settings](../README.md)
> **Status:** designed
> **PLAN.md:** §12 Auto-clean

## Purpose

Power-user feature: allow Polish to perform cleanup actions without explicit confirmation, on a schedule. Carries inherent risk; gated behind an explicit warning page.

## Behaviour

Opening this Settings sub-section shows an explicit warning **before any controls render**:

```
⚠ Auto-clean runs without confirmation

Polish's default behaviour is "notify, never delete." Auto-clean removes that
safety. Read carefully before enabling.

[ I understand — show controls ]
```

After acknowledgment, controls render:

| Setting | Type | Default | Notes |
|---|---|---|---|
| Policy | radio (Notify-only / Safe-auto / Full-auto-with-whitelist) | Notify-only | Master switch |
| Safe-auto categories | (if Safe-auto): checklist | Always-Safe tier only | Editable; can't include anything irreversible |
| Full-auto whitelist | (if Full-auto): checklist | (empty — user must opt-in per category) | Editable; cannot include WSL unregister, DISM ResetBase, AI models, OEM bloat |
| Daily auto-clean time | time | 04:00 | Local |
| "I understand this runs without confirmation" gate | toggle | off | Must be on to enable Safe-auto or Full-auto |

## IPC

- Read: `settings.get("autoClean.*")`
- Write: `settings.set("autoClean.*", value)` — service validates the whitelist against the irreversible-action exclusion list

## Edge cases

- **User adds an irreversible category to Full-auto whitelist via direct settings.json edit:** service refuses on load with warning event in History; falls back to Notify-only.
- **Policy is Full-auto but no categories whitelisted:** scheduler runs but cleans nothing; History logs "auto-clean: no eligible items".
- **User toggles understanding gate off mid-cycle:** policy auto-falls-back to Notify-only.

## Anti-pattern hard rule

This section's intent is documented in PLAN §8.1 / §11.2: Polish **defaults** to notify-only. Auto-clean exists for power users who explicitly opt in. The wording, gate toggle, and irreversible-exclusion ensure no user accidentally enables destructive automation.

## Cross-links

- Related: [[notifications]], [[../../02-clean/features/special-case-confirms]]
- PLAN.md: §12 Auto-clean, §11.2
