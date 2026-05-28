# AGENTS.md — Polish (Windows maintenance suite)

> Repo orientation for AI coding agents. Read this before touching anything.

## Project identity

- **Name (working):** Polish — trust-first MIT-licensed Windows maintenance suite.
- **Status:** Pre-development design lock. No source code yet. Repo currently holds design docs, validation, prototype, and PowerShell smoke-test scripts.
- **Stack (planned):** Rust + Tauri 2 + React. Two-process architecture: `polish-svc.exe` (Windows Service, LocalSystem) + `polish-ui.exe` (Tauri UI, current user) communicating over named pipe IPC.
- **Verdict:** PIVOT (per post-debate v2). v1.0 = free OSS only. Pro tier → v1.2. MSP/Enterprise deferred indefinitely.

## Source-of-truth hierarchy

**If two docs conflict, higher wins:**

1. `PROJECT.md` — validation + go-to-market + monetization + risks. Post-debate v2.
2. `PLAN.md` — design source of truth: process model, IPC, security, signing, distribution, testing, roadmap.
3. `ARCHITECTURE.md` — authoritative on code structure, crate layout, layering, patterns (hexagonal/typestate/inventory/error-handling).
4. `docs/project-structure/` — page-by-page, feature-by-feature decomposition. Must match the above.

`PROJECT.md` wins on scope/sequencing. `PLAN.md` wins on cross-cutting design (signing, IPC protocol, UI flows). `ARCHITECTURE.md` wins on code layout + patterns. `docs/project-structure/` must reconcile to all three — never silently drift.

## Root file map

| Path | What | When to read |
|---|---|---|
| `PROJECT.md` | Validated business plan, ICPs, competitors, financials, risk matrix (§9), go-to-market (§7), next actions (§11). Includes verdict + score. | Any scope, monetization, risk, or roadmap question. |
| `PLAN.md` | Design spec: vision (§1), brand (§2), scope (§3), architecture (§4 — process model + IPC + signing; code structure lives in ARCHITECTURE.md), tech stack (§5), repo layout (§6 — SUPERSEDED by ARCHITECTURE.md §2), pages (§7), cleanup modes (§8), Format Prep (§9), `.pq` quarantine (§10), scanner (§11), settings (§12), security (§13), signing/distribution (§14), telemetry (§15), i18n (§16), testing (§17), docs (§18), competitive (§19), MVP (§20), roadmap (§21), open risks (§22), refs (§23). | Any cross-cutting design question (IPC, signing, distribution). |
| `ARCHITECTURE.md` | Code structure + patterns: hexagonal style (§1), workspace layout (§2), typestate pipeline (§3), `inventory` category registration (§4), `thiserror`/`anyhow` discipline (§5), testing strategy (§6), contributor workflow (§7), CI gates (§8). | Any code-layout, crate-boundary, typing, or contributor-onboarding question. |
| `AGENTS.md` | This file. Orientation only. | First read on new conversation. |
| `docs/` | Feature catalog. See below. | Per-feature scope, version tier, status. |
| `scripts/` | PowerShell smoke-test cleanup scripts (`admin-cleanup.ps1`, `admin-cleanup-pass2.ps1`, `balanced-cleanup.ps1`). Pre-product proof-of-concept. Not part of v1.0 product. | Only if asked about exploratory PoC behavior or original cleanup categories. |
| `graphify-out/` | Generated knowledge-graph artifacts (`graph.html`, `graph.json`, `GRAPH_REPORT.md`). Read-only output of `/graphify`. | If user asks about codebase graph or wants to query relationships. |
| `.vskill-data/` | Skill artifacts: validation history, debate transcripts, research, prototype, design tokens. See archive section. | Cite as source; do NOT edit unless asked. |

## `docs/project-structure/` map

```
docs/project-structure/
├── README.md                         doc-folder orientation
├── _feature-version-matrix.md        every feature → version → tier → status
├── _templates/                       feature-template.md, page-template.md
├── _shared/                          sidebar, tray-menu, toasts, onboarding, empty-states
├── 01-dashboard/                     → PLAN §7.1
├── 02-clean/                         → PLAN §7.2 + §8
├── 03-prepare-for-format/            → PLAN §7.3 + §9 (v1.2 Pro)
├── 04-quarantine/                    → PLAN §7.4 + §10
├── 05-history/                       → PLAN §7.5
├── 06-settings/                      → PLAN §7.6 + §12
└── 07-about/                         → PLAN §7.7
```

**Version tags** (use exactly these in any new feature spec):
- `v1.0` — free OSS MVP (Cleanup + Quarantine + npm/pnpm/cargo).
- `v1.1` — Aggressive/Custom modes, scanner, startup mgr, uninstaller, encrypted `.pq`, `.polishprofile`.
- `v1.2-Pro` — closed-source `polish-pro.exe`. Format Prep, full Dev/AI catalog, CLI, cloud sync.
- `v2.0` — cloud + anti-malware module.
- `DEFERRED` — MSP/Enterprise. Re-entry gate in PROJECT.md §3 + PLAN.md §22.

