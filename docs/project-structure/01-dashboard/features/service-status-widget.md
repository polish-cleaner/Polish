# Service Status Widget — REMOVED FROM DASHBOARD

> **Status:** removed from dashboard
> **New home:** [Settings → System](../../06-settings/README.md)
> **Version removed:** v2 design (prototype-extracted), 2026-05-28
> **Replaced by:** sidebar service pulse ([[../_shared/sidebar]]) + danger state in the [hero strip](last-scan-widget.md) when service is unreachable
> **Prototype:** the dashboard prototype in `.vskill-data/Polish-prototype/src/dashboard.jsx` does NOT include this widget.

## Why removed

The dashboard is now widget-rich (KPI band, two chart rows, drives card, reclaim table, quarantine + format-prep duo). Service health duplicated information already surfaced by the sidebar pulse and is rarely actionable from the dashboard — when it matters, the entire app behaves differently (cached data + restart prompts), which is signaled in the hero strip + KPI band recolor.

## Where service status is now surfaced

| Surface | Behaviour |
|---|---|
| Sidebar bottom pulse | Always visible: green (healthy) / amber (paused/degraded) / red (unreachable). Title-attr tooltip on hover. |
| Hero strip ([[last-scan-widget]]) | "● Service unreachable · [Restart]" replaces the "Background scanner is on" line when IPC fails 3× in a row. |
| KPI band ([[kpi-band]]) | All four tiles recolor muted on service unreachable; "Reclaimable now" shows "—" with stale-data note. |
| Toast | One-time toast when state transitions to unreachable (auto-dismiss disabled until acknowledged). |
| Full controls | `Settings → System` — restart, reinstall, view logs, CPU/memory sample, uptime. |

## Recovery action (still available)

The "[Restart service]" inline button calls UI-side `Command::new("sc.exe").args(["stop", "polish-svc"])` then `start` — UI orchestrates restart (service can't restart itself). This action is now triggered from the hero strip danger state, not from a dedicated dashboard widget.

## Cross-links

- New home: [[../../06-settings/features/service]] (full restart / reinstall / logs)
- Sidebar pulse: [[../_shared/sidebar]]
- Hero strip danger state: [[last-scan-widget]]
- PLAN.md: §4.1, §4.3 (`service.status`)

## Historical note

The original specification (v1 design) placed a small Service card on the dashboard with pulse + uptime + CPU%. That tile was removed in v2 (prototype-extracted) to make room for the chart row and per-drive gauges. Telemetry/observability did not change — only the UI placement.
