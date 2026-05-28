# Design Documentation — Polish (Windows Maintenance Suite) — v2

Generated: 2026-05-28
Version: 2.0
Variant: **editorial-cream** (extracted from user-authored prototype)

---

## Design

**Design source mapping**

- Tokens and component vocabulary in this version are extracted directly from the user-authored prototype at `.vskill-data/Polish-prototype/`. That prototype is the canonical visual source; this design folder is a normalized + machine-readable mirror.
- Project source: `.vskill-data/debate/v2/PROJECT.md` (v2 post-debate plan).
- v1 (`design/v1`, variant `calm-modern`) is superseded — kept on disk for history; **v2 is default** in `index.json`.

**Authoritative artifacts (live in `.vskill-data/Polish-prototype/`)**

| Artifact | Path | Role |
|---|---|---|
| Monolithic HTML shell | `Polish.html` | Token root (`:root` CSS vars), global resets, shared component CSS, React mount, JSX `<script>` chain |
| App root | `src/app.jsx` | Routing, tweaks-panel state, toast stack, accent-palette swap |
| Shared atoms | `src/components.jsx` | Buttons, chips, toggles, drawers, modals (cross-page) |
| Charts | `src/charts.jsx` | Dashboard charts |
| Icons | `src/icons.jsx` | SVG icon set |
| Sample data | `src/data.jsx` | Demo scenarios (midlife etc.) |
| Sidebar | `src/sidebar.jsx` | Top-level nav |
| Dashboard | `src/dashboard.jsx` | Overview page |
| Clean wizard | `src/clean.jsx` | Scan + clean flow (= `scan-results` page) |
| Quarantine | `src/quarantine.jsx` | `.pq` bundle list + drawer detail |
| Settings | `src/settings.jsx` | Profiles, telemetry, exclusions, signing |
| Format Prep | `src/format-prep.jsx` | Pro 7-step wizard |
| History | `src/history.jsx` | Past scan log |
| Tweaks panel | `tweaks-panel.jsx` | Live design knobs (accent, density, Pro-badge toggle) |
| Reference screenshots | `screenshots/*.png` | QA truth |
| Upstream docs (pinned) | `uploads/PROJECT.md`, `uploads/PLAN.md` | Brief inputs used to produce the prototype |

**Scope mapping (v1.0 MVP features → prototype coverage)**

| PROJECT.md v1.0 MVP feature | Prototype coverage |
|---|---|
| Quarantine-first cleanup engine + `.pq` bundle + manifest | `src/quarantine.jsx` (list + drawer w/ manifest + restore/verify/delete) |
| One Dev category (npm + pnpm + cargo) | `src/clean.jsx` (categorized scan; dev cache rows visible in screenshots) |
| Trust-first delivery (MIT, signed, zero telemetry, no nag) | `src/settings.jsx` (telemetry-off default + signing/cert info); toast tone in `app.jsx` |
| Format Prep wizard (v1.2 design-only in v1.0 release) | `src/format-prep.jsx` (7-step wizard) |
| Onboarding (v1.0 first-run) | **Not in prototype** — gap; add post-v2 lock |

**Out of scope for design v2**

- Pro tier billing/checkout UI
- CLI surface
- MSP/Enterprise admin console (deferred per PROJECT.md §3)
- Dark theme (light only — note: oklch tokens make a future dark mode tractable)
- Onboarding / first-run flow (not yet drawn in prototype)

**Token mapping → project constraints**

- **oklch color space** throughout — perceptually uniform; future dark mode flips lightness component cleanly, no manual hex picking.
- **Cream backgrounds `oklch(0.968 0.011 86)`** (warm) + **cool-charcoal ink `oklch(0.205 0.013 250)`** — deliberate temperature contrast. Reads as "paper + ink" (editorial), not "system app".
- **Deep moss accent `oklch(0.420 0.085 155)`** default. Low chroma (0.085) = restrained, not vendor-loud. 4 swappable palettes (deep-moss / deep-ocean / burnt-amber / muted-plum) accessible via tweaks panel.
- **Restrained radii** (3 / 5 / 8) — sharper than Fluent (4 / 8), conveys precision and care without being CAD-cold.
- **Density variable** (`--density: 0.85 | 1 | 1.15`) — single multiplier scales the entire space scale; user can switch compact/regular/comfy live.
- **Typography**: Instrument Serif (display + italic accents on `<em>`) + Inter body + JetBrains Mono for numbers/paths. Display italic anchors brand identity (`page-title em` is accent-tinted italic).
- **Status colors**: low-saturation greens/ambers/reds. No alarm UI. Trust-first → status reads informational, not panic.

**Implementation handoff notes (must preserve)**

