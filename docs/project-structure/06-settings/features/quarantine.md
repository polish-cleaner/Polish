# Settings → Quarantine

> **Version:** v1.0 (core) · v1.1 (encryption)
> **Tier:** Free
> **Page:** [Settings](../README.md)
> **Status:** designed
> **PLAN.md:** §12 Quarantine, §10

## Settings

| Setting | Type | Default | Notes |
|---|---|---|---|
| Default destination drive priority list | drag-to-reorder list of available drives | system drive first | Used by "auto-recommend" strategy |
| Compression algorithm | radio (Deflate / Zstd) | Zstd | Zstd = ZIP method 93 |
| Compression level | slider 1–9 | 6 | Higher = smaller bundle, slower |
| Encryption enabled (v1.1+) | toggle | off | AES-256-GCM, Argon2id KDF |
| Password (if encryption on, v1.1+) | input | — | Stored in Windows Credential Manager |
| Auto-purge time | time | 03:00 | Local; PLAN §10.5 |
| 24h pre-purge warning toast | toggle | on | See [[../../_shared/toast-notifications]] |

## Behaviour

- Reordering destination priority affects next run's auto-recommendation; existing runs are unaffected.
- Changing compression algorithm/level affects new runs only.
- Toggling encryption ON: prompts to set a password and confirms storage in Credential Manager.
- Toggling encryption OFF: existing encrypted runs remain encrypted; only new runs are plaintext.

## IPC

- Read: `settings.get("quarantine.*")`
- Write: `settings.set("quarantine.*", value)`

## Edge cases

- **All drives removed from priority list:** falls back to system drive automatically.
- **User changes password while encrypted runs exist:** old password still required to read old runs; new password applies to new runs only. UI surfaces this clearly.
- **Encryption enabled but Credential Manager unavailable:** error inline; encryption stays off.

## Cross-links

- Related: [[../../04-quarantine/features/auto-purge-policy]], [[../../04-quarantine/features/detail-drawer]]
- PLAN.md: §10, §12 Quarantine