**Status tags:** `designed` / `in-progress` / `shipped` / `dropped`.

## `.vskill-data/` archives (treat as historical record)

```
.vskill-data/
├── PROJECT-v1.md                     pre-debate v1 PROJECT (historical)
├── PROJECT.md                        intermediate copy (historical)
├── index.json                        skill metadata
├── debate/
│   ├── DEBATE.md                     adversarial-review summary
│   ├── transcript.md                 raw 3-agent transcript
│   ├── v1/PROJECT.md                 v1 snapshot
│   └── v2/PROJECT.md                 v2 snapshot (same content now in root PROJECT.md)
├── design/
│   ├── _tokens-preview/              design-token previews
│   ├── v1/                           early design iteration
│   └── v2/                           current design iteration
├── Polish-prototype/                 HTML hi-fi prototype (Polish.html), screenshots, src, tweaks-panel
│   └── uploads/                      original PLAN/PROJECT uploads — STALE, do not cite
└── research/
    └── stress-test-project-risks/    2026-05-28 risk validation (findings.md + research.json)
```

**Rules for `.vskill-data/`:**
- READ to cite source / trace history.
- DO NOT edit unless user explicitly asks.
- `.vskill-data/Polish-prototype/uploads/*` is STALE — newer truth lives in root `PROJECT.md` / `PLAN.md`. Never quote uploads/ as current.
- `.vskill-data/debate/v2/PROJECT.md` ≈ root `PROJECT.md`. Prefer the root when both differ.

## Repo layout (post-scaffold 2026-05-28)

```
windows-cleaner/
├── Cargo.toml                workspace root
├── rust-toolchain.toml       Rust 1.75
├── deny.toml                 cargo-deny config
├── LICENSE-MIT
├── crates/                   Rust workspace (ARCHITECTURE.md §2)
│   ├── wc-core/              pure domain
│   ├── wc-app/               use cases
│   ├── wc-adapters/          concrete adapters
│   ├── wc-ipc/               serde wire types
│   ├── wc-test-fixtures/     shared mocks
│   ├── wc-svc/               bin: Windows service
│   ├── wc-cli/               bin: polish CLI
│   └── wc-ui/                Tauri 2 + React (run `npx @tauri-apps/cli init` — see SETUP.md)
├── apps/                     web apps (website / docs / landing) — empty
├── packages/                 shared TS — empty
├── .github/workflows/ci.yml  fmt + clippy + test + cargo-deny
├── PROJECT.md / PLAN.md / ARCHITECTURE.md / AGENTS.md / docs/
└── .vskill-data / graphify-out / scripts/
```

**Codename:** crates use `wc-*` prefix (codename, matches repo dir). Design
docs (ARCHITECTURE.md, PLAN.md) reference `polish-*` — same crates. Display
name in product = **Polish**.

## Key product decisions (locked)

These were resolved in the design grill (Q1–Q15) + 2026-05-28 adversarial debate + 2026-05-28 post-research stress-test. Re-litigate only with explicit user direction.

- **License:** MIT for OSS engine + UI. Closed-source proprietary for `polish-pro.exe` (v1.2+) consuming MIT engine as library.
- **Pro tier:** $29/yr primary. First 500 seats lifetime-of-v1.x at $79 then withdrawn. MSP/Enterprise deferred indefinitely (re-entry gate: $10K MRR + 3 paid MSP pilots + RMM marketplace listing + 1 backend engineer hired).
- **Quarantine:** Free tier forever. Atomic `.pq` bundles + manifest. Gating quarantine = brand killer.
- **Code signing:** **Microsoft Artifact Signing** (~$10/mo, identity-validated, CI/CD-native) primary. **Certum Open Source** fallback 1. **SignPath Foundation** fallback 2. EV certs explicitly skipped (no longer bypass SmartScreen per MS Learn 2026-05-09). Smart App Control caveat documented.
- **Update mechanism:** Custom service-aware NSIS pattern (Tauri sidecar/updater does NOT fit external Windows service). Week 1–3 spike is kill-switch gate before further v1.0 investment.
- **Telemetry:** opt-in only. Zero default collection. Sentry/GlitchTip in v1.0 (crash reports opt-in toggle in onboarding).
- **Excluded features (LOCKED):** registry cleaner, driver updater, RAM optimizer / Game Booster, "N threats found" FUD, bundled offers, self-re-enable on update, mobile companion. Consensus across all 3 debate reviewers.
- **Brand:** working name "Polish." Trademark check (USPTO TESS + EUIPO Class 9/42) is Week-1 critical. Rename slate ready: Lacquer, Sweep, Tidy, Clear, Buff.
- **Runway gate:** $60–90K self-funded for 12–18 months. Below $60K: do not start.

## Conventions when editing

