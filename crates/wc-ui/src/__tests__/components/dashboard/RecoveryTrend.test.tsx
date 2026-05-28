import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RecoveryTrend from "../../../components/dashboard/RecoveryTrend";
import type { TrendPoint } from "../../../types/charts";

const POINTS: TrendPoint[] = [
  { day: "Mar 02", bytes: 0 },
  { day: "Mar 09", bytes: 1024 ** 3 * 8 },
  { day: "Mar 16", bytes: 1024 ** 3 * 4 },
];

describe("RecoveryTrend", () => {
  it("renders the section heading", () => {
    render(<RecoveryTrend points={POINTS} />);
    expect(screen.getByText(/Recovery trend/i)).toBeInTheDocument();
  });

  it("renders two SVG paths (area + line)", () => {
    const { container } = render(<RecoveryTrend points={POINTS} />);
    expect(container.querySelectorAll("path").length).toBe(2);
  });

  it("renders first and last day labels", () => {
    render(<RecoveryTrend points={POINTS} />);
    expect(screen.getByText("Mar 02")).toBeInTheDocument();
    expect(screen.getByText("Mar 16")).toBeInTheDocument();
  });

  it("does not crash on empty points", () => {
    const { container } = render(<RecoveryTrend points={[]} />);
    // Empty path strings still produce path elements.
    expect(container.querySelectorAll("path").length).toBe(2);
  });
});
