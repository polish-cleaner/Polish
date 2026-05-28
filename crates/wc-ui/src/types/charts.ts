/**
 * Chart data shapes. Per Rule 2, all cross-file types live in
 * src/types/ — the Dashboard chart components import from here.
 */

/** A single slice of the donut chart. */
export interface DonutSegment {
  id: string;
  /** Value contribution (e.g. bytes). Same unit across all segments. */
  value: number;
  /** Display label. */
  label: string;
  /** CSS colour string — usually a `var(--accent)` / `var(--status-*)`. */
  color: string;
}

/** Precomputed geometry for one donut arc. */
export interface DonutArc {
  id: string;
  /** Total stroke-dash run for this arc (proportional to value/total). */
  dashLength: number;
  /** Negative offset (CSS-style cumulative). */
  dashOffset: number;
  /** Original input. */
  segment: DonutSegment;
}

/** A single sample of the recovery trend chart. */
export interface TrendPoint {
  /** X-axis label, e.g. "May 25" or "Wk 14". */
  day: string;
  /** Y value in bytes. */
  bytes: number;
}

/** Precomputed SVG path geometry for the trend area chart. */
export interface TrendPath {
  /** Closed area path for `<path fill>`. */
  areaD: string;
  /** Open top-line path for `<path stroke>`. */
  lineD: string;
  /** Resolved peak in bytes (max-min ≥ 1 guard). */
  peak: number;
  /** Resolved viewBox: `0 0 W H`. */
  viewBox: string;
}
