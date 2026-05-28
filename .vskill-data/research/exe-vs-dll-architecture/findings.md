---
query: "Should Polish use single-exe + DLL plugin architecture instead of multiple .exe binaries? Will multi-exe scale as features grow?"
type: technical
depth: medium
date: 2026-05-28
confidence: high
---

# Multi-EXE vs Single-EXE + DLL Plugin Architecture

## Executive Summary

**The premise of the question is half-right.** Multi-exe is the correct answer for the **privilege boundary** (Windows Session 0 isolation since Vista forces SYSTEM service and user UI into separate processes — non-negotiable). DLL plugin architecture is the correct answer for **in-process feature scaling** (adding more cleanup categories, rules, AI integrations). The two are **orthogonal**, not alternatives.

**Recommendation: keep the multi-exe architecture in PLAN.md §4 AND add a Rust workspace pattern where `polish-engine` is a shared library (rlib statically linked into all binaries at v1.0; optionally cdylib + plugin DLL system at v2+ for community extensions).**

Top confirmed findings:
- ✅ **Session 0 isolation (Windows Vista+) makes single-exe-with-DLLs impossible for SYSTEM+user split.** Service runs in session 0, UI must run in user session. They cannot be the same process. ([MS architecture references](https://inairspace.com/blogs/learn-with-inair/windows-service-interact-with-desktop-a-deep-dive-into-secure-system-architecture))
- ✅ **Major production peers use multi-exe.** [Tailscale ships 3 binaries](https://deepwiki.com/tailscale/tailscale/6-build-and-deployment): `tailscaled.exe` (service), `tailscale.exe` (CLI), GUI. [WireGuard ships 4+](https://git.zx2c4.com/wireguard-windows/about/docs/enterprise.md): `wireguard-installer.exe`, `wireguard.exe` (manager service + UI), `wg.exe` (CLI), per-tunnel `WireGuardTunnel$name` services.
- ✅ **Multi-exe does not multiply signing reputation cost much.** Per [MS Learn](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation) + [Artifact Signing GA blog](https://techcommunity.microsoft.com/blog/microsoft-security-blog/simplifying-code-signing-for-windows-apps-artifact-signing-ga/4482789): "With Azure Artifact Signing, signing reputation isn't tied to a single certificate but is anchored to verified identity in Azure, and every signature reflects that verified identity." Publisher reputation is shared across binaries signed by the same identity. Per-file-hash reputation still seasons individually but the publisher signal carries.
- ✅ **Rust workspace with shared library + multiple bin targets is a standard pattern.** ([Cargo Workspaces](https://doc.rust-lang.org/book/ch14-03-cargo-workspaces.html)) Polish can structure `polish-engine` as a workspace lib that `polish-svc.exe`, `polish-ui.exe`, `polish-cli.exe`, and `polish-pro.exe` all depend on. Zero code duplication. Static linking by default; switch to cdylib only when plugin DLL loading is actually needed.
- ⚠️ **Rust DLL plugin systems work but with real caveats.** [`abi_stable`](https://crates.io/crates/abi_stable) + [`libloading`](https://nullderef.com/blog/plugin-abi-stable/) enable runtime plugin loading, but: Rust ABI is unstable across compiler versions and even compiler runs; no sandbox (malicious plugin = full system access); plugins must be built with same rustc as host. Production-viable for trusted plugins, not for untrusted third-party.

The user's concern ("too many exes won't scale") is rooted in a real frustration but is the wrong axis. EXE count is a function of **trust boundaries** (each privilege/license level = one binary). Feature count is a function of **what's inside the engine library**. Adding 50 new cleanup rules adds zero new binaries.

---

## Section 1 — Privilege boundary forces multi-process (non-negotiable)

**Session 0 isolation (Windows Vista, 2007 onwards):**

Windows services run in **session 0**, which since Vista is **isolated from any interactive user session**. A service cannot create UI windows that the user sees. It must use IPC (named pipes, sockets, COM) to communicate with a user-session process that owns the UI.

Direct quote from architecture sources:

> "Windows services run in session 0 (isolated from user interactive desktops since Vista), with direct UI interaction restricted; they must use IPC, named pipes, sockets, or other techniques to communicate with user sessions." ([Seelen-UI architecture](https://deepwiki.com/eythaann/Seelen-UI/2.4-service-architecture))

> "The high-privilege service never creates UI itself; it simply sends a request to a low-privilege client that is permitted to do so. This method maintains the session boundary." ([Inairspace deep dive](https://inairspace.com/blogs/learn-with-inair/windows-service-interact-with-desktop-a-deep-dive-into-secure-system-architecture))

Why multi-process is hard-required:

1. **Shatter attacks.** If a service running as SYSTEM had UI in the user session, malicious code could send window messages to elevate privileges. "Interact with Desktop" right has been deprecated since Vista for exactly this reason.
2. **Session 0 has no graphics device.** Even if allowed, a service process can't render to user displays.
3. **Per-user state.** UI must live in the user's session to read their settings, theme, DPI, etc.

**Implication for Polish:** `polish-svc.exe` (SYSTEM, session 0) and `polish-ui.exe` (user, current session) **cannot be merged into one binary that loads UI as a DLL**. This is a Windows OS architectural fact, not a design choice. PLAN.md §4 is correct.

**Sources:**
- [Seelen-UI Service Architecture](https://deepwiki.com/eythaann/Seelen-UI/2.4-service-architecture)
- [Inairspace — Windows Service Interact with Desktop](https://inairspace.com/blogs/learn-with-inair/windows-service-interact-with-desktop-a-deep-dive-into-secure-system-architecture)

---

## Section 2 — Trade-offs: multi-exe vs single-exe + DLL plugins

| Dimension | Multi-exe | Single-exe + DLL plugins |
|---|---|---|
| **Privilege boundary** | ✅ Clean (separate process tokens) | ❌ Cannot split SYSTEM/user in one process |
| **Crash isolation** | ✅ Crashing plugin can't take host down | ❌ Plugin DLL crash = host crash |
| **Update path** | ⚠️ Each binary updates independently (more steps) | ✅ Update one host + selected DLLs |
| **Disk size** | ⚠️ Code duplication if not sharing a lib | ✅ Smaller, shared host code |
| **Build time** | ⚠️ Multiple link steps | ✅ Faster incremental for plugin-only changes ([per dev.to plugin post](https://dev.to/mineichen/plugin-based-architecture-in-rust-4om7): 1.4s vs 2.1s) |
| **ABI stability** | ✅ Process boundary uses stable wire format (JSON/proto over IPC) | ❌ Rust ABI unstable across rustc versions and even runs |
| **Plugin security** | ✅ Process can be sandboxed (low-IL token, AppContainer) | ❌ DLL has full host privileges; abi_stable explicitly does NOT sandbox |
| **Signing/reputation cost** | ⚠️ Per-binary file hash seasons separately | ✅ One host binary to season |
| **Publisher reputation** | ✅ Shared via identity (Artifact Signing) | ✅ Shared |
| **Open-core enforcement** | ✅ Separate proprietary binary = clear license boundary | ⚠️ Loading a closed DLL from MIT host is legal but ambiguity-prone |
| **Debugging** | ⚠️ Multi-process debug is harder | ✅ Single process |
| **Production-tested precedent in same niche** | ✅ Tailscale, WireGuard, Firezone | ⚠️ Browser extensions, OBS, VSCode — but those don't span SYSTEM/user split |

**The trade-off is not "scaling."** Both architectures scale to large feature counts. The trade-off is **trust/security boundary vs. iteration speed**.

Polish needs the trust boundary (SYSTEM service + open-core Pro), so multi-exe wins for the top-level architecture. Inside each binary, code can be modular via the engine library, and **plugin DLLs can be added later if community extensions become a goal**.

**Sources:**
- [Plugin-based architecture in Rust (DEV)](https://dev.to/mineichen/plugin-based-architecture-in-rust-4om7)
- [Rust Plugins tutorial](https://zicklag.github.io/rust-tutorials/rust-plugins.html)
- [abi_stable crate](https://crates.io/crates/abi_stable)

---

## Section 3 — Rust workspace + shared engine library pattern

This is what PLAN.md §4.5 implicitly prescribes and what the user's concern actually deserves.

**Cargo workspace layout (proposed):**

```
polish/
├── Cargo.toml                  # workspace root
├── crates/
│   ├── polish-engine/          # MIT, the shared library
│   │   ├── Cargo.toml          # [lib] crate-type = ["rlib"]   (static, v1.0)
│   │   └── src/lib.rs          # cleanup rules, .pq quarantine, scanner, IPC types
│   ├── polish-ipc/             # MIT, shared wire-format types (serde structs)
│   │   └── Cargo.toml
│   ├── polish-svc/             # MIT, binary
│   │   └── src/main.rs         # depends on polish-engine + polish-ipc
│   ├── polish-ui/              # MIT, binary (Tauri)
│   │   └── src/main.rs         # depends on polish-engine + polish-ipc
│   ├── polish-cli/             # MIT, binary
│   │   └── src/main.rs
│   └── polish-pro/             # closed-source (v1.2+), binary
│       └── src/main.rs         # depends on polish-engine (linked) + Pro features
└── target/                     # shared build output
```

Per [Cargo Workspaces docs](https://doc.rust-lang.org/book/ch14-03-cargo-workspaces.html):
- All crates share one `Cargo.lock` + one `target/` directory.
- Binary crates depend on `polish-engine` as a path dependency.
- No code duplication. Adding a new cleanup category = add module to `polish-engine`, all binaries get it automatically.

**Why rlib (static) for v1.0, not cdylib (dynamic):**
- Smaller deployment (no separate .dll file to ship + sign).
- No ABI concerns — static linking embeds the right ABI.
- Simpler signing (3 binaries, not 3 binaries + 1 DLL).
- Easier debugging.
- Can switch to cdylib later if a plugin system is wanted.

**When to switch to cdylib (v2+):**
- If you want third-party plugins (`polish-plugin-myrule.dll` shipped by community).
- If hot-reload of cleanup rules without restart becomes important.
- If `polish-pro.exe` should consume the engine as a DLL to ship Pro updates independently from the OSS engine update cycle.

**Cargo crate-type reference:** Per [Cargo Targets](https://doc.rust-lang.org/cargo/reference/cargo-targets.html), library crates can be `rlib`, `dylib`, `cdylib`, `staticlib`. Binary crates are always `bin`. A workspace can mix all of these.

**Sources:**
- [Cargo Workspaces (Rust book ch14.3)](https://doc.rust-lang.org/book/ch14-03-cargo-workspaces.html)
- [Cargo Targets reference](https://doc.rust-lang.org/cargo/reference/cargo-targets.html)

---

## Section 4 — Rust plugin patterns for future feature scale

If/when Polish wants runtime-loadable plugins (v2+ likely use case: community cleanup rules), the production-viable Rust path is:

**Recommended stack:**
- [`abi_stable`](https://crates.io/crates/abi_stable) — high-level wrapper over `libloading`, provides ABI-stable types (RString, RVec, RHashMap), trait objects, error handling.
- [`libloading`](https://docs.rs/libloading/) — raw cross-platform dynamic library loading. abi_stable uses it under the hood.
- Plugin contract = a single C-ABI exported function (`extern "C" fn polish_plugin_init() -> PluginV1`) returning a vtable of capabilities.

**Hard caveats (per [NullDeref Plugins in Rust series](https://nullderef.com/blog/plugin-abi-stable/)):**

1. **Rust ABI is unstable.** Not just across rustc versions — across compiler runs. A plugin built with rustc 1.80.0 may not load against a host built with rustc 1.80.0 from a different invocation. abi_stable mitigates this by enforcing C-ABI at the boundary.
2. **No sandbox.** Quote: "abi_stable doesn't include a sandbox, so if the plugin developer was a malicious actor, they'd have full access to the computer the runtime is being executed on." For Polish, this means: plugin DLLs must be signed and trusted. Untrusted community plugins = unacceptable risk.
3. **rustc version lock.** Plugins must be built with the same Rust version as the host. Forces a versioning story.
4. **Thread-safety platform delta.** abi_stable + libloading thread-safety is fully OK on Windows; FreeBSD has dlerror issues; not relevant for Polish but worth noting if Polish ever goes cross-platform.

**Verdict:** Plugin DLLs are a v2+ feature, not a v1.0 architectural decision. The workspace + rlib pattern in Section 3 gives you most of the modularity benefit with none of the ABI/security cost.

**Sources:**
- [abi_stable crate](https://crates.io/crates/abi_stable)
- [Plugins in Rust: Reducing the Pain with Dependencies (NullDeref)](https://nullderef.com/blog/plugin-abi-stable/)
- [Plugins in Rust: Getting Started (NullDeref)](https://nullderef.com/blog/plugin-start/)
- [ABI stability of dylib vs cdylib (Rust forum)](https://users.rust-lang.org/t/abi-stability-guarantee-of-dylib-vs-cdylib/50879)

---

## Section 5 — Real-world Windows-service product precedent

Both top peers in the privileged-Windows-service-with-UI category use multi-exe. This is convergent evolution, not coincidence.

**Tailscale (3 binaries, per [DeepWiki](https://deepwiki.com/tailscale/tailscale/6-build-and-deployment) + [GitHub issue #1232](https://github.com/tailscale/tailscale/issues/1232)):**
1. `tailscaled.exe` — open-source Windows Service (the daemon). Notably: uses **internal parent/subprocess split** for crash recovery — "Parent Process (ipnService) runs as the Windows Service, manages child lifecycle." The actual networking logic is in a subprocess.
2. `tailscale.exe` — open-source CLI.
3. GUI binary — historically combined with daemon in pre-1.6, **explicitly split out in 1.6** for cleaner separation. The 1.6 split was driven by enterprise IT needing the daemon without the GUI.

This is **exactly** the trajectory Polish would face: starting with combined binaries gets ugly fast when you need headless deploy, MSP profiles, or CLI-only use. Better to start split.

**WireGuard Windows (4+ binaries, per [official docs](https://git.zx2c4.com/wireguard-windows/about/docs/enterprise.md)):**
1. `wireguard-installer.exe` — picks the right MSI per architecture.
2. `wireguard.exe` — manager service + tray UI host. (Same binary registered as both manager service and UI host; uses Session 0 awareness internally.)
3. `wg.exe` — CLI, installed to `C:\Windows\System32`.
4. `WireGuardTunnel$<name>` — one Windows Service **per tunnel**. Created/destroyed dynamically via `wireguard /installtunnelservice`. Wireguard literally spawns more services on-demand for feature scale.

This is the strongest counter-evidence to the user's concern. WireGuard scales to dozens of services per machine via the multi-exe model and it works fine.

**Firezone ([blog post](https://www.firezone.dev/blog/using-tauri)):** Two-process Tauri model with privileged backend + UI. Same split as PLAN.md §4.

**Sources:**
- [Tailscale GitHub issue #1232](https://github.com/tailscale/tailscale/issues/1232)
- [Tailscale Client Applications (DeepWiki)](https://deepwiki.com/tailscale/tailscale/6-build-and-deployment)
- [WireGuard Windows enterprise docs](https://git.zx2c4.com/wireguard-windows/about/docs/enterprise.md)
- [Firezone — Tauri two-process](https://www.firezone.dev/blog/using-tauri)

---

## Section 6 — Open-core enforcement: separate binary vs DLL

PLAN.md §3 Phase 1.2 + PROJECT.md §5 specify: `polish-pro.exe` is a separate closed-source binary that links MIT `polish-engine`. Research confirms this is the right open-core enforcement choice.

Per [OneUptime — Open Source vs Open Core](https://oneuptime.com/blog/post/2026-02-14-open-source-vs-open-core/view):

> "A clear indicator of an open core model is when you need a different binary or a proprietary plugin for certain features."

Per [GitLab — Open core vs plugins](https://about.gitlab.com/blog/2022/07/14/open-core-is-worse-than-plugins):

> "Open core companies often choose between requiring separate binaries (stricter enforcement) versus allowing dynamic plugins (more flexible integration)."

> "There's a chicken-and-egg problem of premature abstraction: in order to make a good plugin API, you need to see it being used, but in order to see how it is being used, you need to first have it, which delays initial availability."

**For Polish specifically:**
- Separate `polish-pro.exe` = **stricter enforcement**. Pirates must rebuild from leaked source. Closed binary boundary is unambiguous.
- DLL plugin = **more flexible**. But: requires upfront design of a stable plugin API before you know what plugins look like. Premature abstraction risk.

**Verdict:** Keep the separate-binary architecture for v1.2 Pro. Reconsider DLL plugin model only at v2+ when you have real usage data on what extensions people want.

**Sources:**
- [OneUptime — Open Source vs Open Core](https://oneuptime.com/blog/post/2026-02-14-open-source-vs-open-core/view)
- [GitLab — Open core is worse than plugins... and that's why it's better](https://about.gitlab.com/blog/2022/07/14/open-core-is-worse-than-plugins)
- [TermsFeed — Dual Licensing vs Open Core](https://www.termsfeed.com/blog/dual-licensing-vs-open-core/)

---

## Recommended action on PLAN.md / PROJECT.md

**No architectural change needed.** PLAN.md §4 is correct. But the docs should be tightened to explain WHY multi-exe is non-negotiable and how the engine library prevents code duplication. Two surgical additions worth making:

1. **PLAN.md §4** — add explicit subsection "Why multi-exe, not single-exe + DLLs": short note on Session 0 isolation, shatter-attack defense, open-core enforcement clarity. Cites Tailscale + WireGuard precedent.

2. **PLAN.md §6 Repository layout** — make the workspace structure explicit:
   - `crates/polish-engine` (rlib, MIT) — the shared library every binary consumes.
   - `crates/polish-ipc` (rlib, MIT) — shared serde types for named-pipe IPC.
   - `crates/polish-svc`, `crates/polish-ui`, `crates/polish-cli` (bins, MIT).
   - `crates/polish-pro` (bin, closed-source from v1.2) — links `polish-engine` as path dependency.

3. **PLAN.md §3 / §21 roadmap** — optionally note: "DLL plugin system via `abi_stable` evaluated for v2+ if community contributions become a goal. Not in v1.0–v1.2."

---

## Gaps & Open Questions

- No quantitative data on **Tauri 2 + Rust workspace** specific patterns — search returned generic Cargo workspace info, not Tauri-specific. Build the actual workspace during Week 1–3 spike to verify.
- No data on **`polish-engine` binary-size impact** when statically linked into 4 binaries vs. shared dynamically. Likely measured in tens of MB but worth profiling.
- **Plugin API design for v2+** — premature to scope now. Defer until v1.2 ships and community signal emerges.
- **MSI installer flow for 4 binaries** — WireGuard uses one MSI; Tailscale uses one. Polish should plan for one NSIS installer that drops all binaries to `Program Files\Polish\`. Not researched in detail here.
- **Smart App Control behavior on multi-binary install** — does SAC need to season each binary independently? Inferred yes (file hash is per-binary) but no quantitative data on real-world install completion impact.

---

## Sources

- [MS Learn — SmartScreen reputation](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation) — high
- [MS Tech Community — Artifact Signing GA](https://techcommunity.microsoft.com/blog/microsoft-security-blog/simplifying-code-signing-for-windows-apps-artifact-signing-ga/4482789) — high
- [MS Learn — Code signing options](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options) — high
- [Inairspace — Windows Service Interact with Desktop deep dive](https://inairspace.com/blogs/learn-with-inair/windows-service-interact-with-desktop-a-deep-dive-into-secure-system-architecture) — high
- [Seelen-UI Service Architecture (DeepWiki)](https://deepwiki.com/eythaann/Seelen-UI/2.4-service-architecture) — medium
- [Cargo Workspaces (Rust book ch14.3)](https://doc.rust-lang.org/book/ch14-03-cargo-workspaces.html) — high
- [Cargo Targets reference](https://doc.rust-lang.org/cargo/reference/cargo-targets.html) — high
- [abi_stable crate](https://crates.io/crates/abi_stable) — high
- [NullDeref — Plugins in Rust: Reducing the Pain with Dependencies](https://nullderef.com/blog/plugin-abi-stable/) — high
- [NullDeref — Plugins in Rust: Getting Started](https://nullderef.com/blog/plugin-start/) — high
- [DEV — Plugin-based architecture in Rust](https://dev.to/mineichen/plugin-based-architecture-in-rust-4om7) — medium
- [Rust forum — ABI stability of dylib vs cdylib](https://users.rust-lang.org/t/abi-stability-guarantee-of-dylib-vs-cdylib/50879) — medium
- [Tailscale GitHub issue #1232 (windows: make service open source)](https://github.com/tailscale/tailscale/issues/1232) — high
- [Tailscale Client Applications (DeepWiki)](https://deepwiki.com/tailscale/tailscale/6-build-and-deployment) — high
- [WireGuard Windows enterprise docs](https://git.zx2c4.com/wireguard-windows/about/docs/enterprise.md) — high
- [Firezone — Tauri two-process](https://www.firezone.dev/blog/using-tauri) — high
- [OneUptime — Open Source vs Open Core](https://oneuptime.com/blog/post/2026-02-14-open-source-vs-open-core/view) — medium
- [GitLab — Open core vs plugins](https://about.gitlab.com/blog/2022/07/14/open-core-is-worse-than-plugins) — medium
- [TermsFeed — Dual Licensing vs Open Core](https://www.termsfeed.com/blog/dual-licensing-vs-open-core/) — medium

---

Searches run: 8 | Pages fetched: 0
