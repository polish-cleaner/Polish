import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormatPrepCta from "../../../components/dashboard/FormatPrepCta";

describe("FormatPrepCta", () => {
  it("renders the kicker + Pro badge", () => {
    render(<FormatPrepCta onStart={() => {}} />);
    expect(screen.getByText(/Prepare for format/i)).toBeInTheDocument();
    expect(screen.getByText(/Pro/)).toBeInTheDocument();
  });

  it("renders the editorial headline", () => {
    render(<FormatPrepCta onStart={() => {}} />);
    expect(screen.getByText(/Don.t lose anything/)).toBeInTheDocument();
  });

  it("calls onStart when 'Start the wizard' is clicked", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<FormatPrepCta onStart={onStart} />);
    await user.click(screen.getByRole("button", { name: /Start the wizard/i }));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("renders the supporting body copy", () => {
    render(<FormatPrepCta onStart={() => {}} />);
    expect(screen.getByText(/Inventory, back up, verify/)).toBeInTheDocument();
  });
});
