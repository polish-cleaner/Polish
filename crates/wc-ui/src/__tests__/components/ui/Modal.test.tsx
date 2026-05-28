import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "../../../components/ui/Modal";

describe("Modal", () => {
  it("does not render dialog content when open=false", () => {
    render(
      <Modal open={false} onOpenChange={() => {}} title="X">
        body
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog with title when open", () => {
    render(
      <Modal open onOpenChange={() => {}} title="My title">
        body
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("My title")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <Modal open onOpenChange={() => {}} title="T" description="Some desc">
        x
      </Modal>,
    );
    expect(screen.getByText("Some desc")).toBeInTheDocument();
  });

  it("renders children body", () => {
    render(
      <Modal open onOpenChange={() => {}} title="T">
        <span data-testid="body-content">payload</span>
      </Modal>,
    );
    expect(screen.getByTestId("body-content")).toBeInTheDocument();
  });

  it("renders footer slot", () => {
    render(
      <Modal
        open
        onOpenChange={() => {}}
        title="T"
        footer={<button data-testid="footer-btn">ok</button>}
      >
        x
      </Modal>,
    );
    expect(screen.getByTestId("footer-btn")).toBeInTheDocument();
  });

  it("applies destructive class on the title", () => {
    render(
      <Modal open onOpenChange={() => {}} title="DANGER" variant="destructive">
        x
      </Modal>,
    );
    expect(screen.getByText("DANGER").className).toMatch(/text-status-danger/);
  });

  it("invokes onOpenChange(false) on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Modal open onOpenChange={onOpenChange} title="T">
        x
      </Modal>,
    );
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("uses titleId for aria-labelledby when provided", () => {
    render(
      <Modal open onOpenChange={() => {}} title="T" titleId="my-id">
        x
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-labelledby", "my-id");
  });
});
