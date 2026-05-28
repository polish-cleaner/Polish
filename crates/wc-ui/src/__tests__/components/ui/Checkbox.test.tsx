import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Checkbox from "../../../components/ui/Checkbox";

describe("Checkbox", () => {
  it("renders unchecked by default with role=checkbox", () => {
    render(<Checkbox aria-label="x" />);
    const cb = screen.getByRole("checkbox");
    expect(cb).toBeInTheDocument();
    expect(cb).toHaveAttribute("data-state", "unchecked");
  });

  it("reflects checked state via data-state", () => {
    render(<Checkbox aria-label="x" checked />);
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  it("reflects indeterminate state", () => {
    render(<Checkbox aria-label="x" checked="indeterminate" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "data-state",
      "indeterminate",
    );
  });

  it("fires onCheckedChange when clicked", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Checkbox aria-label="x" onCheckedChange={onCheckedChange} />,
    );
    await user.click(screen.getByRole("checkbox"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("respects disabled — no event fired", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Checkbox aria-label="x" disabled onCheckedChange={onCheckedChange} />,
    );
    await user.click(screen.getByRole("checkbox"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("merges className", () => {
    render(<Checkbox aria-label="x" className="my-cb" />);
    expect(screen.getByRole("checkbox").className).toMatch(/my-cb/);
  });
});
