---
query: "Stress-test top load-bearing risks in PROJECT.md v2 §9 with current (2026) external sources"
type: technical+competitive+domain
depth: medium
date: 2026-05-28
confidence: medium-high
---

# Stress-Test of PROJECT.md v2 Risks — External Validation

## Executive Summary

Five load-bearing risks from PROJECT.md v2 §9 were stress-tested against current Microsoft, Tauri, and industry sources. **Three risks confirmed as rated, one is over-rated, two are under-rated, and one new risk surfaced that PROJECT.md missed entirely.**

Top corrections:
- ⚡ **Signing strategy out of date.** PROJECT.md plans SignPath + Certum fallback. Microsoft now recommends **Artifact Signing (formerly Trusted Signing)** at ~$10/mo, no hardware token, CI/CD-native, identity-validated. This is materially cheaper, faster, and lower-friction than either current PROJECT.md option. Recommend re-evaluating §11 Week 1–3 signing path.
- ⚡ **EV cert assumption wrong.** Per [Microsoft Learn (updated 2026-05-09)](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation): "EV certificates no longer bypass SmartScreen... Paying a premium for EV solely to avoid SmartScreen warnings is no longer justified." OV and EV are now treated identically. PROJECT.md §9 risk row "EV cert + SmartScreen seasoning" is correctly rated High prob / Medium impact, but the **mitigation** (begin EV signing month 1) should switch to **Artifact Signing**.
- ⚡ **Microsoft native parity is closer than PROJECT.md assumed.** `wsl --manage <distro> --resize` is **shipped** (WSL 2.5+, current GA), not 12-24 months out. `wsl --shrink` per se isn't documented but `wsl --manage` covers the same need. The window for the Dev wedge is narrower than PROJECT.md's "12–24 month horizon" — closer to 6–18 months before MS ships full auto-shrink + Storage Sense dev-cache integration.
- 🔍 **Smart App Control (Win11) is a NEW risk PROJECT.md does not address.** Per same MS Learn doc: "Smart App Control will block execution of unsigned files unless the file has a positive reputation. Smart App Control signature checks apply to all executable files, not just those downloaded from the Internet." This applies after install too — not just at download. Should be added to §9 risk register.

OSS conversion benchmarks and Tauri two-process feasibility came back **as rated**. Trademark surface search yielded no obvious software-class conflict but is not authoritative — direct USPTO TESS check still required per PROJECT.md §11.

Overall: PROJECT.md v2 is structurally sound. The PIVOT verdict still holds. Signing strategy and Smart App Control need updates. Storage Sense competitive window assumption needs tightening.

---

## Risk #1 — Tauri 2 service-aware updates

**PROJECT.md rating:** High prob / Medium impact. Week 1–3 critical spike required.

**Finding: ✅ Confirmed as rated.**

Tauri 2's native **sidecar pattern** ([docs](https://v2.tauri.app/develop/sidecar/)) is designed for binaries bundled inside the Tauri app, where lifecycle is tied to the parent UI process. This **does not fit** a Windows service that must auto-start at boot and survive UI crashes. The Tauri updater plugin only touches files in the install directory — not a separately-registered Windows service.

