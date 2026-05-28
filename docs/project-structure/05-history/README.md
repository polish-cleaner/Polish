# Page: History

> **Version introduced:** v1.0
> **Tier:** Free
> **Sidebar position:** 📜 History (5th)
> **Route:** `/history`
> **Spec in PLAN.md:** §7.5

## Purpose

Append-only activity log. Every action Polish has ever taken — scans, cleans, restores, settings changes, service events, purges — visible with filters, search, and export. Used for audit, debugging ("what did Polish do at 2pm Tuesday?"), and trust.

## Layout sketch

```
┌─────────────────────────────────────────────────────────────────┐
│  Filters: [ Date ▾ ] [ Action ▾ ] [ Severity ▾ ] [ Actor ▾ ]    │
│  Search: [ _____________________ ]                                │
├─────────────────────────────────────────────────────────────────┤
│  Time           Actor    Action       Target            Outcome  │
│  14:32          service  scan         (system)          OK 41.8GB│
│  14:32          user     clean.exec   8 categories      OK       │
│  03:00          service  auto-purge   2 runs (12 GB)    OK       │
│  yesterday 16:18 user    settings.set retention=14d    OK       │
│  ...                                                              │
├─────────────────────────────────────────────────────────────────┤
│  Showing 47 of 1,238 events    [ Export CSV ] [ Export JSON ]    │
└─────────────────────────────────────────────────────────────────┘
```

## Features

| Feature | Version | Tier | Status |
|---|---|---|---|
| [Activity Log](features/activity-log.md) | v1.0 | Free | designed |
| [History Filters](features/filters.md) | v1.0 | Free | designed |
| [History Search](features/search.md) | v1.0 | Free | designed |
| [History Export](features/export.md) | v1.0 | Free | designed |

## Data dependencies (reads)

- `history.query({ filter, search, page, pageSize })` — paged events

## Data writes

- None — History is append-only. Service writes; UI only reads.
- Exception: `history.export` triggers a file write to a user-picked location.

## Cross-page navigation

| CTA | Destination |
|---|---|
| Row click on a scan event | `/dashboard` with that scan's results pinned |
| Row click on a clean event | `/quarantine` filtered to that run |
| Row click on a settings change | `/settings` with the changed setting highlighted |

## Empty / loading / error states

- **No activity:** "No activity yet. History grows as Polish does things."
- **DB unreachable:** "History store is locked or unreachable. [Restart service] [Open logs]"

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `/` | Focus search |
| `j` / `k` | Move down / up rows |
| `Enter` | Expand row to full detail |
| `Ctrl+E` | Export current filtered view |

## Open questions

- Retention policy for History entries: keep forever, or rotate beyond N days / N events? Current: keep forever (SQLite). Add a "purge history older than X" Setting in v1.1 if needed.
- Should we hash anything sensitive in History (e.g., paths)? Current: paths at DEBUG only — at INFO log level, History stores category IDs not paths (matches PLAN §15.1 PII filter).
