---
query: "Best-in-class Rust code architecture for Polish — robust, modular, adapter-based, strongly-typed, contributor-friendly"
type: technical
depth: medium
date: 2026-05-28
confidence: high
---

# Polish Code Architecture — Final Recommendation

## Executive Summary

**Recommended architecture: Hexagonal (ports-and-adapters) Rust workspace with typestate-validated cleanup pipeline and `inventory`-based distributed category registration.**

This stack delivers all four requirements:
- **Robust** — typestate makes invalid state transitions (e.g., "execute before preview") fail to compile. Sealed traits prevent contributors accidentally implementing internal protocols.
- **Modular** — hexagonal split keeps `polish-core` (pure domain) free of any infrastructure concerns. Adding a new platform (Linux, macOS, an MSP backend) = one new adapter crate, zero core changes.
- **Adapter-based** — each cleanup category, signing provider, storage backend, IPC transport implements a port (trait). Real impls live in `polish-adapters`; tests use mock impls via `mockall`.
- **Contributor-friendly** — new cleanup category = one new file with `inventory::submit!(MyCategory)`. No central registry to edit. No merge conflicts on PRs from multiple contributors.

Confirmed:
- ✅ **Hexagonal is the standard answer for long-lived Rust projects.** Multiple production examples ([Banker](https://www.howtocodeit.com/guides/master-hexagonal-architecture-in-rust), [hexagonal-rust](https://github.com/antoinecarton/hexagonal-rust), [blueprint-hexagonal-rust](https://github.com/fteychene/blueprint-hexagonal-rust), [Hextacy db library](https://lib.rs/crates/hextacy)) converge on the same crate split.
- ✅ **Typestate pattern is zero-cost.** Marker structs are 0-sized; all state checking happens at compile time. ([Cliffle — Typestate Pattern in Rust](https://cliffle.com/blog/rust-typestate/) — canonical reference).
- ✅ **`inventory` crate is the Rust standard for distributed plugin registration.** [dtolnay/inventory](https://github.com/dtolnay/inventory) — by the most respected Rust library author. Used in many production stacks.
- ✅ **thiserror in libraries, anyhow in bins is the convergent best practice.** Multiple 2026 sources agree.

Skip if smaller scope: hexagonal has upfront cost. Polish is the right size — multi-year horizon, 4 binaries, plugin extensibility, MIT engine + closed Pro, multiple contributors. Cost is paid back many times over.

---

## Section 1 — Architectural style: Hexagonal (Ports & Adapters)

**The principle:** Domain logic does not import infrastructure. Infrastructure implements domain-defined traits (ports). Everything outside the domain is an adapter.

```
        ┌─────────────────────────────┐
        │     polish-cli (bin)        │
        ├─────────────────────────────┤
        │     polish-ui (bin)         │   inbound adapters
        ├─────────────────────────────┤
        │     polish-svc (bin)        │
        └──────────────┬──────────────┘
                       │  uses
        ┌──────────────▼──────────────┐
        │  polish-app  (lib)           │   application layer (use cases)
        │  - scan/preview/execute      │
        │  - quarantine orchestration  │
        └──────────────┬──────────────┘
                       │  uses
        ┌──────────────▼──────────────┐
        │  polish-core  (lib)          │   domain — PURE, no I/O
        │  - Category, Rule traits     │
        │  - Quarantine domain model   │
        │  - .pq format model          │
        │  - State machine (typestate) │
        └──────────────▲──────────────┘
                       │  implements (ports)
        ┌──────────────┴──────────────┐
        │  polish-adapters (lib)      │   outbound adapters
        │  - fs adapter (real disk)   │
        │  - registry adapter         │
        │  - wsl adapter              │
        │  - notification adapter     │
        │  - .pq writer adapter       │
        │  - signing-cert adapter     │
        └─────────────────────────────┘
```

Why this matters for Polish specifically:

| Need | Hexagonal answer |
|---|---|
| MIT engine + closed Pro binary | `polish-pro` (closed) implements/extends the same ports as `polish-adapters`. Same domain. No leakage. |
| Future cross-platform (Linux/macOS post-v2+) | Add `polish-adapters-linux` crate. Zero core changes. |
| Testing without Windows / without admin | Replace `WslAdapter` with `MockWslAdapter` in `polish-core` tests. Real adapter tested separately. |
| Signing provider may swap (Artifact Signing → Certum → SignPath) | `SigningPort` trait. Three impls in `polish-adapters/signing/`. Wired at startup. |
| Contributor wants to add a new cleanup category | Implement `Category` trait in `polish-adapters/categories/<name>.rs`. Register via `inventory::submit!`. Done. |

**Sources:**
- [Master Hexagonal Architecture in Rust (howtocodeit.com)](https://www.howtocodeit.com/guides/master-hexagonal-architecture-in-rust) — Banker project tutorial, ~9-part series
- [Hexagonal Architecture in Rust (tuttlem)](http://tuttlem.github.io/2025/08/31/hexagonal-architecture-in-rust.html)
- [How to apply hexagonal architecture to Rust (Barrage)](https://www.barrage.net/blog/technology/how-to-apply-hexagonal-architecture-to-rust)
- [hexagonal-rust (antoinecarton)](https://github.com/antoinecarton/hexagonal-rust)
- [blueprint-hexagonal-rust (fteychene)](https://github.com/fteychene/blueprint-hexagonal-rust)
- [Hextacy](https://lib.rs/crates/hextacy)

---

## Section 2 — Concrete cargo workspace layout (proposed)

```
polish/
├── Cargo.toml                          # workspace root
├── crates/
│   ├── polish-core/                    # MIT — pure domain, no I/O
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── category.rs             # Category trait, CategoryId, SafetyTier
│   │       ├── rule.rs                 # CleanupRule trait
│   │       ├── pipeline/               # typestate pipeline (Scan→Preview→Execute)
│   │       │   ├── mod.rs
│   │       │   ├── states.rs           # Scanned, Previewed, Executed, Restorable
│   │       │   └── transitions.rs
│   │       ├── quarantine.rs           # Quarantine domain model
│   │       ├── manifest.rs             # .pq manifest schema
│   │       └── ports/                  # all outbound trait definitions
│   │           ├── fs_port.rs
│   │           ├── reg_port.rs
│   │           ├── wsl_port.rs
│   │           ├── notify_port.rs
│   │           ├── pq_port.rs
│   │           ├── signing_port.rs
│   │           └── clock_port.rs       # for testable time
│   │
│   ├── polish-app/                     # MIT — application layer (use cases)
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── usecase/
│   │       │   ├── scan_disk.rs
│   │       │   ├── preview_cleanup.rs
│   │       │   ├── execute_cleanup.rs
│   │       │   ├── restore_quarantine.rs
│   │       │   └── format_prep_wizard.rs  # v1.2
│   │       └── orchestrator.rs         # wires use cases together
│   │
│   ├── polish-adapters/                # MIT — concrete adapter impls
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── fs/                     # real filesystem ops via std::fs + windows crate
│   │       ├── registry/               # winreg access
│   │       ├── wsl/                    # wraps `wsl --manage --resize`
│   │       ├── pq_writer/              # segmented sub-archive writer with BLAKE3
│   │       ├── notification/           # WinRT toast + AUMID
│   │       ├── signing/                # Artifact Signing / Certum / SignPath impls
│   │       └── categories/             # one file per cleanup category
│   │           ├── mod.rs
│   │           ├── npm_cache.rs        # contributor adds new file here
│   │           ├── pnpm_cache.rs
│   │           ├── cargo_cache.rs
│   │           └── ...
│   │
│   ├── polish-ipc/                     # MIT — serde wire format for named-pipe IPC
│   │   └── src/lib.rs
│   │
│   ├── polish-test-fixtures/           # MIT — shared mock impls + test data
│   │   └── src/
│   │       ├── mock_fs.rs              # mockall-generated or hand-rolled
│   │       ├── mock_wsl.rs
│   │       ├── fixtures/               # sample .pq bundles, manifests
│   │       └── temp_disk.rs            # in-memory filesystem helper
│   │
│   ├── polish-svc/                     # MIT — bin (Windows Service)
│   ├── polish-ui/                      # MIT — bin (Tauri 2 + React)
│   ├── polish-cli/                     # MIT — bin
│   └── polish-pro/                     # CLOSED-SOURCE from v1.2 — bin
│
└── target/                             # one shared output dir
```

**Dependency direction rule (enforce via `cargo-deny` config):**
- `polish-core` → nothing (no deps on adapters, no deps on app, no deps on bins). Pure.
- `polish-app` → `polish-core` only.
- `polish-adapters` → `polish-core` only.
- `polish-ipc` → `polish-core` only (for shared types).
- `polish-test-fixtures` → `polish-core`.
- Bins (`polish-svc`, `polish-ui`, `polish-cli`, `polish-pro`) → `polish-core` + `polish-app` + `polish-adapters` + `polish-ipc`.
- **Never** `polish-core` → anything else. Compile fails if violated. (Mirror of [Banker](https://www.howtocodeit.com/guides/master-hexagonal-architecture-in-rust) layout.)

**Sources:**
- [Master Hexagonal Architecture in Rust](https://www.howtocodeit.com/guides/master-hexagonal-architecture-in-rust)
- [Cargo Workspaces (Rust book ch14.3)](https://doc.rust-lang.org/book/ch14-03-cargo-workspaces.html)

---

## Section 3 — Typestate for the cleanup pipeline

The cleanup flow has a strict invariant: **Scan → Preview → Execute → Quarantined → Restorable**. You cannot execute a cleanup that wasn't previewed. You cannot restore something that wasn't quarantined. Typestate makes these compile-time guarantees.

```rust
// In polish-core/src/pipeline/states.rs
pub struct Scanned;
pub struct Previewed;
pub struct Executed;
pub struct Restorable;

// In polish-core/src/pipeline/mod.rs
pub struct Cleanup<State> {
    findings: Vec<Finding>,
    _state: PhantomData<State>,
}

impl Cleanup<Scanned> {
    pub fn new(findings: Vec<Finding>) -> Self { /* ... */ }

    pub fn preview(self) -> Cleanup<Previewed> {
        // type changes; only Previewed has .execute()
        Cleanup { findings: self.findings, _state: PhantomData }
    }
}

impl Cleanup<Previewed> {
    // Compiler GUARANTEES preview ran first.
    pub fn execute<F: FsPort, P: PqPort>(
        self, fs: &F, pq: &P
    ) -> Result<Cleanup<Executed>, CleanupError> { /* ... */ }
}

impl Cleanup<Executed> {
    pub fn into_restorable(self) -> Cleanup<Restorable> { /* ... */ }
}

impl Cleanup<Restorable> {
    pub fn restore<F: FsPort, P: PqPort>(
        self, fs: &F, pq: &P
    ) -> Result<(), RestoreError> { /* ... */ }
}
```

What this prevents at compile time:
- ❌ `cleanup.execute()` — won't compile if `cleanup: Cleanup<Scanned>`. Must call `.preview()` first.
- ❌ `cleanup.restore()` — won't compile unless `cleanup: Cleanup<Restorable>`.
- ❌ Calling `.execute()` twice — `.execute()` consumes `self`, returns `Cleanup<Executed>`. Second call doesn't exist on `Executed`.

Per [Cliffle (canonical reference)](https://cliffle.com/blog/rust-typestate/): "The typestate pattern pushes validation to compile time, making invalid states literally unrepresentable. All typestate information is only used during compilation, with marker structs having a size of 0."

**Seal the state markers** so contributors can't accidentally add a state mid-pipeline:

```rust
mod sealed {
    pub trait Sealed {}
    impl Sealed for super::Scanned {}
    impl Sealed for super::Previewed {}
    impl Sealed for super::Executed {}
    impl Sealed for super::Restorable {}
}
pub trait State: sealed::Sealed {}
impl<T: sealed::Sealed> State for T {}
```

External crates cannot implement `State` because they cannot implement `sealed::Sealed` (private). State set is closed. Adding a new state = explicit core change reviewed by maintainers.

**Sources:**
- [The Typestate Pattern in Rust (Cliffle)](https://cliffle.com/blog/rust-typestate/) — canonical
- [Typestate Pattern in Rust (Farazdagi)](https://farazdagi.com/posts/2024-04-07-typestate-pattern/)
- [Software Patterns Lexicon — Typestate in Rust](https://softwarepatternslexicon.com/rust/idiomatic-rust-patterns/the-typestate-pattern/)
- [statum macro library](https://github.com/eboody/statum) — boilerplate-reducer if hand-rolling becomes tedious

---

## Section 4 — Adapter registry: contributors add categories without central edits

**The contributor pain point:** in a naive design, every new cleanup category requires editing a central `categories.rs` file. Multiple contributor PRs touching the same file = merge conflicts.

**The fix:** [`inventory`](https://github.com/dtolnay/inventory) crate. Distributed plugin registration — each plugin file declares itself; engine collects them at startup.

```rust
// In polish-core/src/category.rs
pub trait Category: Send + Sync + 'static {
    fn id(&self) -> &'static str;
    fn name(&self) -> &'static str;
    fn safety_tier(&self) -> SafetyTier;       // Light | Balanced | Aggressive | Pro
    fn version_intro(&self) -> Version;        // when this category became available
    fn scan(&self, ctx: &ScanContext) -> Vec<Finding>;
    fn supports(&self, env: &Environment) -> bool;  // skip if WSL missing, etc
}

pub struct CategoryEntry {
    pub category: &'static dyn Category,
}

inventory::collect!(CategoryEntry);


// In polish-adapters/src/categories/npm_cache.rs
// === Contributor writes ONLY this file. No central registry edit. ===
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


// In polish-app/src/usecase/scan_disk.rs
pub fn all_categories() -> impl Iterator<Item = &'static dyn Category> {
    inventory::iter::<CategoryEntry>
        .into_iter()
        .map(|e| e.category)
}
```

**Result:** contributor PR touches one new file. No conflicts. No central registry. No merge surgery.

Per [inventory README](https://github.com/dtolnay/inventory): "Plugins can be registered by the same crate that declares the plugin type, or by any downstream crate." Means `polish-pro` (closed-source binary) can register its own Pro-only categories from inside the proprietary binary, no leakage into the MIT engine.

**Caveats:**
- `inventory` uses ctor-style "life-before-main" init. Works on all major Windows targets but is platform-sensitive. Documented and stable for years (dtolnay maintains).
- If life-before-main bothers you, [`linkme`](https://github.com/dtolnay/linkme) is the alternative — no runtime init, uses linker section magic. Slightly more invasive but completely lazy.

**Alternative considered (rejected):** Build-time codegen of a registry file via `build.rs`. Works but reintroduces the central-file pain for contributors (they edit a `categories.toml` or similar).

**Sources:**
- [dtolnay/inventory](https://github.com/dtolnay/inventory) — canonical
- [INVENTORY (Lib.rs)](https://lib.rs/crates/inventory)
- [Global Registration (donsz.nl)](https://donsz.nl/blog/global-registration/) — comparison of inventory / linkme / submit / build.rs approaches

---

## Section 5 — Error handling discipline

**The rule that converges across all 2026 sources:**
- **`thiserror`** in libraries (`polish-core`, `polish-app`, `polish-adapters`, `polish-ipc`) — typed errors callers can `match` on.
- **`anyhow`** in binaries (`polish-svc/main.rs`, `polish-ui`, `polish-cli`, `polish-pro/main.rs`) — easy chaining + display.

```rust
// In polish-core/src/quarantine.rs
#[derive(Debug, thiserror::Error)]
pub enum QuarantineError {
    #[error("source path does not exist: {path}")]
    SourceMissing { path: PathBuf },

    #[error("insufficient disk space: need {needed} bytes, have {available}")]
    InsufficientSpace { needed: u64, available: u64 },

    #[error("cross-volume move failed: {source}")]
    CrossVolume { #[source] source: std::io::Error },

    #[error("bundle integrity check failed")]
    BundleCorrupt { #[source] source: BlakeError },

    #[error(transparent)]
    Io(#[from] std::io::Error),
}


// In polish-svc/src/main.rs
fn main() -> anyhow::Result<()> {
    let cfg = load_config().context("loading polish-svc config")?;
    let engine = Engine::start(cfg).context("starting cleanup engine")?;
    serve_ipc(engine).context("serving IPC pipe")?;
    Ok(())
}
```

Why the split per [OneUptime 2026 guide](https://oneuptime.com/blog/post/2026-01-25-error-types-thiserror-anyhow-rust/view) + [Palmieri deep-dive](https://www.lpalmieri.com/posts/error-handling-rust/):
- Library callers might handle `SourceMissing` differently from `InsufficientSpace`. Need typed variants.
- Binary code just logs/displays the error chain. Adding `.context()` to attach a human-readable trail is more important than narrow type discrimination.

**Strict rules:**
- Never use `anyhow` in `polish-core` / `polish-app` / `polish-adapters` public APIs. Breaks callers' ability to match.
- Always use `#[source]` or `#[from]` to preserve underlying causes — no error-chain breaks.
- `#[error(transparent)]` for pure forwarding wrappers.
- Don't `unwrap()` in production code paths. Use typestate to make impossible states unrepresentable instead.

**Sources:**
- [OneUptime — thiserror & anyhow design](https://oneuptime.com/blog/post/2026-01-25-error-types-thiserror-anyhow-rust/view)
- [Caroline Morton — anyhow and thiserror](https://www.carolinemorton.co.uk/blog/rust-error-handling-anyhow-thiserror/)
- [Luca Palmieri — Error Handling in Rust](https://www.lpalmieri.com/posts/error-handling-rust/)

---

## Section 6 — Testing & contributor conventions

### Mock adapters via `mockall`

Every port has a mock impl auto-derived. `polish-test-fixtures` re-exports them.

```rust
// In polish-core/src/ports/fs_port.rs
#[cfg_attr(test, mockall::automock)]
pub trait FsPort: Send + Sync {
    fn read(&self, path: &Path) -> Result<Vec<u8>, FsError>;
    fn write(&self, path: &Path, data: &[u8]) -> Result<(), FsError>;
    fn delete(&self, path: &Path) -> Result<(), FsError>;
    fn move_file(&self, from: &Path, to: &Path) -> Result<(), FsError>;
}


// In polish-app tests
#[test]
fn execute_cleanup_calls_move_then_delete() {
    let mut fs = MockFsPort::new();
    fs.expect_move_file()
      .withf(|src, _| src.ends_with("foo.tmp"))
      .times(1)
      .returning(|_, _| Ok(()));
    fs.expect_delete().times(0);  // execute must move to quarantine, never delete

    let cleanup = Cleanup::<Scanned>::new(vec![/* ... */])
        .preview()
        .execute(&fs, &mock_pq()).unwrap();

    assert_eq!(cleanup.state_marker(), "Executed");
}
```

Per [mockall docs](https://docs.rs/mockall/latest/mockall/) + [developerlife.com — Rust polymorphism for testing](https://developerlife.com/2024/04/28/rust-polymorphism-dyn-impl-trait-objects-for-testing-and-extensibiity/): "You can easily swap out concrete implementations with mock implementations for unit or integration testing without modifying the service itself."

### Layered test strategy

| Layer | What | Tool | Speed |
|---|---|---|---|
| `polish-core` | Pure domain — typestate, manifest, quarantine model | `cargo test` (no I/O) | <1s |
| `polish-app` use cases | With mocked ports via `mockall` | `cargo test` | <1s |
| `polish-adapters` integration | Each adapter against real Windows API | `cargo test --features integration` | seconds |
| End-to-end | Real bins, real service, real Tauri | Playwright + `tauri-driver` | minutes |

### Doc conventions for contributors

Every public trait + struct in `polish-core` ships with:
- One-line summary.
- `# Examples` section that compiles (doc-tests).
- `# Errors` section listing each error variant condition.
- `# Panics` section if any (target: none in `polish-core`).
- `# Invariants` section for typestate types — what the state proves.

CONTRIBUTING.md template for adding a new cleanup category — single-page:
1. Pick `id` (kebab format `dev.<tool>.<artifact>`).
2. Pick `SafetyTier` (default: Balanced).
3. Create `polish-adapters/src/categories/<id>.rs` with the `Category` impl + `inventory::submit!`.
4. Add a doc-test showing scan output on a fixture directory.
5. Add an integration test in `tests/categories/<id>_integration.rs`.
6. Open PR. No other file edits needed.

**Sources:**
- [mockall docs](https://docs.rs/mockall/latest/mockall/)
- [Build with Naz — Rust polymorphism for testing & extensibility](https://developerlife.com/2024/04/28/rust-polymorphism-dyn-impl-trait-objects-for-testing-and-extensibiity/)
- [Leapcell — Dynamic Dispatch & Dependency Injection with Trait Objects](https://leapcell.io/blog/dynamic-dispatch-and-dependency-injection-with-trait-objects-in-rust-web-services)

---

## Section 7 — Optional: `entrait` for friction-free DI

Worth a mention. [`entrait`](https://docs.rs/entrait/latest/entrait/) is a newer crate that auto-generates the trait + impl + mock from a single function definition. Reduces boilerplate vs. hand-writing `FsPort` + `RealFsAdapter` + `MockFsPort`. Trade-off: more macro magic, slightly steeper learning curve for new contributors.

**Recommendation:** Start with explicit hand-rolled traits + `mockall`. The pattern is teachable, transparent, well-documented. Adopt `entrait` later if boilerplate becomes painful (typically around 20+ ports).

---

## Section 8 — Tooling enforcement (CI gates)

Make architectural rules un-skippable:

| Rule | Enforcement |
|---|---|
| `polish-core` depends on nothing infrastructure | `cargo-deny check bans` with deny-list of crates |
| `polish-core` has no `std::fs`, `std::net`, `std::process` | Grep gate in CI (`! grep -r 'std::fs' crates/polish-core/src/`) |
| All public items in `polish-core` have doc-tests | `cargo test --doc -p polish-core` must pass |
| No `unwrap()` in non-test code | `clippy::unwrap_used` denied |
| No `panic!()` in non-test code | `clippy::panic` denied |
| Bins use `anyhow`, libs use `thiserror` | Manual review checklist + lint hint in CONTRIBUTING.md |
| Workspace dependency direction | `cargo-modules` graph reviewed at release time |

---

## Gaps & Open Questions

- **Tauri 2 + hexagonal split for the UI side** — research focused on Rust engine architecture. Tauri's IPC contract design (commands vs events) needs separate research before `polish-ui` is built. Likely answer: Tauri commands become inbound adapters that call `polish-app` use cases.
- **CQRS / event-sourcing for `.pq` quarantine state** — not researched. Could be elegant for "every operation is a journal entry" model, but adds complexity. Defer until pain emerges.
- **Plugin DLL system (`abi_stable`)** — covered in prior research (`exe-vs-dll-architecture/`). Stays v2+ deferred. The `inventory` registry covers in-binary extensibility; DLL plugins are runtime extensibility (different use case).
- **`entrait` vs hand-rolled traits at scale** — no production data point at 100+ port scale. Polish unlikely to hit that.
- **Async vs sync ports** — research returned mostly sync examples. Polish probably wants `async` for I/O ports (`tokio` ecosystem). Pattern is the same (`async-trait` or stable `async fn` in traits as of Rust 1.75+).
- **Performance impact of `dyn Category` vs static dispatch** — runtime cost is one vtable lookup per category. Negligible for cleanup workload (I/O-dominated). No issue.

---

## Sources

- [Master Hexagonal Architecture in Rust (howtocodeit)](https://www.howtocodeit.com/guides/master-hexagonal-architecture-in-rust) — high (multi-part tutorial, Banker example)
- [Hexagonal Architecture in Rust (tuttlem)](http://tuttlem.github.io/2025/08/31/hexagonal-architecture-in-rust.html) — high
- [How to apply hexagonal architecture to Rust (Barrage)](https://www.barrage.net/blog/technology/how-to-apply-hexagonal-architecture-to-rust) — medium
- [hexagonal-rust (antoinecarton)](https://github.com/antoinecarton/hexagonal-rust) — medium (reference impl)
- [blueprint-hexagonal-rust (fteychene)](https://github.com/fteychene/blueprint-hexagonal-rust) — medium
- [Hextacy crate](https://lib.rs/crates/hextacy) — medium
- [The Typestate Pattern in Rust (Cliffle)](https://cliffle.com/blog/rust-typestate/) — high (canonical)
- [Typestate Pattern in Rust (Farazdagi)](https://farazdagi.com/posts/2024-04-07-typestate-pattern/) — medium
- [Software Patterns Lexicon — Typestate in Rust](https://softwarepatternslexicon.com/rust/idiomatic-rust-patterns/the-typestate-pattern/) — medium
- [statum (eboody) — typestate macro lib](https://github.com/eboody/statum) — medium
- [dtolnay/inventory](https://github.com/dtolnay/inventory) — high (canonical)
- [INVENTORY (Lib.rs)](https://lib.rs/crates/inventory) — high
- [Global Registration approaches (donsz.nl)](https://donsz.nl/blog/global-registration/) — medium
- [OneUptime — thiserror & anyhow design (2026-01-25)](https://oneuptime.com/blog/post/2026-01-25-error-types-thiserror-anyhow-rust/view) — high
- [Caroline Morton — anyhow and thiserror](https://www.carolinemorton.co.uk/blog/rust-error-handling-anyhow-thiserror/) — medium
- [Luca Palmieri — Error Handling in Rust deep-dive](https://www.lpalmieri.com/posts/error-handling-rust/) — high
- [mockall docs](https://docs.rs/mockall/latest/mockall/) — high
- [Build with Naz — Rust polymorphism for testing](https://developerlife.com/2024/04/28/rust-polymorphism-dyn-impl-trait-objects-for-testing-and-extensibiity/) — medium
- [Leapcell — Dynamic Dispatch & DI with Trait Objects](https://leapcell.io/blog/dynamic-dispatch-and-dependency-injection-with-trait-objects-in-rust-web-services) — medium
- [entrait crate](https://docs.rs/entrait/latest/entrait/) — medium (optional path)
- [Cargo Workspaces (Rust book)](https://doc.rust-lang.org/book/ch14-03-cargo-workspaces.html) — high
- [Cargo Targets reference](https://doc.rust-lang.org/cargo/reference/cargo-targets.html) — high

---

Searches run: 5 | Pages fetched: 0
