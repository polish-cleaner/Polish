# Design Documentation — Polish (Windows Maintenance Suite)

Generated: 2026-05-28
Version: 1.0
Variant: **calm-modern**

---

## Design

**Design source mapping**

- This document lives at `.vskill-data/design/v1/DESIGN.md`. Project source: `.vskill-data/debate/v2/PROJECT.md` (v2 post-debate plan, pointed to by `.vskill-data/index.json.debate.latest`).
- Variant `calm-modern` was selected by the user after three variants were compared (`fluent-native`, `calm-craft`, `terminal-mono`) and refined once for modern-clean execution.

**Scope mapping (v1.0 MVP features → design coverage)**

| PROJECT.md v1.0 MVP feature | Design coverage in v1 |
|---|---|
| Quarantine-first cleanup engine + `.pq` bundle + manifest | `quarantine` page, `dashboard` recovery surface, list-row pattern, status chips |
| One Dev category (npm + pnpm + cargo) | `scan-results` page, list-row + path + size pattern, status chips |
| Trust-first delivery (MIT, signed binary, zero telemetry, no nag) | Tone of voice; no FUD banners; non-modal scan UI; `settings` page exposes telemetry-off state |
| v1.2 Format Prep wizard (designed-for, not implemented v1.0) | `format-prep-wizard` page included to lock visual language early |
| Onboarding / first-run signing trust narrative | `onboarding` page |
| Settings (profiles, scheduling, telemetry) | `settings` page |

**Out of scope for design v1**

- WSL2 / Docker VHDX compaction UI (v1.2 — separate Dev/AI catalog screen)
- Pro tier paywall / billing UI (v1.2)
- CLI surface (`polish` command) — separate from GUI design
- MSP/Enterprise admin console (deferred indefinitely per PROJECT.md §3)

**Token mapping → project constraints**

- **Forest green `#1F4D3B`** as brand: deliberate anti-CCleaner (their blue), anti-Avast (their orange). Reinforces "Polish ≠ noisy security-vendor". Reads as natural, considered, slow-software — matches trust-first narrative.
- **Cream surface `#FBFAF7`** (not pure white): warmer than every competitor, signals "not a system utility, not corporate SaaS". Distinctive at-a-glance.
- **Instrument Serif italic** as identity moment: used sparingly (display headings, stat unit suffixes, "Polish<em>.</em>" wordmark). One typographic gesture differentiates from every utility-app sans-only competitor.
- **Geist sans / Geist Mono**: modern, neutral, premium feel; mono used heavily for paths, sizes, command hints (developer-tool affordance).
- **No FUD color use**: error red `#9A2A2A` is muted (oxblood), used for destructive confirmation only — never on first-load. Warning `#B27017` (amber) used for "review", never as scan-results status.

**Implementation handoff notes (must preserve)**

1. **Tokens only, no hex literals in prototype HTML.** Every color/spacing/radius/shadow MUST reference a CSS variable from `design-tokens.json`. Builder G5 will fail on hex literals.
2. **Italic serif is a feature, not decoration.** When implementing in Tauri WebView, embed Instrument Serif via `<link>` (Google Fonts) or self-host. Without the serif, the design loses identity.
3. **No FUD typography.** Headlines stay in display serif; do not bold-shout. List-rows do not get scary icons. Status chips use neutral `dot` + lowercase text (`safe`, `review`, `excluded`), never `THREAT!` or `DANGER!`.
4. **Focus rings are brand-tinted** (`#EAF1ED`), not system blue. Keep WCAG AA contrast.
5. **Density**: lists at 12-14px padding; not crammed, not airy-marketing. Match Linear / Things 3 density, not Outlook / Teams density.

---

## Overview

- **Project**: Polish
- **Type**: desktop_app (Tauri 2 webview)
- **Style**: Custom (calm-modern — warm-neutral premium)
- **Theme**: light (dark deferred to v1.1 patch)
- **Accessibility**: WCAG AA
- **Target users**: Tier A devs (primary) + Tier C power users (secondary)

