import { create } from "zustand";
import type { RouteId } from "../types/route";

interface RouteState {
  route: RouteId;
  setRoute: (next: RouteId) => void;
}

/**
 * In-memory routing store. Not persisted — every cold-start lands on
 * the Dashboard. URL-style deep linking is intentionally out of scope
 * for Phase 3 (Polish is a single-window desktop app; the route is
 * ephemeral UI state, not addressable).
 */
export const useRoute = create<RouteState>((set) => ({
  route: "dashboard",
  setRoute: (next) => set({ route: next }),
}));
