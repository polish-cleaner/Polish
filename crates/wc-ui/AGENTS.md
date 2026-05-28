# AGENTS.md — `wc-ui` (Polish Tauri 2 + React frontend)

> Frontend-specific rules. Compose with root `AGENTS.md`. If a rule here conflicts with root, this one wins for files under `crates/wc-ui/`.

## File structure (required)

```
crates/wc-ui/src/
├── __tests__/           one *.test.tsx per source file in src/ (rule 1)
├── components/          reusable presentational components (each <120 lines)
├── lib/                 pure helper functions (formatters, grouping, parsing)
├── pages/               top-level page components (composed by App.tsx)
├── types/               ALL type / interface declarations (rule 2)
│   ├── finding.ts
│   ├── environment.ts
│   └── <domain>.ts
├── App.tsx              root component — composes pages, owns top-level state
├── main.tsx             ReactDOM entry — do not put logic here
├── styles.css           global styles only (resets, tokens, typography)
└── vite-env.d.ts
```

Per-component CSS goes inline (CSS Modules) or in a colocated `<Component>.module.css` file. Do NOT add new global rules to `styles.css` for component-scoped styling.

## Rule 1 — tests in `__tests__/`

**Every file in `src/` that exports anything testable MUST have a corresponding test file in `src/__tests__/`.**

Pattern:

| Source | Test |
|---|---|
| `src/App.tsx` | `src/__tests__/App.test.tsx` |
| `src/components/EnvList.tsx` | `src/__tests__/components/EnvList.test.tsx` |
| `src/lib/format.ts` | `src/__tests__/lib/format.test.ts` |
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
| ```tsx<br>// in App.tsx<br>interface Finding { path: string; size: number; }<br>``` | ```ts<br>// in src/types/finding.ts<br>export interface Finding {<br>  path: string;<br>  size: number;<br>  category_id: string;<br>}<br>``` then `import type { Finding } from "@/types/finding";` |

**Naming:**
- One file per domain noun (`finding.ts`, not `findings.ts`).
- File name matches the primary type's name in lowercase-kebab.
- Re-export aggregate from `src/types/index.ts` ONLY if the type is consumed in 5+ places — otherwise prefer direct path import (`import type { Foo } from "@/types/foo"`).

**Allowed in component files:**
- Local-only `type` aliases that never leak out of the component (e.g., a single-use prop tuple). Threshold: if it appears in 2+ files, move it.
- React-built-in generic specializations inline (`useState<string>(…)`).

**Mirror Rust domain types.** When a Tauri command returns a Rust type, the matching TS interface in `src/types/<x>.ts` must mirror the Rust field names and types exactly. If the Rust struct changes, update the TS type in the same PR.

## Rule 3 — DRY (inherited)

See root `AGENTS.md` "Conventions when editing" → DRY entry. Frontend-specific application:

- Repeated `formatMiB`, `groupByCategory`, byte-formatting, date-formatting → `src/lib/format.ts`.
- Repeated `invoke` wrappers (e.g., `scan()`, `executeCleanup()`) → `src/lib/commands.ts` with one typed wrapper per Tauri command. UI never calls `invoke` directly past v1.0; it imports from `commands.ts`.
- Repeated state machines (loading / data / error) → custom hook in `src/hooks/<name>.ts`.

## Pre-commit checklist (frontend changes)

1. `npm test` exits 0.
2. `npx tsc -b --noEmit` exits 0 (no new TS errors; pre-existing scaffold issues tracked separately).
3. New source file → matching `__tests__/` file added in same commit.
4. New `interface` / `type` declarations → in `src/types/`, not in the component.
5. No new global CSS in `styles.css` for component-scoped styles.

## What NOT to do

- Do not co-locate tests with source (`Component.test.tsx` next to `Component.tsx`) — must live under `__tests__/` mirror tree.
- Do not declare types inside components or pages.
- Do not call `invoke` from components directly once `src/lib/commands.ts` exists; use the typed wrapper.
- Do not commit `*.tsbuildinfo` (root `.gitignore` already handles this).
- Do not add UI libraries (MUI, Chakra, shadcn) without explicit user approval — Polish ships pure CSS until v1.1.

---

*Last updated: 2026-05-28. Update when frontend file structure, test framework, or type-organization rules change.*
