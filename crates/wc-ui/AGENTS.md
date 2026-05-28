# AGENTS.md — `wc-ui` (Polish Tauri 2 + React frontend)

> Frontend-specific rules. Compose with root `AGENTS.md`. If a rule here conflicts with root, this one wins for files under `crates/wc-ui/`.

## File structure (required)

```
crates/wc-ui/src/
├── __tests__/           one *.test.{ts,tsx} per source file (rule 1)
├── components/          reusable presentational components — NO data fetching, NO IPC calls
├── hooks/               custom React hooks (use*), one per file
├── lib/                 ALL pure logic — formatters, parsers, command wrappers, constants
├── pages/               top-level page components composed by App.tsx
├── types/               ALL type / interface declarations (rule 2)
│   ├── finding.ts
│   ├── environment.ts
│   └── <domain>.ts
├── App.tsx              root component — composes pages, owns top-level state
├── main.tsx             ReactDOM entry — do not put logic here
├── styles/              global styles (split into tokens.css + base.css + index.css)
├── test-setup.ts        Vitest global setup (matchers, no logic)
└── vite-env.d.ts
```

Per-component styling is handled by Tailwind v4 utility classes (Rule 8). CSS Modules (`<Component>.module.css`) are allowed for one-off layouts the utility surface cannot express. Do NOT add new global rules to `styles/base.css` or `styles/tokens.css` for component-scoped styling.

## Rule 1 — tests in `__tests__/`

**Every file in `src/` that exports anything testable MUST have a corresponding test file in `src/__tests__/`.**

Pattern:

| Source | Test |
|---|---|
| `src/App.tsx` | `src/__tests__/App.test.tsx` |
| `src/components/EnvList.tsx` | `src/__tests__/components/EnvList.test.tsx` |
| `src/lib/format.ts` | `src/__tests__/lib/format.test.ts` |
| `src/hooks/useScan.ts` | `src/__tests__/hooks/useScan.test.ts` |
| `src/pages/ScanPage.tsx` | `src/__tests__/pages/ScanPage.test.tsx` |

**Mirror the source tree under `__tests__/`.** Same relative path, `.test.<ext>` suffix.

**Test framework:** Vitest + `@testing-library/react` + `@testing-library/jest-dom` + `jsdom`. Configured in `vite.config.ts` under `test:` block.

**Mock Tauri IPC** by default — the unit-test layer must not depend on the Rust shell. Use:

```ts
import { vi } from "vitest";
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));
```

**Test coverage minimum:**
- Pure helper (`lib/*`): full branch coverage including edge cases (empty, null, malformed).
- Component (`components/*`, `pages/*`): render test + at least one user-interaction test (`click`, `type`, `submit`) where applicable.
- Hook (`hooks/*`): `renderHook` from `@testing-library/react`, assert state transitions.

**Verification:** `npm test` (alias for `vitest run`) must exit 0 before any commit that touches `src/`.

## Rule 2 — types ONLY in `src/types/`

**No `interface` or `type` declaration may live in a component / page / lib file.** All cross-file types belong in `src/types/<domain>.ts`.

| ❌ Forbidden | ✅ Required |
|---|---|
| ```tsx<br>// in App.tsx<br>interface Finding { path: string; size: number; }<br>``` | ```ts<br>// in src/types/finding.ts<br>export interface Finding {<br>  path: string;<br>  size: number;<br>  category_id: string;<br>}<br>``` then `import type { Finding } from "../types/finding";` |

**Naming:**
- One file per domain noun (`finding.ts`, not `findings.ts`).
- File name matches the primary type's name in lowercase-kebab.
- Re-export aggregate from `src/types/index.ts` ONLY if the type is consumed in 5+ places — otherwise prefer direct path import.

**Allowed in component files:**
- Local-only `type` aliases that never leak out of the component (e.g., a single-use prop tuple). Threshold: if it appears in 2+ files, move it.
- React-built-in generic specializations inline (`useState<string>(…)`).

**Mirror Rust domain types.** When a Tauri command returns a Rust type, the matching TS interface in `src/types/<x>.ts` must mirror the Rust field names and types exactly. If the Rust struct changes, update the TS type in the same PR.

## Rule 3 — DRY (inherited)

See root `AGENTS.md` "Conventions when editing" → DRY entry. Frontend-specific application:

- Repeated formatting / parsing / grouping logic → `src/lib/<topic>.ts`.
- Repeated `invoke` wrappers → `src/lib/commands.ts` (see Rule 5).
- Repeated state machines (loading / data / error) → custom hook in `src/hooks/<name>.ts`.
- Repeated magic numbers / strings → `src/lib/constants.ts` (single source of truth).
- Three-strikes trigger: 3rd occurrence forces extraction. 2 is grey area; default to extract if the lines are non-trivial.

## Rule 4 — Helper-first: every independent function lives in `src/lib/`

**This is the major structural rule. Read carefully.**

