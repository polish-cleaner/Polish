import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CategoryBreakdown from "../../../components/dashboard/CategoryBreakdown";
import type { Finding } from "../../../types/finding";

const FINDINGS: Finding[] = [
  { path: "a", size: 1024 ** 3 * 3, category_id: "dev.npm.cache" },
  { path: "b", size: 1024 ** 3 * 1, category_id: "windows.temp" },
  { path: "c", size: 1024 ** 3 * 2, category_id: "browser.chrome.cache" },
];

describe("CategoryBreakdown", () => {
  it("renders the section heading", () => {
    render(<CategoryBreakdown findings={FINDINGS} />);
    expect(screen.getByText(/Where the space lives/i)).toBeInTheDocument();
  });

  it("renders one legend item per category", () => {
    render(<CategoryBreakdown findings={FINDINGS} />);
    expect(screen.getByText(/npm cache/i)).toBeInTheDocument();
    expect(screen.getByText(/System temp/i)).toBeInTheDocument();
    expect(screen.getByText(/Chrome cache/i)).toBeInTheDocument();
  });

  it("renders the donut SVG with one arc per non-zero segment", () => {
    const { container } = render(<CategoryBreakdown findings={FINDINGS} />);
    // 1 background ring + 3 arc circles = 4 circle elements.
    expect(container.querySelectorAll("circle").length).toBe(4);
  });

  it("does not crash on empty findings (zero segments)", () => {
    const { container } = render(<CategoryBreakdown findings={[]} />);
    // Background ring is still drawn.
    expect(container.querySelectorAll("circle").length).toBeGreaterThanOrEqual(1);
  });
});
