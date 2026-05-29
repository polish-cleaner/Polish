import { describe, it, expect } from "vitest";
import {
  detectedToolCount,
  envFlags,
  findingsToDonut,
  topNCategories,
  findingsToTableRows,
  activityHeatmapBuckets,
  driveStatus,
} from "../../lib/dashboard-helpers";
import type { Environment } from "../../types/environment";
import type { Finding } from "../../types/finding";
import type { ActivityCell } from "../../types/activity-heatmap";

const ENV_ALL: Environment = {
  has_npm: true,
  has_pnpm: true,
  has_cargo: true,
  has_wsl: true,
  has_chrome: true,
  has_edge: true,
  has_firefox: true,
  windows_build: 26200,
};

const ENV_NONE: Environment = {
  has_npm: false,
  has_pnpm: false,
  has_cargo: false,
  has_wsl: false,
  has_chrome: false,
  has_edge: false,
  has_firefox: false,
  windows_build: null,
};

describe("detectedToolCount", () => {
  it("counts every true flag", () => {
    expect(detectedToolCount(ENV_ALL)).toBe(7);
  });
  it("returns 0 when nothing is detected", () => {
    expect(detectedToolCount(ENV_NONE)).toBe(0);
  });
});

describe("envFlags", () => {
  it("returns 7 rows in deterministic order", () => {
    const flags = envFlags(ENV_ALL);
    expect(flags.map((f) => f.id)).toEqual([
      "npm",
      "pnpm",
      "cargo",
      "wsl",
      "chrome",
      "edge",
      "firefox",
    ]);
  });
  it("returns all false flags for a null env", () => {
    const flags = envFlags(null);
    expect(flags.every((f) => !f.detected)).toBe(true);
  });
});

describe("findingsToDonut", () => {
  const findings: Finding[] = [
    { path: "a", size: 100, category_id: "windows.temp" },
    { path: "b", size: 200, category_id: "dev.npm.cache" },
    { path: "c", size:  50, category_id: "browser.chrome.cache" },
  ];

  it("returns one segment per category", () => {
    const segs = findingsToDonut(findings);
    expect(segs).toHaveLength(3);
  });

  it("sorts segments by descending size", () => {
    const segs = findingsToDonut(findings);
    expect(segs[0].value).toBe(200);
    expect(segs[1].value).toBe(100);
  });

  it("pools tail categories into an 'Other' segment when topN exceeded", () => {
    const many: Finding[] = Array.from({ length: 10 }, (_, i) => ({
      path: `p${i}`,
      size: 100 - i,
      category_id: `cat.${i}`,
    }));
    const segs = findingsToDonut(many, 3);
    expect(segs).toHaveLength(4);
    expect(segs[segs.length - 1].id).toBe("__other");
  });

  it("returns empty list when no findings", () => {
    expect(findingsToDonut([])).toEqual([]);
  });
});

describe("topNCategories", () => {
  const findings: Finding[] = [
    { path: "a", size: 100, category_id: "windows.temp" },
    { path: "b", size: 500, category_id: "dev.npm.cache" },
    { path: "c", size:  50, category_id: "browser.chrome.cache" },
    { path: "d", size: 200, category_id: "dev.pnpm.store" },
  ];

  it("returns top-N sorted by size desc", () => {
    const rows = topNCategories(findings, 3);
    expect(rows.map((r) => r.bytes)).toEqual([500, 200, 100]);
  });

  it("returns empty list when no findings", () => {
    expect(topNCategories([], 5)).toEqual([]);
  });

  it("caps at N rows", () => {
    expect(topNCategories(findings, 2)).toHaveLength(2);
  });

  it("labels resolve via labelForCategory", () => {
    const rows = topNCategories(findings, 1);
    expect(rows[0].label).toBe("npm cache");
  });
});

describe("findingsToTableRows", () => {
  const findings: Finding[] = [
    { path: "a", size: 100, category_id: "windows.temp" },
    { path: "b", size: 500, category_id: "dev.npm.cache" },
    { path: "c", size:  50, category_id: "windows.temp" },
  ];

  it("aggregates files per category", () => {
    const rows = findingsToTableRows(findings);
    const tempRow = rows.find((r) => r.id === "windows.temp");
    expect(tempRow?.files).toBe(2);
  });

  it("sorts by bytes desc and caps at limit", () => {
    const rows = findingsToTableRows(findings, 1);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("dev.npm.cache");
  });

  it("returns empty for no findings", () => {
    expect(findingsToTableRows([])).toEqual([]);
  });
});

describe("activityHeatmapBuckets", () => {
  const cells: ActivityCell[] = [
    { date: "May 1", bytes: 0,                scanned: true  },
    { date: "May 2", bytes: 1 * 1024 ** 3,    scanned: true  },
    { date: "May 3", bytes: 10 * 1024 ** 3,   scanned: true  },
    { date: "May 4", bytes: 0,                scanned: false },
  ];

  it("returns 0 intensity for clean-scanned days", () => {
    expect(activityHeatmapBuckets(cells)[0].intensity).toBe(0);
  });

  it("returns 0 intensity for no-scan days", () => {
    const b = activityHeatmapBuckets(cells)[3];
    expect(b.intensity).toBe(0);
    expect(b.scanned).toBe(false);
  });

  it("returns intensity 4 for peak day", () => {
    const b = activityHeatmapBuckets(cells)[2];
    expect(b.intensity).toBe(4);
  });

  it("returns intensity 1-2 for small fractions of peak", () => {
    const b = activityHeatmapBuckets(cells)[1];
    expect(b.intensity).toBeGreaterThanOrEqual(1);
    expect(b.intensity).toBeLessThanOrEqual(2);
  });

  it("returns [] for empty input", () => {
    expect(activityHeatmapBuckets([])).toEqual([]);
  });
});

describe("driveStatus", () => {
  it("returns 'ok' below 70% used", () => {
    expect(driveStatus(50, 100)).toBe("ok");
  });
  it("returns 'warn' between 70% and 90%", () => {
    expect(driveStatus(80, 100)).toBe("warn");
  });
  it("returns 'danger' above 90%", () => {
    expect(driveStatus(95, 100)).toBe("danger");
  });
  it("returns 'ok' when total is 0", () => {
    expect(driveStatus(0, 0)).toBe("ok");
  });
  it("returns 'danger' at exactly 90%", () => {
    expect(driveStatus(90, 100)).toBe("danger");
  });
});