**Definition of "independent function":** any function whose body does NOT directly reference React hooks (`useState`, `useEffect`, `useRef`, etc.), does NOT directly return JSX, and does NOT depend on component-local closure. If a function can be lifted out of a component without changing behaviour, it MUST be lifted.

**Where it goes:**

| What | Where | Example |
|---|---|---|
| Formatter / parser / pure transform | `src/lib/format.ts` or `src/lib/<topic>.ts` | `formatMiB(bytes)`, `parsePath(str)` |
| Tauri command wrapper | `src/lib/commands.ts` (see Rule 5) | `scan()`, `executeCleanup()` |
| Static constant / enum-like map | `src/lib/constants.ts` | `BYTES_PER_MIB`, `CATEGORY_LABELS` |
| Validation / predicate | `src/lib/validate.ts` | `isFinding(x)`, `isSafePath(p)` |
| React hook (any function starting with `use`) | `src/hooks/<name>.ts` — one hook per file | `useScan()`, `useEnvironment()` |
| Stateful UI logic shared across components | `src/hooks/<name>.ts` | `useConfirmation(message)` |

**What components MAY contain:**
1. Imports
2. The default-exported component function (returns JSX)
3. Nothing else.

**What components MUST NOT contain:**
- Standalone function declarations (extract to `lib/` or `hooks/`).
- `const someFn = () => { ... }` defined outside the component body and used inside (extract to `lib/`).
- Inline event handlers >5 lines (extract to `lib/` if pure, or `hooks/` if stateful).
- Magic numbers / strings (extract to `lib/constants.ts`).
- Inline regex literals used in 2+ components (extract to `lib/constants.ts` or `lib/validate.ts`).

**Inline lambdas in JSX are allowed only if:**
- ≤3 lines AND
- Used in exactly one place AND
- No closed-over variable would need to be passed if hoisted

Example — wrong (function defined inline, has logic, could be lifted):
```tsx
// ❌ wrong — pure helper buried in a component file
function ScanPage() {
  function formatMiB(bytes: number): string {
    return (bytes / 1_048_576).toFixed(2) + " MiB";
  }
  // ...
}
```

Correct:
```ts
// ✅ src/lib/format.ts
export function formatMiB(bytes: number): string {
  return (bytes / 1_048_576).toFixed(2) + " MiB";
}
```
```tsx
// ✅ ScanPage.tsx
import { formatMiB } from "../lib/format";
function ScanPage() { /* ... */ }
```

## Rule 5 — Single Tauri-IPC boundary: `src/lib/commands.ts`

**No file in `src/` may import `invoke` from `@tauri-apps/api/core` except `src/lib/commands.ts`.**

`commands.ts` is the typed wrapper layer. Every Rust `#[tauri::command]` must have exactly one corresponding TypeScript function in `commands.ts` with:
- Identical name in camelCase (`scan_files` → `scanFiles`).
- Argument types from `src/types/`.
- Return type `Promise<T>` where `T` is in `src/types/`.

Components and pages import the typed wrapper. They never call `invoke` directly. This means:
- The IPC contract has a single inspection surface.
- Renaming a Rust command is one TS-side edit, not N.
- Tests mock `invoke` once at the lowest layer; component tests stub the wrapper.

## Rule 6 — Code structure conventions

**File naming:**
- React components / pages: `PascalCase.tsx` (e.g., `EnvList.tsx`, `ScanPage.tsx`).
- Hooks: `useCamelCase.ts` (e.g., `useScan.ts`).
- Libs / types / constants: `kebab-case.ts` (e.g., `category-group.ts`, `commands.ts`).
- Tests: `<source-name>.test.{ts,tsx}` matching source file.

**Exports:**
- Components / pages: ONE default export per file (the component). Named exports for additional helpers in same file are forbidden — move them to `lib/`.
- Lib / hooks / types / constants: NAMED exports only. No `export default` in these files.

**File size caps:**
- Components / pages: **150 lines hard cap**. If exceeded → split into sub-components in `components/`.
- Hooks: **80 lines hard cap**. If exceeded → split the hook or extract pure helpers to `lib/`.
- Lib files: **200 lines soft cap**. Split by topic when crossed.

**Import order (within a file, blank line between groups):**
1. React + third-party (`react`, `react-dom`, `@tauri-apps/*`, testing libs)
2. Path-aliased / absolute imports (none yet — reserved for future `@/` config)
3. Relative imports (`../`, `./`)
4. Type-only imports (`import type { X } from "..."`) — last group
5. CSS / asset imports — very last

**Side-effect rules:**
- `useEffect` only for syncing external state (Tauri data, DOM listeners, timers).
- Setup + teardown live in the same effect — never split.
- Effect dependency arrays must be exhaustive; suppress with `// eslint-disable-next-line` only with an adjacent comment explaining why.

**State scope:**
- Local component state → `useState` / `useReducer`.
- Cross-component state → custom hook + React context (defer Redux/Zustand/Jotai to v1.1).
- Server / IPC state → fetch in a hook at the page/App level, pass down via props. Components do NOT fetch.