---

## Design Tokens

See `design-tokens.json` for the canonical machine-readable values. Highlights:

### Colors (semantic roles)

| Role | Token | Hex | Usage |
|---|---|---|---|
| Brand primary | `--brand-700` | `#1F4D3B` | Primary buttons, links, focus, active nav |
| Brand hover | `--brand-900` | `#143B2D` | Hover state for primary actions |
| Brand emphasis | `--brand-500` | `#2D6A52` | Italic display ink; inline emphasis |
| Brand tint | `--brand-50` | `#EAF1ED` | Focus rings, subtle bg fills |
| Accent destructive | `--accent-500` | `#B85C3A` | Destructive button background (rare) |
| Surface base | `--surface-base` | `#FBFAF7` | App background (warm cream) |
| Surface elevated | `--surface-elevated` | `#FFFFFF` | Panels, cards |
| Surface raised | `--surface-raised` | `#F4F2EC` | Hover bg, sub-panel |
| Surface sunken | `--surface-sunken` | `#EEEAE0` | Toggle off-track, inset wells |
| Text primary | `--text-primary` | `#14110E` | Body text, headings |
| Text secondary | `--text-secondary` | `#5C544B` | Sub-text, labels |
| Text tertiary | `--text-tertiary` | `#908578` | Hint text, mono path |
| Border subtle | `--border-subtle` | `#ECE7DD` | Panel borders, list-row dividers |
| Border default | `--border-default` | `#DDD5C6` | Inputs, buttons |
| Border strong | `--border-strong` | `#B8AC97` | Hover state on borders |
| Success | `--success` | `#2F6B45` | "safe" chip, completed states |
| Warning | `--warning` | `#B27017` | "review" chip, attention |
| Error | `--error` | `#9A2A2A` | Destructive confirm, blocked chip |

### Typography

- **Display** — `Instrument Serif` 400, 400 italic — used for h1 (display-l 64px), stat values (display-m 40px), section/panel titles (italic uppercase 13px). Identity moment.
- **Sans** — `Geist` 400 / 500 / 600 — body, labels, buttons. Letter-spacing `-0.005em` default.
- **Mono** — `Geist Mono` 400 / 500 — paths, sizes, command examples, kbd, code.

### Scale (8pt + half-step)

`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96` — generous on the upper end for hero/section gaps, tight on the lower end for list density.

### Radius

`sm 6px / md 10px / lg 14px / xl 20px` — softer than Fluent (4/8) but not pillow-soft. Conveys craft without becoming friendly-marketing.

### Elevation

Four steps, all warm-tinted (`rgba(20,17,14,*)`) so shadows don't read cool/corporate against the cream surface:

| Token | Use |
|---|---|
| `--shadow-xs` | Inputs, button rest |
| `--shadow-sm` | Panels, stat cards |
| `--shadow-md` | Hover/focus on cards, dropdowns |
| `--shadow-lg` | Modals, command palette, wizard steps |

### Motion

- Default ease: `cubic-bezier(.16,1,.3,1)` (ease-out-quint — confident exit, no bounce).
- Durations: `120ms` fast (state), `150ms` base (most), `200ms` slow (layout shifts only).

---

## Pages (planned for v1)

Sequential build order. Each page goes through `:page` mode separately (per skill behavioral rule — never batch).

