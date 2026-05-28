---
version: v2
produced_by: project-debate (single round + rebuttal pass)
date: 2026-05-28
changes:
  - TAM corrected to Mordor figure ($1.05B / 5.8% CAGR), trend noted as flat-to-declining due to Microsoft native shipping
  - Pro tier deferred from v1.0 → v1.2; Free OSS only at v1.0 with email waitlist
  - Format Prep wizard moved from v1.0 MVP → v1.2 flagship release (own product scope)
  - Dev/AI category catalog moved from v1.0 → v1.2-v1.3, rearchitected as policy wrapper over MS-native primitives (`wsl --shrink`, Dev Drive)
  - One Dev category (npm/pnpm/cargo) kept in v1.0 as proof-of-wedge differentiator vs incumbents
  - Quarantine kept in Free tier (consensus — trust-critical, brand-killer if gated)
  - MIT desktop + Pro paywall resolved as dual-binary architecture (MIT engine library + closed-source Pro consumer)
  - Pro pricing simplified: $29 annual primary, lifetime SKU dropped (or first-500-seat capped at $79 then withdrawn)
  - MSP/Teams/Enterprise tiers struck from roadmap until $10K MRR Pro + 3 signed 6-month paid pilots + RMM marketplace listing path
  - LTV recomputed (Pro $30-55, MSP TBD), CAC recomputed (Pro $40-80, MSP $1.5-5K), founder $5K/mo opportunity cost modeled
  - Conversion projections aligned to OSS-free-flagship benchmarks (0.3-0.8%, stretch 1.0%)
  - Growth: LTT/Primeagen/Chuck sponsor rates corrected ($15-60K real, mid-tier $500-3K only), HN reach reframed (50-200K not 7M), acquisition mechanism per cohort
  - Storage Sense risk raised Low → Medium (12-24mo horizon, Dev Drive + wsl --shrink already shipped/preview); kill-switch scenario added
  - New risks added: Defender false-positive on SYSTEM-level service, EV cert + SmartScreen 3-6mo reputation seasoning, open-core enforcement under MIT, .pq corruption mid-write under power loss, Windows API churn (24H2/25H1/12), telemetry blind-spot from no opt-in collection
  - Founder Advantage rescored 6 → 4/10 (default for unknown solo dev unless prior shipped product cited)
  - Success Score recomputed 62.5% → 53% (High Risk, Major Pivot Needed per band)
  - Verdict revised: GO → **PIVOT** (descope aggressively + monetization redesign)
locked_sections:
  - Feature Engineering — Excluded features (registry / driver / RAM / FUD / bundles) — principled, well-defended, all 3 agents implicit ≥ 7
rebuttal_pass: true
---

# PROJECT.md — Polish (Windows Maintenance Suite) — v2 (post-debate)

> Validation pass: 2026-05-28 · Source plan: `PLAN.md` v1 · v1 PROJECT.md: `.vskill-data/debate/v1/PROJECT.md` · Lens: profitability-first SaaS framing **reconciled** with solo-dev execution reality after 3-agent adversarial review

---

## SECTION 1 — Executive Summary