## Rule 7 — Animation discipline (VVI per user 2026-05-28)

Polish is editorial software: every motion is deliberate, every state transition is choreographed. There are no instant pop-ins. There is no jank.

- **Page transitions:** `<AnimatePresence>` + `<motion.div variants={fadeUp}>` (240 ms ease-out).
- **Modals / drawers / toasts:** Framer Motion variants only — never instant. Use `scaleIn` for modals, `slideFromRight` for drawers, `toastSlide` for the toast stack.
- **List reorder / add / remove:** put the `layout` prop on each item so Framer FLIPs the position delta.
- **Numeric values that change** (recoverable bytes, file counts, progress percentages): animate via `useMotionValue` + `useTransform` count-up — never snap.
- **Hover / press micro-interactions:** Tailwind transition utilities driven by `--t-base` + `--ease-out` tokens. No jarring colour jumps; cross-fade backgrounds.
- **Skeleton loaders during async:** shimmer animation (Framer-driven gradient sweep, not CSS keyframe).
- **Scan progress:** smooth `motion.div` width animation, not a stepping bar.
- **Loading spinners:** Framer Motion continuous rotate (`animate={{ rotate: 360 }}`), not CSS keyframes.
- **`prefers-reduced-motion`:** when true, drop animation duration to `DURATION_FAST` (120 ms) or swap variants entirely. Use the `usePrefersReducedMotion` hook to conditionally select variants. This is **NOT optional** — every variant consumer must honour it.
- **All variants live in `src/lib/motion.ts`.** NEVER inline variants in a component. NEVER hand-roll a new ease/duration without first adding it to `lib/motion.ts`. Import from there.

## Rule 8 — Locked stack (PLAN.md §5)

The PLAN.md §5 tech-stack table is authoritative. Do not extend the runtime dependency surface without an explicit rule change here.

- **Styling:** Tailwind v4 utility classes. CSS-first config (`src/styles/index.css` + `@theme inline`). No inline `style={}` except for genuinely dynamic values (animated counts, runtime accent overrides) that no utility can express.
- **Component scaffolding:** shadcn/ui — copy-paste, components live in `src/components/ui/`, not a runtime dependency.
- **Accessibility primitives:** Radix UI (Dialog, Tooltip, DropdownMenu, Switch, Checkbox, Tabs, Toast, Progress, Slot) — every modal/menu/disclosure must compose a Radix primitive.
- **Icons:** Lucide React. NEVER inline SVG except for the wordmark / brand glyphs.
- **Motion:** Framer Motion for ALL motion (see Rule 7).
- **State:** Zustand for cross-component state (the v1.1 deferral noted in earlier copies of this doc is hereby lifted). Local state still uses `useState`; server/IPC state uses TanStack Query.
- **IPC client cache:** TanStack Query for ALL Tauri IPC calls. Wrap the typed wrappers in `src/lib/commands.ts` with `useQuery` / `useMutation` in `src/hooks/use<X>.ts`. No bare `await invoke(...)` in components or pages.
- **Runtime validation at the IPC boundary:** Zod schemas in `src/lib/schemas/` (lands Phase 2).
- **Date / time:** `date-fns` (no Moment, no Day.js, no native `Date` formatting in components).
- **No new UI library** (MUI / Chakra / Mantine / Ant / etc.) without an amendment to this rule signed off by the user.

## Pre-commit checklist (frontend changes)

1. `npm test` exits 0.
2. `npx tsc -b --noEmit` exits 0 (no new TS errors).
3. New source file → matching `__tests__/` file added in same commit.
4. New `interface` / `type` declarations → in `src/types/`, not in the component.
5. No new global CSS in `styles.css` for component-scoped styles.
6. No function definition in a component / page file other than the default-exported component (Rule 4).
7. No `import { invoke } from "@tauri-apps/api/core"` outside `src/lib/commands.ts` (Rule 5).
8. File sizes within caps (Rule 6).

## What NOT to do

- Do not co-locate tests with source (`Component.test.tsx` next to `Component.tsx`) — must live under `__tests__/` mirror tree.
- Do not declare types inside components or pages.
- Do not call `invoke` from components directly — use `src/lib/commands.ts`.
- Do not write logic-bearing helpers inside component files — extract to `lib/` or `hooks/`.
- Do not introduce `export default` in `lib/`, `hooks/`, `types/`, or `constants/` files.
- Do not commit `*.tsbuildinfo` (root `.gitignore` already handles this).
- Do not add UI libraries outside the Rule 8 locked stack (Tailwind v4 + shadcn/ui + Radix + Lucide + Framer Motion). MUI / Chakra / Ant / Mantine are forbidden.
- Do not add state-management libraries outside Zustand (locked-stack choice for cross-component state per Rule 8). Redux / Jotai / Recoil are forbidden.
- Do not silently bypass file-size caps with split-by-arbitrary-line-count "Part1" / "Part2" files — split by concern.

---

*Last updated: 2026-05-28. Update when frontend file structure, test framework, or type-organization rules change.*