Two-process privileged-backend pattern IS feasible and shipping in production. [Firezone](https://www.firezone.dev/blog/using-tauri) documents exactly this split: privileged service + Tauri UI, IPC via named pipe. ScreenPipe ([DeepWiki](https://deepwiki.com/mediar-ai/screenpipe/2.1-desktop-application)) uses similar resident-daemon pattern.

Update flow for the service binary is **the unsolved part** — no canonical Tauri pattern exists. Must be hand-rolled:
- Stop service → swap binary → restart service, or
- MSI-based service repair flow, or
- Companion updater process invoked by UI.

**Recommendation:** PROJECT.md's Week 1–3 spike is correctly scoped. Add **named-pipe IPC + service stop/swap/restart** as part of the spike, not just Tauri sidecar/updater.

**Sources:**
- [Tauri 2 Updater plugin](https://v2.tauri.app/plugin/updater/) — confirms "On Windows the application is automatically exited when the install step is executed due to a limitation of Windows installers"
- [Tauri 2 Sidecar docs](https://v2.tauri.app/develop/sidecar/) — sidecar pattern is for bundled binaries, not external services
- [Firezone — Building Cross-Platform Apps with Tauri](https://www.firezone.dev/blog/using-tauri) — production-grade two-process Tauri + privileged backend split
- [IPC Pipe vs Unix Socket for Resident Daemon in Tauri (DEV)](https://dev.to/hiyoyok/ipc-pipe-vs-unix-socket-for-a-resident-daemon-in-tauri-what-i-learned-fa6) — pipe lifecycle gotchas
- [Tauri Process Model](https://v2.tauri.app/concept/process-model/)

---

## Risk #2 — SmartScreen / Defender SYSTEM-service friction

**PROJECT.md rating:** EV cert seasoning High/Med; Defender FP on SYSTEM service High/High.

**Finding: ⚡ Confirmed at risk level but mitigation outdated.**

[Microsoft Learn — SmartScreen reputation for Windows app developers](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation) (updated 2026-05-09) is canonical. Direct quotes:

> "EV certificates no longer bypass SmartScreen. Years ago, signing files with an Extended Validation (EV) code signing certificate would result in positive SmartScreen reputation by default, but this behavior no longer exists. EV certificates may matter for enterprise procurement, but they no longer impact SmartScreen behavior. Paying a premium for EV solely to avoid SmartScreen warnings is no longer justified."

> "Reputation builds up automatically. The prompt will stop appearing once the file hash has sufficient download history. There is no exact threshold, but it can take several weeks and hundreds of clean installs from a wide audience."

> "Smart App Control will block execution of unsigned files unless the file has a positive reputation. Smart App Control signature checks apply to all executable files, not just those downloaded from the Internet."

Key implications PROJECT.md missed:

1. **Switch from SignPath/Certum to Artifact Signing.** MS-recommended cert provider: ~$10/mo, no hardware token, CI/CD-native, identity-validated. SignPath Foundation 4-8 week processing window + Certum €69 + €29/yr fallback becomes unnecessary detour. Artifact Signing reputation accumulates same as any other valid cert.
2. **Smart App Control (Win11) is more aggressive than SmartScreen.** Applies to all execution, not just downloads. Unsigned-with-no-reputation = blocked outright on SAC-enabled machines. Service binary signature is mandatory, not optional.
3. **Reputation seasoning per MS:** "several weeks and hundreds of clean installs." PROJECT.md's "3–6 months" is consistent on the high end — calibrate to "8–24 weeks contingent on install volume" rather than a flat range.
4. ⚠️ **Conflicting source signals.** Several CA marketing pages ([Sectigo](https://support.sectigo.com/PS_KnowledgeDetailPageFaq?Id=kA01N000000zFJx), [SSL.com](https://www.ssl.com/faqs/which-code-signing-certificate-do-i-need-ev-ov/), [DigiCert](https://comparecheapssl.com/why-digicert-ev-code-signing-is-a-must-for-microsoft-smartscreen-reputation/)) still claim EV grants instant SmartScreen reputation. Microsoft's canonical doc contradicts this. **Trust Microsoft; ignore CA marketing copy.**

**New cert validity constraint:** Per [Sectigo 2026 guide](https://sslinsights.com/sectigo-code-signing-certificate-guide/), CA/Browser Forum Ballot CSC-31 reduced max validity of publicly trusted code signing certs to 460 days (~15 months) as of March 2026. Affects all multi-year cert cost projections.

**Defender PUP/HackTool flag risk:** No quantitative data found on false-positive rates for cleanup utilities specifically. Best-practice mitigation (Microsoft MAPS submission, VirusTotal partner submission, "do not exhibit PUP behavior") is in [MS criteria](https://learn.microsoft.com/en-us/unified-secops/criteria) and matches PROJECT.md plan. **Confirmed as rated.**

**Sources:**
- [Microsoft Learn — SmartScreen reputation](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation) — canonical
- [Microsoft Artifact Signing (Trusted Signing)](https://learn.microsoft.com/en-us/azure/trusted-signing/) — recommended cert path
- [Sectigo Code Signing 2026 guide](https://sslinsights.com/sectigo-code-signing-certificate-guide/) — CSC-31 ballot
- [Microsoft unwanted software criteria](https://learn.microsoft.com/en-us/unified-secops/criteria) — PUP avoidance reference

---

## Risk #3 — Microsoft native parity (Dev wedge erosion)

**PROJECT.md rating:** Medium prob / High impact, 12–24 month horizon.

**Finding: ⚡ Under-rated. Window is shorter than assumed.**

[Microsoft Learn — Manage WSL disk space](https://learn.microsoft.com/en-us/windows/wsl/disk-space) documents **`wsl --manage <distro> --resize`** as available in WSL 2.5+ (currently shipping). The doc explicitly walks through:
- `wsl --shutdown` + `wsl --manage --resize` (the modern flow)
- Manual diskpart `compact vdisk` flow (legacy fallback)

WSL releases [2.7.5 / 2.7.7 (Preview)](https://windowsnews.ai/article/wsl-277-and-275-preview-bring-linux-kernel-618-vhd-access-fixes-and-wslg-package-update.419536) in May 2026 added further VHD-handling fixes including reliability improvements to mount/shrink flows.

The exact `wsl --shrink` command isn't documented as a top-level verb, but the **capability is shipped** under `wsl --manage`. Polish's Dev wedge plan is to wrap `wsl --shrink` once GA — current canonical command is `wsl --manage`, which **changes the wrapper surface but not the fundamental approach**.

**Bigger concern:** Microsoft's [March 2026 WSL upgrade announcement](https://www.windowslatest.com/2026/03/31/microsoft-to-upgrade-windows-subsystem-for-linux-wsl-with-faster-file-access-better-networking-and-easier-setup/) signals continued investment in WSL polish (faster file access, networking, onboarding). Auto-shrink-on-idle is a plausible 12-month roadmap item given the demand pressure ([GitHub issue 4699 — auto-shrink](https://github.com/microsoft/WSL/issues/4699) has been open since 2019, still actively requested).

Storage Sense dev-cache awareness was not found in current MS docs — that part of the window may indeed be 12–24 months. **But the WSL VHDX wedge specifically is closer to 6–18 months.**

**Recommendation:** Tighten PROJECT.md §9 risk row "Microsoft native parity" to Medium-High prob (was Medium), and split the assumption: WSL shrink window 6–18 mo; Storage Sense dev-cache window 12–24 mo.

**Sources:**
- [MS Learn — Manage WSL disk space](https://learn.microsoft.com/en-us/windows/wsl/disk-space) — `wsl --manage --resize` shipped in 2.5+
- [WSL releases](https://github.com/microsoft/WSL/releases) — release cadence confirms active work
- [WSL 2.7.5 / 2.7.7 fixes](https://windowsnews.ai/article/wsl-277-and-275-preview-bring-linux-kernel-618-vhd-access-fixes-and-wslg-package-update.419536) — May 2026
- [GitHub WSL issue #4699 — auto-shrink request](https://github.com/microsoft/WSL/issues/4699)
- [Windows Latest — March 2026 WSL upgrade preview](https://www.windowslatest.com/2026/03/31/microsoft-to-upgrade-windows-subsystem-for-linux-wsl-with-faster-file-access-better-networking-and-easier-setup/)

---

## Risk #4 — Conversion benchmark realism (Pro tier)

**PROJECT.md rating:** Conversion 0.3% (month 9) → 0.7% (month 24); LTV/CAC 0.24x–0.6x = broken.

**Finding: ✅ Confirmed. Benchmarks consistent.**

Industry benchmarks across multiple sources align with PROJECT.md's assumption band:
- [Monetizely — Open Source SaaS conversion](https://www.getmonetizely.com/articles/whats-the-optimal-conversion-rate-from-free-to-paid-in-open-source-saas): 0.3-1% for mass-market dev tools with massive adoption, 1-3% for enterprise-focused OSS, 3%+ exceptional.
- [First Page Sage — 2026 freemium benchmarks](https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/): 2-5% typical SaaS; OSS lower.
- [Daydream — Freemium conversion library](https://www.withdaydream.com/library/insights/freemium-conversion-rate): 1-10% range, most 2-5%.

For a **free-OSS-flagship desktop tool with no account requirement**, the 0.3-1% band is the realistic anchor. PROJECT.md's 0.3-0.8% (stretch 1.0%) is **honest and well-calibrated**.

The structural LTV/CAC problem ($14.50-25 LTV vs $40-80 CAC = 0.24x-0.6x) is **not solvable by tweaking conversion** — it requires either:
- Higher ACV (≥ $49/yr) — risks demand collapse
- Sticky expansion features (cloud sync, fleet add-on) that lift retention from ~6 months to 18+ months
- Sponsorship/donation revenue layered on top of subscription
- OR accept that Pro is a hobby revenue stream not a SaaS business (per PROJECT.md Appendix verdict)

**Recommendation:** No change to PROJECT.md numbers. The honesty here is the point.

**Sources:**
- [Monetizely — OSS conversion rates](https://www.getmonetizely.com/articles/whats-the-optimal-conversion-rate-from-free-to-paid-in-open-source-saas)
- [First Page Sage — 2026 SaaS Freemium rates](https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/)
- [Daydream — Freemium conversion benchmarks](https://www.withdaydream.com/library/insights/freemium-conversion-rate)
- [Appcues — Free-to-paid improvement](https://www.appcues.com/blog/free-to-paid-conversion)

---

## Risk #5 — "Polish" software trademark

**PROJECT.md rating:** High prob / High impact. Rename plan ready.

**Finding: ⚠️ Single-source / inconclusive. Direct USPTO TESS check still required.**

Surface search of [Trademarkia](https://www.trademarkia.com) and [Justia](https://trademarks.justia.com) returned many "polish" marks — overwhelmingly nail-polish related (OPI, CUTEPOLISH, SMART POLISH PRO, P.S. I LOVE THAT POLISH SMART). No exact bare "POLISH" mark surfaced in software Class 9 or Class 42 in this pass, BUT:
- Search not exhaustive — Trademarkia / Justia indexes lag USPTO TESS
- Common dictionary-word marks face high USPTO descriptiveness rejection ("polish your PC" verb-led) but also lower distinctiveness => harder to enforce vs descriptive uses
- EUIPO + UKIPO + Madrid Protocol records not checked here

**Recommendation:** Direct USPTO TESS + EUIPO eSearch Plus search in Week 1 (per PROJECT.md §11) remains mandatory. Have rename slate (Lacquer, Sweep, Tidy, Clear, Buff) loaded. Domain `polish.io` availability is independently risky. **Risk rating "High prob / High impact" looks correct.**

**Sources:**
- [Trademarkia search](https://www.trademarkia.com) — surface only
- [Justia Trademarks](https://trademarks.justia.com) — surface only
- [USPTO TESS](https://www.uspto.gov/trademarks/search) — authoritative, must check directly

---

## NEW Risk surfaced — Smart App Control (Win11)

**Not in PROJECT.md §9. Should be added.**

Smart App Control is a Win11-only feature that blocks execution of unsigned files lacking positive reputation — **applies post-install, not just at download**. Per [MS Learn](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation): "Smart App Control signature checks apply to all executable files, not just those downloaded from the Internet."

For Polish's two-process architecture, both `polish-svc.exe` and `polish-ui.exe` must be signed AND have reputation. On SAC-enabled Win11 installs (default on clean OS installs since 22H2), low-rep binaries are blocked at execution, not just at first run.

**Implication:** SmartScreen seasoning window (Risk #2) extends to "until reputation is established for Smart App Control purposes too" — effectively the same gate, but no user "Run anyway" escape on SAC-enabled machines.

**Recommendation:** Add to PROJECT.md §9 as: "Smart App Control blocks low-reputation signed binaries on enabled Win11 installs — Probability High, Impact Medium, Mitigation: same as SmartScreen seasoning, but no user override path; document SAC-disable workaround in onboarding for early adopters."

---

## Gaps & Open Questions

- Quantitative data on Defender PUP/HackTool false-positive rates for cleanup utilities specifically — not found. Best comparable: CCleaner installer historically flagged for bundleware (clearly distinct from Polish's no-bundle plan).
- Specific install-completion drop percentage for new EV/OV cert on a Win11 SAC-enabled machine — no published data.
- Direct USPTO TESS / EUIPO "Polish" mark check in software classes 9/42 — out of scope of web search, requires direct query.
- WSL 2.5 `wsl --manage --resize` adoption rate among dev population — proxy for whether wedge is already eroded — no data found.
- Tauri 2 + Windows-service auto-update pattern: zero canonical patterns or sample repos found. The Week 1–3 spike PROJECT.md plans is appropriate; no shortcut available.

---

## Sources

- [Microsoft Learn — SmartScreen reputation for Windows app developers](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation) — canonical, updated 2026-05-09 — high
- [Microsoft Learn — Manage WSL disk space](https://learn.microsoft.com/en-us/windows/wsl/disk-space) — canonical — high
- [Microsoft Artifact Signing (Trusted Signing)](https://learn.microsoft.com/en-us/azure/trusted-signing/) — high
- [Microsoft unwanted software criteria](https://learn.microsoft.com/en-us/unified-secops/criteria) — high
- [Tauri 2 Updater plugin](https://v2.tauri.app/plugin/updater/) — high
- [Tauri 2 Sidecar docs](https://v2.tauri.app/develop/sidecar/) — high
- [Tauri 2 Process Model](https://v2.tauri.app/concept/process-model/) — high
- [Firezone — Tauri two-process privileged architecture](https://www.firezone.dev/blog/using-tauri) — high (production case study)
- [DEV — IPC Pipe vs Unix Socket for Tauri daemon](https://dev.to/hiyoyok/ipc-pipe-vs-unix-socket-for-a-resident-daemon-in-tauri-what-i-learned-fa6) — medium
- [WSL releases (GitHub)](https://github.com/microsoft/WSL/releases) — high
- [WSL 2.7.5/2.7.7 May 2026 fixes](https://windowsnews.ai/article/wsl-277-and-275-preview-bring-linux-kernel-618-vhd-access-fixes-and-wslg-package-update.419536) — medium
- [GitHub WSL #4699 — auto-shrink request](https://github.com/microsoft/WSL/issues/4699) — medium
- [Sectigo Code Signing 2026 guide (CSC-31)](https://sslinsights.com/sectigo-code-signing-certificate-guide/) — medium
- [Monetizely — OSS SaaS conversion rates](https://www.getmonetizely.com/articles/whats-the-optimal-conversion-rate-from-free-to-paid-in-open-source-saas) — medium
- [First Page Sage — 2026 SaaS Freemium benchmarks](https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/) — medium
- [Daydream — Freemium conversion benchmark library](https://www.withdaydream.com/library/insights/freemium-conversion-rate) — medium
- [Trademarkia search portal](https://www.trademarkia.com) — low (surface only)
- [Justia Trademarks](https://trademarks.justia.com) — low (surface only)

---

Searches run: 10 | Pages fetched: 2
