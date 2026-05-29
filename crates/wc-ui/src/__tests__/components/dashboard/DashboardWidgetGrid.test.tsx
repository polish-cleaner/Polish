import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TooltipProvider from "../../../components/ui/TooltipProvider";
import DashboardWidgetGrid from "../../../components/dashboard/DashboardWidgetGrid";
import { buildDashboardData } from "../../../lib/dashboard-data";
import type { Environment } from "../../../types/environment";

const ENV: Environment = {
  has_npm: true,
  has_pnpm: true,
  has_cargo: false,
  has_wsl: false,
  has_chrome: true,
  has_edge: false,
  has_firefox: false,
  windows_build: 26200,
};

describe("DashboardWidgetGrid", () => {
  const data = buildDashboardData("preview", []);
  function renderGrid() {
    return render(
      <TooltipProvider>
        <DashboardWidgetGrid
          findings={[]}
          env={ENV}
          totalBytes={0}
          data={data}
          onClean={() => {}}
          onQuarantine={() => {}}
          onFormatPrep={() => {}}
        />
      </TooltipProvider>,
    );
  }

  it("renders the KPI band", () => {
    renderGrid();
    expect(screen.getByText("Reclaimable now")).toBeInTheDocument();
  });

  it("renders LargestOpportunities", () => {
    renderGrid();
    expect(screen.getByText(/Largest opportunities/i)).toBeInTheDocument();
  });

  it("renders ActivityHeatmap", () => {
    renderGrid();
    expect(screen.getByText(/30-day activity/i)).toBeInTheDocument();
  });

  it("renders DriveGauge", () => {
    renderGrid();
    expect(screen.getByText(/All drives/i)).toBeInTheDocument();
  });

  it("renders TopReclaimTable", () => {
    renderGrid();
    expect(screen.getByText(/Top reclaim opportunities/i)).toBeInTheDocument();
  });

  it("renders QuarantineSummary", () => {
    renderGrid();
    expect(screen.getByRole("button", { name: /Open quarantine/i })).toBeInTheDocument();
  });

  it("renders FormatPrepCta", () => {
    renderGrid();
    expect(screen.getByText(/Prepare for format/i)).toBeInTheDocument();
  });

  it("renders CategoryBreakdown + RecoveryTrend", () => {
    renderGrid();
    expect(screen.getByText(/Where the space lives/i)).toBeInTheDocument();
    expect(screen.getByText(/Recovery trend/i)).toBeInTheDocument();
  });

  it("renders EnvironmentTile", () => {
    renderGrid();
    expect(screen.getByText(/Scanner coverage/i)).toBeInTheDocument();
  });
});
