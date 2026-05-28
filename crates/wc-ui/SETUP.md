# wc-ui — setup

Codename `wc-ui` (display: **Polish**). Tauri 2 + React + Vite frontend.

## First-time setup

```powershell
# from repo root
cd crates/wc-ui
npm install
# adds Tauri 2 native shell (src-tauri/)
npx @tauri-apps/cli@latest init
```

Answer the `tauri init` prompts:

| Prompt | Answer |
|---|---|
| App name | `Polish` |
| Window title | `Polish` |
| Web assets location | `../dist` |
| Dev server URL | `http://localhost:1420` |
| Frontend dev command | `npm run dev` |
| Frontend build command | `npm run build` |

After `tauri init` succeeds:

1. Uncomment `"crates/wc-ui/src-tauri"` in the root `Cargo.toml` workspace members.
2. Add `wc-core`, `wc-app`, `wc-ipc` as path deps in `crates/wc-ui/src-tauri/Cargo.toml`.
3. Set `identifier` in `crates/wc-ui/src-tauri/tauri.conf.json` to `io.polish.app`.

## Run

```powershell
# web only (Vite, no Tauri shell)
npm run dev

# full Tauri app
npm run tauri dev
```

## Build

```powershell
npm run tauri build
```

Output: `crates/wc-ui/src-tauri/target/release/bundle/`.

## Notes

- Tauri 2 `identifier` must be reverse-DNS, not `com.tauri.dev`. Use `io.polish.app`.
- Code-signing happens at the NSIS / MSI bundle level. See `PLAN.md §14.2`.
- Window emits / IPC contract: see `crates/wc-ipc/`.
