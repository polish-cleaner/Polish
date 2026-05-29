import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuarantineSummary from "../../../components/dashboard/QuarantineSummary";

const GIB = 1024 ** 3;

describe("QuarantineSummary", () => {
  it("renders the bundle count badge", () => {
    render(
      <QuarantineSummary
        bundle_count={3}
        total_bytes={43.1 * GIB}
        days_until_purge={4}
        onOpen={() => {}}
      />,
    );
    // "3 runs" appears in the badge AND in the sub-line.
    expect(screen.getAllByText(/3 runs/).length).toBeGreaterThan(0);
  });

  it("renders the purge sub-line when supplied", () => {
    render(
      <QuarantineSummary
        bundle_count={3}
        total_bytes={43.1 * GIB}
        days_until_purge={4}
        onOpen={() => {}}
      />,
    );
    expect(screen.getByText(/purge in 4d/)).toBeInTheDocument();
  });

  it("calls onOpen when the primary button is clicked", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(
      <QuarantineSummary
        bundle_count={3}
        total_bytes={43.1 * GIB}
        onOpen={onOpen}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Open quarantine/i }));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("hides 'Restore last' when no callback supplied", () => {
    render(
      <QuarantineSummary
        bundle_count={3}
        total_bytes={43.1 * GIB}
        onOpen={() => {}}
      />,
    );
    expect(screen.queryByText(/Restore last/i)).not.toBeInTheDocument();
  });

  it("renders the Restore last button when callback supplied", () => {
    render(
      <QuarantineSummary
        bundle_count={3}
        total_bytes={43.1 * GIB}
        onOpen={() => {}}
        onRestoreLast={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: /Restore last/i })).toBeInTheDocument();
  });
});
