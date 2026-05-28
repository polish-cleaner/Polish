# Quarantine Detail Drawer

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Quarantine](../README.md)
> **Status:** designed
> **PLAN.md:** §7.4, §10.3

## Purpose

Right-side drawer that opens when a user clicks a quarantine run row. Shows the full manifest tree, per-item sizes, and the run's actions (restore / purge / export).

## Behaviour

- Slides in from the right (~400 ms spring animation, no bouncy).
- Header: run timestamp, mode badge, total size, item count.
- Body: manifest tree — categories → items, with per-item bytes + path (DEBUG-only paths; INFO shows category labels, hidden paths revealed by "Show paths" toggle for power users).
- Footer: action buttons (Restore all / Restore selected / Purge now / Export `.pq`).
- Manifest tree supports multi-select; selection feeds into "Restore selected" / "Purge selected (subset)".
- "Open `.pq` location" button shells out `explorer.exe /select,<path>`.

## Inputs

- **IPC calls consumed:** `quarantine.detail({ runId })` — returns full manifest
- **State read:** `useQuarantineStore.selectedRunIds[0]` (drawer follows single-row focus)

## Outputs

- **IPC calls fired:** see [[restore-actions]] and per-row purge/export
- **State written:** `useQuarantineStore.drawerOpen = true`, `useQuarantineStore.itemSelection`

## UI states

| State | When | What user sees |
|---|---|---|
| Closed | No row focused | Drawer hidden |
| Loading | Drawer opening, manifest fetching | Skeleton tree |
| Populated | Manifest fetched | Tree |
| Manifest corrupted | Sidecar JSON unreadable | "Manifest unreadable. Bundle exists at `<path>`; manual extraction possible. [Open bundle location]" — restore/purge disabled, export enabled |
| Bundle missing | `.pq` file gone | "Bundle missing on disk. Clean up the orphan manifest? [Yes / No]" |

## Edge cases

- **Drawer open while underlying run is auto-purged** (user delayed too long): drawer shows banner "This run was just auto-purged. Closing." then auto-closes after 3 s.
- **User toggles "Show paths" while screen-shared:** paths revealed; this is documented behavior — file paths considered sensitive by default.
- **Very large manifest (10,000+ items):** virtualized list rendering; first 200 items rendered, rest virtualized.

## Accessibility

- Drawer has `role="complementary"` and `aria-labelledby`.
- Focus traps within drawer when open.
- Esc closes drawer (returns focus to the row that opened it).

## Telemetry (opt-in, v1.1+)

- Event: `quarantine.detail.opened` — `{ category_count, item_count_bucket }`

## Cross-links

- Related: [[run-list]], [[restore-actions]], [[bulk-actions]]
- PLAN.md: §7.4, §10.3 (manifest spec)
