# Page: About

> **Version introduced:** v1.0
> **Tier:** Free
> **Sidebar position:** ℹ️ About (7th)
> **Route:** `/about`
> **Spec in PLAN.md:** §7.7

## Purpose

Identity, provenance, and credit. Tells the user exactly what version they're running, who built it, what licenses apply, and how to contribute or donate. Also: the trust footprint — signing certificate identity, license text inline, build hash.

## Layout sketch

```
┌─────────────────────────────────────────────────────────────────┐
│            POLISH                                                 │
│            v1.0.3 · build 2027-01-15T09:21:00Z                    │
│            commit a1b2c3d4                                         │
│                                                                    │
│   Polish keeps Windows clean, safe, and ready for whatever        │
│   comes next — without nagging, lying, or deleting anything       │
│   it can't take back.                                              │
│                                                                    │
│   Signed by: SignPath Foundation (or "Vikash Sharma" if Certum)   │
│   Certificate SHA: a1b2c3...                                       │
│                                                                    │
│   ──────────────────────                                           │
│   License: MIT                          [ View full text ▾ ]      │
│   Third-party licenses (acknowledgements)  [ View list ▾ ]        │
│                                                                    │
│   ──────────────────────                                           │
│   Contributors (N)                       [ View list ▾ ]          │
│   GitHub repo · Documentation · Issue tracker · Security policy   │
│                                                                    │
│   ──────────────────────                                           │
│   [ Copy diagnostic info ]       [ Donate / ★ Star us on GitHub ] │
└─────────────────────────────────────────────────────────────────┘
```

## Features

| Feature | Version | Tier | Status |
|---|---|---|---|
| [Version & Build Info](features/version-info.md) | v1.0 | Free | designed |
| [License & Acknowledgements](features/license.md) | v1.0 | Free | designed |
| [Contributors & Links](features/contributors-links.md) | v1.0 | Free | designed |
| [Diagnostic Info Copy](features/diagnostic-info.md) | v1.0 | Free | designed |

## Data dependencies (reads)

- `service.status` — for version + commit hash + build timestamp
- Build-time bundled: third-party license list, contributors list (auto-pulled at build per PLAN §7.7)

## Data writes

- None (read-only page).
- Exception: "Copy diagnostic info" copies a sanitized snapshot to clipboard.

## Cross-page navigation

| CTA | Destination |
|---|---|
| Check for updates (link) | `/settings` → Updates sub-section |
| GitHub repo / Documentation / Issue tracker / Security policy | External — opens in default browser |
| Donate | External — opens GitHub Sponsors / OpenCollective page |
| ★ Star us on GitHub | External — opens repo |

## Empty / loading / error states

- **Initial load:** brief skeleton; version + build hash come from `service.status` (or fallback to `polish-ui.exe` bundled metadata if service unreachable).
- **Contributors fetch failed at build time (unlikely):** "Contributors not available."

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Esc` | Back to previous page |

## Open questions

- Should the About page include the SBOM (CycloneDX) link from the latest release? Yes — adds to transparency posture. Add v1.0.
- Per-release changelog inline or external? Current: external (docs.polish.io/changelog) — keeps About slim.
