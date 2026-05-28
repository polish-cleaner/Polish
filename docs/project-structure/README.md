# Polish — Project Structure (Feature Documentation)

> **Purpose.** This folder is the canonical feature catalog for the Polish desktop app. One folder per page; one MD file per feature. Used to decide what ships in v1.0 vs v1.1 vs v1.2-Pro vs deferred — and to give the implementer a single click-through view of every screen before any code is written.
>
> **Sources of truth.**
> - **`PLAN.md`** (repo root) — overall design, architecture, IPC, security, signing, distribution.
> - **`PROJECT.md`** (repo root) — validated go-to-market plan, monetization, debate-reconciled scope.
> - **This folder** — page-by-page, feature-by-feature decomposition. Feature specs here MUST match PLAN.md and PROJECT.md scope. If a feature spec drifts, update one or the other (not silently).

## Navigation

```
docs/project-structure/
├── README.md                          (you are here)
├── _feature-version-matrix.md         single sheet: every feature → version → tier → status
├── _templates/
│   ├── feature-template.md            template every feature MD must follow
│   └── page-template.md               template every page README must follow
├── _shared/                           cross-page UI surfaces
│   ├── sidebar.md                     left nav (every page reuses)
│   ├── tray-menu.md                   system tray right-click menu
│   ├── toast-notifications.md         Windows toast / Action Center contracts
│   ├── onboarding-first-run.md        first-launch experience
│   └── empty-states.md                shared empty / error / disabled UI rules
├── 01-dashboard/                      → see PLAN §7.1
├── 02-clean/                          → see PLAN §7.2 + §8
├── 03-prepare-for-format/             → see PLAN §7.3 + §9 — v1.2 Pro
├── 04-quarantine/                     → see PLAN §7.4 + §10
├── 05-history/                        → see PLAN §7.5
├── 06-settings/                       → see PLAN §7.6 + §12
└── 07-about/                          → see PLAN §7.7
```

## Version tags (use exactly these)

| Tag | Meaning |
|---|---|
| **v1.0** | Ships in the descoped MVP (free OSS, Cleanup + Quarantine + npm/pnpm/cargo). Per PLAN §20 (post-debate). |
| **v1.1** | Table-stakes follow-up (Aggressive/Custom modes, scanner, startup mgr, uninstaller, encrypted .pq, `.polishprofile`). Per PLAN §3 Phase 1.1. |
| **v1.2-Pro** | Paid Pro tier in separate closed-source `polish-pro.exe` binary. Format Prep wizard, full Dev/AI catalog (WSL2/Docker/LM Studio/Ollama), CLI, Custom profile cloud sync. Per PLAN §3 Phase 1.2. |
| **v2.0** | Cloud + anti-malware (optional Polish Account, `.pq` cloud backup, anti-malware module). Per PLAN §3 Phase 2. |
| **DEFERRED** | MSP / Enterprise (originally Phase 3). Removed from active roadmap. Re-entry gate in PLAN §22. |

## Status tags

- `designed` — spec complete, no code
- `in-progress` — being built
- `shipped` — in a released build
- `dropped` — explicitly cut (with reason)

## How to add a new feature

1. Decide which page it belongs to. If it spans pages, document the primary owner and link from the others.
2. Copy `_templates/feature-template.md` into the page's `features/` folder. Name with kebab-case.
3. Fill in every section. Cross-link to PLAN.md / PROJECT.md / IPC method per template.
4. Add a row to `_feature-version-matrix.md`.
5. Update the parent page's `README.md` to list the new feature.

## Conventions

- **Every feature has a version tag.** No untagged features. If you don't know, default `v1.1` and flag for review.
- **IPC contracts.** Reference IPC method names from PLAN §4.3 verbatim. Do not invent new method names here — propose them in PLAN.md first, then reference.
- **No code.** Pseudocode in `Behaviour` sections is fine. Actual TS/Rust lives in the repo, not here.
- **Cross-links use `[[name]]`** for related features within this folder (matches memory-system convention used in CLAUDE.md), `§X.Y` for PLAN.md references, `PROJECT.md §X` for PROJECT.md references.
- **Markdown only.** No HTML embedding.

## What this folder is NOT

- Not a user manual (that lives at `docs.polish.io`, per PLAN §18).
- Not API documentation (lives in code via doc-comments).
- Not a marketing site (`polish.io` landing page is separate).
- Not a substitute for the design system (Figma / tokens / motion presets live in `packages/design-tokens` per PLAN §6).
