import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TooltipProvider from "../../../components/ui/TooltipProvider";
import ActivityHeatmap from "../../../components/dashboard/ActivityHeatmap";
import type { ActivityCell } from "../../../types/activity-heatmap";

const GIB = 1024 ** 3;
const CELLS: ActivityCell[] = Array.from({ length: 30 }, (_, i) => ({
  date: `May ${i + 1}`,
  bytes: (i % 5) * GIB,
  scanned: i < 28,
}));

function renderWithTooltip(ui: React.ReactElement) {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
}

describe("ActivityHeatmap", () => {
  it("renders the section heading", () => {
    renderWithTooltip(<ActivityHeatmap cells={CELLS} />);
    expect(screen.getByText(/30-day activity/i)).toBeInTheDocument();
  });

  it("renders one cell per day", () => {
    renderWithTooltip(<ActivityHeatmap cells={CELLS} />);
    const cells = screen.getAllByRole("gridcell");
    expect(cells).toHaveLength(30);
  });

  it("scan-count sub line matches scanned-count", () => {
    renderWithTooltip(<ActivityHeatmap cells={CELLS} />);
    // 28 scanned days → "28 scans · darker = more found"
    expect(screen.getByText(/28/)).toBeInTheDocument();
    expect(screen.getByText(/scans/i)).toBeInTheDocument();
  });

  it("renders 'less / more' legend bar", () => {
    renderWithTooltip(<ActivityHeatmap cells={CELLS} />);
    expect(screen.getByText("less")).toBeInTheDocument();
    expect(screen.getByText("more")).toBeInTheDocument();
    expect(screen.getByText("30d ago")).toBeInTheDocument();
    expect(screen.getByText("today")).toBeInTheDocument();
  });

  it("shows preview-data tag when flagged", () => {
    renderWithTooltip(<ActivityHeatmap cells={CELLS} previewTag />);
    expect(screen.getByText(/preview data/i)).toBeInTheDocument();
  });

  it("renders zero gridcells for empty input", () => {
    renderWithTooltip(<ActivityHeatmap cells={[]} />);
    expect(screen.queryAllByRole("gridcell")).toHaveLength(0);
  });
});
