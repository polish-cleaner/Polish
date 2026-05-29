import type { Finding } from "../types/finding";
import type { DashboardMode } from "../types/dashboard";
import type { KpiInput } from "../types/kpi-band";
import type { DashboardData } from "../types/dashboard-data";
import { totalBytes, groupByCategory } from "./format";
import {
  topNCategories,
  findingsToTableRows,
} from "./dashboard-helpers";
import { buildKpiTiles } from "./kpi-tiles";
import {
  MIDLIFE_OPPORTUNITIES,
  MIDLIFE_TABLE_ROWS,
  MIDLIFE_KPIS,
  MIDLIFE_QUARANTINE,
} from "./fixtures/dashboard";

const TOP_OPPORTUNITY_COUNT = 6;
const TOP_TABLE_ROWS = 6;

/** Resolve all secondary-widget data for the current Dashboard mode. */
export function buildDashboardData(
  mode: DashboardMode,
  findings: ReadonlyArray<Finding>,
): DashboardData {
  const isPreview = mode === "preview";
  // Live-mode KPIs blend findings-derived reclaimable_bytes with
  // fixture-driven drives + quarantine + 90d-freed until those
  // surfaces exist on the Rust side.
  const reclaimable = isPreview
    ? MIDLIFE_KPIS.reclaimable_bytes
    : totalBytes(findings as Finding[]);
  const categoryCount = isPreview
    ? MIDLIFE_KPIS.category_count
    : groupByCategory(findings as Finding[]).length;
  const kpiInput: KpiInput = {
    reclaimable_bytes: reclaimable,
    drive_free_bytes: MIDLIFE_KPIS.drive_free_bytes,
    drive_total_bytes: MIDLIFE_KPIS.drive_total_bytes,
    quarantine_bytes: MIDLIFE_KPIS.quarantine_bytes,
    quarantine_runs: MIDLIFE_QUARANTINE.bundle_count,
    quarantine_purge_days: MIDLIFE_QUARANTINE.days_until_purge,
    freed_90d_bytes: MIDLIFE_KPIS.freed_90d_bytes,
    cleans_count: MIDLIFE_KPIS.cleans_count,
    category_count: categoryCount,
  };
  const opportunities = isPreview
    ? MIDLIFE_OPPORTUNITIES
    : topNCategories(findings, TOP_OPPORTUNITY_COUNT);
  const tableRows = isPreview
    ? MIDLIFE_TABLE_ROWS
    : findingsToTableRows(findings, TOP_TABLE_ROWS);
  return {
    opportunities,
    tableRows,
    kpiTiles: buildKpiTiles(kpiInput),
    previewTag: !isPreview,
  };
}
