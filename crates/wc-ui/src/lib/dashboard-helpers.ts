import type { Environment } from "../types/environment";
import type { Finding } from "../types/finding";
import type { DonutSegment } from "../types/charts";
import type { OpportunityRow } from "../types/largest-opportunities";
import type { ReclaimTableRow } from "../types/top-reclaim-table";
import type {
  ActivityCell,
  HeatmapBucket,
} from "../types/activity-heatmap";
import type { DriveStatus } from "../types/drive-gauge";
import { labelForCategory } from "./fixtures/dashboard";
import { groupByCategory } from "./format";

/** Number of "true" flags in a detected environment. */
export function detectedToolCount(env: Environment): number {
  return [
    env.has_npm,
    env.has_pnpm,
    env.has_cargo,
    env.has_wsl,
    env.has_chrome,
    env.has_edge,
    env.has_firefox,
  ].filter(Boolean).length;
}

/**
 * Map of OS / dev tool labels and their detection booleans, in the
 * order the EnvironmentTile grid renders them. Lives in `lib/` so the
 * EnvironmentTile component file stays JSX-only (Rule 4).
 */
export interface EnvFlag {
  id: string;
  label: string;
  detected: boolean;
}

export function envFlags(env: Environment | null): EnvFlag[] {
  return [
    { id: "npm",     label: "npm",     detected: env?.has_npm ?? false },
    { id: "pnpm",    label: "pnpm",    detected: env?.has_pnpm ?? false },
    { id: "cargo",   label: "cargo",   detected: env?.has_cargo ?? false },
    { id: "wsl",     label: "WSL",     detected: env?.has_wsl ?? false },
    { id: "chrome",  label: "Chrome",  detected: env?.has_chrome ?? false },
    { id: "edge",    label: "Edge",    detected: env?.has_edge ?? false },
    { id: "firefox", label: "Firefox", detected: env?.has_firefox ?? false },
  ];
}

/**
 * Deterministic palette for the donut segments. The same category id
 * always lands on the same colour so the chart is comparable across
 * sessions. Mirrors the prototype's "safety tier" palette but lifted
 * into the design-token CSS-var space.
 */
const SEGMENT_PALETTE = [
  "var(--accent)",
  "var(--accent-deep)",
  "var(--status-good)",
  "var(--status-info)",
  "var(--status-warn)",
  "var(--ink-soft)",
  "var(--ink-muted)",
  "var(--accent-hover)",
];

/**
 * Convert a Finding list to the donut chart's segment shape: one
 * segment per top-N category, with a final "Other" pooling smaller
 * tails. Output is sorted by bytes descending (largest slice first).
 */
export function findingsToDonut(
  findings: ReadonlyArray<Finding>,
  topN = 7,
): DonutSegment[] {
  const groups = groupByCategory(findings as Finding[]);
  if (groups.length === 0) return [];

  const head = groups.slice(0, topN);
  const tail = groups.slice(topN);
  const segments: DonutSegment[] = head.map((g, i) => ({
    id: g.id,
    label: labelForCategory(g.id),
    value: g.size,
    color: SEGMENT_PALETTE[i % SEGMENT_PALETTE.length],
  }));
  if (tail.length > 0) {
    const otherBytes = tail.reduce((s, g) => s + g.size, 0);
    if (otherBytes > 0) {
      segments.push({
        id: "__other",
        label: "Other",
        value: otherBytes,
        color: "var(--ink-faint)",
      });
    }
  }
  return segments;
}

/**
 * Top-N reclaimable categories by size. Drives the LargestOpportunities
 * bar list. Sorted by bytes descending; smaller tails dropped (NOT
 * pooled — the bar widget shows only the headline opportunities).
 */
export function topNCategories(
  findings: ReadonlyArray<Finding>,
  n: number,
): OpportunityRow[] {
  const groups = groupByCategory(findings as Finding[]);
  return groups.slice(0, n).map((g) => ({
    id: g.id,
    label: labelForCategory(g.id),
    bytes: g.size,
  }));
}

/**
 * Convert a Finding list into the TopReclaimTable row shape.
 * Sorted by bytes desc, capped at `limit`.
 */
export function findingsToTableRows(
  findings: ReadonlyArray<Finding>,
  limit = 6,
): ReclaimTableRow[] {
  const groups = groupByCategory(findings as Finding[]);
  return groups.slice(0, limit).map((g) => ({
    id: g.id,
    category: labelForCategory(g.id),
    files: g.count,
    bytes: g.size,
  }));
}

/**
 * Translate raw activity cells into the colored-bucket shape the
 * heatmap renders. Buckets are 0-4 (0 = no scan / clean, 4 = peak).
 */
export function activityHeatmapBuckets(
  cells: ReadonlyArray<ActivityCell>,
): HeatmapBucket[] {
  if (cells.length === 0) return [];
  const peak = Math.max(...cells.map((c) => c.bytes), 1);
  return cells.map((c) => {
    let intensity: 0 | 1 | 2 | 3 | 4 = 0;
    if (c.scanned && c.bytes > 0) {
      const r = c.bytes / peak;
      if (r > 0.66) intensity = 4;
      else if (r > 0.33) intensity = 3;
      else if (r > 0.15) intensity = 2;
      else intensity = 1;
    }
    return {
      date: c.date,
      bytes: c.bytes,
      scanned: c.scanned,
      intensity,
    };
  });
}

const STATUS_WARN_THRESHOLD = 0.7;
const STATUS_DANGER_THRESHOLD = 0.9;

/** Percent-used → traffic-light status used by DriveGauge bars. */
export function driveStatus(used: number, total: number): DriveStatus {
  if (total <= 0) return "ok";
  const ratio = used / total;
  if (ratio >= STATUS_DANGER_THRESHOLD) return "danger";
  if (ratio >= STATUS_WARN_THRESHOLD) return "warn";
  return "ok";
}
