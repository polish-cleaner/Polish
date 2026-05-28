import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Drawer from "../../../components/ui/Drawer";

describe("Drawer", () => {
  it("does not render when open=false", () => {
    render(
      <Drawer open={false} onOpenChange={() => {}} title="X">
        body
      </Drawer>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog with title when open", () => {
    render(
      <Drawer open onOpenChange={() => {}} title="Detail">
        body
      </Drawer>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Detail")).toBeInTheDocument();
  });

  it("renders description and body and footer", () => {
    render(
      <Drawer
        open
        onOpenChange={() => {}}
        title="T"
        description="DESC"
        footer={<button data-testid="ftr">F</button>}
      >
        <span data-testid="bodytext">BODY</span>
      </Drawer>,
    );
    expect(screen.getByText("DESC")).toBeInTheDocument();
    expect(screen.getByTestId("bodytext")).toBeInTheDocument();
    expect(screen.getByTestId("ftr")).toBeInTheDocument();
  });

  it("invokes onOpenChange(false) on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Drawer open onOpenChange={onOpenChange} title="T">
        x
      </Drawer>,
    );
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("respects a custom width via inline style", () => {
    render(
      <Drawer open onOpenChange={() => {}} title="T" width={420}>
        x
      </Drawer>,
    );
    const dialog = screen.getByRole("dialog") as HTMLElement;
    expect(dialog.style.width).toBe("420px");
  });
});
