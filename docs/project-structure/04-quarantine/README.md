# Page: Quarantine

> **Version introduced:** v1.0
> **Tier:** Free (core) · v1.2-Pro adds cloud backup of quarantines
> **Sidebar position:** 📦 Quarantine (4th)
> **Route:** `/quarantine`
> **Spec in PLAN.md:** §7.4, §10

## Purpose

The trust headquarters of Polish. Browse past cleanup runs, restore individual items or whole runs, export `.pq` bundles to other destinations, and manage retention. Every action Polish has ever taken is here, recoverable until auto-purge.

## Layout sketch

```
┌─────────────────────────────────────────────────────────────────┐
│  Filters: [ Date ▾ ] [ Drive ▾ ] [ Mode ▾ ] [ Status ▾ ]         │
│  Search: [ _____________________ ]                                │
├─────────────────────────────────────────────────────────────────┤
│  ☑ Date          Mode        Size      Items     Drive   Purge    │
│  ☐ 14m ago       Balanced    41.8 GB   12,483    D:      14d      │
│  ☐ yesterday     Balanced    18.2 GB   8,200     D:      13d      │
│  ☐ 5d ago        Light       4.1 GB    2,310     C:      2d ⚠     │
│  ...                                                              │
├─────────────────────────────────────────────────────────────────┤
│  [Restore selected] [Purge selected] [Export .pq selected]        │
└─────────────────────────────────────────────────────────────────┘

         ↓ Click a row opens detail drawer (right side)

┌─────────────────────────────────────────────────────────────────┐
│  Detail: polish-2026-05-28-14-32 (41.8 GB, 12,483 items)         │
│                                                                    │
│  ▼ always-safe                                            12.4 GB │
│      Recycle Bin                                  3.1 GB          │
│      %TEMP%                                       5.7 GB          │
│      ...                                                           │
│  ▼ safe-for-devs                                          18.2 GB │
│      ...                                                           │
│                                                                    │
│  [Restore all]  [Restore selected]  [Purge now]  [Export .pq]    │
└─────────────────────────────────────────────────────────────────┘
```

## Features

| Feature | Version | Tier | Status |
|---|---|---|---|
| [Run List](features/run-list.md) | v1.0 | Free | designed |
| [Filters](features/filters.md) | v1.0 | Free | designed |
| [Detail Drawer](features/detail-drawer.md) | v1.0 | Free | designed |
| [Restore Actions](features/restore-actions.md) | v1.0 | Free | designed |
| [Bulk Actions](features/bulk-actions.md) | v1.0 | Free | designed |
| [Auto-Purge Policy](features/auto-purge-policy.md) | v1.0 | Free | designed |
| Cloud backup of `.pq` quarantines | v1.2-Pro | Pro | spec'd in [[../_feature-version-matrix]] |

## Data dependencies (reads)

- `quarantine.list` — paged run list with filters
- `quarantine.detail({ runId })` — full manifest for a single run
- Service events: `event.notification-fired` (for purge-imminent warnings)

## Data writes

- `quarantine.restore({ runId, items })` — restore one run or selected items
- `quarantine.purge({ runIds })` — irreversible purge
- `quarantine.export({ runId, destination })` — copy `.pq` to another location
- `settings.set("quarantine.*")` — retention defaults (lives in Settings, mirrored here for convenience)

## Cross-page navigation

| CTA | Destination |
|---|---|
| Row click | Opens detail drawer (in-page, not navigation) |
| Restore selected | Stays on page; toast confirms; affected rows update |
| Purge selected | Stays on page; rows removed |
| Export `.pq` | OS file picker → file written → toast confirms |
| "Open in History" (per-run context menu) | `/history?run=<runId>` |

## Empty / loading / error states

- **No runs ever:** "No quarantine yet. Polish creates one for every cleanup. [Open Clean]"
- **All expired & purged:** "No active quarantines. Past activity in History."
- **Manifest sidecar missing for a row:** the row appears with a "⚠ Manifest missing — bundle exists at `<path>`" inline note; restore disabled, export still works.
- **Bundle file deleted out-of-band (user removed it manually):** row shows "⚠ Bundle missing" + offer to clean up the orphan manifest.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `/` | Focus search |
| `j` / `k` | Move down / up in run list |
| `Enter` | Open detail drawer for focused row |
| `Esc` | Close detail drawer |
| `Ctrl+A` | Select all visible rows |

## Open questions

- Should we show a treemap visualization of the largest categories across all quarantine runs? Defer to v1.1 along with the general treemap analyzer (PLAN §19 Phase 1.5).
- For users who paid for cloud backup (v1.2 Pro): show a "Cloud sync status" indicator per row? Yes.
