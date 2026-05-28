import type { ReactElement } from "react";
import Dashboard from "../pages/Dashboard";
import Home from "../pages/Home";
import PlaceholderPage from "../pages/PlaceholderPage";
import type { RouteId } from "../types/route";

/**
 * Resolve a route id to the page element App.tsx should mount.
 *
 * Lives in `lib/` per Rule 4 — it is a pure function whose body does
 * NOT use React hooks and would clutter App.tsx if inlined. Returning
 * JSX is fine: TSX modules are allowed in `lib/` provided the export
 * is a plain function, not a component (no hooks, no state).
 *
 * Phase 4 wiring:
 *   - dashboard → Dashboard (the editorial overview)
 *   - clean     → Home (the legacy single-page scan UX; Phase 5
 *                  replaces with the proper Clean wizard)
 *   - rest      → PlaceholderPage
 */
export function resolvePage(route: RouteId): ReactElement {
  if (route === "dashboard") return <Dashboard />;
  if (route === "clean") return <Home />;
  return <PlaceholderPage routeId={route} />;
}
