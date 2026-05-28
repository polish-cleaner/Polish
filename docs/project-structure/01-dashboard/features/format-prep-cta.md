# Format Prep CTA — "Don't lose anything."

> **Version:** v1.2-Pro
> **Tier:** Pro
> **Page:** [Dashboard](../README.md)
> **Status:** designed
> **PLAN.md:** §7.1, §9
> **Prototype:** `.vskill-data/Polish-prototype/src/dashboard.jsx` (Format Prep CTA Card, right half of the duo at the bottom of the page)

## Purpose

Surface the Format Prep wizard at the bottom of the Dashboard. The flagship Pro feature; this widget is discoverable without being a nag.

> **Visual changed vs the first draft.** The card was previously specced with a gold border accent (`#D4AF37`). Per the prototype, it now uses an **inverted ink card** (background `var(--ink)`, foreground `#fff`) with an italic display headline — same trust-first restraint, more confident contrast.

## Layout (per prototype)

```
┌─ FORMAT PREP CTA (1fr, ink card) ──────────────────────────┐
│  🚀  PREPARE FOR FORMAT                              [Pro]  │
│                                                              │
│  Don't lose anything.                                        │
│  (italic display, 26px, white)                               │
│                                                              │
│  Inventory, back up, verify, generate a restore plan —       │
│  then format with confidence.                                │
│                                                              │
│  Start the wizard →                                          │
└──────────────────────────────────────────────────────────────┘
```

- Card padding `22px`. Card background `var(--ink)`, border `var(--ink)`, text `var(--surface)`.
- Top row: rocket icon + uppercase tracked eyebrow `PREPARE FOR FORMAT` (11px, `+10%` tracking, color `oklch(0.72 0.01 250)`, weight 500) + right-aligned `Pro` `Badge` with inverted colors (bg `#fff`, fg `var(--ink)`).
- Headline: `display-italic` 26px / line 1.15, white. Copy: **"Don't lose anything."**
- Body paragraph: 12.5px, color `oklch(0.82 0.005 250)`, line 1.55.
- Footer action: white inline button "Start the wizard →" (no chrome — text + arrow icon).

## Visibility

- **Free-tier users:** widget does NOT render. Bento slot collapses; Quarantine card spans 2 columns of the bottom row. Anti-upsell principle from PROJECT.md §5.
- **Pro users:** always renders unless `showProBadges` tweak is off (dev affordance only — production ships with Pro UI always on for licensed users).
- Visibility is also gated by the `showProBadges` prop from `App` → `Dashboard` so the tweaks panel can preview both states.

## User story

"As a Pro user about to wipe my machine, I want a clear entry point to the guided Format Prep flow from the main screen, so I don't have to hunt for it."

## Behaviour

- Click → navigate to `format-prep` page Step 1, OR resume an in-progress wizard session if `format-prep.session.get` returns one.
- When a session is resumable, the headline copy and CTA swap to: `Resume — Step <N> of 7 →` and the eyebrow flips to `RESUMING FORMAT PREP`.
- No fly-in animation; the card respects the no-motion-entry rule.

## Inputs

- **IPC calls consumed:** `service.status` (includes `pro.licenseValid` + `pro.active`); `format-prep.session.get` (Pro-only IPC; checks resumable session)
- **State read:** `useProStore.licenseValid`, `useFormatPrepStore.activeSession`
- **Service events subscribed:** `event.pro-license-changed`

## Outputs

- **IPC calls fired:** none (navigation only)
- **State written:** none
- **Events emitted:** none

## UI states

| State | When | What user sees |
|---|---|---|
| Hidden | Pro binary not installed OR license invalid | Widget does not render; Quarantine card spans 2 cols |
| Idle | Pro active, no in-progress wizard | "PREPARE FOR FORMAT · Don't lose anything. · Start the wizard →" |
| Resume | Pro active, wizard session in service state | "RESUMING FORMAT PREP · Continue where you left off. · Resume — Step 3 of 7 →" |
| Expired | Pro license expired mid-session | "Pro license expired — [Renew] or use exported restore plan." Card border tinted `var(--status-warn)`; existing session preserved server-side |
| Mismatch | Pro binary newer than engine | "Update Polish to use Format Prep — [Update now]" |
| Updating | License being validated | Skeleton card matching ink background |

## Edge cases

- **License expired between dashboard mount and click:** `event.pro-license-changed` re-renders the card to `Expired` before navigation; if click already in flight, target page handles the expired state.
- **User uninstalled `polish-pro.exe`:** next poll returns `pro.active = false`; card unmounts; no upsell shown.
- **Two sessions claim to be in-progress** (shouldn't happen — server enforces single session): widget picks the newest by `updated_at`.

## Accessibility

- Card has `aria-labelledby` referencing the eyebrow text.
- "Pro" badge has `aria-label="Pro feature"`.
- "Start the wizard" / "Resume" is a `<button>` with `aria-label="Open Format Prep wizard, step 1"` (or `"Resume Format Prep, step N of 7"`).
- Background-foreground pair (`var(--ink)` / `#fff`) measured at 16.6:1 — exceeds AA Large and AA Normal.

## Telemetry (opt-in, v1.2+)

- Event: `dashboard.format-prep-cta.start.clicked` — `{ resume_existing: bool, step_index_bucket: 0|1|2|3|4|5|6|7 }`
- No PII; step_index is just the resumed step (0 = none).

## Cross-links

- Full surface: [[../03-prepare-for-format/README]] and step features in `03-prepare-for-format/features/`
- PLAN.md: §7.1, §9
- PROJECT.md: §5 v1.2 Pro feature
- Prototype: `src/dashboard.jsx` Format Prep CTA Card

## Open questions

- Show *any* teaser to free users? Current decision: **no** — strict anti-upsell. The Pro pricing page on `polish.io` explains. Dashboard never teases.
- Position when both cards render (1fr/1fr): always rightmost (current) or swap by user click frequency? Current: fixed; reorderable bento out of scope for v1.0.
- Headline copy lock-in: "Don't lose anything." is currently chosen for emotional weight + literal description. Alternatives tested: "Format with confidence." (rejected — too marketing-y), "Before you wipe." (rejected — too clinical). Lock for v1.2 launch; revisit if A/B testing surfaces a winner.
