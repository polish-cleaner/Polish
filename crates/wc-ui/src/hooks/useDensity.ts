import { create } from "zustand";
import { DEFAULT_DENSITY, DENSITY_VALUES } from "../types/density";
import type { Density } from "../types/density";

interface DensityState {
  density: Density;
  setDensity: (next: Density) => void;
}

/**
 * Write `--density` to :root. Every `--space-*` token is
 * `calc(Npx * var(--density))`, so a single multiplier rescales
 * the whole UI. SSR-safe.
 */
function applyDensityToRoot(name: Density): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty(
    "--density",
    DENSITY_VALUES[name].toString(),
  );
}

export const useDensity = create<DensityState>((set) => ({
  density: DEFAULT_DENSITY,
  setDensity: (next) => {
    applyDensityToRoot(next);
    set({ density: next });
  },
}));

// Apply default on first import.
applyDensityToRoot(DEFAULT_DENSITY);
