# ARCHITECTURE.md — Polish

> **Authoritative on code structure, layering, and patterns.** Source: `PLAN.md` §4/§6 supersede pointer. Research artifact: `.vskill-data/research/best-code-architecture-polish-rust/`.
>
> **Source-of-truth ordering for architecture conflicts:** `PROJECT.md` (scope) > `PLAN.md` (design) > `ARCHITECTURE.md` (code structure) > `docs/project-structure/` (feature catalog).
>
> **Status:** Locked design for v1.0 build. Re-litigate only with explicit user direction.
>
> **Last updated:** 2026-05-28

---

## TL;DR

| Concern | Pick |
|---|---|
| Style | Hexagonal (Ports & Adapters) |
| Workspace | Cargo workspace + multiple bin crates sharing one lib crate |
| State invariants | Typestate pattern + sealed traits |
| Plugin registration | `inventory` crate (distributed, no central registry) |
| Errors | `thiserror` in libs, `anyhow` in bins |
| Mocking | `mockall::automock` on every port trait |
| Dep direction | Enforced via `cargo-deny` config |
| Async | `tokio` + stable `async fn in traits` (Rust 1.75+) |
| Lints | `clippy::unwrap_used`, `clippy::panic` denied outside tests |
| Doc tests | Required for every public item in `polish-core` |

---

## 1. Architectural style — Hexagonal (Ports & Adapters)

Domain logic does not import infrastructure. Infrastructure implements domain-defined traits (ports). Everything outside the domain is an adapter.

```
        ┌─────────────────────────────┐
        │     polish-cli (bin)        │
        ├─────────────────────────────┤
        │     polish-ui (bin)         │   inbound adapters
        ├─────────────────────────────┤
        │     polish-svc (bin)        │
        ├─────────────────────────────┤
        │     polish-pro (bin, closed)│
        └──────────────┬──────────────┘
                       │  uses
        ┌──────────────▼──────────────┐
        │  polish-app  (lib)           │   application layer (use cases)
        │  - scan / preview / execute  │
        │  - quarantine orchestration  │
        │  - format-prep wizard (v1.2) │
        └──────────────┬──────────────┘
                       │  uses
        ┌──────────────▼──────────────┐
        │  polish-core  (lib)          │   domain — PURE, no I/O
        │  - Category, Rule traits     │
        │  - Quarantine domain model   │
        │  - .pq format model          │
        │  - Typestate pipeline        │
        │  - Port traits (definitions) │
        └──────────────▲──────────────┘
                       │  implements (ports)
        ┌──────────────┴──────────────┐
        │  polish-adapters (lib)      │   outbound adapters
        │  - fs (real disk)           │
        │  - registry                 │
        │  - wsl (wraps --manage)     │
        │  - notification (WinRT)     │
        │  - pq-writer                │
        │  - signing (Artifact / Certum / SignPath) │
        │  - categories/<id>.rs       │
        └─────────────────────────────┘
```

**Why this style:**

| Polish need | Hexagonal answer |
|---|---|
| MIT engine + closed Pro binary | `polish-pro` implements/extends ports same as `polish-adapters`. Same domain. No leakage. |
| Future cross-platform (post v2+) | Add `polish-adapters-linux` crate. Zero core change. |
| Test without Windows/admin | Swap real adapter for `MockFsPort` etc. in `polish-app` tests. |
| Swap signing provider | `SigningPort` trait + 3 impls. Wired at startup. |
| Contributor adds cleanup category | One new file in `polish-adapters/src/categories/`. No central registry. |
| Survive contributor turnover | Architecture rules enforced by CI, not by reviewer memory. |

---

## 2. Cargo workspace layout (canonical)

> **This supersedes PLAN.md §6 layout.** PLAN.md §6 represented earlier thinking; this layout is what we build.
>
> **Codename note (2026-05-28):** the scaffolded workspace uses the `wc-*`
> crate-name prefix (codename, matches `windows-cleaner` repo dir). The
> diagram and trait examples below still read `polish-*` — they refer to the
> same crates. Mapping: `polish-core` ≡ `wc-core`, `polish-app` ≡ `wc-app`,
> `polish-adapters` ≡ `wc-adapters`, `polish-ipc` ≡ `wc-ipc`,
> `polish-test-fixtures` ≡ `wc-test-fixtures`, `polish-svc` ≡ `wc-svc`,
> `polish-ui` ≡ `wc-ui`, `polish-cli` ≡ `wc-cli`, `polish-pro` ≡ `wc-pro`
> (v1.2). Display name in product remains **Polish**.

