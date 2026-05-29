import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TopReclaimTable from "../../../components/dashboard/TopReclaimTable";
import type { ReclaimTableRow } from "../../../types/top-reclaim-table";

const GIB = 1024 ** 3;
const ROWS: ReclaimTableRow[] = [
  { id: "a", category: "LM Studio cached models", files:    4, bytes: 23.7 * GIB, last_seen: "14m ago" },
  { id: "b", category: "Docker unused images",    files:  412, bytes: 12.1 * GIB, last_seen: "14m ago" },
  { id: "c", category: "pnpm store",              files: 3284, bytes:  8.4 * GIB, last_seen: "14m ago" },
];

describe("TopReclaimTable", () => {
  it("renders the section heading", () => {
    render(<TopReclaimTable rows={ROWS} />);
    expect(screen.getByText(/Top reclaim opportunities/i)).toBeInTheDocument();
  });

  it("renders the column headers", () => {
    render(<TopReclaimTable rows={ROWS} />);
    expect(
      screen.getByRole("columnheader", { name: /Category/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Files/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Size/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Last seen/i }),
    ).toBeInTheDocument();
  });

  it("renders one tbody row per data row", () => {
    render(<TopReclaimTable rows={ROWS} />);
    const rows = screen.getAllByRole("row");
    // 1 header row + 3 data rows
    expect(rows.length).toBe(4);
  });

  it("formats file counts with locale separators", () => {
    render(<TopReclaimTable rows={ROWS} />);
    expect(screen.getByText("3,284")).toBeInTheDocument();
  });

  it("renders empty-state copy when no rows", () => {
    render(<TopReclaimTable rows={[]} />);
    expect(screen.getByText(/No reclaimable categories yet/i)).toBeInTheDocument();
  });

  it("renders dash placeholder for missing last_seen", () => {
    const rows: ReclaimTableRow[] = [
      { id: "x", category: "X", files: 1, bytes: GIB },
    ];
    render(<TopReclaimTable rows={rows} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
