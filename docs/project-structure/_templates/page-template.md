# Page: <Name>

> **Version introduced:** v1.0 | v1.1 | v1.2-Pro
> **Tier:** Free | Pro
> **Sidebar position:** <icon + label>
> **Route:** `/<route>`
> **Spec in PLAN.md:** §X.Y

## Purpose

One or two sentences. Why does this page exist? What is the primary user job it serves?

## Layout sketch

```
ASCII or word-sketch layout — bento grid, sidebar split, wizard steps, etc.
```

## Features

| Feature | Version | Tier | Status |
|---|---|---|---|
| [Feature A](features/feature-a.md) | v1.0 | Free | designed |
| [Feature B](features/feature-b.md) | v1.1 | Free | designed |
| [Feature C](features/feature-c.md) | v1.2-Pro | Pro | designed |

## Data dependencies (reads)

- **IPC calls this page invokes:** list of `<method>` from PLAN §4.3
- **State stores read:** which Zustand stores
- **Service events subscribed:** which `event.*` streams

## Data writes

- **IPC calls fired on user action:** list
- **Local state mutations:** which stores
- **Persisted state:** any settings written via `settings.set`

## Cross-page navigation

| CTA | Destination |
|---|---|
| `<button>` | `/<route>` |

## Empty / loading / error states

Describe page-level states (when no data, while loading, on IPC error).

## Keyboard shortcuts

| Shortcut | Action |
|---|---|

## Open questions

- Anything unresolved at the page level.
