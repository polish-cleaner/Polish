import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DriveGauge from "../../../components/dashboard/DriveGauge";
import type { DriveRow } from "../../../types/drive-gauge";

const GIB = 1024 ** 3;
const DRIVES: DriveRow[] = [
  { id: "C", label: "C:", name: "Windows", used_bytes: 371 * GIB, total_bytes: 375 * GIB },
  { id: "D", label: "D:", name: "Work",    used_bytes:  29 * GIB, total_bytes:  99 * GIB },
];

describe("DriveGauge", () => {
  it("renders the section heading", () => {
    render(<DriveGauge drives={DRIVES} />);
    expect(screen.getByText(/All drives/i)).toBeInTheDocument();
  });

  it("renders one row per drive", () => {
    render(<DriveGauge drives={DRIVES} />);
    // C: appears in the row label + status note → multiple matches.
    expect(screen.getAllByText("C:").length).toBeGreaterThan(0);
    expect(screen.getByText("D:")).toBeInTheDocument();
    expect(screen.getByText("Windows")).toBeInTheDocument();
    expect(screen.getByText("Work")).toBeInTheDocument();
  });

  it("shows the headline status percent for the primary drive", () => {
    render(<DriveGauge drives={DRIVES} />);
    // 371/375 ≈ 99%.
    expect(screen.getByText(/99% full/)).toBeInTheDocument();
  });

  it("flags 'preview data' when flagged", () => {
    render(<DriveGauge drives={DRIVES} previewTag />);
    expect(screen.getByText(/preview data/i)).toBeInTheDocument();
  });

  it("handles empty drives gracefully", () => {
    const { container } = render(<DriveGauge drives={[]} />);
    expect(container.firstChild).toBeTruthy();
  });
});
