import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LargestOpportunities from "../../../components/dashboard/LargestOpportunities";
import type { OpportunityRow } from "../../../types/largest-opportunities";

const GIB = 1024 ** 3;
const ROWS: OpportunityRow[] = [
  { id: "a", label: "LM Studio cached models", bytes: 23.7 * GIB },
  { id: "b", label: "Docker unused images",    bytes: 12.1 * GIB },
  { id: "c", label: "Windows.old",             bytes: 11.4 * GIB },
];

describe("LargestOpportunities", () => {
  it("renders the section title", () => {
    render(<LargestOpportunities rows={ROWS} />);
    expect(screen.getByText(/Largest opportunities/i)).toBeInTheDocument();
    expect(screen.getByText(/Sorted by reclaimable size/i)).toBeInTheDocument();
  });

  it("renders one row per opportunity", () => {
    render(<LargestOpportunities rows={ROWS} />);
    expect(screen.getByText("LM Studio cached models")).toBeInTheDocument();
    expect(screen.getByText("Docker unused images")).toBeInTheDocument();
    expect(screen.getByText("Windows.old")).toBeInTheDocument();
  });

  it("renders empty-state copy when no rows", () => {
    render(<LargestOpportunities rows={[]} />);
    expect(
      screen.getByText(/No reclaimable categories yet/i),
    ).toBeInTheDocument();
  });

  it("shows the (preview data) tag when flagged", () => {
    render(<LargestOpportunities rows={ROWS} previewTag />);
    expect(screen.getByText(/preview data/i)).toBeInTheDocument();
  });

  it("never renders preview tag by default", () => {
    render(<LargestOpportunities rows={ROWS} />);
    expect(screen.queryByText(/preview data/i)).not.toBeInTheDocument();
  });
});
