# License & Acknowledgements

> **Version:** v1.0
> **Tier:** Free
> **Page:** [About](../README.md)
> **Status:** designed
> **PLAN.md:** §7.7

## Purpose

Show the MIT license text for the OSS desktop engine + UI, and list every third-party dependency with its license. Compliance + transparency.

## Behaviour

- **License: MIT** — collapsible section showing full MIT text inline. No external link needed (in case user is offline).
- **Third-party licenses** — collapsible list auto-generated at build time from CycloneDX SBOM (PLAN §17.2). Each row: dependency name, version, license SPDX identifier, link to upstream.
- **Pro binary license note (when Pro installed):** "Polish Pro v1.X is proprietary software — license terms at polish.io/pro-license." MIT engine code remains fully open.

## Inputs

- **Bundled at build time:** MIT text (in repo), third-party licenses (generated from `cargo-cyclonedx` + `@cyclonedx/cyclonedx-npm` SBOM outputs)
- **IPC (if Pro installed):** `service.status.pro.licensed` (boolean) — toggles the Pro section visibility

## Outputs

- None.

## UI states

| State | When | What user sees |
|---|---|---|
| Default | MIT-only | "License: MIT [View ▾]" + "Third-party licenses [View ▾]" |
| Pro installed | Pro binary present + licensed | + "Pro binary license [View ▾]" |
| SBOM missing | Build-time generation failed | "Third-party license list unavailable for this build — see polish.io/sbom/<version>" |

## Edge cases

- **User clicks "View" on a list of 500+ dependencies:** virtualized list; searchable inline.
- **SBOM doesn't include a dep (rare manual addition):** "see CONTRIBUTING.md for the manual additions list" link.

## Cross-links

- Related: [[../../README]] (license info)
- PLAN.md: §7.7, §17.2 (SBOM generation)
- PROJECT.md: §5 v1.0 trust-first delivery (MIT, signed)
