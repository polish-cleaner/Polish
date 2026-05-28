# apps/ — web properties

Reserved for future web apps. Empty today.

## Planned

| Path | Purpose | Version | Stack (TBD) |
|---|---|---|---|
| `apps/website/` | Marketing + download (polish.io) | post-v1.0 launch | Astro or Next |
| `apps/docs/` | User docs + contributor docs | with v1.0 launch | Astro Starlight (per `PLAN.md §18`) |
| `apps/landing/` | Pre-v1.0 email waitlist landing | Week 18–24 (`PROJECT.md §11`) | Static (Astro) |

The Tauri desktop app lives at `crates/wc-ui/` per `ARCHITECTURE.md §2` —
**not** under `apps/`.

## Why split

- `crates/` = Rust workspace (Cargo).
- `apps/` = web (Node / pnpm workspace).
- `packages/` = shared TS libraries consumed by `apps/*` + `crates/wc-ui/`.

Mixing Cargo and Node workspaces under one directory bites at toolchain
boundaries; separating keeps Cargo + pnpm/npm builds independent.
