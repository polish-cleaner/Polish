import { describe, it, expect } from "vitest";
import { formatMiB, groupByCategory, totalBytes } from "../../lib/format";
import type { Finding } from "../../types/finding";

describe("formatMiB", () => {
  it("formats zero as 0.00 MiB", () => {
    expect(formatMiB(0)).toBe("0.00 MiB");
  });

  it("formats exactly 1 MiB", () => {
    expect(formatMiB(1_048_576)).toBe("1.00 MiB");
  });

  it("rounds to 2 decimal places", () => {
    expect(formatMiB(1_572_864)).toBe("1.50 MiB");
  });

  it("handles large values", () => {
    expect(formatMiB(2_500_000_000)).toBe("2384.19 MiB");
  });
});

describe("totalBytes", () => {
  it("returns 0 for empty array", () => {
    expect(totalBytes([])).toBe(0);
  });

  it("sums sizes", () => {
    const findings: Finding[] = [
      { path: "a", size: 100, category_id: "x" },
      { path: "b", size: 200, category_id: "x" },
      { path: "c", size: 300, category_id: "y" },
    ];
    expect(totalBytes(findings)).toBe(600);
  });
});

describe("groupByCategory", () => {
  it("returns empty array for empty input", () => {
    expect(groupByCategory([])).toEqual([]);
  });

  it("groups findings by category_id", () => {
    const findings: Finding[] = [
      { path: "a", size: 100, category_id: "dev.npm.cache" },
      { path: "b", size: 200, category_id: "dev.npm.cache" },
      { path: "c", size: 50, category_id: "windows.temp" },
    ];
    const result = groupByCategory(findings);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: "dev.npm.cache", count: 2, size: 300 });
    expect(result[1]).toEqual({ id: "windows.temp", count: 1, size: 50 });
  });

  it("sorts by descending size", () => {
    const findings: Finding[] = [
      { path: "a", size: 50, category_id: "small" },
      { path: "b", size: 500, category_id: "large" },
      { path: "c", size: 200, category_id: "medium" },
    ];
    const ids = groupByCategory(findings).map((g) => g.id);
    expect(ids).toEqual(["large", "medium", "small"]);
  });
});
