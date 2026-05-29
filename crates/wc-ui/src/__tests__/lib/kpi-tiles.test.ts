import { describe, it, expect } from "vitest";
import { buildKpiTiles } from "../../lib/kpi-tiles";
import type { KpiInput } from "../../types/kpi-band";

const GIB = 1024 ** 3;
const INPUT: KpiInput = {
  reclaimable_bytes:  41.8 * GIB,
  drive_free_bytes:    4.0 * GIB,
  drive_total_bytes: 375.0 * GIB,
  quarantine_bytes:   43.1 * GIB,
  quarantine_runs:    3,
  quarantine_purge_days: 4,
  freed_90d_bytes:    91.9 * GIB,
  cleans_count:       8,
  category_count:     12,
};

describe("buildKpiTiles", () => {
  it("returns exactly 4 tiles", () => {
    expect(buildKpiTiles(INPUT)).toHaveLength(4);
  });

  it("first tile is reclaimable", () => {
    expect(buildKpiTiles(INPUT)[0].id).toBe("reclaimable");
    expect(buildKpiTiles(INPUT)[0].label).toBe("Reclaimable now");
  });

  it("renders quarantine purge sub-line", () => {
    const tiles = buildKpiTiles(INPUT);
    const q = tiles.find((t) => t.id === "quarantine")!;
    expect(q.sub).toContain("3 runs");
    expect(q.sub).toContain("4d");
  });

  it("flags drive-free 'critical' when near full", () => {
    const tiles = buildKpiTiles(INPUT);
    const drive = tiles.find((t) => t.id === "drive-free")!;
    expect(drive.trend).toBe("critical");
  });

  it("omits drive 'critical' label when comfortably below 90%", () => {
    const tiles = buildKpiTiles({ ...INPUT, drive_free_bytes: 200 * GIB });
    const drive = tiles.find((t) => t.id === "drive-free")!;
    expect(drive.trend).toBeUndefined();
  });

  it("freed-90d shows category-driven sub-line", () => {
    const tiles = buildKpiTiles(INPUT);
    const freed = tiles.find((t) => t.id === "freed-90d")!;
    expect(freed.sub).toBe("across 8 cleans");
  });

  it("reclaimable sub-line uses input.category_count", () => {
    const tiles = buildKpiTiles({ ...INPUT, category_count: 5 });
    expect(tiles[0].sub).toBe("5 categories");
  });
});
