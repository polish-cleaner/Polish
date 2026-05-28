# Auto-Purge Policy

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Quarantine](../README.md)
> **Status:** designed
> **PLAN.md:** §10.5

## Purpose

Background job that purges expired quarantine runs based on retention settings. Keeps the quarantine drive from filling indefinitely.

## Behaviour

- Each `.pq` run has a `purge_at` ISO timestamp set at run creation, computed from `mode.retention_days` (Light 7d / Balanced 14d / Aggressive 30d / Custom user-set).
- Background scheduler runs daily at 03:00 local (user-configurable in [[../06-settings/features/quarantine]]).
- For each run with `purge_at < now`: delete `.pq` + sidecar manifest; log purge event to History.
- **24-hour pre-purge warning:** if the run has any not-yet-restored items AND the run will purge in < 24 h, fire a one-time toast: "Quarantine run from X auto-purges tomorrow. Anything to restore? [View] [Let it purge]". Toast respects DND + quiet hours (see [[../_shared/toast-notifications]]).
- Settings → Quarantine includes a "Cancel auto-purge for this run" affordance per-row (sets purge_at to "never" until user manually purges).

## Inputs

- **IPC calls consumed:** none from UI; this is a service-side scheduler
- **State read (service side):** all active runs from quarantine state DB
- **Settings consumed:** `quarantine.autoPurgeTime`, `quarantine.preWarningEnabled`

## Outputs (service emits)

- **Events:** `event.quarantine-purged` (with runId list); `event.notification-fired` (for pre-warning toasts)
- **Side effects:** `.pq` files deleted; History row added per purge

## UI states (where the user sees this)

- **Run list:** "Days until auto-purge" column.
- **Dashboard quarantine widget:** "Next auto-purge: Xd".
- **Toast notification:** 24-hour pre-warning, one per affected run, not stacking.
- **Settings → Quarantine:** time-picker for daily purge time + per-mode retention override + global pre-warning toggle.

## Edge cases

- **System clock skewed:** service uses monotonic time + wall-clock cross-check; if wall-clock jumped backwards more than 24 h, defers purge that cycle and logs a warning.
- **Quarantine destination drive disconnected at purge time:** purge skipped; logged; tried again next cycle.
- **User restored some items from a run but not all:** purge proceeds at `purge_at` regardless. The 24h warning makes this explicit.
- **Service crashed mid-purge:** atomic per-file delete; partial purge state on restart triggers a recovery scan that finishes the purge.

## Accessibility

Not a UI feature itself; consumer UIs ([[../_shared/toast-notifications]], [[run-list]]) handle accessibility.

## Telemetry (opt-in, v1.1+)

- Event: `quarantine.auto-purge.ran` — `{ purged_count, total_bytes_bucket }`

## Cross-links

- Related: [[../06-settings/features/quarantine]], [[../05-history/features/activity-log]], [[../_shared/toast-notifications]]
- PLAN.md: §10.5