1. **Tokens only — no hex literals** in any new HTML. All colors via `var(--token)`. The prototype already enforces this; mirror that discipline.
2. **oklch with fallbacks**: every browser-targeting build must resolve oklch (Tauri WebView2 = Chromium ≥111, OK). For external screenshots / older clients, snapshot to sRGB during build.
3. **Italic display = identity moment**. Used on `page-title em`, `display-italic`, wordmark period. Do not bold-shout headings.
4. **Density var is global**. New components must multiply via `calc(_px * var(--density))`, never hard-code px in layout.
5. **Focus rings = accent**, 2px solid outline + 2px offset. Brand-tinted, not system blue.
6. **Mono numbers**: every numeric (`size`, `count`, `time-since`) wraps in `.num-display` with tabular-nums. Prevents table jitter.
7. **Scrollbars**: custom thin-pill via `::-webkit-scrollbar`. Tauri ships Chromium; honored.
8. **No CSS keyframe entrance animations** in current build (commented in HTML: "behavior inconsistent in some embedding contexts"). Keep semantic classes (`.fade-up`, `.fade-in`) but no opacity:0 default. Re-enable only after embedding context verified.
9. **Toast stack**: bottom-right, stacked, auto-dismiss 5s, manual close, action buttons inline. Position shifts up when daily-toast active (see `app.jsx`).
10. **Tweaks panel** is a dev affordance (live tweak accent/density/Pro-badge). Ship behind a build flag for production; not user-facing.

---

## Overview

- **Project**: Polish
- **Type**: desktop_app (Tauri 2 WebView2 — Chromium)
- **Style**: Custom — editorial cream + cool ink, deep-moss accent, Instrument Serif display
- **Theme**: light
- **Accessibility**: WCAG AA
- **Target users**: Tier A devs (primary) + Tier C power users (secondary)
- **Color space**: oklch

---

## Design Tokens

Canonical machine-readable values: `design-tokens.json`. Highlights:

### Color roles (semantic)

| Role | Token | Value | Usage |
|---|---|---|---|
| Page bg | `--bg` | `oklch(0.968 0.011 86)` | App background — warm cream paper |
| Bg deep | `--bg-deep` | `oklch(0.945 0.013 86)` | Sunken page sections |
| Surface | `--surface` | `#ffffff` | Cards, panels, drawer body |
| Surface warm | `--surface-warm` | `oklch(0.985 0.008 86)` | `card-sunken` variant |
| Surface sunken | `--surface-sunken` | `oklch(0.955 0.012 86)` | Segmented track, hover bg |
| Ink | `--ink` | `oklch(0.205 0.013 250)` | Body text |
| Ink soft | `--ink-soft` | `oklch(0.380 0.010 250)` | Secondary text |
| Ink muted | `--ink-muted` | `oklch(0.560 0.008 250)` | Labels, micro |
| Ink faint | `--ink-faint` | `oklch(0.720 0.006 250)` | Disabled, dot baseline |
| Line | `--line` | `oklch(0.895 0.007 250)` | Card borders, dividers |
| Line strong | `--line-strong` | `oklch(0.825 0.008 250)` | Button border, scrollbar thumb |
| Line soft | `--line-soft` | `oklch(0.935 0.006 250)` | Subtle row dividers |
| Accent | `--accent` | `oklch(0.420 0.085 155)` | Primary action — deep moss |
| Accent deep | `--accent-deep` | `oklch(0.320 0.072 155)` | Active/pressed |
| Accent hover | `--accent-hover` | `oklch(0.380 0.085 155)` | Hover state |
| Accent soft | `--accent-soft` | `oklch(0.940 0.030 155)` | Selection, badge bg |
| Accent ink | `--accent-ink` | `oklch(0.280 0.060 155)` | Text on accent-soft |
| Status good | `--status-good` | `oklch(0.545 0.110 155)` | Safe, complete |
| Status warn | `--status-warn` | `oklch(0.680 0.130 70)` | Review, caution |
| Status danger | `--status-danger` | `oklch(0.545 0.180 25)` | Destructive, blocked |
| Status info | `--status-info` | `oklch(0.520 0.080 240)` | Informational |

### Accent palettes (user-switchable via tweaks panel)

| Name | Anchor | Default? |
|---|---|---|
| deep-moss | `#3d7050` | ✓ |
| deep-ocean | `#2f5f7a` | |
| burnt-amber | `#7a4f2f` | |
| muted-plum | `#5c4a78` | |

### Typography

- **Display**: `Instrument Serif` 400 + 400 italic. `page-title` 44 / 1.0 / −1.5%; italic anchors accent (`page-title em`).
- **Body**: `Inter` 400 / 500 / 600 / 700. Base 14 / 1.5. Features `cv11`, `ss01`.
- **Mono**: `JetBrains Mono` 400 / 500 / 600. `tnum`, `zero` features for numerals.
- **Label**: 10.5px, 500, +12% tracking, uppercase, `ink-muted`.
- **Micro**: 11px, `ink-muted`.

### Spacing (density-multiplied)

