import { describe, it, expect } from "vitest";
import {
  detectedToolCount,
  envFlags,
  findingsToDonut,
} from "../../lib/dashboard-helpers";
import type { Environment } from "../../types/environment";
import type { Finding } from "../../types/finding";

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
