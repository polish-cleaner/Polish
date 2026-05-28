# Top Reclaim Opportunities

> **Version:** v1.0
> **Tier:** Free
> **Page:** [Dashboard](../README.md)
> **Status:** designed
> **PLAN.md:** §7.1
> **Prototype:** `.vskill-data/Polish-prototype/src/dashboard.jsx` (the "Top reclaim opportunities" `<section>`)

## Purpose

Surface the biggest cleanup wins from the latest scan, with one-click selection and a "Clean selected" entry point. Highest-impact widget on the page — how a user goes from "Polish is running" to "I just reclaimed 29 GB" in 3 clicks.

## Layout (per prototype)

```
┌─ TOP RECLAIM OPPORTUNITIES                                           ┐
│  Sorted by size · check or uncheck to refine                          │
├───────────────────────────────────────────────────────────────────────┤
│ [✓] 🤖  LM Studio cached models     · 4 models           23.7 GB  devs │
│ [✓] 📦  Docker images (unused)      · 12 images, 90d+    12.1 GB  devs │
│ [✓] 🗑️  Temp files                   · system + user       4.2 GB  safe │
│ [ ] 📁  Old Downloads >90 days       · 17 files            1.8 GB  user │
│ [✓] ⚡  Browser caches               · Chrome + Edge       1.0 GB  safe │
├───────────────────────────────────────────────────────────────────────┤
│  3 of 5 selected  │  WILL RECLAIM 29.0 GB     [Clean selected →]      │
└───────────────────────────────────────────────────────────────────────┘
```

- Section label "Top reclaim opportunities" with a right-aligned helper line "Sorted by size · check or uncheck to refine".
- Card container, no outer padding; rows are flex items with `14px 20px` padding.
- Rows separated by `1px solid var(--line-soft)` (the first row has no top border).
- Row hover: background swaps to `var(--surface-warm)` (100ms transition).
- Row click *anywhere* toggles selection — checkbox is not the only target.
- Footer command bar on `var(--surface-warm)` background with separator at top.

## Selection rules

- Source: `CATEGORIES.filter(c => c.bytes >= 1 GB).sort(desc by bytes).slice(0, 5)`.
- Initial selection: every category whose `defaultModes.includes('balanced')`. High-risk categories (AI models, OEM bloat) start unchecked unless the user previously cleaned them.
- Aggregate `Will reclaim` updates live as user toggles.
- Selection state is passed to the `clean` page via `onStartCleanWith('balanced', selectedReclaim)`.

## Row anatomy

| Slot | Component | Content |
|---|---|---|
| 1 | `Checkbox` | selected state |
| 2 | `CategoryIcon` | tier-tinted icon (`src/icons.jsx`) |
| 3 | name + detail | `13.5px / 500` label + `11.5px ink-muted` detail |
| 4 | safety `Badge` | variant: `accent` (always-safe) · `default` (devs / large user) · `warn` (system) |
| 5 | `NumDisplay` | mono tabular bytes + unit (right-aligned, min-width 80px) |

## User story

"As a Windows user, I want to see the largest categories I can clean right now, pick the ones I want, and proceed without configuring anything."

## Behaviour

- Show top 5 categories with `bytes >= 1 GB`, sorted descending.
- Pre-check categories whose `defaultModes` includes `balanced`.
- Aggregate "Will reclaim X.X GB" reflects current selection live.
- Counter "N of M selected" uses mono numerals.
- "Clean selected →" routes to `clean` page Step 2 (Preview) with pre-selection; Clean wizard inherits the `Set<categoryId>` via the `initialSelected` prop on `<CleanWizard>`.
- Row click and checkbox click both toggle; clicking inside the badge does NOT toggle (event stops propagation).
- If a scan has never run: replaced with the empty state from [[../_shared/empty-states]].
- If a scan ran but nothing ≥ 1 GB reclaimable: "All clear ✨ Last verified Xm ago." replaces the table; footer hidden.

## Inputs

- **IPC calls consumed:**
  - `scan.results` — full latest scan output grouped by category (filtered + sorted client-side)
  - `clean.preview` — fired on selection toggle (debounced 200ms) to refresh the "Will reclaim" total and validate destination drive capacity
- **State read:** `useScanStore.latestResult`, `useSelectionStore.selected`
- **Service events subscribed:** `event.scan-complete` triggers refetch of `scan.results`

## Outputs

- **IPC calls fired:** `clean.preview` (debounced) → `{ totalBytes, itemCount, destinationDrive, retentionDays }`
- **State written:** `useSelectionStore.toggle(categoryId)`; `App.cleanInit` is set via `onStartCleanWith` on "Clean selected"
- **Events emitted:** none

## UI states

| State | When | What user sees |
|---|---|---|
| Empty | First run, no scan complete | "Running first scan… ~2 minutes ⏳" with progress; footer hidden |
| All clean | Scan complete, no category ≥ 1 GB | "All clear ✨ Nothing to reclaim. Last verified Xm ago." footer hidden |
| Populated | Scan complete, ≥ 1 row | Row list + checkboxes + live "Will reclaim" + active CTA |
| Zero selected | Populated, user unchecked all | Footer "0 of 5 selected"; "Clean selected" greys out + tooltip "Select at least one category" |
| Loading | Refreshing after `event.scan-complete` | Skeleton rows |
| Error | `scan.results` IPC failed | "Couldn't load scan results — [Retry]" replaces the rows |
| Disabled | Clean in flight | Rows non-clickable; checkboxes disabled; CTA greyed; tooltip "Clean in progress" |

## Edge cases

- **More than 5 categories ≥ 1 GB:** show top 5; user goes to `clean` for the full category tree (CTA "Clean selected" carries selection state).
- **User unchecks every row:** "Will reclaim 0 B"; CTA disabled + tooltip.
- **Category size changes between scans (e.g., Docker pulled new images):** widget reflects new size on next `event.scan-complete`.
- **User clicks "Clean selected" then back-navigates from Clean:** `App.cleanInit` is preserved; if user returns to dashboard, selection persists.
- **Row count < 5 (small machines):** render whatever exists; footer counter caps at the actual count.

## Accessibility

- List uses `role="list"`; rows `role="listitem"`.
- Each row has `aria-pressed` to expose selection state to SR users.
- "Will reclaim" counter has `aria-live="polite"`.
- "Clean selected" `<button>` has `aria-disabled` when no rows selected.
- Row click target includes ≥ 44×44px hit area (padding ensures this).

## Telemetry (opt-in, v1.1+)

- Event: `dashboard.top-reclaim.toggle` — `{ category_id, checked, tier }`
- Event: `dashboard.top-reclaim.clean-selected.clicked` — `{ selected_count, total_bytes_bucket: 1|5|10|50|100 }`

## Cross-links

- Companion: [[largest-opportunities-bars]] (visual sibling — top categories as horizontal bars, no selection)
- Detail surface: [[../02-clean/features/category-tree]], [[../02-clean/features/preview-step]]
- PLAN.md: §7.1, §8.2 (safety tiers), §4.3 (`scan.results`, `clean.preview`)
- PROJECT.md: §5 MVP feature #1
- Prototype: `src/dashboard.jsx` "Top reclaim opportunities" section

## Open questions

- Pre-checked defaults customizable per-user? Current: no in v1.0 — Custom mode in Clean covers this (v1.1+).
- Cap at 5 vs configurable? Current: hard 5; users with > 5 GB-class categories go to Clean for the full tree.
- Selection persistence across app restarts? Current: in-memory only; on restart, defaults re-apply from `defaultModes`. Saved selections live in named profiles (Settings).
