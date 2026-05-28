import type {
  DonutArc,
  DonutSegment,
  TrendPath,
  TrendPoint,
} from "../types/charts";

/**
 * Pure chart math. Per Rule 4 these are the only legal place for the
 * stroke / path arithmetic the Dashboard's CategoryBreakdown and
 * RecoveryTrend components need. Components remain JSX-only.
 */

/**
 * Translate donut segments into precomputed arc geometry (dashLength
 * + dashOffset for a `<circle stroke-dasharray>` ring). The donut is
 * drawn as a single circle with one `<circle>` per segment; each
 * segment renders its slice as a dash + complementary gap, offset so
 * the slices butt-join around the circumference.
 *
 * `radius` is the SVG radius (NOT thickness — the caller draws the
 * ring stroke at the given thickness). `gapPx` is the small gap
 * between adjacent slices to keep them visually distinct (≈1.5px).
 */
export function segmentsToArcs(
  segments: ReadonlyArray<DonutSegment>,
  radius: number,
  gapPx = 1.5,
): DonutArc[] {
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0);
  if (total <= 0 || segments.length === 0) return [];
  let cumulative = 0;
  return segments.map((seg) => {
    const v = Math.max(0, seg.value);
    const proportion = v / total;
    const arc: DonutArc = {
      id: seg.id,
      dashLength: Math.max(0, proportion * circumference - gapPx),
      dashOffset: -cumulative,
      segment: seg,
    };
    cumulative += proportion * circumference;
    return arc;
  });
}

/** Sum of all segment values (helper for the donut centre label). */
export function totalSegmentValue(
  segments: ReadonlyArray<DonutSegment>,
): number {
  return segments.reduce((s, x) => s + Math.max(0, x.value), 0);
}

/**
 * Translate trend points into `d` attribute strings for SVG paths.
 *
 * `width` × `height` are the inner viewBox dims; padding stays the
 * same on every side. Output is in the same coordinate space (no
 * extra scaling).
 */
export function pointsToPath(
  points: ReadonlyArray<TrendPoint>,
  width: number,
  height: number,
  padding = 4,
): TrendPath {
  const empty: TrendPath = {
    areaD: "",
    lineD: "",
    peak: 0,
    viewBox: `0 0 ${width} ${height}`,
  };
  if (points.length === 0) return empty;

  const w = width - padding * 2;
  const h = height - padding * 2;
  const peak = Math.max(...points.map((p) => p.bytes), 1);
  const step = points.length > 1 ? w / (points.length - 1) : 0;

  const coords = points.map((p, i) => {
    const x = padding + i * step;
    const y = padding + h - (p.bytes / peak) * h;
    return { x, y };
  });

  const linePts = coords
    .map((c, i) => (i === 0 ? `M ${c.x.toFixed(2)} ${c.y.toFixed(2)}`
                            : `L ${c.x.toFixed(2)} ${c.y.toFixed(2)}`))
    .join(" ");

  const first = coords[0];
  const last = coords[coords.length - 1];
  const baseline = padding + h;
  const areaD =
    `${linePts} L ${last.x.toFixed(2)} ${baseline.toFixed(2)} ` +
    `L ${first.x.toFixed(2)} ${baseline.toFixed(2)} Z`;

  return {
    areaD,
    lineD: linePts,
    peak,
    viewBox: `0 0 ${width} ${height}`,
  };
}

/** Sum of trend values — used by the chart's headline number. */
export function totalTrendBytes(points: ReadonlyArray<TrendPoint>): number {
  return points.reduce((s, p) => s + Math.max(0, p.bytes), 0);
}
