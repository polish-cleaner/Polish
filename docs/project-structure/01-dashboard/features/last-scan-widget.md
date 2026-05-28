# Hero Strip — Last Scan Timestamp

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Dashboard](../README.md)
> **Status:** designed
> **PLAN.md:** §7.1
> **Prototype:** `.vskill-data/Polish-prototype/src/dashboard.jsx` (hero strip block, lines ~47–69)

## Purpose

Anchor the "Polish is working" signal at the very top of the page. Tells the user when the last successful scan ran and whether the background scanner is currently on.

> **Was previously a standalone card.** Collapsed into the dashboard hero strip per the prototype. The detailed history surface lives in the **History** page (`05-history`).

## What this is now

A single one-line strip that sits above the hero `<h1>`:

```
DASHBOARD  ·  Last scanned 14m ago  ·  Background scanner is on
```

- `DASHBOARD` — section label (uppercase, 10.5px, `+12%` tracking, `var(--ink-muted)`).
- `Last scanned <relative>` — relative time string from `fmtAgo(SCAN_LAST.minsAgo)`. The `<relative>` substring is rendered in mono (`var(--font-mono)`), `var(--ink-soft)`.
- `Background scanner is on` — when scheduler is enabled; replaced by `Background scanner paused` (amber) when paused; replaced by `● Service unreachable · [Restart]` (danger) when service IPC fails.

## User story

"As a user, I want to glance at the top of the dashboard and immediately know Polish has run recently and is actively watching the system."

## Behaviour

- Always visible above the hero h1.
- Updates the relative-time substring every 60 s while mounted.
- If scan is currently running: substring switches to `Scanning… <bytes_checked> checked · ETA <eta>`.
- If no scan has ever run: substring reads `Never scanned · [Scan now]` (the [Scan now] is a ghost inline link that opens the `clean` page).

## Inputs

- **IPC calls consumed:** `service.status` (returns `last_scan_at`, `last_scan_found_bytes`, `scheduler_state`); `event.scan-progress` for live in-flight updates
- **State read:** `useScanStore.lastResult`, `useServiceStore.schedulerState`

## Outputs

- **IPC calls fired:** `scan.start` only if user clicks the inline `Scan now` in the never-scanned variant
- **State written:** none
- **Events emitted:** none

## UI states

| State | When | What user sees in the strip |
|---|---|---|
| Never scanned | Fresh install | "Never scanned · [Scan now]" |
| Scanning | Scan in flight | "Scanning… <bytes> checked · ETA <eta>" |
| Recent | Scan completed | "Last scanned <relative> · Background scanner is on" |
| Stale | > 7 days since last scan | "Last scanned 12d ago · [Scan now]" (amber inline link) |
| Paused | Scheduler paused | "Last scanned 14m ago · Background scanner paused" |
| Error | Service unreachable | "● Service unreachable · [Restart]" (danger dot) |

## Edge cases

- **Clock skew (user changed system time):** if computed relative would be negative or > 365d, fall back to absolute `Found at YYYY-MM-DD HH:MM`.
- **Service restarted between scans:** widget reads persisted `last_scan_at` from service-side SQLite, not session-only state.
- **Scan completes while user is on dashboard:** strip swaps from "Scanning…" → "Last scanned 0m ago" without a flash; charts and table re-render via the same `event.scan-complete`.

## Accessibility

- Relative time wrapped in `<time datetime="ISO-8601">` for screen-reader date parsing.
- "[Scan now]" / "[Restart]" rendered as `<button>` with `aria-label`s.
- The danger-state dot has `role="status"` + `aria-live="polite"` so SR users hear the change.

## Telemetry (opt-in, v1.1+)

- Event: `dashboard.hero-scan-now.clicked` — `{ from_state: 'never' | 'stale' }`
- No bytes leaked.

## Cross-links

- Companion: [[kpi-band]] (the "Last scan" data is also implied via "Reclaimable now" + "Freed 90 days")
- Detail surface: [[../05-history/README]]
- Related: [[disk-usage-widget]]
- PLAN.md: §7.1, §4.3 (`service.status`, `event.scan-progress`)

## Open questions

- Should the "Background scanner is on" text be a clickable toggle to pause inline? Current decision: read-only on dashboard; toggle lives in Settings → Scheduler. Inline toggle is too easy to fat-finger.
- Sparkline of last N scans' found-bytes inline in the strip? No — that role is fulfilled by [[reclaim-trend-sparkline]] below.
