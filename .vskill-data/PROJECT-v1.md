# PROJECT.md — Polish (Windows Maintenance Suite)

> Validation pass: 2026-05-28 · Source plan: `PLAN.md` v1 · Lens: profitability-first SaaS framing layered onto the local-first OSS plan · Method: PLAN.md extraction + web research (May 2026)

---

## SECTION 1 — Executive Summary

- **Product.** Polish is a Windows maintenance suite: cleanup + guided pre-format backup + trustworthy quarantine, with a v2 paid tier for dev/IT power-users.
- **Why now.** Avast/Gen Digital's FTC settlement ($16.5M, 2024) + CCleaner's bundled-offer / privacy-monitor backlash created an active trust vacuum in a $1–3B market growing 8–10% CAGR. Modern dev workloads (WSL2, Docker, npm/pnpm/cargo) chew 50–200 GB no incumbent handles cleanly.
- **Biggest strength.** Two genuine wedges nobody owns at once: (1) **trustworthy MIT/quarantine-first cleaner** (vs. Gen Digital baggage) and (2) **first-class Format Prep wizard** + **developer-aware categories** (vs. grandma-targeted incumbents).
- **Biggest risk.** Monetization. Plan ships v1 MIT-free local-only. Free OSS Windows cleaners (BleachBit) have failed to monetize for 15 years. Without a credible Pro/MSP tier *designed in from v1*, "most profitable SaaS" framing is aspirational.
- **Verdict.** **GO with monetization redesign.** Build v1 per PLAN.md but introduce paid **Polish Pro** (dev tier, $39 lifetime / $5/mo) at v1.0 launch, not deferred to v2.0. Phase 3 B2B/MSP angle (per-device SaaS) is the real profit engine — pull forward to v2.0.

---

## SECTION 2 — Problem Validation