```
polish/
├── Cargo.toml                          # workspace root
├── pnpm-workspace.yaml                 # TS side for polish-ui frontend
├── crates/
│   │
│   ├── polish-core/                    # MIT — PURE DOMAIN, NO I/O
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── category.rs             # Category trait, CategoryId, SafetyTier
│   │       ├── rule.rs                 # CleanupRule trait
│   │       ├── pipeline/               # typestate pipeline (see §3)
│   │       │   ├── mod.rs
│   │       │   ├── states.rs           # Scanned, Previewed, Executed, Restorable
│   │       │   └── transitions.rs
│   │       ├── quarantine.rs           # Quarantine domain model
│   │       ├── manifest.rs             # .pq manifest schema
│   │       ├── environment.rs          # Environment detection facts
│   │       └── ports/                  # ALL outbound trait definitions
│   │           ├── fs_port.rs
│   │           ├── reg_port.rs
│   │           ├── wsl_port.rs
│   │           ├── notify_port.rs
│   │           ├── pq_port.rs
│   │           ├── signing_port.rs
│   │           └── clock_port.rs       # testable time
│   │
│   ├── polish-app/                     # MIT — APPLICATION LAYER (use cases)
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── usecase/
│   │       │   ├── scan_disk.rs
│   │       │   ├── preview_cleanup.rs
│   │       │   ├── execute_cleanup.rs
│   │       │   ├── restore_quarantine.rs
│   │       │   └── format_prep_wizard.rs  # v1.2
│   │       └── orchestrator.rs         # wires use cases
│   │
│   ├── polish-adapters/                # MIT — CONCRETE ADAPTERS
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── fs/                     # std::fs + windows crate
│   │       ├── registry/               # winreg
│   │       ├── wsl/                    # wraps `wsl --manage --resize`
│   │       ├── pq_writer/              # segmented sub-archive + BLAKE3
│   │       ├── notification/           # WinRT toast + AUMID
│   │       ├── signing/                # Artifact / Certum / SignPath
│   │       └── categories/             # ONE FILE PER CATEGORY (see §4)
│   │           ├── mod.rs
│   │           ├── npm_cache.rs
│   │           ├── pnpm_cache.rs
│   │           └── cargo_cache.rs
│   │
│   ├── polish-ipc/                     # MIT — SERDE WIRE TYPES
│   │   └── src/lib.rs                  # depends only on polish-core types
│   │
│   ├── polish-test-fixtures/           # MIT — SHARED MOCKS + DATA
│   │   └── src/
│   │       ├── mock_fs.rs              # re-exports MockFsPort
│   │       ├── mock_wsl.rs
│   │       ├── fixtures/               # sample .pq, manifests
│   │       └── temp_disk.rs            # in-memory fs helper
│   │
│   ├── polish-svc/                     # MIT — bin: Windows Service
│   │   └── src/main.rs
│   ├── polish-ui/                      # MIT — bin: Tauri 2 + React
│   │   ├── src-tauri/src/main.rs
│   │   └── src/                        # React frontend
│   ├── polish-cli/                     # MIT — bin: CLI
│   │   └── src/main.rs
│   └── polish-pro/                     # CLOSED from v1.2 — bin
│       └── src/main.rs                 # links polish-engine, adds Pro features
│
├── packages/                           # TS side
│   ├── ipc-types/                      # codegen'd from polish-ipc serde
│   └── design-tokens/
│
├── installer/                          # NSIS template + sign config
├── docs/                               # user docs (Astro Starlight)
├── scripts/                            # build/sign/release helpers
├── .github/workflows/                  # ci.yml + release.yml
├── PROJECT.md
├── PLAN.md
├── ARCHITECTURE.md                     # (this file)
├── AGENTS.md
└── target/                             # one shared output dir
```

**Dependency direction rule (CI-enforced via `cargo-deny`):**

