import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Toast from "../../../components/ui/Toast";

describe("Toast", () => {
  it("renders title with status role", () => {
    render(<Toast title="Saved" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("renders body when provided", () => {
    render(<Toast title="t" body="A body line" />);
    expect(screen.getByText("A body line")).toBeInTheDocument();
  });

  it("renders action slot", () => {
    render(<Toast title="t" action={<button data-testid="undo">Undo</button>} />);
    expect(screen.getByTestId("undo")).toBeInTheDocument();
  });

  it("renders dismiss button when onClose provided and fires onClose on click", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Toast title="t" onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does NOT render dismiss button when no onClose", () => {
    render(<Toast title="t" />);
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
  });

  it("renders danger variant — dot inherits class", () => {
    const { container } = render(<Toast title="t" variant="danger" />);
    // Dot is the first svg/span — search by status-danger class.
    expect(container.innerHTML).toMatch(/bg-status-danger/);
  });

  it("renders warn variant", () => {
    const { container } = render(<Toast title="t" variant="warn" />);
    expect(container.innerHTML).toMatch(/bg-status-warn/);
  });
});