- **Product.** Polish is a trust-first, MIT-licensed Windows maintenance suite. v1.0 ships free: cleanup + quarantine + one developer category (npm/pnpm/cargo cache) as proof-of-wedge. v1.2 ships the Format Prep wizard + paid Pro tier behind a closed-source companion binary. MSP/Enterprise is deferred indefinitely until product-market fit signals.
- **Why now.** Avast/Gen Digital FTC settlement ($16.5M, 2024) + CCleaner trust collapse opened a window. Real Windows utilities market: ~$1.05B with 5.8% CAGR ([Mordor Intelligence, Apr 2024](https://www.mordorintelligence.com/)). Adjacent endpoint mgmt market is $4.2B at 13% CAGR but cleanup is not a standalone budget line there. The window is narrowing: Microsoft shipped Dev Drive in Win11 23H2; `wsl --shrink` is in preview — native parity for dev workloads is 12–24 months out, not 3–5.
- **Biggest strength.** Three independent verifiable wedges remain after critique: (1) atomic quarantine (no competitor has it), (2) Format Prep wizard (no competitor has it), (3) one credible developer category in a GUI before Microsoft ships it natively. Plus the well-defended anti-feature list (no registry / driver / RAM / FUD / bundles) — the only locked-by-consensus section of this document.
- **Biggest risk.** Solo-dev execution. v1 PROJECT.md packed 4 products into a 16-week single-product calendar with concurrent Pro billing infrastructure. All three adversarial reviewers (Market, Technical, Business) independently flagged this as fatal. Compounded by EV cert + SmartScreen 3–6 month reputation seasoning window the original plan didn't budget for.
- **Verdict.** **PIVOT — descope to a true 16-week MVP (free OSS only), defer monetization to v1.2 (month 6–9), kill MSP/Enterprise from the v1.0–v1.3 roadmap.** This is not the "perfect SaaS app with most profitable" framing requested — the honest answer is that profit-first framing applied to PLAN.md's scope is structurally incompatible with a solo founder. Profit is reachable, but only at a slower, sequenced cadence with smaller per-tier ambitions.

---

## SECTION 2 — Problem Validation

**Core problem.** Windows machines accumulate recoverable junk (system, browser, dev caches, leftover installers, model files) that the OS does not clean automatically. Dominant fix tools are (a) distrusted (CCleaner / Gen Digital, FTC-fined, bundled adware), (b) unmaintained/intimidating (BleachBit Tk UI from 2008), or (c) too narrow (WizTree visualizes only; Storage Sense system-drive only).

**Who faces it.**
- Devs on Win+WSL2/Docker — VHDX bloat (10–100 GB), npm/pnpm/cargo build cache accumulation.
- Mainstream users on aging machines reaching disk-full state.
- IT-curious power users with mistrust of Gen Digital lineage.

**Demand evidence (replacing prior anecdotal claims).**
- Real search-volume signals (anchored to dev-niche, where wedge is winnable, not head term):
  - "clean my pc" — 165K/mo US (Ahrefs estimate, Apr 2026), KD 78 — high-competition consumer head term, *not* the winnable wedge.
  - "ccleaner alternative" — 12K/mo, KD 42 — defensive intent capture.
  - "clean wsl vhdx" / "wsl shrink disk" — combined ~1.9K/mo, KD 14 — winnable, dev-niche.
- npkill: ~7K GitHub stars (cross-platform, Mac/Linux-dominant) — proxy not direct evidence for Windows-specific dev demand. Treat as confirmatory not load-bearing.
- BleachBit: free GPLv3, multi-million download estimates — confirms cleanup category demand, also confirms ~0% paid conversion at full-featured free tier.
- *Required validation pre-launch:* 5 specific r/sysadmin / r/WSL / r/docker thread URLs with date, title, upvote count, top-comment sentiment. Outstanding; do not cite "quarterly threads" in marketing or pitch.
- *Required validation pre-launch:* CCleaner Trustpilot pull with actual sentiment breakdown (avg rating, top 3 complaint themes by % of negative reviews, sample size, pull date). Prior v1 figure of "1,035 reviews" was review count, not complaint count.

**Painkiller or vitamin?**
- **Painkiller for two narrow segments:** (1) devs hitting "disk full" on a WSL2/Docker workstation — work blocked. (2) Users about to format — "don't lose anything." Urgent + painful.
- **Vitamin for mainstream cleanup.** Annoying but not blocking. Switching cost ≈ 0. Problem severity = medium.

**Problem Severity Score: 7/10.** Confirmed by debate. Painkiller for narrow segments justifies the upper-middle band; vitamin for mainstream tempers it.

---

## SECTION 3 — Target Audience

### ICP Table (corrected)

| Attribute | Detail |
|---|---|
| Role / Title | (Tier A) SWE / SRE / DevOps on Windows + WSL2; (Tier C) Windows power user (gamer, content creator, prosumer). **Tier B (MSP/SMB IT) dropped from primary ICP** — see note below. |
| Industry | Software, SaaS, game studios, creative, prosumer |
| Company size | Tier A: individual buyer at 10–500-person co; Tier C: N/A |
| Trigger event | "Disk full" toast, planned reformat, new-machine setup, OEM bloat post-purchase, Avast/CCleaner trust event |
| Platforms | r/Windows (2.5M), r/Sysadmin (1.1M), r/Windows11 (700K), r/WSL, r/docker, Hacker News (front-page reach 50–200K w/ <5% CTR), dev.to, GitHub trending |
| Decision maker | Self (Tier A/C) |
| Current spend on standalone cleanup | Tier A: $0 (npkill, BleachBit). Tier C: $0–40/yr CCleaner Free→Pro funnel. |

**Tier B (MSP/SMB IT) explicit deferral.** v1 PROJECT.md treated MSPs as a primary buyer for a $2/device/mo standalone-cleanup SaaS. All three reviewers independently flagged this as structurally wrong:
- MSPs do not have standalone cleanup budget. RMM suites (NinjaOne $1.50–3.75/device/mo; Atera $129–209/tech/mo) bundle cleanup as one of 40+ features. There is no buyer with cleanup-only authority.
- Selling standalone B2B from a solo OSS shop requires marketplace integration with NinjaOne / Atera / Kaseya / ConnectWise — not a price tag.
- Loaded MSP CAC is $1,500–5,000 (sales engineering + security review + procurement), not $400.

**MSP re-entry gate.** Revisit only after: (a) $10K MRR on Pro tier, (b) 3 signed 6-month paid pilots with named MSPs, (c) listing accepted in at least one of NinjaOne / Atera / Kaseya / ConnectWise marketplace, (d) one full-time backend engineer hired.

### User Segments

| Tier | Profile | Budget | Polish v1 stance |
|---|---|---|---|
| Beginners (Tier C) | Windows home user, friend installs it, wants disk back, never touches Settings | $0 (free OSS) | Free tier, no nag, no upsell |
| Professionals (Tier A) | Dev on Win11 + WSL2 + Docker, wants WSL/Docker/cache cleanup + transparency + scriptable | $29/yr Pro (when v1.2 ships) | Free at v1.0 (one dev category); Pro at v1.2 (full dev/AI + Format Prep + CLI) |
| ~~MSP/SMB IT~~ | DEFERRED — see re-entry gate above | — | Not addressed v1.0–v1.3 |

- **Demand Score: 6/10** — Cleanup category genuinely large; dev-niche is the winnable subset; Storage Sense compresses the window over 12–24 months.
- **Willingness to Pay Score: 5/10** — Consumers historically pay $25–40/yr for CCleaner-class, but OSS-trained majority depresses average; Pro feature lock unclear if quarantine + cleanup are free.

---

## SECTION 4 — Competitor Intelligence

(Pricing data current as of May 2026 web research; complaint themes require structured re-pull pre-launch.)

| Attribute | CCleaner | BleachBit | Glary | IObit ASC | Wise Care 365 | PrivaZer | Storage Sense |
|---|---|---|---|---|---|---|---|
| Pricing | Free / $29.95 Pro / $39.95 Plus / $64.95 Bundle | Free, GPLv3 | Free / $39.95/yr 3 PC | Free / $16.77/yr | Free / $29.96 one-time, 3 PC | Free / ~$49 Pro | Free (OS) |
| Trustpilot/G2 | TP avg ~4.0 (1,035 reviews — pull pending verification of complaint % breakdown); G2 4.5 | n/a (OSS) | Limited public reviews | G2 4.3 | G2 limited; Capterra 4.4 | G2 4.5 small-N | n/a (OS) |
| Documented trust events | Avast FTC $16.5M ruling (Feb 2024); 2017 supply-chain compromise; v7 forced auto-renew complaints | None | Bundled-offer installer history | Historic bundled-offer events | Bundled-offer installer history | None | n/a |
| Weakness vs Polish wedge | Trust + bundled offers | UX 2008-era, no scheduling/quarantine/notif | UX dated, snake-oil features | Snake-oil features (RAM/driver) | Bundled offers, snake-oil | UI dated, novice-hostile | Only system drive; misses dev caches |

**Adjacent / non-direct:**

| Tool | Pricing | Role | Threat to Polish |
|---|---|---|---|
| WizTree | Free / $25 commercial one-time | Visualizer | Complementary; could be acquired/integrated v1.x+ |
| npkill / kondo / dust | Free CLI | Dev cache cleaners | Polish must absorb their UX; not direct paid competition |
| NinjaOne / Atera / Kaseya | $1.50–$3.75/device or $129+/tech | RMM suites; cleanup bundled | NOT cleanup competitors. Channel partners (marketplace) if Polish ever ships MSP. |

**The real moat we underweighted in v1:** EV code-signing cert + SmartScreen reputation. CCleaner, Wise, Glary all have multi-year signing reputation. New entrants face 3–6 month SmartScreen seasoning during which install-completion rates run 30–60% lower. This is the dominant *market entry tax* — not feature breadth.

**Competition Difficulty Score: 6/10** (raised from prior 6 inverted to 4 in score; consensus that EV/SmartScreen moat is real, kept honest).

---

## SECTION 5 — Feature Engineering

### Competitor Feature Matrix

(Unchanged from v1 — feature mapping was the strongest part of the document. See `.vskill-data/debate/v1/PROJECT.md` §5 for full matrix. Anti-feature exclusion list is **locked** by consensus across all three agents.)

### MVP Feature Set — v1.0 (revised, 3 features)

| # | Feature | Type | Rationale |
|---|---|---|---|
| 1 | **Quarantine-first cleanup engine + `.pq` bundle + manifest** — Light/Balanced modes only | Whitespace | Trust differentiator. Stays in Free tier forever (consensus: gating quarantine is brand-killer; Recycle Bin is free in Windows). |
| 2 | **One Dev category (npm + pnpm + cargo build cache)** — *not* WSL2/Docker VHDX, *not* AI models | Whitespace (narrow) | Proof-of-wedge against generic cleaners. WSL2 VHDX + Docker VHDX + LM Studio/Ollama destructive paths and Microsoft API risk deferred to v1.2–v1.3 with safer wrapper architecture. |
| 3 | **Trust-first delivery** — MIT OSS, signed binary (SignPath or Certum fallback), zero default telemetry, no bundled offers, no nag | Simplification recast as wedge | Direct contrast with CCleaner / Wise / Glary. EV cert + SmartScreen warm-up gate added to timeline (8 weeks). |

**Dropped from v1.0 MVP** (consensus 3/3 agents):
- Format Prep wizard → moves to **v1.2 (month 6–9)** as a flagship release. Snapshot/backup/verify/restore-plan = multi-week subsystems each. Was previously cited as a wedge in v1; remains the wedge, but cannot ship alongside a SYSTEM-level service in 16 weeks.
- WSL2 VHDX compaction, Docker VHDX compaction, LM Studio/Ollama audit → v1.2/v1.3 as **policy wrappers over MS-native primitives** (`wsl --shrink` when GA; `Optimize-VHD`). Hard deadline gate: pivot if Microsoft ships GA before our build.
- Background scanner + daily-digest toast → defer to v1.1; ship manual scan only in v1.0.
- Pro tier infrastructure (license validation, Stripe/Paddle, refund flow) → v1.2.

### MVP for v1.2 (month 6–9, when Pro tier launches)

| # | Feature | Tier |
|---|---|---|
| 4 | **Format Prep wizard (7-step)** | **Pro paid** ($29/yr) |
| 5 | Full Dev/AI catalog (WSL2 VHDX wrapper, Docker VHDX, LM Studio/Ollama models, IDE caches) | **Pro paid** |
| 6 | Encrypted `.pq` bundles | **Pro paid** |
| 7 | CLI (`polish`) | **Pro paid** |
| 8 | `.polishprofile` import/export | Free |
| 9 | Idle-aware background scanner + daily digest toast (DND, snooze, threshold-gated) | Free |
| 10 | Aggressive mode + Custom mode | Free (aggressive) / Pro (custom profiles) |
| 11 | Startup app manager + Uninstaller (table-stakes for mainstream segment) | Free |

### Explicitly Excluded (LOCKED — consensus across all 3 reviewers)

Unchanged from v1: registry cleaner, driver updater, RAM optimizer / Game Booster, "N threats found" FUD, bundled third-party offers, self-re-enable on update, mobile companion.

### Open-Core Enforcement Architecture (resolved)

**Resolution:** Pro features ship in a **separate closed-source consumer binary** (`polish-pro.exe`) that links the MIT-licensed `polish-engine` library + service. The OSS desktop UI (`polish-ui.exe`) and engine remain MIT; Pro features live in proprietary code that consumes the engine. This is:
- Legally clean (MIT permits linking from proprietary).
- Technically clear (separate binary, separate signing, separate update channel).
- Pirateable (~30% community fork rate is the realistic acceptance) but not trivially.

Alternative (rejected): license-server runtime check — any GPL/MIT fork can rip out in 30 minutes; gives a worse experience for legitimate users.

---

## SECTION 6 — Market Gap & Differentiation

**Wedge statement (revised, less BleachBit overlap):**

> Polish is the only Windows cleaner with first-class **dev-cache and AI-model cleanup**, **atomic quarantine**, and (in v1.2) a **guided Format Prep wizard** — built for Windows developers who can't get this from BleachBit (Linux-leaning, no dev categories, no Format Prep), CCleaner (distrusted, no dev categories, no Format Prep), or Storage Sense (system drive only, no dev categories yet).

What got dropped: "open source" and "trust-first" as primary differentiators. BleachBit already owns OSS+trust; "trust-first" is necessary but no longer a wedge. Lead with dev/AI + Format Prep + quarantine.

**Differentiation strategy:** Audience focus (Windows devs) + UX simplicity + categorical whitespace (Format Prep, AI models) — not price, not OSS-vs-OSS.

---

## SECTION 7 — Growth & Distribution Plan

(Revised with correct reach figures and sponsor rates.)

| Channel | Realistic reach | Time to results | Est. cost | ICP fit |
|---|---|---|---|---|
| **r/Windows / r/Sysadmin / r/WSL / r/Docker — Show HN/Reddit launch** | 50–200K Reddit; <5% CTR | 1–4 weeks | $0 | High (Tier A) |
| **GitHub Releases + Trending** | Open ecosystem, OSS halo | 4–12 weeks | $0 | High (Tier A) |
| **Hacker News launch (Show HN)** | Front-page: 50–200K impressions, <5% click-through, ~2K–10K installs if successful | 1 day window | $0 | High (Tier A) |
| **dev.to / Hashnode / personal blog (Tauri service-update post, quarantine architecture post)** | Long-tail dev SEO | 12–24 weeks | $0 | High (Tier A) |
| **Product Hunt** | 5M monthly visits; realistic launch traffic 5K–20K | 1 day + tail | $0 | Med |
| **winget / Scoop / Choco listings** | Power-user discovery only after they've heard of you | 4 weeks | $0 | High (discovery channel, not awareness) |
| **SEO content: long-tail dev queries ("clean wsl vhdx", "clean docker disk windows")** | 1.9K/mo combined, KD 14 — winnable | 6–12 months | $0 (founder time) | High |
| **Mid-tier dev YouTubers (10K–100K subs): NetworkChuck-adjacent, ThePrimeTime guests, Fireship-style** | 50K–500K per video | 8–20 weeks | $500–3K integration sponsorship | High |
| **Top-tier YouTube (LTT, Primeagen, NetworkChuck)** | 5–15M reach | n/a | $15K–60K floor; NOT pursued pre-Series-A | High but unaffordable |
| **Twitter/X dev community replies to disk-full tweets** | 200K dev community | Ongoing | $0 | High |
| **Paid: Google Ads "ccleaner alternative" + "clean wsl"** | Defensive intent | 1–4 weeks | $1–3 CPC, $1–2K/mo if scaled | Med |

**Blended CAC estimate (revised honest):**
- Free tier: ~$0 organic for first ~5K–20K (HN/Reddit halo).
- Pro tier: **$40–80 blended** (content + Reddit + Google Ads, founder time at $50/hr modeled).
- MSP (deferred): $1,500–5,000 loaded.

**Distribution Difficulty Score: 6/10** (raised from 5; honest about sponsor floor + SmartScreen reputation lag).

**Path to first 100 paying Pro users (when v1.2 ships, month 6–9):**
1. v1.0 ships free, builds 5K–10K free user base over months 1–6 (SmartScreen reputation seasons here).
2. v1.2 launches Pro on email list (~20% open, ~3% click, ~10% of clicks convert) — yields first 10–30 Pro buyers from waitlist.
3. Concurrent Show HN re-launch for Pro / Format Prep — yields next 50–100.
4. Year-1 ceiling: 200–500 paying Pro users (honest comp set).

---

## SECTION 8 — Revenue Model & Projections (rebuilt)

### Pricing Tiers (revised)

| Tier | Price | Features | Target |
|---|---|---|---|
| **Polish Free (MIT)** | $0 forever | Light/Balanced cleanup, atomic quarantine, npm/pnpm/cargo dev category, signed binary, manual scan (v1.0); + startup mgr / uninstaller / scheduler / Aggressive mode / `.polishprofile` (v1.2+) | Tier A trial, Tier C mainstream |
| **Polish Pro** | **$29/yr** (primary). Optional first-500-seat launch promo: **$79 lifetime-of-v1.x-major** (then withdrawn). Lifetime past v1.x = not committed. | Format Prep wizard, full Dev/AI catalog (WSL2/Docker/LM Studio/Ollama), encrypted `.pq`, CLI, Custom profile mode, cloud backup of profiles, priority support | Tier A devs |
| ~~Polish Teams (SaaS)~~ | DEFERRED | — | Not v1.0–v1.3 |
| ~~Polish Enterprise~~ | DEFERRED | — | Not v1.0–v1.3 |

**Lifetime decision (contested in debate, partial consensus):** Capped lifetime promo at v1.2 launch (first 500 seats, $79, "lifetime of v1.x major version") to fund signing infrastructure and validate willingness-to-pay. After 500 seats: lifetime SKU withdrawn, annual-only. Resolves Strategist's pricing-trap concern + TA's perpetual-maintenance liability concern.

### Financial Projections (rebuilt with honest inputs)

Assumptions:
- v1.0 launch month 4 (16-week build, free OSS only, no monetization).
- v1.2 launch month 9 (Pro tier ships).
- SmartScreen reputation seasoning ~months 4–10.
- Pro conversion from free: 0.3% month 9 → 0.7% month 24 (OSS-free-flagship benchmark range).
- Avg Pro retention: 6 months (revised from "24 months" assertion in v1).
- Founder opportunity cost: $5K/mo modeled into break-even.

| Milestone | Free actives | Paying Pro | Pro MRR | Lifetime cash bookings (cumulative) |
|---|---|---|---|---|
| Month 3 (pre-v1.0) | 0 | 0 | $0 | $0 |
| Month 6 (v1.0 free out 2 months) | 3,000–8,000 | 0 (no Pro yet) | $0 | $0 |
| Month 9 (v1.2 Pro launches) | 8,000–15,000 | 25–50 | $60–150 | $5K–15K (lifetime promo seats sold) |
| Month 12 | 15,000–30,000 | 100–250 | $250–600 | $15K–30K (promo capped at $39.5K = 500 × $79) |
| Month 18 | 30,000–60,000 | 300–700 | $750–1,750 | $39.5K (cap hit) |
| Month 24 | 50,000–100,000 | 500–1,200 | $1,250–3,000 | $39.5K (no further lifetime) |

**ARR estimate at month 24: $15K–36K recurring + $39.5K cumulative lifetime cash = run-rate $54K–75K cash basis.** Far below v1's $888K ARR claim. Comparable OSS Windows utility outcomes: Espanso $0 ARR, AutoHotkey $0, Rufus $0, ShareX $0 (donation models); Beyond Compare ~$8M ARR but is 25 years old, multi-platform, closed-source from day 1.

### Unit Economics (rebuilt)

- **LTV (Pro).** $29/yr × 0.5 years avg retention = **$14.50** (annual sub paid once, ~50% renew). With OSS-trust narrative + sticky utility, optimistic = $25.
- **CAC (Pro).** $40–80 blended (founder time + content + minor paid).
- **LTV/CAC (Pro).** $14.50 / $60 = **0.24x** (broken). $25 / $40 = **0.6x** (still below 1x viable threshold).
- **Implication.** Pro tier as currently designed is **not self-sustaining on subscription alone**. The $39.5K lifetime-promo cash + low Pro retention means the business is one-shot transactional, not SaaS. Founder must accept either: (a) Pro is a hobby revenue stream, not a SaaS business; (b) Pro tier needs additional gated features that drive sustained value (cloud backup, AI assistant, fleet add-on); or (c) move to higher ACV ($79/yr) and accept lower conversion.

### Break-Even Math (honest)

- **Cash costs.** SignPath if approved $0 / Certum $69 upfront + $29/yr; hosting $50–200/mo; infra (Stripe/Paddle 3–5% of revenue); landing page $0–20/mo.
- **Founder opportunity cost.** $5K/mo modeled (conservative; market rate is higher).
- **Break-even on cash only.** Month 18–24 at ~$2K MRR + $20K lifetime cash trickle.
- **Break-even including founder opportunity cost.** Likely never on Pro alone. Requires either MSP tier (deferred) or expansion features.
- **Required runway.** $60K–90K self-funded for 12–18 months.

---

## SECTION 9 — Risk Matrix (expanded)

| Risk | Type | Probability | Impact | Mitigation |
|---|---|---|---|---|
| Solo-dev velocity insufficient even for descoped v1.0 (Cleanup + Quarantine + 1 dev category) | Execution | High | High | 16-week calendar with weekly internal milestone reviews; cut Aggressive mode + Custom + scanner to v1.1 if month-3 review behind. |
| **Defender / 3rd-party AV flags polish-svc.exe as PUP/HackTool** (NEW) | Reputation/Trust | **High** | **High** | Pre-launch: submit to Microsoft MAPS, VirusTotal partner submissions, request whitelist from Defender + major AVs 6+ weeks before public release. Pre-stage a "see this is signed, here's the SHA + signing chain" doc. |
| **EV cert + SmartScreen reputation seasoning (3–6 months install friction)** (NEW) | Distribution/Execution | **High** | **Medium** | Begin signing on dev builds month 1, submit to MS Defender AV trust early, README "Unblock" guide, no Pro launch until reputation seasoned (~month 6+). |
| **Microsoft ships native parity for Dev/AI categories** (`wsl --shrink` GA, Dev Drive expanded, Storage Sense dev-aware) (UPGRADED Low→Medium) | Competition | **Medium** | **High** | Architect Dev/AI catalog as wrapper over MS-native commands where available, custom only where not. Build kill-switch scenario: pivot Polish to Format Prep + general cleanup if dev wedge collapses. |
| **MIT desktop + Pro features = open-core enforcement broken** (NEW) | Business/IP | High if Pro ships in same binary | Medium (revenue erosion, not fatal) | Pro features in separate proprietary `polish-pro.exe` consuming MIT engine as library. Accept ~30% community-fork rate as cost of OSS halo. |
| Quarantine bug → user data loss → trust collapse | Execution + Trust | Medium | Fatal | **Specific failure modes addressed**: 6-week dogfood on 3 dev machines covering cross-volume restore, NTFS reparse/junctions/symlinks, ACL preservation, files-in-use, .pq corruption under simulated power-loss (kill -9 mid-write), 200GB+ bundle round-trip. Independent security review before v1.0. |
| **`.pq` corruption mid-write under power loss / 200GB bundle pathology** (NEW) | Execution | Medium | High | Segmented bundle architecture (per-category sub-archives), atomic rename only after sub-archive write+verify, journal file for in-flight ops, BLAKE3 verify-on-restore not verify-on-write. |
| **Windows API churn (24H2 / 25H1 / 12 toast/AUMID/Storage API breakage)** (NEW) | Dependency | Medium | Medium | Vendor `windows` crate at known-good version; test matrix includes latest Insider build; conventional update review cadence per Windows release. |
| Tauri 2 service-aware update pattern breaks | Technical | **High** (upgraded from Medium per TA rebuttal) | Medium | **Week 1–3 spike**: build minimal Tauri service-update pattern end-to-end on throwaway binary. If it doesn't work cleanly: kill the two-process architecture or accept manual updates. Single highest technical risk; answered before week 4 or project pivots. |
| SignPath Foundation rejects application | Execution | Medium | High | Certum Open Source fallback (~€69 upfront + €29/yr); plan for KMS-only cloud-signing CI plumbing (1–2 weeks). Certum binaries do not inherit SmartScreen rep — new-cert friction 3–6 months. |
| **Open-core under MIT enables fork-and-strip** (NEW) | Business | High | Medium | See architecture resolution §5. Accept ~30% piracy. |
| Avast/Gen Digital rebrand recaptures trust narrative | Competition | Medium | High | Move fast on launch; tie launch press to FTC ruling + Polish transparency; brand "Polish" as the post-CCleaner cleaner. |
| Trademark conflict on "Polish" in software class | Regulatory | High | High | USPTO TESS + EUIPO search week 1; rename plan ready (`Lacquer`, `Sweep`, `Tidy`, `Clear`, `Buff`). |
| MSP/Teams customer acquisition impossible at solo-dev scale | Market | High (if pursued) | Fatal to that line | DEFERRED entirely. Re-entry gate explicit in §3. |
| **Telemetry blind-spot — no opt-in collection at v1.0 = invisible long-tail failures** (NEW) | Execution | Medium | Medium | Ship opt-in Sentry / GlitchTip in v1.0 (2-week subsystem, was unscoped in v1). "Send anonymous crash reports" opt-in toggle in onboarding. |
| Free tier ships flagship Format Prep + Dev catalog = no Pro upgrade trigger (RESOLVED) | Business | n/a | n/a | Format Prep + full Dev/AI catalog gated to Pro in v1.2. Quarantine + npm/pnpm/cargo stays Free (trust + proof-of-wedge). |
| OEM bloat / driver false positives → reputation hit | Execution | Medium | Medium | Bloat removal Aggressive-only, per-item confirm, never auto. Manual OEM-list review per Win release. |
| Founder runway runs out before v1.2 | Execution / Founder | Medium-High | Fatal | Disclose runway in months. Required $60–90K. If <$60K available, do not start; if $60–90K available, accept 12–18 month build window. |

---

## SECTION 10 — Success Probability Score (recomputed)

| Dimension | Weight | Score (1–10) | Weighted | Δ vs v1 |
|---|---|---|---|---|
| Problem Strength | 20% | 7 | 1.40 | 0 |
| Market Demand | 20% | 6 | 1.20 | −0.20 (Storage Sense compression) |
| Competition Difficulty (inverted) | 15% | 4 | 0.60 | 0 (kept; EV moat real) |
| Monetization Potential | 15% | 5 | 0.75 | −0.30 (lifetime cannibalization, free flagship) |
| Distribution Ease | 15% | 5 | 0.75 | −0.15 (SmartScreen, sponsor reality) |
| Founder Advantage | 15% | 4 | 0.60 | −0.30 (solo dev, no shipped product cited) |
| **TOTAL** | **100%** | — | **5.30 → 53%** | **−9.5%** |

**Score interpretation: 53% → High risk. Major pivot needed** (band: 41–55%).

This is honest. The score *increases* only if the founder cites: prior shipped product, established Windows-dev audience, MSP relationships, or domain expertise — none of which are documented in PROJECT.md or PLAN.md.

---

## FINAL DECISION TABLE (v2)

| Category | Details |
|---|---|
| **Product Idea** | Trust-first, MIT-licensed Windows maintenance suite. v1.0 = Free OSS cleanup + atomic quarantine + npm/pnpm/cargo. v1.2 = Pro tier (Format Prep + Dev/AI + encrypted .pq + CLI). MSP/Enterprise deferred indefinitely. |
| **Core Problem** | Windows recoverable junk; distrusted incumbents (Gen Digital baggage); dev-aware (WSL2/Docker/AI) cleanup not solved in GUI. |
| **Target Audience** | Tier A devs (primary) + Tier C power users (secondary). Tier B MSP deferred. |
| **Key Features (v1.0 MVP)** | (1) Quarantine + `.pq` + manifest, (2) npm/pnpm/cargo dev category, (3) Trust-first delivery (MIT + signing + zero telemetry) |
| **Key Features (v1.2 Pro)** | Format Prep wizard, full Dev/AI catalog, encrypted .pq, CLI, Custom mode |
| **Unique Advantage** | Atomic quarantine + Format Prep + first-class dev/AI cleanup before Microsoft ships native parity (12–24mo window) |
| **Top Competitors** | CCleaner ($29.95/yr), BleachBit (free GPL), Wise Care 365 ($29.96 one-time), Glary ($39.95/yr), IObit ASC ($16.77/yr), PrivaZer ($49 Pro), WizTree ($25 commercial), Storage Sense (free OS) — RMM suites are channel partners, not competitors |
| **Revenue Model** | Freemium + capped lifetime promo + annual sub. Free MIT / Pro $29/yr (primary) / $79 lifetime (capped 500 seats then withdrawn) |
| **Est. Free Users — Month 12** | 15,000–30,000 |
| **Est. Paying Pro — Month 12** | 100–250 |
| **Est. MRR — Month 12** | $250–600 + $15–30K cumulative lifetime cash |
| **Est. MRR — Month 24** | $1,250–3,000 + ~$39.5K total lifetime cash (cap hit) |
| **Break-even Timeline** | Month 18–24 cash basis (Pro alone). Never on Pro alone if founder opportunity cost loaded. |
| **LTV / CAC Ratio** | Pro 0.24x–0.6x ($14.50–25 / $40–80) — **below viable threshold; needs feature expansion or higher ACV** |
| **Distribution Strategy** | OSS halo via GitHub + Show HN (50–200K reach not 7M) + r/Windows/Sysadmin/WSL/Docker + winget/Scoop/Choco + dev SEO long-tail + mid-tier YouTube ($500–3K integrations, not top-tier) |
| **Problem Severity** | 7/10 — painkiller for dev/format-prep, vitamin for mainstream |
| **Demand Score** | 6/10 — broad category + dev niche; Storage Sense compresses window |
| **WTP Score** | 5/10 — free OSS desktop cannibalizes Pro; conversion benchmarks tight |
| **Competition Difficulty** | 6/10 — incumbents distrusted but EV/SmartScreen moat is real entry tax |
| **Distribution Difficulty** | 6/10 — OSS halo helps but SmartScreen + sponsor reality limit speed |
| **Success Score** | **53%** |
| **Risk Level** | **High** — top risks: solo-dev velocity, Defender FP on SYSTEM service, Microsoft native parity, founder runway |
| **DECISION** | **PIVOT — descope v1.0 to free OSS only (Cleanup + Quarantine + 1 dev category), defer Pro to v1.2, defer MSP indefinitely, model honest unit economics, accept this is a slow OSS product with modest paid upside, NOT a "most profitable SaaS" play at solo-dev scale.** |

---

## SECTION 11 — Next Actions (revised)

**PIVOT path. Next 24 weeks (extended from 16).**

**Week 1–3 (founder survival check + critical spike):**
- Trademark search: USPTO TESS + EUIPO for "Polish" in software class 9/42. Rename candidates ready: Lacquer, Sweep, Tidy, Clear, Buff.
- Domain WHOIS + 3 fallbacks.
- GitHub org reservation.
- **Apply to SignPath Foundation immediately (4–8 week processing).** Have Certum Open Source ready as fallback (€69 upfront + €29/yr + 1–2 weeks CI plumbing).
- **CRITICAL SPIKE: Build minimal Tauri service-aware update pattern end-to-end on a throwaway binary.** Single highest technical unknown per debate consensus. If it doesn't work by end of week 3: kill two-process arch OR accept manual updates OR pivot the entire project.
- **Founder runway disclosure.** Self-honest: do you have 12–18 months of $60–90K runway? If not, do not start; if yes, proceed.

**Week 4–8 (signing + foundation):**
- Quarantine engine + `.pq` round-trip — start dogfooding on 3 dev machines.
- npm/pnpm/cargo cache scanner (the one Dev category).
- Light + Balanced cleanup wizard.
- Begin signing dev builds for SmartScreen reputation seasoning.
- Submit Microsoft MAPS + VirusTotal partner pre-flag.

**Week 9–14 (hardening + dogfood):**
- Quarantine failure modes: cross-volume MoveFile fallback under low free space, NTFS reparse points/junctions/symlinks, ACL preservation, files-in-use behavior, .pq corruption under simulated power-loss, 50GB+ bundle round-trip.
- Recruit 25 r/sysadmin / r/WSL / r/docker beta testers via DM (start week 8).
- Telemetry/crash reporting subsystem (opt-in Sentry/GlitchTip).
- Independent security review.

**Week 15–20 (v1.0 launch prep):**
- Landing page + email waitlist (no Pro pricing yet).
- Show HN draft + Reddit launch posts.
- winget manifest + Scoop bucket ready.

**Week 21–24 (v1.0 launch):**
- Show HN: "Polish — open-source, quarantine-safe Windows cleaner".
- Reddit cross-post: r/Windows, r/Windows11, r/sysadmin, r/WSL, r/docker, r/programming.
- winget submit day 1. Product Hunt (Tuesday US).
- Blog post: "Why we built a Windows cleaner that won't lie to you" — tie to FTC Avast ruling.

**Month 6–9 (v1.1 → v1.2 Pro launch):**
- v1.1 ships: Aggressive mode, Custom mode, startup mgr, uninstaller, `.polishprofile`, background scanner.
- v1.2 ships: **Pro tier launches**.
  - Stripe + Paddle integration (4 weeks).
  - License validation (offline-tolerant file model; 2 weeks).
  - Format Prep wizard (8–12 weeks).
  - Full Dev/AI catalog with safer wrappers (6 weeks).
  - First-500-seat $79 lifetime promo to fund + validate WTP. Withdraw after cap.
  - Annual $29/yr ongoing.

**Conditional pivots:**
- If Tauri service-update spike fails at week 3 → either revert to single-process architecture (accept no SYSTEM-level features in v1.0; defer scheduled scans + locked-file access to v2.0) OR accept manual updates as the model.
- If Microsoft announces `wsl --shrink` GA before our v1.2 → kill Dev/AI wedge, pivot Polish to Format Prep + general cleanup. Re-pitch as productivity tool not dev tool.
- If SmartScreen reputation hasn't seasoned by month 6 → delay Pro launch to month 9–12; do not ship paid into high-friction install funnel.
- If Pro month-3 conversion <0.3% → paywall failure; re-gate (move 1 more feature to Pro) OR drop Pro and pivot to donations/sponsorships model.
- If founder runway depletes before v1.2 → do not ship Pro half-baked; pause monetization, keep OSS alive at reduced cadence.
- If 3 paid MSP pilots materialize organically by month 18 → re-evaluate Teams tier with backend engineer hire as gate.

---

## Appendix — Honest Verdict Statement (for the founder)

The user request was "perfect SaaS app with most profitable." That framing is **structurally incompatible with PLAN.md's scope at solo-dev scale** — all three adversarial reviewers converged on this independently. The honest truth surfaced by the debate:

1. **There is no Windows OSS desktop cleaner that has reached $1M ARR by a solo founder.** Espanso, Rufus, AutoHotkey, ShareX, BleachBit — all $0 ARR. The category structurally does not produce SaaS unicorns at solo scale.
2. **The closest comp that monetized at all (Stardock Fences/Start11, JetBrains Toolbox) had teams, multi-platform, or 25-year reputation moats.**
3. **The real opportunity is a labor-of-love OSS product with modest paid upside** — $30–75K cash basis run-rate by year 2 is a credible target; $888K ARR is not.
4. **Path to "perfect SaaS / most profitable" requires either: (a) accepting a 5+ year build to that ARR ceiling, or (b) raising capital + hiring + building the MSP/Enterprise tier seriously, or (c) pivoting the entire concept toward a different category where solo-OSS-to-SaaS is documented (e.g., a developer tool with stronger network effects).**

The PROJECT.md v2 above is the credible plan. The "perfect profitable SaaS" version requires the founder to commit to (b) — capital + team — and that decision is not made in this document.

---

*End of PROJECT.md v2 — post-debate, 2026-05-28.*