| Crate | May depend on |
|---|---|
| `polish-core` | **nothing** in workspace |
| `polish-app` | `polish-core` only |
| `polish-adapters` | `polish-core` only |
| `polish-ipc` | `polish-core` only (for shared types) |
| `polish-test-fixtures` | `polish-core` + `mockall` |
| `polish-svc` / `polish-ui` / `polish-cli` | `polish-core` + `polish-app` + `polish-adapters` + `polish-ipc` |
| `polish-pro` (closed) | same as bins, plus proprietary Pro modules |

**Never** `polish-core` → anything else. Build fails if violated.

---

## 3. Typestate cleanup pipeline

The cleanup flow has a strict invariant: `Scan → Preview → Execute → Quarantined → Restorable`. Typestate makes invalid transitions fail to compile.

```rust
// polish-core/src/pipeline/states.rs
pub struct Scanned;
pub struct Previewed;
pub struct Executed;
pub struct Restorable;

// Seal the state set
mod sealed {
    pub trait Sealed {}
    impl Sealed for super::Scanned {}
    impl Sealed for super::Previewed {}
    impl Sealed for super::Executed {}
    impl Sealed for super::Restorable {}
}
pub trait State: sealed::Sealed {}
impl<T: sealed::Sealed> State for T {}

// polish-core/src/pipeline/mod.rs
pub struct Cleanup<S: State> {
    findings: Vec<Finding>,
    _state: PhantomData<S>,
}

impl Cleanup<Scanned> {
    pub fn new(findings: Vec<Finding>) -> Self { /* ... */ }

    pub fn preview(self) -> Cleanup<Previewed> {
        // type changes; only Previewed has .execute()
        Cleanup { findings: self.findings, _state: PhantomData }
    }
}

impl Cleanup<Previewed> {
    pub fn execute<F: FsPort, P: PqPort>(
        self, fs: &F, pq: &P,
    ) -> Result<Cleanup<Executed>, CleanupError> { /* ... */ }
}

impl Cleanup<Executed> {
    pub fn into_restorable(self) -> Cleanup<Restorable> { /* ... */ }
}

impl Cleanup<Restorable> {
    pub fn restore<F: FsPort, P: PqPort>(
        self, fs: &F, pq: &P,
    ) -> Result<(), RestoreError> { /* ... */ }
}
```

**What the compiler rejects:**
- `cleanup.execute()` when `cleanup: Cleanup<Scanned>` — must `.preview()` first.
- `cleanup.restore()` unless `cleanup: Cleanup<Restorable>`.
- Double `.execute()` — first call consumes `self`, returns `Cleanup<Executed>`. Second call doesn't exist on that type.

**Properties:**
- Marker structs are 0-sized — zero runtime cost.
- Sealed trait prevents external crates from adding states.
- New state = explicit `polish-core` change, code review required.

---

## 4. Distributed category registration via `inventory`

**Pain point this solves:** in a naive registry, every new category requires editing a central `categories.rs`. Multi-contributor PRs = merge conflict storms.

**Pattern:**

```rust
// polish-core/src/category.rs — defined ONCE
pub trait Category: Send + Sync + 'static {
    fn id(&self) -> &'static str;
    fn name(&self) -> &'static str;
    fn safety_tier(&self) -> SafetyTier;       // Light | Balanced | Aggressive | Pro
    fn version_intro(&self) -> Version;         // when introduced (v1.0, v1.1, v1.2-Pro)
    fn scan(&self, ctx: &ScanContext) -> Vec<Finding>;
    fn supports(&self, env: &Environment) -> bool;
}

pub struct CategoryEntry {
    pub category: &'static dyn Category,
}

inventory::collect!(CategoryEntry);
```

```rust
// polish-adapters/src/categories/npm_cache.rs
// === CONTRIBUTOR WRITES ONLY THIS FILE ===
use polish_core::{Category, CategoryEntry, SafetyTier, Version, ScanContext, Finding, Environment};

pub struct NpmCacheCategory;

impl Category for NpmCacheCategory {
    fn id(&self) -> &'static str { "dev.npm.cache" }
    fn name(&self) -> &'static str { "npm cache (~/.npm)" }
    fn safety_tier(&self) -> SafetyTier { SafetyTier::Balanced }
    fn version_intro(&self) -> Version { Version::V1_0 }
    fn scan(&self, ctx: &ScanContext) -> Vec<Finding> { /* ... */ }
    fn supports(&self, env: &Environment) -> bool { env.has_npm() }
}

inventory::submit! {
    CategoryEntry { category: &NpmCacheCategory }
}
```

