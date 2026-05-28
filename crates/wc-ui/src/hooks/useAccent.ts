import { create } from "zustand";
import { ACCENT_PALETTES, DEFAULT_ACCENT } from "../types/accent";
import type { AccentName } from "../types/accent";

interface AccentState {
  accent: AccentName;
  setAccent: (next: AccentName) => void;
}

/**
 * Write the 5 accent CSS vars (--accent, --accent-deep, --accent-hover,
 * --accent-soft, --accent-ink) to :root. SSR-safe: no-op if `document`
 * is undefined (e.g. during a pre-render).
 */
function applyAccentToRoot(name: AccentName): void {
  if (typeof document === "undefined") return;
  const p = ACCENT_PALETTES[name];
  const root = document.documentElement;
  root.style.setProperty("--accent", p.accent);
  root.style.setProperty("--accent-deep", p.deep);
  root.style.setProperty("--accent-hover", p.hover);
  root.style.setProperty("--accent-soft", p.soft);
  root.style.setProperty("--accent-ink", p.ink);
}

export const useAccent = create<AccentState>((set) => ({
  accent: DEFAULT_ACCENT,
  setAccent: (next) => {
    applyAccentToRoot(next);
    set({ accent: next });
  },
}));

// Apply default on first import so root vars match the store on boot.
applyAccentToRoot(DEFAULT_ACCENT);
