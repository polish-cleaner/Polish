import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Progress from "../../../components/ui/Progress";

describe("Progress", () => {
  it("renders with a value and exposes aria-valuenow", () => {
    render(<Progress value={42} ariaLabel="loading" />);
    const root = screen.getByRole("progressbar");
    expect(root).toHaveAttribute("aria-valuenow", "42");
  });

  it("clamps value above 100 to 100", () => {
    render(<Progress value={200} ariaLabel="x" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("clamps value below 0 to 0", () => {
    render(<Progress value={-50} ariaLabel="x" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("applies track styling classes", () => {
    render(<Progress value={10} ariaLabel="x" />);
    expect(screen.getByRole("progressbar").className).toMatch(/bg-surface-sunken/);
  });

  it("renders indeterminate variant without a numeric value", () => {
    render(<Progress indeterminate ariaLabel="busy" />);
    const root = screen.getByRole("progressbar");
    expect(root).toBeInTheDocument();
    // Indeterminate progress should not have aria-valuenow set to a number.
    expect(root.getAttribute("aria-valuenow")).toBeNull();
  });
});
