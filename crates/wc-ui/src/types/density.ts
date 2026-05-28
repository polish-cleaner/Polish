/**
 * Density type + canonical density multipliers.
 *
 * Source: .vskill-data/design/v2/design-tokens.json → spacing.density-*.
 * The chosen density is applied to document.documentElement as the
 * `--density` CSS var; all `--space-*` tokens are `calc(Npx * var(--density))`,
 * so a single multiplier rescales the whole UI.
 */

export type Density = "compact" | "regular" | "comfy";

export const DENSITY_VALUES: Record<Density, number> = {
  compact: 0.85,
  regular: 1,
  comfy:   1.15,
};

export const DEFAULT_DENSITY: Density = "regular";