| # | ID | Route (in-app) | File | Purpose |
|---|---|---|---|---|
| 1 | `dashboard` | `/` | `prototype/pages/dashboard.html` | First-launch view: overview, last scan, quick actions, quarantine status, signed-binary badge |
| 2 | `scan-results` | `/scan` | `prototype/pages/scan-results.html` | After-scan view: categorized recoverable items, per-row select, quarantine-vs-clean controls, dry-run pattern |
| 3 | `quarantine` | `/quarantine` | `prototype/pages/quarantine.html` | List of `.pq` bundles, restore / verify-BLAKE3 / delete, manifest view |
| 4 | `format-prep-wizard` | `/format-prep` | `prototype/pages/format-prep-wizard.html` | 7-step wizard (snapshot → backup → verify → restore plan → confirm → run → report). Locked-Pro in v1.2 but designed now. |
| 5 | `settings` | `/settings` | `prototype/pages/settings.html` | Profiles, scheduling, telemetry-OFF surface, signing/cert info, exclusions, advanced |
| 6 | `onboarding` | `/onboarding` | `prototype/pages/onboarding.html` | First-run: SmartScreen unblock guide, signature verify, opt-in crash reports, profile pick |

### Components (planned, used across pages)

| ID | Description | Variants |
|---|---|---|
| `app-shell` | Top-bar + nav (Dashboard / Scan / Quarantine / Format Prep / Settings) | default, scrolled |
| `logo-mark` | "P" badge + "Polish." wordmark with italic period | default, compact |
| `badge` | Inline status pill with dot (engine online, signed, version) | success, warn, error, neutral |
| `button` | Action button | primary, secondary, ghost, destructive, disabled |
| `kbd` | Keyboard shortcut chip | default, on-primary |
| `input` | Text/path input with optional leading icon | default, focus, error, disabled |
| `select` | Dropdown | default, focus, disabled |
| `toggle` | Switch with label + description | default, checked, disabled |
| `checkbox` | Selection box for list rows | default, checked, indeterminate, disabled |
| `chip` | Status pill with colored dot | safe (success), review (warn), blocked (error), excluded (neutral) |
| `list-row` | Scan/quarantine row: checkbox + name + path + chip + size | default, hover, selected, expanded |
| `stat-card` | Metric card with label + display-serif value | default, with-trend, with-action |
| `panel` | Card container with section title | default, tight, raised |
| `wizard-step` | One step of Format Prep | active, complete, pending, error |
| `command-bar` | Footer-anchored action bar (scan/clean/dry-run) | default, sticky |

---

## Accessibility

- **Target**: WCAG AA contrast (4.5:1 body, 3:1 large text).
- **Focus**: brand-tinted ring `0 0 0 3px #EAF1ED` on all interactive controls.
- **Keyboard**: every action reachable via Tab + Enter; primary action has `⌘R` / `Ctrl+R` shortcut visible in button kbd.
- **Reduced motion**: `prefers-reduced-motion: reduce` disables all transitions ≥150ms; instant state changes only.
- **ARIA**: list-rows are `role="row"`; status chips have `aria-label="status: safe"` etc.
- **Color independence**: status uses dot + text + position, not color alone.

---

## File Reference

| File | Purpose |
|---|---|
| `DESIGN.md` | This file — human-readable design documentation |
| `design-tokens.json` | Machine-readable tokens (canonical source) |
| `prototype_design_flow.json` | Page + section + component spec |
| `prototype/pages/*.html` | Per-page prototypes (built one at a time via `:page`) |
| `../_tokens-preview/calm-modern.html` | Token-selection preview tile (reference; do not edit) |

---

## Changelog

### v1 — 2026-05-28 — calm-modern selected
- Initial design version locked.
- Selected variant: **calm-modern** (refined from initial `calm-craft` after user request for "more modern + clean" execution).
- Rejected variants: `fluent-native` (too generic / indistinguishable from Microsoft system apps), `terminal-mono` (too cold for Tier C audience).
- Rejected refinement attempt: original `calm-craft` (Fraunces serif read folk-craft; #F8F5EF surface read brochure-yellow).
- Key decisions: Instrument Serif italic as identity moment; Geist sans/mono throughout; brand `#1F4D3B` deeper than initial `#2D5F4A`; surface `#FBFAF7` cleaner than initial `#F8F5EF`; copper accent demoted to destructive-only.
