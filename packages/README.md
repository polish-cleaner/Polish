# packages/ — shared TS libraries

Reserved for shared TypeScript packages consumed by `apps/*` and
`crates/wc-ui/`.

## Planned (per ARCHITECTURE.md §2 + PLAN.md §6)

| Path | Purpose |
|---|---|
| `packages/ipc-types/` | TS types generated from `crates/wc-ipc/` serde structs |
| `packages/design-tokens/` | Shared design tokens (colors, spacing, type) — Polish brand |
| `packages/ui-kit/` | (later) shared React components between desktop UI + website |

Codegen plan: `cargo run -p wc-ipc --bin codegen` → emits TS into
`packages/ipc-types/src/` so desktop UI and website both consume one schema.
