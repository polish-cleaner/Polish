# Feature → Version Matrix

> Single sheet showing every feature, its target version, paid tier, owning page, and status. Update this every time a feature is added, moved between versions, or shipped.
>
> Authoritative scope: PLAN.md §3 (phases), §20 (v1.0 MVP), §21 (roadmap) — all post-debate.

## v1.0 — Free OSS MVP (target 2027 Q1)

| Feature | Page | Tier | Status |
|---|---|---|---|
| Disk usage widget | Dashboard | Free | designed |
| Top reclaim opportunities | Dashboard | Free | designed |
| Quarantine widget (dashboard) | Dashboard | Free | designed |
| Last scan widget | Dashboard | Free | designed |
| Service status widget | Dashboard | Free | designed |
| Mode picker (Light / Balanced only) | Clean | Free | designed |
| Category tree | Clean | Free | designed |
| Preview step | Clean | Free | designed |
| Run step (progress + cancel) | Clean | Free | designed |
| Result step (count-up + CTAs) | Clean | Free | designed |
| Special-case confirms (DISM ResetBase, hibernation, etc.) | Clean | Free | designed |
| Quarantine run list | Quarantine | Free | designed |
| Quarantine filters | Quarantine | Free | designed |
| Quarantine detail drawer | Quarantine | Free | designed |
| Restore actions | Quarantine | Free | designed |
| Bulk actions | Quarantine | Free | designed |
| Auto-purge policy | Quarantine | Free | designed |
| Activity log | History | Free | designed |
| History filters | History | Free | designed |
| History search | History | Free | designed |
| History export (CSV / JSON) | History | Free | designed |
| Settings: General | Settings | Free | designed |
| Settings: Cleanup defaults | Settings | Free | designed |
| Settings: Quarantine | Settings | Free | designed |
| Settings: Privacy (crash reporting opt-in) | Settings | Free | designed |
| Settings: Service | Settings | Free | designed |
| Settings: Updates | Settings | Free | designed |
| Settings: Advanced | Settings | Free | designed |
| About | About | Free | designed |
| Sidebar (collapsible) | _shared | Free | designed |
| Tray menu (minimal — Scan now / Open / Quit) | _shared | Free | designed |
| First-run onboarding | _shared | Free | designed |
| Empty-states | _shared | Free | designed |

## v1.1 — Table stakes + community (target 2027 Q2–Q3)

| Feature | Page | Tier | Status |
|---|---|---|---|
| Aggressive mode | Clean | Free | designed |
| Custom mode | Clean | Free | designed |
| Startup app manager | (new sub-page or Settings) | Free | designed |
| Uninstaller + leftover sweep | (new sub-page or Settings) | Free | designed |
| Idle-aware background scanner | _shared (service) | Free | designed |
| Daily digest toast | _shared | Free | designed |
| Critical-issue toast | _shared | Free | designed |
| Tray pause submenu (notifications + scans) | _shared | Free | designed |
| Encrypted `.pq` bundles | Quarantine | Free | designed |
| `.polishprofile` import/export | Settings → Advanced | Free | designed |
| Settings: Scanning | Settings | Free | designed |
| Settings: Notifications | Settings | Free | designed |
| Settings: Auto-clean (Notify / Safe-auto / Full-auto-whitelist) | Settings | Free | designed |
| winget submission | (build) | Free | designed |
| Scoop bucket | (build) | Free | designed |
| Chocolatey manifest | (build) | Free | designed |

## v1.2-Pro — Paid Pro tier launch (target 2027 Q4)

> Lives in separate closed-source binary `polish-pro.exe`. MIT engine remains free.

| Feature | Page | Tier | Status |
|---|---|---|---|
| Prepare for Format — Step 1 System Snapshot | Format Prep | Pro | designed |
| Prepare for Format — Step 2 Backup Destination | Format Prep | Pro | designed |
| Prepare for Format — Step 3 Backup Execution | Format Prep | Pro | designed |
| Prepare for Format — Step 4 Verify Backup Integrity | Format Prep | Pro | designed |
| Prepare for Format — Step 5 Cleanup | Format Prep | Pro | designed |
| Prepare for Format — Step 6 Generate Restore Plan | Format Prep | Pro | designed |
| Prepare for Format — Step 7 Final Greenlight | Format Prep | Pro | designed |
| WSL2 VHDX compaction (wrapper over `wsl --shrink` when GA) | Clean → Dev categories | Pro | designed |
| Docker VHDX compaction (wrapper over `Optimize-VHD`) | Clean → Dev categories | Pro | designed |
| LM Studio / Ollama model audit | Clean → AI categories | Pro | designed |
| IDE caches (VS Code, Cursor, JetBrains workspace) | Clean → Dev categories | Pro | designed |
| Orphan node_modules detection | Clean → Dev categories | Pro | designed |
| go-build cache | Clean → Dev categories | Pro | designed |
| CLI (`polish` command) | _shared | Pro | designed |
| Custom profile cloud sync | Settings | Pro | designed |
| Cloud backup of `.pq` quarantines | Quarantine | Pro | designed |
| Pro license validation (offline-tolerant) | _shared | Pro | designed |
| Stripe + Paddle billing integration | (build) | Pro | designed |

## v1.0 dev category (proof-of-wedge, free)

| Feature | Page | Tier | Status |
|---|---|---|---|
| npm cache cleanup | Clean → Dev category | Free | designed |
| pnpm content-addressable store cleanup | Clean → Dev category | Free | designed |
| cargo registry + build cache cleanup | Clean → Dev category | Free | designed |

## v2.0 — Cloud + anti-malware (target 2028 Q4)

| Feature | Page | Tier | Status |
|---|---|---|---|
| Polish Account opt-in | Settings | Pro | designed |
| Cross-PC config sync | Settings | Pro | designed |
| Anti-malware second-opinion (YARA + ClamAV) | (new sub-page) | Pro | designed |

## DEFERRED — MSP / Enterprise

| Feature | Page | Tier | Status |
|---|---|---|---|
| Fleet dashboard | (new app) | Enterprise | DEFERRED |
| RBAC + audit log export | (new app) | Enterprise | DEFERRED |
| Intune / Group Policy integration | (new app) | Enterprise | DEFERRED |
| Per-PC policy distribution | (new app) | Enterprise | DEFERRED |
| Marketplace listings (NinjaOne / Atera / Kaseya / ConnectWise) | (new app) | Enterprise | DEFERRED |

## Explicitly excluded (never)

Per PLAN §8.3 + §19 + PROJECT.md §5 anti-feature list — these are LOCKED by debate consensus:

- Registry "cleaner"
- Driver updater
- RAM optimizer / Game Booster / "Speed up by N%"
- Bogus threat / privacy scores (counting cookies as threats)
- Bundled third-party offers in installer
- Self-re-enable disabled features on update
- Scare-tactic language ("YOUR PC IS AT RISK")
- Mobile companion app
