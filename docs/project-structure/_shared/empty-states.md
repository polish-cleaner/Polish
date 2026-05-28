# Shared: Empty / Loading / Error / Disabled States

> **Version:** v1.0
> **Tier:** Free
> **PLAN.md:** §7 (Dashboard empty states), §11 (Service status states)

## Purpose

Single source of truth for non-happy-path UI. Every page must conform. Empty isn't the same as loading; loading isn't the same as error; error isn't the same as disabled. Confusing them kills trust.

## State definitions

| State | Meaning |
|---|---|
| **Empty** | No data exists (e.g., zero quarantine runs, zero history entries). Action available to create some. |
| **Loading** | Data exists but not yet fetched; service is computing. |
| **Success / populated** | Data fetched, ready. |
| **Error** | Fetch failed (IPC error, service crashed, schema validation failed). Recovery action offered. |
| **Disabled** | Feature exists but currently unavailable (e.g., Scan now during in-flight clean). |
| **Pending action** | User initiated a long-running op (clean execute); progress shown. |

## Page-by-page mapping

### Dashboard
- Empty (first run, scan never run): "Welcome — running first scan, ~2 min ⏳"
- All-clean (scan finished, nothing > 1 GB reclaimable): "All clear ✨ Nothing to reclaim. Last verified Xm ago."
- Error (service unreachable): "Polish service is unreachable. [Restart service] [Open logs]" + amber tray icon
- Loading (scan in progress): "Scanning… X.X GB of Y.Y GB checked. ETA Zm." with progress bar

### Clean
- Empty (no scan results yet): "Run a scan first. [Scan now]"
- Empty (scan complete, nothing to reclaim): "All clear. Try Aggressive mode (v1.1+) for deeper reach."
- Loading (preview being computed): skeleton banner + "Computing impact…"
- Error (during execute): see [[run-step]] for partial-rollback semantics
- Disabled (clean already in flight): mode picker greyed with tooltip "Clean in progress — see status bar"

### Quarantine
- Empty (no runs ever): "No quarantine yet. Polish creates one for every cleanup. [Open Clean]"
- Empty (all expired & purged): "No active quarantines. Past activity in History."
- Error (manifest unreadable): per-row inline warning "⚠ Manifest corrupted — only the bundle is recoverable manually. [View bundle path]"

### History
- Empty (no activity): "No activity yet. History grows as Polish does things."
- Error (DB unreachable): "History store is locked. [Restart service] [Open logs]"

### Settings
- Loading (initial load): skeleton form
- Save error: inline red text near the changed field; setting reverts to previous value
- Pending save: input shows subtle "Saving…" indicator

### Format Prep (v1.2 Pro)
- Empty (wizard never started): "Start a new prep session" CTA
- In-progress (wizard partially completed): "Resume from Step X" CTA — wizard state stored in service

## Visual conventions

- **Emerald `#0F5132`** for primary positive states.
- **Slate** neutrals for empty / disabled.
- **Amber `#F59E0B`** for warnings (service unreachable, manifest corrupt).
- **Red `#EF4444`** ONLY for security warnings or unrecoverable data loss. Never cosmetic.
- **Mono font** for numeric values (bytes, counts) — gives system-reading feel (PLAN §2 motion / typography).
- Skeletons use subtle shimmer animation (200–300 ms cycle).

## Behaviour rules

- **Loading state must not block the rest of the page.** Other widgets render with their own loading states independently.
- **Error states must include a recovery path.** Not "Something went wrong" — always "X failed. [Restart] [Logs] [Report bug]."
- **Disabled states must show why.** Tooltip or inline copy explains the precondition.
- **Empty states must show next action.** Never a dead end.

## Accessibility

- Skeleton loaders have `aria-busy="true"` on their parent.
- Error states announce via `aria-live="polite"` (`assertive` only for critical issues).
- Disabled buttons have `aria-disabled="true"` with explanatory `aria-describedby`.

## Open questions

- Should we add a global "shake" animation when an action fails (subtle), or rely purely on inline messaging? Current decision: inline only, no global motion — keeps the "calm" brand.
- For long-running scans, do we show estimated time remaining or just elapsed? Current: show ETA based on bytes/sec rate, with explicit "may vary" caveat.