```rust
// polish-app/src/usecase/scan_disk.rs
pub fn all_categories() -> impl Iterator<Item = &'static dyn Category> {
    inventory::iter::<CategoryEntry>
        .into_iter()
        .map(|e| e.category)
}
```

**Properties:**
- Adding a category = one new file. Zero central edits. Zero merge conflicts.
- `polish-pro` (closed) registers Pro-only categories from inside its own binary. Same mechanism. No leakage into MIT engine.
- `inventory` uses ctor-style life-before-main init — fine on Windows. Stable, maintained by dtolnay.
- Alternative: `linkme` (linker-section-based, no life-before-main). Swap if needed.

---

## 5. Error handling discipline

**Rule:**
- `thiserror` in library crates (`polish-core`, `polish-app`, `polish-adapters`, `polish-ipc`) — typed variants callers can `match` on.
- `anyhow` in binary crates (`polish-svc/main.rs`, `polish-ui`, `polish-cli`, `polish-pro/main.rs`) — `.context()` chains for display.

```rust
// polish-core/src/quarantine.rs
#[derive(Debug, thiserror::Error)]
pub enum QuarantineError {
    #[error("source path does not exist: {path}")]
    SourceMissing { path: PathBuf },

    #[error("insufficient disk space: need {needed} bytes, have {available}")]
    InsufficientSpace { needed: u64, available: u64 },

    #[error("cross-volume move failed")]
    CrossVolume { #[source] source: std::io::Error },

    #[error("bundle integrity check failed")]
    BundleCorrupt { #[source] source: BlakeError },

    #[error(transparent)]
    Io(#[from] std::io::Error),
}
```

```rust
// polish-svc/src/main.rs
fn main() -> anyhow::Result<()> {
    let cfg = load_config().context("loading polish-svc config")?;
    let engine = Engine::start(cfg).context("starting cleanup engine")?;
    serve_ipc(engine).context("serving IPC pipe")?;
    Ok(())
}
```

**Strict rules:**
- Never use `anyhow` in library public APIs — breaks callers' ability to match.
- Always `#[source]` or `#[from]` to preserve cause chain.
- `#[error(transparent)]` for pure forwarders.
- No `unwrap()` / `panic!()` in production code paths — use typestate to make impossible states unrepresentable.

---

## 6. Testing strategy

| Layer | What | Tool | Speed target |
|---|---|---|---|
| `polish-core` | Pure domain — typestate, manifest, quarantine model | `cargo test` (no I/O) | <1s |
| `polish-app` use cases | With mocked ports via `mockall` | `cargo test` | <1s |
| `polish-adapters` integration | Each adapter against real Windows API | `cargo test --features integration` | seconds |
| End-to-end | Real bins, real service, real Tauri | Playwright + `tauri-driver` | minutes |

**Mock pattern:**

```rust
// polish-core/src/ports/fs_port.rs
#[cfg_attr(test, mockall::automock)]
pub trait FsPort: Send + Sync {
    fn read(&self, path: &Path) -> Result<Vec<u8>, FsError>;
    fn write(&self, path: &Path, data: &[u8]) -> Result<(), FsError>;
    fn delete(&self, path: &Path) -> Result<(), FsError>;
    fn move_file(&self, from: &Path, to: &Path) -> Result<(), FsError>;
}
```

```rust
// polish-app tests
#[test]
fn execute_cleanup_moves_then_never_deletes() {
    let mut fs = MockFsPort::new();
    fs.expect_move_file()
      .withf(|src, _| src.ends_with("foo.tmp"))
      .times(1)
      .returning(|_, _| Ok(()));
    fs.expect_delete().times(0);

    let cleanup = Cleanup::<Scanned>::new(vec![/* ... */])
        .preview()
        .execute(&fs, &mock_pq()).unwrap();

    assert!(matches!(cleanup, Cleanup::<Executed> { .. }));
}
```

