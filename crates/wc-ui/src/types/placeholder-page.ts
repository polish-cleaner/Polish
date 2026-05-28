import type { RouteId } from "./route";

export interface PlaceholderPageProps {
  routeId: RouteId;
}

/** Per-route hint copy shown in the empty-state card. */
export const PLACEHOLDER_SUBTITLES: Record<RouteId, string> = {
  dashboard:     "Coming in a later phase.",
  clean:         "Guided multi-step cleanup will land here.",
  quarantine:    "Browse and restore quarantined bundles.",
  history:       "Past cleanup runs and recovered space.",
  settings:      "Accent, density, and quarantine retention.",
  "format-prep": "Snapshot apps and licences before a clean install.",
};