Base px: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64`. Each multiplied by `--density` (0.85 / 1 / 1.15). Single global lever.

### Radius

`sm 3 / md 5 / lg 8 / pill 999`. Restrained — Polish reads as crafted, not cuddly.

### Motion

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Default — confident exit |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Toggle thumb only |
| `--t-fast` | 120ms | State change |
| `--t-base` | 240ms | Most transitions |
| `--t-slow` | 400ms | Progress, layout |

### Elevation

- `shadow-card`: hairline + 1px subtle (cards, segmented active)
- `shadow-drawer`: `-8px 0 32px oklch(0.20 0.012 250 / 0.08)`
- `shadow-modal`: `0 20px 60px oklch(0.20 0.012 250 / 0.18)`
- `shadow-toast`: `0 8px 24px oklch(0.20 0.012 250 / 0.10)`

---

## Pages (from prototype `src/`)

Sequential file-of-truth in `.vskill-data/Polish-prototype/src/<file>.jsx`. v2 `prototype/pages/` mirror is intentionally empty — the JSX prototype is the canonical render, not duplicated HTML.

| # | ID | Component | Source file | Purpose |
|---|---|---|---|---|
| 1 | `dashboard` | `<Dashboard>` | `src/dashboard.jsx` | Overview, charts, recoverable total, daily-toast trigger |
| 2 | `clean` | `<CleanWizard>` | `src/clean.jsx` | Scan-results + clean flow (modes: light / balanced / aggressive); replaces v1's separate scan-results page |
| 3 | `quarantine` | `<Quarantine>` | `src/quarantine.jsx` | `.pq` bundle list, drawer with manifest + actions |
| 4 | `history` | `<History>` | `src/history.jsx` | Past scan log (new vs v1 plan) |
| 5 | `settings` | `<Settings>` | `src/settings.jsx` | Profiles, telemetry, exclusions, signing/cert |
| 6 | `format-prep` | `<FormatPrep>` | `src/format-prep.jsx` | 7-step Pro wizard (v1.2 feature, designed in v2) |
| — | `onboarding` | — | **missing** | First-run flow; not yet drawn. Track as v2 gap. |

### Components (extracted from prototype CSS in `Polish.html` + `src/components.jsx`)

| ID | Variants | Provided by |
|---|---|---|
| `card` | default, sunken | HTML CSS |
| `btn` | primary, secondary, ghost, danger, sm, lg, disabled | HTML CSS |
| `badge` | default, accent, warn, danger, pro | HTML CSS |
| `dot` | base, good, warn, danger, pulsing | HTML CSS |
| `progress` | determinate, indeterminate | HTML CSS |
| `check` (checkbox) | default, checked, indeterminate | HTML CSS |
| `toggle` (switch) | off, on | HTML CSS |
| `segmented` | default, active item | HTML CSS |
| `num-display` + `num-unit` | mono-tabular number presentation | HTML CSS |
| `divider` | horizontal, vertical | HTML CSS |
| `page-title` + `page-subtitle` | display serif + italic accent | HTML CSS |
| `wizard-steps` / `wizard-step` | active, done, pending | HTML CSS |
| `drawer` | right-side, backdrop+blur | HTML CSS |
| `modal` | centered, backdrop+blur | HTML CSS |
| `tooltip` | `[data-tip]` attr | HTML CSS |
| `toast` | good, warn, danger | HTML CSS + `app.jsx` |
| `sidebar` | nav with Pro badges | `src/sidebar.jsx` |

---

## Accessibility

- WCAG AA contrast target.
- `:focus-visible` outline: 2px solid `--accent`, 2px offset.
- Status uses dot + label text + color — color independent.
- Keyboard: every action reachable via Tab + Enter; primary actions have shortcuts in tooltips.
- No motion ≥ 240ms on non-state transitions (respect `prefers-reduced-motion` to be wired into `app.jsx` — gap noted).

---

## File Reference

| File | Purpose |
|---|---|
| `DESIGN.md` | This file |
| `design-tokens.json` | Canonical tokens (oklch) |
| `prototype_design_flow.json` | Page + component spec mirroring prototype |
| `prototype/pages/` | Empty by design — see "Pages" above; truth lives in `Polish-prototype/src/*.jsx` |

---

## Changelog

### v2 — 2026-05-28 — editorial-cream (extracted from user prototype)
- User authored full React+Tauri prototype at `.vskill-data/Polish-prototype/`.
- v2 tokens extracted verbatim from `Polish.html` `:root` (oklch color space, density-multiplied spacing, restrained radii, dual easing).
- Component vocabulary documented from shared CSS in `Polish.html` and `src/components.jsx`.
- Page roster updated: added `history`, renamed v1 `scan-results` → `clean` (matches `<CleanWizard>` semantics).
- Marked v2 default in `.vskill-data/index.json`.
- **G3 / ui-score bypassed** — pages exist as JSX components, not HTML files; per-page ui-score loop intentionally skipped at user instruction. Builder should treat `.vskill-data/Polish-prototype/` as the visual reference and proceed to sprint planning.
- Gap: onboarding flow not drawn. Track for follow-up.

### v1 — 2026-05-28 — calm-modern (superseded)
- See `.vskill-data/design/v1/DESIGN.md`. Retained for history; not default.
