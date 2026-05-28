# Contributors & Links

> **Version:** v1.0
> **Tier:** Free
> **Page:** [About](../README.md)
> **Status:** designed
> **PLAN.md:** §7.7

## Purpose

Credit contributors and link to canonical project surfaces (repo, docs, issue tracker, security policy, sponsors).

## Behaviour

- **Contributors list** — auto-pulled from GitHub at build time (login + avatar + commit count or PR count). Compact grid view; expand for full list.
- **External links** — emerald link styling, opens in default browser:
  - GitHub repo (e.g., `github.com/polish-app/polish`)
  - Documentation (e.g., `docs.polish.io`)
  - Issue tracker (= GitHub Issues)
  - Security policy (= SECURITY.md in repo)
  - SBOM (CycloneDX) for current build
  - Changelog
- **Donate / Star** — subtle buttons; never urgent, never blocking. Wired to GitHub Sponsors / OpenCollective.

## Inputs

- **Bundled at build time:** contributors JSON (from GitHub API at CI build)
- **IPC:** none

## Outputs

- None.

## UI states

| State | When | What user sees |
|---|---|---|
| Default | Online | Avatars + names + counts |
| Offline-friendly | Bundled data | List works without network |
| Contributors fetch failed at build | Build-time issue | "Contributor list unavailable for this build." |

## Edge cases

- **Contributor count > 100:** show top 20 + "View all on GitHub" link (avoids huge embed).
- **A contributor changed their GitHub username post-build:** stale data until next release; link still resolves via username history.
- **Star prompt fatigue:** the Result-step "Star us" prompt (PLAN §7.2) is the noisier nudge; this About-page Star is always subtle, always non-blocking.

## Cross-links

- Related: [[../../02-clean/features/result-step]] (where the bigger Star prompt lives)
- PLAN.md: §7.7
