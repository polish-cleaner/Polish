/**
 * KpiBand widget — strip of 4 small KPI tiles above the chart row.
 * Mirrors the prototype dashboard.jsx "KPI band" block.
 */
export type KpiTrendKind = "up" | "down" | "neutral";

export interface KpiTile {
  id: string;
  /** Small-caps section heading (e.g. "Reclaimable now"). */
  label: string;
  /** Big numeric value rendered through NumDisplay. */
  value: number;
  /** Display unit (e.g. "GB", "GB"). */
  unit: string;
  /** Optional sub-line (e.g. "12 categories"). */
  sub?: string;
  /** Optional trend hairline (e.g. "↑ 18%", "critical"). */
  trend?: string;
  /** Drives the trend hairline color. */
  trendKind?: KpiTrendKind;
  /** Lucide icon name → resolved inside KpiBand. */
  icon: "sparkles" | "hard-drive" | "box" | "rotate-ccw";
  /** Drives the icon color (defaults to ink-muted). */
  accent?: "accent" | "danger" | "ink-soft";
  /** Whether to count-up animate the value. */
  animate?: boolean;
}

export interface KpiBandProps {
  tiles: ReadonlyArray<KpiTile>;
}

/** Input shape for the `buildKpiTiles` helper. */
export interface KpiInput {
  reclaimable_bytes: number;
  drive_free_bytes: number;
  drive_total_bytes: number;
  quarantine_bytes: number;
  quarantine_runs: number;
  quarantine_purge_days: number;
  freed_90d_bytes: number;
  cleans_count: number;
  category_count: number;
}