**Core problem.** Windows machines accumulate 30–150 GB of recoverable junk (system, browser, dev caches, leftover installers, model files) that the OS does not clean automatically. The dominant fix tools are either (a) untrusted (CCleaner / Avast lineage, FTC-fined, bundled adware) or (b) unmaintained/intimidating (BleachBit Tk UI) or (c) too narrow (WizTree shows, doesn't clean; Storage Sense only system drive, ignores dev junk).

**Who faces it.**
- Dev/IT-curious users on Windows 10/11: r/Windows (2.5M), r/Sysadmin (1.1M), r/Windows11 (700K), r/programming Windows threads — disk-full posts weekly.
- Mainstream users who Google "clean my pc" — 246K avg monthly US searches (KW Planner range).
- IT teams on shared-tenant Windows fleets where Storage Sense is unconfigured.
- **Highest-pain segment:** developers on Windows with WSL2 + Docker — VHDX files grow unboundedly (10–100 GB), no native tool compacts them, manual `wsl --shutdown && diskpart` is a known sharp edge.

**Current solutions & failures.**
- **CCleaner (Gen Digital):** ~70M+ users. Complaints: forced auto-renewal (Trustpilot threads), removed features in v7 ("became a shell"), Avast-era data-selling scandal, registry-cleaner snake oil, taskbar pinning broken, browser uninstalls. G2 4.5, Trustpilot 4.2 surface ratings — but qualitative complaints dominant.
- **BleachBit:** GPLv3 free, broad 70+ app cleaners, but Tk UI from 2008, no scheduling, no startup mgr, no quarantine, no notifications. Trusted but dated.
- **Wise Care 365 / Glary Utilities:** $30–$40/yr, bundled installers, China-ownership opacity, weekly nag updates, registry cleaner snake oil.
- **IObit Advanced SystemCare:** $16.77/yr, broad toolkit, but G2 4.3, history of bundled offers.
- **PrivaZer:** Strong forensic wipe (only one), but UI from 2010, novice-hostile.
- **WizTree:** Disk visualizer, fastest scan via MFT, but pure analyzer — no cleanup, no quarantine.
- **Storage Sense (built-in):** Free, off by default, only system drive, misses every dev cache, VHDX file, package-manager debris.
- **CLI tools (npkill, kondo, dust):** Dev-loved, but CLI-only, single-purpose, no quarantine/restore.

**Painkiller or vitamin?**
- **Painkiller for two narrow segments:** (1) devs hitting "disk full" on a WSL2/Docker workstation — work *stops* — and (2) users about to format their PC ("don't lose anything"). This is genuinely urgent + painful.
- **Vitamin for mainstream cleanup.** Annoying but not blocking. Incumbents have trained users to do it monthly; switching cost = low; problem severity = medium.

**Evidence.**
- r/sysadmin "low disk space WSL Docker VHDX" — recurring quarterly threads.
- Trustpilot CCleaner complaints (1,035 reviews): auto-renew abuse, removed features, "uninstalled my browser."
- FTC Avast $16.5M ruling Feb 2024 — public trust event.
- npkill 7K+ GitHub stars; community testimonials reclaiming 50–200 GB → validated developer pain.

**Problem Severity Score: 7/10.** Painkiller for dev/format-prep segments (9), vitamin for mainstream (5), weighted to 7. Trust gap is independently strong (+1 effective).

---

## SECTION 3 — Target Audience

### ICP Table

| Attribute | Detail |
|---|---|
| Role / Title | (Tier A) Software engineer / SRE / DevOps on Windows + WSL2; (Tier B) IT admin / sysadmin on SMB Windows fleet; (Tier C) Windows power user (gamer, content creator, prosumer) |
| Industry | Software / SaaS / Game studios / Creative / SMB IT services |
| Company size | Tier A: 10–500 (individual buyer); Tier B: 10–500 endpoints; Tier C: N/A (consumer) |
| Trigger event | "Disk full" toast, planned reformat, new-machine setup, OEM bloat post-purchase, post-incident audit, Avast/CCleaner trust event |
| Platforms | r/Windows, r/Sysadmin, r/programming, r/WSL, r/docker, Hacker News, dev.to, GitHub trending, Stack Overflow, MSP subreddits, ProductHunt |
| Decision maker | Tier A/C: self. Tier B: sysadmin → IT manager (one-stop approval under $5K/yr). |
| Current spend | Tier A: $0 (npkill, BleachBit) → $30/yr churned (CCleaner Pro). Tier B: $80–250/device/yr on RMM (NinjaOne $1.50–$3.75, Atera $129–$209/tech). Tier C: $25–40/yr on CCleaner/Wise. |

### User Segments

| Tier | Profile | Budget | Priority |
|---|---|---|---|
| **Beginners (Tier C)** | Windows home user, friend installs it, wants disk back, never touches Settings page | $0 (free OSS tier) | One-button "Clean now" + zero nag |
| **Professionals (Tier A)** | Dev on Win11 + WSL2 + Docker, wants WSL/Docker/cache cleanup + transparency + scriptable | $39 lifetime / $5–9/mo Pro | Dev categories, CLI, .polishprofile sharing, encrypted quarantine |
| **Enterprise / MSP (Tier B)** | IT admin managing 50–500 Windows endpoints, wants fleet cleanup reports, audit log, group policy | $2–4/device/mo SaaS | Centralized dashboard, RBAC, audit log export, Intune/GP integration |

- **Demand Score: 7/10** — Cleanup tool category itself is huge (Google 246K/mo); dev-aware niche is fast-growing (WSL2 adoption ↑ since 2023); MSP fleet-cleanup not yet a category.
- **Willingness to Pay Score: 6/10** — Consumers historically pay $25–40/yr for CCleaner-class. Devs pay for tools they trust (Charles, Beyond Compare, JetBrains). MSPs pay $1–4/device/mo readily. Free-OSS-trained majority depresses average.

---

## SECTION 4 — Competitor Intelligence

| Attribute | CCleaner (Gen Digital) | BleachBit | Glary Utilities | IObit ASC | Wise Care 365 | PrivaZer |
|---|---|---|---|---|---|---|
| Pricing | Free / $29.95 Pro / $39.95 Plus / $64.95 Bundle | Free, GPLv3 | Free / $39.95/yr 3 PC | Free / $16.77/yr | Free / $29.96 one-time, 3 PC | Free / ~$49 Pro |
| Core features | Junk clean, browser clean, registry, startup mgr, software updater, driver updater | 70+ app cleaners, free-space wipe, shred | Junk, registry, startup, uninstaller, defrag, "1-click" optimizer | Junk, registry, "RAM optimizer", driver updater, real-time monitor | Junk, registry, privacy eraser, sched, system tuner | Forensic wipe, free-space scrub, residual trace removal |
| Strengths | Brand recognition, polished UI, 70M+ installs | Trust, OSS, breadth, portable | Toolkit breadth, mature, sched tasks | Cheapest paid, broad toolkit | Fast scan, clean UI for Asia mkt | Forensic depth nobody matches |
| Weaknesses | Avast trust collapse, FTC fine baggage, forced renewal, bundled offers, removed features in v7 | 2008-era Tk UI, no sched, no quarantine, no notif, no startup mgr | Bundled installers, registry snake oil, weekly nag, Chinese-opacity, broken-English support | Snake oil features (RAM/driver), historic bundling, real-time scan = bloat | Bundled offers, registry snake oil, China-ownership opacity | Dated UI, novice-hostile, slow (thorough), no quarantine |
| Top user complaint | "Auto-renewed without consent, uninstalled my browser, customer support unreachable" (Trustpilot 1,035 reviews) | "Need scheduling and modern UI" (sourceforge) | "Constant nag for updates, popups, broken English" (forums) | "Driver updater bricked my GPU" (reddit) | "Tried to install third-party software during install" (forums) | "Couldn't figure out what to click — too many checkboxes" (G2) |
| Market position | Leader (mainstream) | Niche (OSS/Linux/security-aware) | Challenger (toolkit) | Challenger (cheap) | Challenger (regional/Asia) | Niche (forensic) |

**Adjacent / non-cleaner competitors:**

| Tool | Pricing | Role | Threat |
|---|---|---|---|
| WizTree | Free / $25 commercial one-time | Disk visualizer | Solves "what's eating my disk" — not cleanup. Complementary, could be acquired/integrated. |
| Storage Sense | Free (OS) | OS-native auto-clean | Floor competitor. Capable but myopic. |
| npkill / kondo / dust | Free OSS CLI | Dev cache cleaners | Dev-loved point tools. Polish must absorb their UX. |
| NinjaOne / Atera (RMM) | $1.50–$3.75/device or $129–$209/tech | Endpoint mgmt suites (cleanup is feature) | Real enterprise competition. Polish B2B must be the focused alternative. |

**Competition Difficulty Score: 6/10.** Mainstream segment is crowded with weak/distrusted incumbents (good for trust wedge). Dev/MSP niches are open. Microsoft's Storage Sense is the silent floor.

---

## SECTION 5 — Feature Engineering

### Competitor Feature Matrix

| Feature | CCleaner | BleachBit | Glary | IObit ASC | Wise | PrivaZer | Storage Sense | Classification |
|---|---|---|---|---|---|---|---|---|
| Temp/junk clean | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Table stakes |
| Browser cache (multi) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | partial | Table stakes |
| Recycle Bin per-drive | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Table stakes |
| Startup app manager | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | Table stakes (Polish defers to v1.x) |
| Uninstaller + leftover sweep | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | Table stakes (Polish defers) |
| Scheduled background clean | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ | Table stakes |
| Registry cleaner | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | **Polish hard-excludes (anti-feature)** |
| Driver updater | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | **Polish hard-excludes (anti-feature)** |
| "Speed boost / RAM optimizer" | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | **Polish hard-excludes (anti-feature)** |
| Quarantine + restore before delete | ✗ | ✗ | partial (recycle bin) | ✗ | ✗ | ✗ | ✗ | **WHITESPACE — Polish core** |
| Dry-run preview manifest | ✗ | partial | ✗ | ✗ | ✗ | ✗ | ✗ | **WHITESPACE — Polish core** |
| WSL2 VHDX compaction | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **WHITESPACE — Polish wedge** |
| Docker VHDX compaction | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **WHITESPACE — Polish wedge** |
| Per-language cache clean (npm/pnpm/pip/cargo/go) | ✗ | partial (Python) | ✗ | ✗ | ✗ | ✗ | ✗ | **WHITESPACE — Polish wedge** |
| Orphan node_modules detection | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **WHITESPACE — Polish wedge** |
| LM Studio / Ollama model audit | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **WHITESPACE — Polish wedge (AI-era)** |
| Pre-format guided wizard | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **WHITESPACE — Polish flagship** |
| Restore plan generator (winget export, ext lists) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **WHITESPACE — Polish flagship** |
| Forensic free-space wipe | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ | Gap (defer to v1.x or skip) |
| Duplicate file finder | partial | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | Gap (v1.x) |
| Treemap disk view | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | Gap (v1.x — WizTree integration) |
| Signed installer + no bundled offers | ✗ (bundled) | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | **Polish wedge: trust** |
| MIT/open-source desktop | ✗ | ✓ (GPL) | ✗ | ✗ | ✗ | ✗ | n/a | **Polish wedge: license** |
| Fleet dashboard / centralized policy | ✗ (paid Cloud) | ✗ | ✗ | ✗ | ✗ | ✗ | partial (Intune) | **Whitespace — Polish v2.0+ profit engine** |

### MVP Feature Set (v1.0 — 3–5 max, each maps to real complaint)

| # | Feature | Type | Pain point | Competitor gap | User benefit |
|---|---|---|---|---|---|
| 1 | **Quarantine-first cleanup engine + `.pq` bundle + manifest** | Whitespace | "CCleaner uninstalled my browser, no way to recover" (Trustpilot) | All — none quarantine atomically; only Recycle Bin (not for system files) | Every action reversible. Trust restored. |
| 2 | **Dev/AI category catalog (WSL2 VHDX, Docker VHDX, npm/pnpm/pip/cargo, LM Studio / Ollama models, IDE caches)** | Whitespace | r/sysadmin "WSL2 ate my disk", npkill 7K stars proves demand | None ship this. npkill is CLI-only and single-purpose. | Devs reclaim 50–200 GB without writing shell scripts. |
| 3 | **Prepare for Format guided wizard (7 steps: snapshot → backup → verify → cleanup → restore plan)** | Whitespace | "I formatted and forgot to back up `.ssh/`/`.aws/`" — universal dev pain | None — closest is OOBE / Win11 Reset which is one-way | Reformat without losing credentials, env, IDE extensions. |
| 4 | **Trust-first delivery: MIT OSS, signed binaries, zero default telemetry, no bundled offers, no nag** | Simplification + table stakes recast as wedge | CCleaner/Wise/Glary bundled offers, Avast FTC scandal, registry snake oil | Only BleachBit matches, but UX is 2008-era | First "clean" cleaner since BleachBit, with modern UX. |
| 5 | **Idle-aware background daemon + 1/day digest toast (DND-respect, snooze, threshold-gated)** | Table stakes + Simplification | "CCleaner toasts every hour", "Glary weekly nag" | All ship notifications, all spam | Hands-off maintenance without trust-eroding spam. |

### Phase 2 Features (v1.1 – v1.5)

| Feature | Why it waits | Build trigger |
|---|---|---|
| Treemap disk view | Adds wow but not core to v1 promise | After 1,000 active users + repeated request |
| Duplicate file finder | Hard to make correct + fast; not core wedge | After v1 stable, MFT-direct scan benchmarked |
| `.polishprofile` import/export + community gallery | Network effect, needs traffic to seed | After v1 ships, ~500 stars on GitHub |
| Forensic free-space wipe | PrivaZer-style, niche but unique gap from BleachBit + Polish | Phase 1.5; security-aware users will ask |
| Startup app manager + Uninstaller | Table stakes for mainstream; not present in v1 spec | If retention < target without it (likely needed by v1.2) |
| CLI (`polish` command) | Devs ask, simplifies CI cleanup | v1.1, modest scope |
| Localization beyond en-US | Crowdin community | Post-launch by language |

### Phase 3 Features (v2.0 — Pro tier + B2B)

| Feature | Why it goes here | Monetization tie |
|---|---|---|
| Encrypted `.pq` cloud backup | Pro tier hook | $5–9/mo Pro |
| Cross-PC config sync | Pro tier hook | $5–9/mo Pro |
| Anti-malware second-opinion (YARA, ClamAV optional) | Pro tier hook | $5–9/mo Pro |
| Fleet dashboard for MSP/IT admin | B2B profit engine | $2–4/device/mo SaaS |
| RBAC + audit log export + Intune/GP integration | B2B requirement | $2–4/device/mo SaaS |
| SSO / SAML | Enterprise tier | $5–8/device/mo Enterprise |

### Explicitly Excluded (scope killers — Polish never ships these)

| Feature | Why excluded |
|---|---|
| Registry "cleaner" | Microsoft + Malwarebytes both confirm: measurable benefit zero, downside catastrophic. Defines competitor snake oil. |
| Driver updater | High risk (bricked systems), low reward, malware vector category. Defer to Windows Update / OEM. |
| RAM optimizer / "Speed Boost / Game Booster" | Marketing fiction; flushing working sets hurts performance. Trust erosion. |
| "N threats found / X cookies = privacy risk" | Manufactured urgency. Erodes trust. CCleaner's MO. |
| Bundled third-party offers in installer | #1 complaint across every paid competitor. Hard no. |
| Self-re-enable disabled features on update | CCleaner anti-pattern. |
| Mobile companion app | Not the problem. Out of scope forever (v1 spec). |

---

## SECTION 6 — Market Gap & Differentiation

- **Gap identified.** Two simultaneous gaps:
  1. **Trust-first cleaner for the post-Avast, post-CCleaner era.** No actively-maintained, modern-UX OSS Windows cleaner exists. BleachBit is the only OSS alternative; UX hasn't been updated since 2008.
  2. **Developer-aware + AI-era disk reclamation.** WSL2 VHDX, Docker VHDX, LM Studio / Ollama models, IDE caches — nobody handles these in a GUI with quarantine.
  3. **Pre-format wizard.** Universal pain. Zero competitor coverage.
  4. **Fleet cleanup for SMB MSPs as standalone SaaS.** NinjaOne/Atera bundle this into $1.50–$3.75/device suites. No standalone cleanup-only product for the SMB who doesn't need full RMM.
- **Differentiation strategy.** **Trust + UX simplicity + niche audience focus.** Not price (already free). Not feature breadth (incumbents have more). The wedge is *what we refuse to ship* + *who we ship for*.
- **Wedge statement.**
  > Unlike CCleaner, Polish is the only Windows cleaner that's open-source, never deletes without quarantine, refuses snake-oil features, and handles WSL2/Docker/dev caches by default — built for developers, power users, and IT admins who stopped trusting their tools.

---

## SECTION 7 — Growth & Distribution Plan

| Channel | Reach | Time to results | Est. cost | ICP fit |
|---|---|---|---|---|
| **r/Windows / r/Sysadmin / r/WSL / r/Docker — show HN/Reddit launch** | 4M+ combined, <5% reach per post | 1–4 weeks | $0 | High (Tier A/B) |
| **GitHub Releases + Trending** | Open ecosystem, OSS halo | 4–12 weeks | $0 | High (Tier A) |
| **Hacker News launch (Show HN)** | 7M monthly visitors | 1 day window | $0 | High (Tier A) |
| **dev.to / Hashnode / personal blog "Anatomy of a Windows service in Rust"** | Dev SEO long-tail | 12–24 weeks | $0 | High (Tier A) |
| **Product Hunt** | 5M monthly | 1 day spike + tail | $0 | Med (Tier C/A) |
| **winget / Scoop / Choco listings** | Power-user discovery | 4 weeks | $0 | High (Tier A) |
| **SEO content: "best Windows cleaner 2026", "clean WSL VHDX"** | 246K/mo "clean my pc" head term, long-tail dev queries | 6–12 months | $0 (own time) | High (mixed) |
| **YouTube partnerships (LTT short, ThePrimeagen react, NetworkChuck)** | 5–15M reach per video | 8–20 weeks | $500–2K sponsor (or free if news-worthy) | High (Tier A/C) |
| **Twitter/X dev community + replies to disk-full tweets** | 200K dev community | Ongoing | $0 | High (Tier A) |
| **MSP subreddits + r/MSP + spiceworks community** | 50K MSP/IT | 4–12 weeks | $0 | High (Tier B, for v2) |
| **Paid: Google Ads on "CCleaner alternative" + "ccleaner unsafe"** | Defensive intent capture | 1–4 weeks | $1–3 CPC, ~$2K/mo if scaled | Med (Tier C) |

- **Blended CAC estimate.** Free tier: ~$0 organic (OSS halo) for first 50K. Pro tier: ~$10–25 (content + Reddit-driven trial). MSP: ~$200–600 (sales-light SaaS, content + outbound).
- **Distribution Difficulty Score: 5/10.** OSS halo + trust narrative + dev community = strong organic. Mainstream consumer reach is hard (SEO crowded). MSP requires real sales motion.
- **Path to first 100 users.** (1) Pre-release v0.5 to 10 r/sysadmin / r/WSL beta testers via DM. (2) Show HN at v1.0 with "trust-first Windows cleaner in Rust" angle. (3) Submit winget on day 1 + Scoop bucket; cross-post to r/Windows11, r/programming.

---

## SECTION 8 — Revenue Model & Projections

> **Profit-first redesign vs. PLAN.md.** PLAN.md defers paid Pro tier to v2.0 (2027 Q4). For "most profitable SaaS" framing this is too late — launch Pro at v1.0 to capture intent + fund development. B2B/MSP tier (Phase 3 in plan) is the actual profit engine; pull forward to v2.0.

### Pricing Tiers (recommended redesign)

| Tier | Price | Key features | Target segment |
|---|---|---|---|
| **Polish Free (MIT)** | $0 forever | All v1 cleanup, Format Prep wizard, quarantine, local-only, no telemetry | Tier C beginners, Tier A devs trial |
| **Polish Pro** | **$39 lifetime** OR **$5/mo** OR **$39/yr** | Dev categories (npm/pip/cargo/WSL/Docker/Ollama), encrypted `.pq`, cloud backup of quarantines, `.polishprofile` cloud sync, priority support, CLI, scheduled auto-clean with whitelist, future AI features | Tier A devs, prosumers |
| **Polish Teams (SaaS)** | **$2/device/mo** (50–500 devices) OR $1.50 (500+) | Pro + fleet dashboard, RBAC, audit log export, Intune/GP integration, SSO add-on, weekly cleanup reports | Tier B SMB IT admins |
| **Polish Enterprise** | **$5/device/mo** + custom | Teams + SAML, SLA, compliance reports, on-prem control plane, dedicated CSM | Tier B+ Enterprise IT |

**Rationale.**
- **Lifetime option ($39) creates trust against subscription-fatigued audience.** Devs hate CCleaner's auto-renew abuse. Mimics JetBrains' Toolbox optionality.
- **$5/mo Pro = ~50% under CCleaner Pro Plus ($3.75/mo effective).** Plenty of room.
- **$2/device/mo MSP undercuts NinjaOne ($1.50–$3.75) only at the high end** but vastly cheaper than Atera ($129/tech). Sweet spot for SMB who only wants cleanup auditing, not full RMM.
- **Free OSS desktop stays free forever** — that's the brand and the OSS halo.

### Financial Projections (conservative, single-dev solo)

| Milestone | Active free users | Pro paying | MSP paying devices | Conversion (free → paid) | MRR |
|---|---|---|---|---|---|
| Month 3 (post v1.0 launch) | 5,000 | 50 ($5 ARPU) | 0 | 1.0% | **$250** |
| Month 6 | 25,000 | 400 | 200 (avg $2 = $400) | 1.6% | **$2,400** |
| Month 12 | 80,000 | 2,000 | 1,500 ($3,000) | 2.5% | **$13,000** |
| Month 18 (v2.0 ships) | 150,000 | 5,000 | 5,000 ($10,000) | 3.3% | **$35,000** |
| Month 24 | 250,000 | 10,000 | 12,000 ($24,000) | 4.0% | **$74,000** |

**Notes.**
- Pro conversion of 1–3% is within freemium benchmark (median 2–5%, top 6–8%). 2.5% by month 12 is realistic with OSS-trust narrative.
- MSP per-device growth assumes one mid-tier MSP customer = 200–500 devices.
- Numbers exclude one-time lifetime sales which front-load cash but don't add to MRR.

### Key Unit Economics

- **Break-even.** Month 9 at ~$8,000 MRR (assuming hosting ~$2K/mo + signing $200/yr + SaaS infra + solo founder runway not modeled).
- **LTV (Pro).** $5 × 24 months avg retention = **$120**.
- **LTV (MSP/device).** $2 × 36 months × avg 100 devices/account = **$7,200/account**.
- **LTV/CAC (Pro).** $120 / $15 = **8x** ✓ (viable).
- **LTV/CAC (MSP).** $7,200 / $400 = **18x** ✓ (very viable).

### Path to ARR

- Conservative: **$888K ARR by month 24** (above table).
- Optimistic (if dev/MSP word-of-mouth compounds + one viral HN/LTT moment): $2–3M ARR by month 24, dominated by MSP devices.

---

## SECTION 9 — Risk Matrix

| Risk | Type | Probability | Impact | Mitigation |
|---|---|---|---|---|
| Solo-dev velocity insufficient to ship v1.0 in 2026 Q4 + Pro tier by then | Execution | High | High | Cut v1 scope: ship Cleanup + Format Prep + quarantine only. Defer startup mgr, uninstaller, treemap to v1.1. Pro tier = encrypted .pq + dev categories + CLI gated. |
| Microsoft tightens cleaner-class app policies (Defender flags, SmartScreen friction) | Regulatory | High | High | Submit to Microsoft Defender AV trust early; SignPath/Certum signing; README unblock guide; never call ourselves "antivirus" until v2.0 module ships. |
| SignPath Foundation rejects application | Execution | Medium | High | Certum Open Source fallback (~€69 upfront + €29/yr). Don't block launch on SignPath. |
| Avast/Gen Digital ships a "trust reset" rebrand and recaptures narrative | Competition | Medium | High | Move fast on launch; tie launch press to FTC ruling + transparency narrative; brand "Polish" as the post-CCleaner cleaner. |
| Microsoft adds dev-aware cleanup to Storage Sense (WSL2 / Docker / npm) | Competition | Low (3–5 yr horizon) | Fatal long-term | Build mindshare + MSP/Pro revenue moat before this happens. Differentiate on Format Prep + quarantine, not just dev categories. |
| Quarantine bug → user data loss → trust collapse | Execution + Trust | Medium | Fatal | 100% test coverage on `polish-quarantine`; round-trip restore test in CI; never ship rules without quarantine path verified; bug bounty (post-v2). |
| Free OSS users never convert (BleachBit fate) | Market | Medium | Fatal to profit goal | Pro tier launched at v1.0 (not v2); MSP SaaS as primary revenue lever; lifetime license as conversion bridge; never feature-strip Free to coerce upgrade. |
| Tauri 2 service-aware update pattern breaks on Win11 25H1+ | Technical / Dependency | Medium | Medium | Build + extensively test in v0.x; have NSIS-only fallback path; blog the pattern (community help). |
| Trademark conflict on "Polish" in software class | Regulatory | High | High | USPTO TESS + EUIPO search now (pre-launch); have rename plan (alt names from PLAN.md §2 brand check) |
| Quarantine bundles accidentally include user sensitive files (.ssh/.aws) | Security/Privacy | Low | Fatal | Whitelist-based scan paths (not blacklist); explicit user-content tier requires per-item confirmation; security review before v1. |
| Tauri webview compromise → privileged RPC abuse | Security | Low | Fatal | Per-call SID validation (already in PLAN.md §4.2/§13.2); fuzz IPC schemas; ship narrow RPC surface. |
| MSP segment refuses to buy from a 1-person OSS dev | Market | Medium | High | Launch MSP tier only after $30K MRR Pro; partner with one design-partner MSP for case study; "Polish Teams Open Beta" before charging. |
| OEM bloat / driver false positives → reputation hit | Execution | Medium | Medium | Bloat removal Aggressive-only, per-item confirm, never auto. Manual review of OEM list per Win release. |

---

## SECTION 10 — Success Probability Score

| Dimension | Weight | Score (1–10) | Weighted |
|---|---|---|---|
| Problem Strength | 20% | 7 | 1.40 |
| Market Demand | 20% | 7 | 1.40 |
| Competition Difficulty (inverted: 10 − raw_difficulty = 4) | 15% | 4 | 0.60 |
| Monetization Potential | 15% | 7 | 1.05 |
| Distribution Ease | 15% | 6 | 0.90 |
| Founder Advantage | 15% | 6 | 0.90 |
| **TOTAL** | **100%** | — | **6.25 → 62.5%** |

**Score interpretation: 62.5% → Viable with strategic focus. Proceed carefully.**

Strategic focus areas to push score toward 75%+:
1. Launch Pro tier at v1.0 (lifts Monetization 7 → 8.5).
2. Validate one MSP design partner before v2.0 build (lifts Demand + Mon. each +0.5).
3. Ship dev-category MVP first, push Reddit + HN — proves founder advantage (lifts FA 6 → 8).
4. Aggressively de-scope v1.0 to ship 6 months earlier (lifts Distribution by accelerating mindshare window before Storage Sense improves).

---

## FINAL DECISION TABLE

| Category | Details |
|---|---|
| **Product Idea** | Trust-first, open-source Windows maintenance suite with quarantine-safe cleanup, dev-aware categories (WSL/Docker/npm/pip/cargo), guided pre-format wizard, and paid Pro + MSP fleet tiers. |
| **Core Problem** | Windows machines accumulate 30–150 GB of recoverable junk; incumbent cleaners are distrusted (Gen Digital baggage), dated (BleachBit), or narrow (Storage Sense). Devs face WSL2/Docker disk bloat with no GUI fix. |
| **Target Audience** | Tier A devs on Win+WSL2 (10–500-person co's, self-buy); Tier B SMB IT admins (50–500 endpoints, sysadmin-buy); Tier C Windows power users (consumer). |
| **Key Features (MVP)** | (1) Quarantine + `.pq` + manifest, (2) Dev/AI categories, (3) Format Prep wizard, (4) Trust-first delivery (MIT, signed, no nag), (5) Idle-aware notif daemon |
| **Unique Advantage** | Only modern OSS cleaner; only tool with quarantine-first safety; only tool with first-class Format Prep wizard; only tool with dev/AI categories in a GUI. |
| **Top Competitors** | CCleaner ($29.95/yr), BleachBit (free GPL), Wise Care 365 ($29.96 one-time), Glary ($39.95/yr), IObit ASC ($16.77/yr), PrivaZer ($49 Pro), WizTree ($25 commercial), NinjaOne ($1.50–$3.75/device/mo), Atera ($129/tech/mo), Storage Sense (free OS) |
| **Revenue Model** | Freemium + Lifetime + Subscription + Per-Device SaaS: Free OSS / Pro $39 lifetime or $5/mo / Teams $2/device/mo / Enterprise $5/device/mo + custom |
| **Est. Users — Month 3** | 5,000 free / 50 paying |
| **Est. Users — Month 12** | 80,000 free / 2,000 Pro / 1,500 MSP devices |
| **Est. MRR — Month 3** | $250 |
| **Est. MRR — Month 12** | $13,000 |
| **Break-even Timeline** | Month 9 at ~$8K MRR |
| **LTV / CAC Ratio** | Pro 8x ($120 / $15) · MSP 18x ($7.2K / $400) |
| **Distribution Strategy** | OSS halo via GitHub + HN launch + r/Windows/r/Sysadmin/r/WSL/r/Docker + winget/Scoop/Choco + dev SEO + YouTube partnerships. MSP via content + design partner. |
| **Problem Severity** | 7/10 — painkiller for dev/format-prep, vitamin for mainstream, trust gap amplifies |
| **Demand Score** | 7/10 — broad category demand + fast-growing dev niche + open MSP wedge |
| **WTP Score** | 6/10 — consumers historically pay $25–40/yr, devs/MSPs pay readily, OSS-trained majority depresses avg |
| **Competition Difficulty** | 6/10 — mainstream crowded with distrusted incumbents (favorable), dev/MSP niches open, Storage Sense is silent floor |
| **Distribution Difficulty** | 5/10 — OSS halo + dev community strong; mainstream SEO hard; MSP needs sales motion |
| **Success Score** | **62.5%** |
| **Risk Level** | **High** — top risk: solo-dev velocity vs. v1.0 scope + Pro launch in same cycle |
| **DECISION** | **GO with monetization redesign — pull Pro tier from v2.0 to v1.0, pull MSP fleet tier from v3.0 to v2.0; ship narrower v1.0 sooner to capture trust-vacuum window.** |

---

## SECTION 11 — Next Actions

**GO path. Next 16 weeks.**

**Week 1–2 (now):**
- Trademark search: USPTO TESS + EUIPO for "Polish" in software class 9/42. Have rename candidates ready (`Lacquer`, `Sweep`, `Tidy`, `Clear`, `Buff`).
- Domain WHOIS: `polish.io` + 3 fallbacks. Buy whichever is available + cheap defensives.
- GitHub org reservation: `polish-app`, `getpolish`, `polishtools`.
- Apply to SignPath Foundation (4–8 week processing).
- Decide: Pro tier billing infra. Recommend Stripe + Paddle (Paddle handles VAT/tax for global indie SaaS).

**Week 3–6:**
- Cut v1.0 scope ruthlessly. Must-have list (revised):
  - Two-process architecture ✓ (PLAN.md §4)
  - Quarantine engine + `.pq` round-trip ✓
  - Cleanup wizard (Light/Balanced/Aggressive — defer Custom to v1.1)
  - **Pre-Format wizard** ← keep, it's the flagship wedge
  - Dev/AI categories ← keep, it's the second wedge
  - Background scanner + daily digest toast
  - Signed installer + auto-update (service-aware)
  - Pro tier license validation (offline-tolerant license file model recommended)
- Defer to v1.1: Startup app manager, Uninstaller, Treemap, Duplicate finder, `.polishprofile`, CLI, encrypted `.pq`.
- Set up landing page at provisional domain. Email capture. "Pro lifetime $29 pre-launch" tier (1,000 seats max) to fund signing + infra.

**Week 7–12:**
- Build & dogfood. Recruit 10 r/sysadmin / r/WSL beta testers via DM (start now in week 3).
- One MSP design partner conversation (no commitment, just validate v2.0 MSP roadmap).
- Telemetry-free crash reporting infra (Sentry self-hosted or GlitchTip).
- Set up Stripe + Paddle accounts; license key system (offline-tolerant).

**Week 13–16 (v1.0 launch):**
- Show HN: "Polish — open-source, quarantine-safe Windows cleaner with WSL2/Docker support".
- Reddit: r/Windows, r/Windows11, r/sysadmin, r/WSL, r/docker, r/programming.
- winget submit on launch day. Scoop bucket live. Chocolatey within 2 weeks.
- Product Hunt launch (Tuesday US for max traffic).
- Blog post: "Why we built a Windows cleaner that won't lie to you" — tie to FTC Avast ruling.

**Month 5–6:**
- Iterate on top 5 user-reported issues.
- Ship v1.1: startup mgr, uninstaller, `.polishprofile`, CLI.
- Hire first part-time helper (community manager + docs) if MRR > $5K.
- Begin MSP design partner build cycle.

**Conditional pivots if metrics miss at month 6:**
- If Pro conversion < 0.5%: re-examine paywall. Lifetime-only might out-convert subscription for this audience.
- If <20K free downloads: distribution problem, not product. Double down on dev SEO + YouTube outreach; consider one paid sponsorship in a dev channel.
- If MSP design partner says "we need RBAC + audit log day 1": that's good — accelerate v2.0 MSP build, deprioritize anti-malware module.

---

*End of PROJECT.md — generated 2026-05-28 via vskill-new-project (option 1: extract from PLAN.md + SaaS profit lens). Project-debate phase to follow.*
