/**
 * Accent palette type + canonical palette values.
 *
 * Source: .vskill-data/design/v2/design-tokens.json → `accent_palettes`.
 * Each palette resolves the 5 accent CSS vars (--accent, --accent-deep,
 * --accent-hover, --accent-soft, --accent-ink). useAccent() applies the
 * chosen palette to document.documentElement at runtime.
 */

export type AccentName = "deep-moss" | "deep-ocean" | "burnt-amber" | "muted-plum";

export interface AccentPalette {
  accent: string;
  deep: string;
  hover: string;
  soft: string;
  ink: string;
}

export const ACCENT_PALETTES: Record<AccentName, AccentPalette> = {
  "deep-moss": {
    accent: "oklch(0.420 0.085 155)",
    deep:   "oklch(0.320 0.072 155)",
    hover:  "oklch(0.380 0.085 155)",
    soft:   "oklch(0.940 0.030 155)",
    ink:    "oklch(0.280 0.060 155)",
  },
  "deep-ocean": {
    accent: "oklch(0.450 0.080 230)",
    deep:   "oklch(0.350 0.070 230)",
    hover:  "oklch(0.410 0.080 230)",
    soft:   "oklch(0.945 0.025 230)",
    ink:    "oklch(0.290 0.060 230)",
  },
  "burnt-amber": {
    accent: "oklch(0.520 0.115 55)",
    deep:   "oklch(0.420 0.105 55)",
    hover:  "oklch(0.480 0.115 55)",
    soft:   "oklch(0.945 0.035 70)",
    ink:    "oklch(0.380 0.090 55)",
  },
  "muted-plum": {
    accent: "oklch(0.440 0.085 300)",
    deep:   "oklch(0.350 0.075 300)",
    hover:  "oklch(0.400 0.085 300)",
    soft:   "oklch(0.945 0.030 310)",
    ink:    "oklch(0.310 0.070 300)",
  },
};

export const DEFAULT_ACCENT: AccentName = "deep-moss";
