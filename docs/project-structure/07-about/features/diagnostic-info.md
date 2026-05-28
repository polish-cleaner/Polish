# Diagnostic Info Copy

> **Version:** v1.0
> **Tier:** Free
> **Page:** [About](../README.md)
> **Status:** designed
> **PLAN.md:** §7.7, §13.3

## Purpose

One-click "give me everything I need to file a bug report" snapshot, sanitized of PII. Compact text block copied to clipboard.

## Contents of the snapshot

```
Polish v1.0.3 (commit a1b2c3d4)
Service binary v1.0.3 (commit a1b2c3d4)
Build: 2027-01-15T09:21:00Z, Channel: Stable
Signed by: SignPath Foundation (SHA: a1b2c3...)

OS: Windows 11 23H2 (build 22631.4317)
Architecture: x64
Locale: en-US
Time zone: America/Los_Angeles

Service status: Healthy, uptime 3d 4h
CPU during last scan: 4.2%
Last scan: 2027-01-15T14:32:00Z, found 41.8 GB
Active quarantine runs: 3 (12.4 GB)
History entries: 1,238

Privacy: Crash reports OFF, Usage stats OFF
Auto-clean policy: Notify-only

(no file paths, no environment variables, no hostname, no username)
```

## Behaviour

- "Copy diagnostic info" button copies the block as plain text.
- Toast confirms "Copied to clipboard. Paste into your bug report."
- Polish does NOT auto-upload this anywhere.
- Snapshot is generated fresh on each click (not cached) so it reflects current state.

## Inputs

- **IPC calls consumed:** `diagnostics.snapshot` — service returns the sanitized block
- **Bundled:** UI version metadata

## Outputs

- Clipboard write via Tauri clipboard API.

## UI states

| State | When | What user sees |
|---|---|---|
| Idle | Default | Button enabled |
| Generating | Service computing snapshot | Brief spinner |
| Copied | Clipboard write succeeded | Toast "Copied" |
| Error | Service unreachable or clipboard refused | "Snapshot unavailable — service issue. [Open logs]" |

## What is explicitly NOT in the snapshot

Per PLAN §13.3 PII filter:
- File paths
- File names
- Environment variable VALUES (just names, if relevant)
- Hostname
- Username
- IP address
- Quarantine bundle contents
- Browsing history references

## Edge cases

- **Clipboard refused by Windows (rare — group policy or virtual desktop):** fallback offers "Save snapshot to file" → file picker.
- **Service unreachable:** snapshot generated locally with UI-side info only, marked "(service info unavailable)".

## Cross-links

- Related: [[../../06-settings/features/privacy]] (full diagnostic export there is more detailed)
- PLAN.md: §7.7, §13.3
