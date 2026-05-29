import type { KpiInput, KpiTile } from "../types/kpi-band";
import { bytesToGiB } from "./format";
import { driveStatus } from "./dashboard-helpers";

/**
 * Build the canonical 4-tile KPI band. Pure transform from a
 * pre-resolved scenario object → tile list the KpiBand renders.
 * Mirrors the prototype dashboard.jsx "KPI band" block:
 * Reclaimable now / C: free / In quarantine / Freed last 90d.
 */
export function buildKpiTiles(input: KpiInput): KpiTile[] {
  const drivePctFree = input.drive_total_bytes > 0
    ? (input.drive_free_bytes / input.drive_total_bytes) * 100
    : 0;
  const driveStatusCode = driveStatus(
    input.drive_total_bytes - input.drive_free_bytes,
    input.drive_total_bytes,
  );
  return [
    {
      id: "reclaimable",
      label: "Reclaimable now",
      value: bytesToGiB(input.reclaimable_bytes),
      unit: "GB",
      sub: `${input.category_count} categories`,
      trend: "↑ 18%",
      trendKind: "up",
      icon: "sparkles",
      accent: "accent",
      animate: true,
    },
    {
      id: "drive-free",
      label: "C: drive free",
      value: bytesToGiB(input.drive_free_bytes),
      unit: "GB",
      sub: `${drivePctFree.toFixed(1)}% of ${bytesToGiB(input.drive_total_bytes).toFixed(0)} GB`,
      trend: driveStatusCode === "danger" ? "critical" : undefined,
      trendKind: "down",
      icon: "hard-drive",
      accent: "danger",
      animate: true,
    },
    {
      id: "quarantine",
      label: "In quarantine",
      value: bytesToGiB(input.quarantine_bytes),
      unit: "GB",
      sub: `${input.quarantine_runs} runs · purge in ${input.quarantine_purge_days}d`,
      icon: "box",
      accent: "ink-soft",
      animate: true,
    },
    {
      id: "freed-90d",
      label: "Freed last 90 days",
      value: bytesToGiB(input.freed_90d_bytes),
      unit: "GB",
      sub: `across ${input.cleans_count} cleans`,
      trend: "↑ 31%",
      trendKind: "up",
      icon: "rotate-ccw",
      accent: "accent",
      animate: true,
    },
  ];
}