---

## 7. Contributor workflow — add a cleanup category in ≤1 day

1. Pick `id` in `<scope>.<tool>.<artifact>` kebab format. Example: `dev.npm.cache`.
2. Pick `SafetyTier` — default `Balanced`.
3. Create `polish-adapters/src/categories/<id>.rs`.
4. Implement `Category` trait + `inventory::submit!`.
5. Add doc-test on a fixture directory.
6. Add integration test in `crates/polish-adapters/tests/categories/<id>_integration.rs`.
7. Open PR. No other file edits needed.

**Template:**

```rust
// polish-adapters/src/categories/<id>.rs
use polish_core::*;

/// <Human description of what this category cleans>
///
/// # Safety
/// <What this NEVER deletes; why it's tier X>
///
/// # Examples
/// ```
/// use polish_adapters::categories::<TypeName>;
/// use polish_core::Category;
/// let cat = <TypeName>;
/// assert_eq!(cat.id(), "<scope>.<tool>.<artifact>");
/// ```
pub struct <TypeName>;

impl Category for <TypeName> {
    fn id(&self) -> &'static str { "<scope>.<tool>.<artifact>" }
    fn name(&self) -> &'static str { "<UI label>" }
    fn safety_tier(&self) -> SafetyTier { SafetyTier::Balanced }
    fn version_intro(&self) -> Version { Version::V1_0 }
    fn supports(&self, env: &Environment) -> bool { /* ... */ }
    fn scan(&self, ctx: &ScanContext) -> Vec<Finding> { /* ... */ }
}

inventory::submit! { CategoryEntry { category: &<TypeName> } }
```

---

## 8. CI gates — architecture survives turnover

| Rule | Enforcement |
|---|---|
| `polish-core` depends on nothing infrastructure | `cargo-deny check bans` with deny-list |
| `polish-core` has no `std::fs` / `std::net` / `std::process` | Grep gate in CI |
| All public items in `polish-core` have doc-tests | `cargo test --doc -p polish-core` must pass |
| No `unwrap()` in non-test code | `clippy::unwrap_used` denied |
| No `panic!()` in non-test code | `clippy::panic` denied |
| Bins use `anyhow`, libs use `thiserror` | Manual checklist + CONTRIBUTING.md |
| Workspace dependency graph reviewed | `cargo-modules generate graph` at release |

---

## 9. Open questions (defer until painful)

- **Async vs sync ports.** Lean async via `tokio` + stable `async fn in traits` (Rust 1.75+) for I/O ports. Sync for pure-CPU work.
- **`entrait` crate** for friction-free DI. Skip for v1.0 (less transparent for new contributors). Reconsider at 20+ ports.
- **DLL plugin system via `abi_stable`.** Covered in `.vskill-data/research/exe-vs-dll-architecture/`. v2+ evaluation; not v1.0.
- **CQRS / event-sourcing for `.pq` quarantine state.** Defer until pain.
- **Tauri 2 + hexagonal on UI side.** Tauri commands likely become inbound adapters calling `polish-app` use cases. Confirm during Week 1–3 spike.

---

## 10. References

Full research: `.vskill-data/research/best-code-architecture-polish-rust/findings.md` + `research.json`.

Canonical sources:
- [Master Hexagonal Architecture in Rust](https://www.howtocodeit.com/guides/master-hexagonal-architecture-in-rust)
- [The Typestate Pattern in Rust (Cliffle)](https://cliffle.com/blog/rust-typestate/)
- [dtolnay/inventory](https://github.com/dtolnay/inventory)
- [Luca Palmieri — Error Handling in Rust](https://www.lpalmieri.com/posts/error-handling-rust/)
- [mockall docs](https://docs.rs/mockall/latest/mockall/)
- [Cargo Workspaces](https://doc.rust-lang.org/book/ch14-03-cargo-workspaces.html)

Related Polish research:
- `.vskill-data/research/exe-vs-dll-architecture/findings.md` — why multi-exe + DLL plugins are orthogonal.
- `.vskill-data/research/stress-test-project-risks/findings.md` — signing, SmartScreen, MS native parity validation.

---

*End of ARCHITECTURE.md.*
