import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmModal from "../../components/ConfirmModal";

describe("ConfirmModal", () => {
  it("renders nothing when open is false", () => {
    render(
      <ConfirmModal
        open={false}
        title="X"
        message="Y"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders title and message when open", () => {
    render(
      <ConfirmModal
        open
        title="Quarantine all?"
        message="This is destructive."
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Quarantine all\?/ })).toBeInTheDocument();
    expect(screen.getByText(/This is destructive/)).toBeInTheDocument();
  });

  it("uses default Confirm / Cancel labels when omitted", () => {
    render(
      <ConfirmModal
        open
        title="X"
        message="Y"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("calls onConfirm when confirm clicked, onCancel when cancel clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        open
        title="X"
        message="Y"
        confirmLabel="Yes"
        cancelLabel="No"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Yes" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "No" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
