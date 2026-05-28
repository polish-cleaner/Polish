import { describe, it, expect } from "vitest";
import {
  pointsToPath,
  segmentsToArcs,
  totalSegmentValue,
  totalTrendBytes,
} from "../../lib/charts";
import type { DonutSegment, TrendPoint } from "../../types/charts";

const SEGMENTS: DonutSegment[] = [
  { id: "a", value: 100, label: "A", color: "var(--accent)" },
  { id: "b", value:  50, label: "B", color: "var(--accent-deep)" },
  { id: "c", value:  50, label: "C", color: "var(--status-info)" },
];

describe("segmentsToArcs", () => {
  it("returns one arc per segment", () => {
    const arcs = segmentsToArcs(SEGMENTS, 50);
    expect(arcs).toHaveLength(3);
  });

  it("preserves segment id and original payload", () => {
    const arcs = segmentsToArcs(SEGMENTS, 50);
    expect(arcs[0].id).toBe("a");
    expect(arcs[0].segment.label).toBe("A");
  });

  it("computes arcs that consume proportions of the circumference", () => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const arcs = segmentsToArcs(SEGMENTS, radius, 0);
    const total = arcs.reduce((s, a) => s + a.dashLength, 0);
    expect(total).toBeCloseTo(circumference, 5);
    // 100/200 of the circumference for the first arc.
    expect(arcs[0].dashLength).toBeCloseTo(circumference * 0.5, 5);
    expect(arcs[1].dashLength).toBeCloseTo(circumference * 0.25, 5);
  });

  it("dash offsets are non-positive and cumulative", () => {
    const arcs = segmentsToArcs(SEGMENTS, 50);
    expect(arcs[0].dashOffset).toBe(-0);
    expect(arcs[1].dashOffset).toBeLessThan(0);
    expect(arcs[2].dashOffset).toBeLessThan(arcs[1].dashOffset);
  });

  it("returns empty list for empty input", () => {
    expect(segmentsToArcs([], 50)).toEqual([]);
  });

  it("returns empty list when total is zero", () => {
    const zero: DonutSegment[] = [
      { id: "a", value: 0, label: "A", color: "var(--accent)" },
    ];
    expect(segmentsToArcs(zero, 50)).toEqual([]);
  });

  it("clamps negative values to zero", () => {
    const neg: DonutSegment[] = [
      { id: "a", value: -5, label: "A", color: "var(--accent)" },
      { id: "b", value:  5, label: "B", color: "var(--accent)" },
    ];
    const arcs = segmentsToArcs(neg, 50);
    expect(arcs).toHaveLength(2);
    // -5 clamped to 0 → zero-length arc, no negative leak.
    expect(arcs[0].dashLength).toBe(0);
    expect(arcs[1].dashLength).toBeGreaterThan(0);
  });
});

describe("totalSegmentValue", () => {
  it("sums positive values", () => {
    expect(totalSegmentValue(SEGMENTS)).toBe(200);
  });
  it("treats negatives as zero", () => {
    const neg: DonutSegment[] = [
      { id: "a", value: -10, label: "A", color: "" },
      { id: "b", value:  20, label: "B", color: "" },
    ];
    expect(totalSegmentValue(neg)).toBe(20);
  });
});

const TREND: TrendPoint[] = [
  { day: "Mon", bytes:   0 },
  { day: "Tue", bytes: 100 },
  { day: "Wed", bytes: 200 },
];

describe("pointsToPath", () => {
  it("returns empty paths for empty input", () => {
    const p = pointsToPath([], 100, 40);
    expect(p.areaD).toBe("");
    expect(p.lineD).toBe("");
    expect(p.peak).toBe(0);
    expect(p.viewBox).toBe("0 0 100 40");
  });

  it("emits a line path with one M and N-1 L commands", () => {
    const p = pointsToPath(TREND, 100, 40);
    const moves = (p.lineD.match(/M /g) ?? []).length;
    const lines = (p.lineD.match(/L /g) ?? []).length;
    expect(moves).toBe(1);
    expect(lines).toBe(TREND.length - 1);
  });

  it("emits an area path that ends with the closing 'Z'", () => {
    const p = pointsToPath(TREND, 100, 40);
    expect(p.areaD.endsWith("Z")).toBe(true);
  });

  it("computes the resolved peak", () => {
    const p = pointsToPath(TREND, 100, 40);
    expect(p.peak).toBe(200);
  });

  it("guards a zero-peak set so the path math never divides by zero", () => {
    const flat: TrendPoint[] = [
      { day: "A", bytes: 0 },
      { day: "B", bytes: 0 },
    ];
    const p = pointsToPath(flat, 100, 40);
    expect(p.peak).toBe(1);
    expect(p.lineD).not.toBe("");
  });

  it("single-point path emits M + Z (degenerate area)", () => {
    const one: TrendPoint[] = [{ day: "X", bytes: 50 }];
    const p = pointsToPath(one, 100, 40);
    expect(p.lineD.startsWith("M")).toBe(true);
    expect(p.areaD.endsWith("Z")).toBe(true);
  });
});

describe("totalTrendBytes", () => {
  it("sums positive values", () => {
    expect(totalTrendBytes(TREND)).toBe(300);
  });
  it("treats negatives as zero", () => {
    const neg: TrendPoint[] = [
      { day: "A", bytes: -100 },
      { day: "B", bytes:  100 },
    ];
    expect(totalTrendBytes(neg)).toBe(100);
  });
  it("returns 0 for empty input", () => {
    expect(totalTrendBytes([])).toBe(0);
  });
});
