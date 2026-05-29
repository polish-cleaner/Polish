import { describe, it, expect } from "vitest";
import { buildDashboardData } from "../../lib/dashboard-data";
import type { Finding } from "../../types/finding";

const GIB = 1024 ** 3;
const LIVE_FINDINGS: Finding[] = [
  { path: "a", size: 5 * GIB, category_id: "dev.npm.cache" },
  { path: "b", size: 2 * GIB, category_id: "windows.temp" },
];

describe("buildDashboardData", () => {
  it("preview mode returns fixture opportunities", () => {
    const data = buildDashboardData("preview", []);
    expect(data.opportunities.length).toBeGreaterThan(0);
    expect(data.previewTag).toBe(false);
  });

  it("live mode flags previewTag for mixed fixtures", () => {
    const data = buildDashboardData("live", LIVE_FINDINGS);
    expect(data.previewTag).toBe(true);
  });

  it("live mode derives opportunities from findings", () => {
    const data = buildDashboardData("live", LIVE_FINDINGS);
    expect(data.opportunities[0].id).toBe("dev.npm.cache");
  });

  it("live mode derives table rows from findings", () => {
    const data = buildDashboardData("live", LIVE_FINDINGS);
    expect(data.tableRows).toHaveLength(2);
    expect(data.tableRows[0].id).toBe("dev.npm.cache");
  });

  it("live mode KPI[reclaimable] equals sum of finding sizes", () => {
    const data = buildDashboardData("live", LIVE_FINDINGS);
    // 7 GiB total → bytesToGiB returns ~7.0
    const reclaim = data.kpiTiles.find((t) => t.id === "reclaimable")!;
    expect(reclaim.value).toBeCloseTo(7.0, 1);
  });

  it("preview mode KPI[reclaimable] uses the fixture total (41.8 GB)", () => {
    const data = buildDashboardData("preview", []);
    const reclaim = data.kpiTiles.find((t) => t.id === "reclaimable")!;
    expect(reclaim.value).toBeCloseTo(41.8, 1);
  });

  it("always returns 4 KPI tiles", () => {
    expect(buildDashboardData("live", []).kpiTiles).toHaveLength(4);
    expect(buildDashboardData("preview", []).kpiTiles).toHaveLength(4);
  });
});
