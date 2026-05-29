import type { OpportunityRow } from "./largest-opportunities";
import type { ReclaimTableRow } from "./top-reclaim-table";
import type { KpiTile } from "./kpi-band";

/**
 * Resolved widget data for the Dashboard render. In Live mode the
 * Findings-derived widgets (opportunities, table, reclaimable bytes)
 * come from the scan result; the rest stay fixture-backed until we
 * land a real history store.
 */
export interface DashboardData {
  opportunities: ReadonlyArray<OpportunityRow>;
  tableRows: ReadonlyArray<ReclaimTableRow>;
  kpiTiles: ReadonlyArray<KpiTile>;
  /** True when this widget set blends in fixture-only data. */
  previewTag: boolean;
}
