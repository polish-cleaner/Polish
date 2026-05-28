# Page: Settings

> **Version introduced:** v1.0 (subset) · v1.1 (full catalog with scanner + notifications + auto-clean)
> **Tier:** Free (most) · Pro adds Custom profile cloud sync (v1.2)
> **Sidebar position:** ⚙️ Settings (6th)
> **Route:** `/settings`
> **Spec in PLAN.md:** §7.6, §12

## Purpose

Single home for every user preference. Left sub-nav within the page splits settings into themed sections. Some sections only appear when the relevant feature is in the installed version (e.g., Scanning sub-section appears only in v1.1+).

## Layout sketch

```
┌──────────────┬──────────────────────────────────────────────────┐
│ Sub-nav      │  Settings → <active section>                       │
├──────────────┤                                                     │
│ General      │  ┌─────────────────────────────────────────────┐  │
│ Scanning     │  │ Setting label                                 │  │
│ Cleanup      │  │ Description                                    │  │
│ Notifications│  │ [ toggle / input / dropdown ]                  │  │
│ Auto-clean   │  ├─────────────────────────────────────────────┤  │
│ Quarantine   │  │ ...                                            │  │
│ Privacy      │  └─────────────────────────────────────────────┘  │
│ Service      │                                                     │
│ Updates      │                                                     │
│ Advanced     │                                                     │
│ About        │                                                     │
└──────────────┴──────────────────────────────────────────────────┘
```

## Features (one file per Settings sub-section)

| Sub-section | Version | Tier | File |
|---|---|---|---|
| General | v1.0 | Free | [general.md](features/general.md) |
| Scanning | v1.1 | Free | [scanning.md](features/scanning.md) |
| Cleanup defaults | v1.0 | Free | [cleanup-defaults.md](features/cleanup-defaults.md) |
| Notifications | v1.1 | Free | [notifications.md](features/notifications.md) |
| Auto-clean | v1.1 | Free | [auto-clean.md](features/auto-clean.md) |
| Quarantine | v1.0 | Free | [quarantine.md](features/quarantine.md) |
| Privacy | v1.0 | Free | [privacy.md](features/privacy.md) |
| Service | v1.0 | Free | [service.md](features/service.md) |
| Updates | v1.0 | Free | [updates.md](features/updates.md) |
| Advanced | v1.0 | Free | [advanced.md](features/advanced.md) |

About sub-section duplicates [../07-about/](../07-about/README.md) content; accessible both via sidebar and Settings sub-nav.

## Data dependencies (reads)

- `settings.get(key)` — per-section lazy fetch
- `service.status` (Service sub-section)
- `update.status` (Updates sub-section)

## Data writes

- `settings.set(key, value)` — every input change
- `service.restart` (Service sub-section action)
- `update.check`, `update.install` (Updates sub-section actions)
- `settings.export`, `settings.import` (Advanced sub-section actions)

## Cross-page navigation

- Service → "Open log directory" → shells `explorer.exe` to log path
- Advanced → "Open `%ProgramData%\Polish\` in Explorer"
- Privacy → "What we collect" link → docs.polish.io/privacy in default browser

## Empty / loading / error states

- **Loading initial settings:** skeleton form per section.
- **Save error:** inline red text near the changed field; setting reverts visually to previous value; toast "Failed to save. [Retry] [Open logs]".
- **Pending save:** input shows subtle "Saving…" indicator (debounced 200 ms commit).

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+,` | Open Settings (from any page) |
| `Tab` | Step through fields |
| `Ctrl+S` | Force-flush pending saves (rarely needed; saves are auto) |

## Open questions

- Should settings sub-nav be searchable (free-text find a setting)? Defer to v1.1 once full catalog is shipped.
- Are there per-user vs per-machine settings? Current decision: all are per-user (service writes to user-specific state); per-machine policy is a Phase 3 (deferred) MSP feature.