- **Preserve scope discipline.** v1.0 MVP is locked at 3 features: Quarantine engine, npm/pnpm/cargo Dev category, Trust-first delivery. Adding to v1.0 without explicit user direction violates the debate-locked scope.
- **Update both docs on scope change.** PROJECT.md scope/sequencing change → PLAN.md must reconcile, and vice versa.
- **Date convention.** Today is 2026-05-28. Convert any relative date to absolute when writing into the file.
- **Risk matrix format.** Single row per risk. Columns: Risk | Type | Probability | Impact | Mitigation. Severity tags in **bold**. Mark NEW additions with `(NEW)` or `(NEW post-debate)` / `(NEW post-research <date>)`.
- **Citations.** Inline `[claim](url)`. Cite canonical sources over marketing copy (e.g., trust Microsoft Learn over CA vendor blogs on SmartScreen behavior).
- **Cleanup categories.** Any new category must declare safety tier (Light/Balanced/Aggressive/Pro), per-item confirm policy, and OEM/dev-environment risk note. Per PLAN §8.
- **DRY (full codebase, Rust + TS).** Do not duplicate logic across files. If the same expression appears in 3+ places, extract it into a shared helper module (Rust: a `*_util.rs` or new module; TS: `crates/wc-ui/src/lib/<purpose>.ts`). Before writing a new helper, grep for an existing one — prefer extending it over creating a parallel one.
- **Frontend rules (`crates/wc-ui/`).** Read `crates/wc-ui/AGENTS.md` before editing any file under `crates/wc-ui/src/`. Covers required file structure, test-per-file rule, types-only-in-`src/types/` rule. Frontend rules override default React conventions.
- **Race-condition / "real-world failure mode" coverage is mandatory.** Any time a user-reported bug exercises a real-machine condition the unit tests didn't cover (`%TEMP%` file deleted mid-pack, Chrome locking cache files, antivirus interfering), add a Rust integration-style test that simulates the scenario via a stub port or a real `tempfile::TempDir` BEFORE the fix is allowed to ship. The user should not need to relaunch the UI to confirm a regression is closed. Place these tests in the closest use case (`crates/wc-app/src/usecase/<name>.rs`) so they run via `cargo test --workspace`.

## What NOT to do

- Do not create new top-level files without asking. PROJECT.md / PLAN.md / AGENTS.md / docs/ is the surface.
- Do not introduce features outside the locked v1.0 scope without user direction.
- Do not edit `.vskill-data/` archives unless user asks — they are historical record.
- Do not weaken anti-feature list (registry/driver/RAM/FUD/bundles). Locked by 3/3 debate consensus.
- Do not switch licenses, signing strategy, or pricing without re-reading PROJECT.md §8 + PLAN.md §14.
- ~~Do not write code — repo is pre-development.~~ Workspace scaffolded 2026-05-28 per user direction. Stubs only; no cleanup logic. Week 1–3 critical spikes (signing setup, Tauri+service IPC, runway) still outstanding.

## Pre-development checklist (Week 1–3, from PROJECT.md §11)

1. Trademark search (USPTO TESS + EUIPO Class 9/42).
2. Domain WHOIS + 3 fallbacks for `polish.io`.
3. GitHub org reservation.
4. MS Artifact Signing setup (Certum / SignPath fallbacks ready).
5. **Critical spike:** Tauri 2 + Windows-service update pattern end-to-end on throwaway binary. Kill-switch gate.
6. Founder runway disclosure.

## Quick orientation queries

| Question | Where to look |
|---|---|
| What ships in v1.0? | PROJECT.md §5 + PLAN.md §3 Phase 1 + `docs/project-structure/_feature-version-matrix.md` |
| Why this scope and not bigger? | PROJECT.md §10 + Appendix + `.vskill-data/debate/DEBATE.md` |
| How does quarantine work? | PLAN.md §10 + ARCHITECTURE.md §3 (typestate pipeline) + `docs/project-structure/04-quarantine/` |
| Why MIT desktop + closed-source Pro? | PROJECT.md §5 (Open-core architecture) + PLAN.md §3 Phase 1.2 |
| What signing path? | PLAN.md §14.2 + PROJECT.md §9 (post-research updates) |
| Current top risks? | PROJECT.md §9 + `.vskill-data/research/stress-test-project-risks/findings.md` |
| Competitive landscape? | PROJECT.md §4 + PLAN.md §19 |
| Pricing + projections? | PROJECT.md §8 |
| Code structure / crate layout? | ARCHITECTURE.md §2 (workspace layout + dep direction rules) |
| How to add a cleanup category? | ARCHITECTURE.md §7 (contributor workflow, ≤1 day) |
| Why multi-exe + how it scales? | ARCHITECTURE.md §1 + `.vskill-data/research/exe-vs-dll-architecture/findings.md` |
| Type-safety patterns? | ARCHITECTURE.md §3 (typestate) + §5 (errors) |

---

*Last updated: 2026-05-28 (post-research stress-test). Update whenever root scope, structure, or source-of-truth hierarchy changes.*
