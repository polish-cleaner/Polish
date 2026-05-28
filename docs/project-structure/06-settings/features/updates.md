# Settings → Updates

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Settings](../README.md)
> **Status:** designed
> **PLAN.md:** §12 Updates, §14.3

## Settings

| Setting | Type | Default | Notes |
|---|---|---|---|
| Check for updates | button + last-checked timestamp | manual | Fires `update.check` |
| Auto-check | toggle (daily) | on | Background check at 04:00 |
| Update channel | radio (Stable / Beta) | Stable | Beta opt-in |
| Install timing | radio (Next launch / Scheduled / Manual) | Scheduled 04:00 | When to apply downloaded update |
| Update notes link | external link | `polish.io/changelog` | Per-release notes |

## Behaviour

- Update check returns: `current_version`, `latest_version`, `release_notes_url`, `download_size`.
- If newer version found: inline panel shows version + notes + "Update now" button.
- Patch updates can auto-install at scheduled time; minor/major always prompt.
- Update flow follows the service-aware pattern from PLAN §14.3 (prepare → exit → NSIS update → restart service → reconnect).

## IPC

- `update.check` (UI initiates)
- `update.download` (UI initiates after user confirms)
- `update.install({ runId })` (UI initiates; orchestrates the service-aware pattern)
- `service.prepareForUpdate` (service-side cooperative shutdown)

## Edge cases

- **Update check while a clean is in flight:** queued; runs after clean completes.
- **Download interrupted (network down):** resume on next attempt; integrity verified before swap.
- **Signature verification fails on downloaded update:** abort + alert + log; existing version untouched.
- **Roll-forward not possible (e.g., 24H2 → 25H1 changed an API):** update flow auto-backs-out to previous version + alerts.

## Cross-links

- Related: [[service]], [[../../07-about/README]] (About also shows version)
- PLAN.md: §12 Updates, §14.3 Update mechanism
