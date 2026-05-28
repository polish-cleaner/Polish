import { describe, it, expect } from "vitest";
import {
  CATEGORY_LABELS,
  MIDLIFE_ENVIRONMENT,
  MIDLIFE_FINDINGS,
  MIDLIFE_TREND,
  labelForCategory,
} from "../../../lib/fixtures/dashboard";
import { groupByCategory, totalBytes } from "../../../lib/format";

describe("MIDLIFE_FINDINGS", () => {
  it("has at least one finding per category seed", () => {
    expect(MIDLIFE_FINDINGS.length).toBeGreaterThan(0);
  });

  it("totals a non-trivial number of bytes (≥10 GB)", () => {
    const GIB = 1024 ** 3;
    expect(totalBytes(MIDLIFE_FINDINGS)).toBeGreaterThan(10 * GIB);
  });

  it("every category id is present in CATEGORY_LABELS", () => {
    const groups = groupByCategory(MIDLIFE_FINDINGS);
    for (const g of groups) {
      expect(CATEGORY_LABELS[g.id]).toBeTruthy();
    }
  });

  it("every finding has a positive size", () => {
    for (const f of MIDLIFE_FINDINGS) {
      expect(f.size).toBeGreaterThan(0);
    }
  });
});

describe("MIDLIFE_ENVIRONMENT", () => {
  it("flags multiple dev tools as detected", () => {
    expect(MIDLIFE_ENVIRONMENT.has_npm).toBe(true);
    expect(MIDLIFE_ENVIRONMENT.has_cargo).toBe(true);
  });
});

describe("MIDLIFE_TREND", () => {
  it("renders the prototype's 12-week window", () => {
    expect(MIDLIFE_TREND).toHaveLength(12);
  });
  it("has at least one non-zero point", () => {
    expect(MIDLIFE_TREND.some((p) => p.bytes > 0)).toBe(true);
  });
});

describe("labelForCategory", () => {
  it("returns the mapped label when known", () => {
    expect(labelForCategory("dev.npm.cache")).toBe("npm cache");
  });
  it("formats unknown ids by replacing separators", () => {
    expect(labelForCategory("foo.bar_baz")).toBe("foo bar baz");
  });
});
