# Shared: Sidebar (left navigation)

> **Version:** v1.0
> **Tier:** Free (visible on every page)
> **PLAN.md:** §7 IA & pages

## Purpose

Persistent left-hand navigation. Single source of routing between top-level pages. Collapsible to icon-only mode (40px wide) for users who want more content area. State persisted via `settings.get/set`.

## Layout

```
┌──────────────────────────────┐
│  POLISH                      │  ← app brand + collapse toggle
├──────────────────────────────┤
│  🏠  Dashboard               │
│  🧹  Clean                   │
│  🚀  Prepare for Format ✦    │  ← gold accent, distinct (v1.2 Pro)
│  📦  Quarantine              │
│  📜  History                 │
│  ⚙️  Settings                │
│  ℹ️  About                   │
│                              │
│  (spacer)                    │
│                              │
│  ● Service: healthy          │  ← live pulse
│  C:  371 / 375 GB ████░░░░░  │  ← mini disk gauge
└──────────────────────────────┘
```

Collapsed mode shows icons only; service-pulse + drive-gauge stack vertically below.

## Entries

| Icon | Label | Route | Min version | Tier |
|---|---|---|---|---|
| 🏠 | Dashboard | `/dashboard` | v1.0 | Free |
| 🧹 | Clean | `/clean` | v1.0 | Free |
| 🚀 | Prepare for Format | `/format-prep` | v1.2 | Pro (sidebar entry hidden until Pro installed) |
| 📦 | Quarantine | `/quarantine` | v1.0 | Free |
| 📜 | History | `/history` | v1.0 | Free |
| ⚙️ | Settings | `/settings` | v1.0 | Free |
| ℹ️ | About | `/about` | v1.0 | Free |

## Bottom-of-sidebar widgets

- **Service status pulse.** Green = healthy, amber = paused, red = error (red only for service failure, not cosmetic warnings — PLAN §11.3).
- **C: drive mini-gauge.** xx% used, animated transitions. Reads `service.status` → primary system drive.

## Behaviour

- Sidebar starts expanded on first launch. Collapse state persisted per-user via `settings.set("ui.sidebar.collapsed", bool)`.
- Active route highlighted with emerald accent bar on left edge.
- Clicking the brand label (top) routes to Dashboard.
- Pro page (`/format-prep`) entry is **hidden entirely** when `polish-pro.exe` is not installed. When Pro installed but inactive license, entry is visible with a small "Pro" badge and routes to a license-management screen.

## States

| State | Visual |
|---|---|
| Default | Full labels + icons |
| Collapsed | Icons only |
| Active route | Emerald accent bar + label bold |
| Hover | Subtle background tint |
| Disabled (Pro entry without license) | Greyed icon + "Pro" badge |

## Accessibility

- All entries are `<a>` tags or routing components with proper ARIA labels.
- Active route has `aria-current="page"`.
- Sidebar collapse toggle is keyboard-reachable; uses `aria-expanded`.

## Open questions

- Does the brand label include an Easter egg / version popover on click? (Defer to v1.1.)
- Are sidebar entries reorderable by power users? (Defer to v1.2+, not in MVP.)
