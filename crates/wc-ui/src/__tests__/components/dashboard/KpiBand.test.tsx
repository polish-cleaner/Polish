import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import KpiBand from "../../../components/dashboard/KpiBand";
import type { KpiTile } from "../../../types/kpi-band";

const TILES: KpiTile[] = [
  { id: "a", label: "Reclaimable now", value: 41.8, unit: "GB", sub: "12 categories", trend: "↑ 18%", trendKind: "up", icon: "sparkles", accent: "accent", animate: false },
  { id: "b", label: "C: drive free",   value:  4.0, unit: "GB", sub: "1.1% of 375 GB", trend: "critical", trendKind: "down", icon: "hard-drive", accent: "danger", animate: false },
  { id: "c", label: "In quarantine",   value: 43.1, unit: "GB", sub: "3 runs · purge in 4d", icon: "box", accent: "ink-soft", animate: false },
  { id: "d", label: "Freed last 90 days", value: 91.9, unit: "GB", sub: "across 8 cleans", trend: "↑ 31%", trendKind: "up", icon: "rotate-ccw", accent: "accent", animate: false },
];

describe("KpiBand", () => {
  it("renders one card per tile", () => {
    render(<KpiBand tiles={TILES} />);
    expect(screen.getByText("Reclaimable now")).toBeInTheDocument();
    expect(screen.getByText("C: drive free")).toBeInTheDocument();
    expect(screen.getByText("In quarantine")).toBeInTheDocument();
    expect(screen.getByText("Freed last 90 days")).toBeInTheDocument();
  });

  it("renders the trend hairline when supplied", () => {
    render(<KpiBand tiles={TILES} />);
    expect(screen.getByText(/↑ 18%/)).toBeInTheDocument();
    expect(screen.getByText(/critical/)).toBeInTheDocument();
  });

  it("renders sub-lines", () => {
    render(<KpiBand tiles={TILES} />);
    expect(screen.getByText(/12 categories/)).toBeInTheDocument();
    expect(screen.getByText(/across 8 cleans/)).toBeInTheDocument();
  });

  it("handles empty tiles array", () => {
    const { container } = render(<KpiBand tiles={[]} />);
    expect(container.firstChild).toBeTruthy();
  });

  it("omits trend section when neither trend nor sub set", () => {
    const t: KpiTile[] = [{ id: "x", label: "Bare", value: 1, unit: "GB", icon: "sparkles", animate: false }];
    render(<KpiBand tiles={t} />);
    expect(screen.queryByText("↑")).not.toBeInTheDocument();
  });
});
