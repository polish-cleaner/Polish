import type { RouteId, RouteMeta } from "../types/route";

/**
 * Canonical route metadata, keyed for O(1) lookup, plus an ordered
 * list for sidebar render. Per Rule 4, this is the single source of
 * truth — neither the Sidebar nor PlaceholderPage may hard-code labels
 * or icons.
 */

export const ROUTE_META: Record<RouteId, RouteMeta> = {
  dashboard:     { id: "dashboard",     label: "Dashboard",          icon: "LayoutDashboard" },
  clean:         { id: "clean",         label: "Clean",              icon: "Sparkles" },
  quarantine:    { id: "quarantine",    label: "Quarantine",         icon: "Archive" },
  history:       { id: "history",       label: "History",            icon: "History" },
  settings:      { id: "settings",      label: "Settings",           icon: "Settings" },
  "format-prep": { id: "format-prep",   label: "Prepare for format", icon: "Wand2", pro: true },
};

/** Ordered as it appears in the sidebar — top to bottom. */
export const ROUTE_LIST: RouteMeta[] = [
  ROUTE_META.dashboard,
  ROUTE_META.clean,
  ROUTE_META["format-prep"],
  ROUTE_META.quarantine,
  ROUTE_META.history,
  ROUTE_META.settings,
];
