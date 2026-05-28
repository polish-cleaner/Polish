/**
 * Polish app routing — Phase 3 in-memory route enum.
 *
 * The TS `icon` field stores the Lucide React icon component **name**
 * as a string. The Sidebar resolves the name → component via a static
 * import switch (Rule 8: Lucide React is the icon system). Phase 4 may
 * replace this with a typed icon-component union if more routes land.
 */

export const ROUTES = [
  "dashboard",
  "clean",
  "quarantine",
  "history",
  "settings",
  "format-prep",
] as const;

export type RouteId = (typeof ROUTES)[number];

export interface RouteMeta {
  id: RouteId;
  label: string;
  icon: string;
  pro?: boolean;
}
