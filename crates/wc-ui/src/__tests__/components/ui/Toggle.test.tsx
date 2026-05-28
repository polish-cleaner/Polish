import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Toggle from "../../../components/ui/Toggle";

describe("Toggle", () => {
  it("renders with role=switch", () => {
    render(<Toggle aria-label="x" />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("reflects unchecked state by default", () => {
    render(<Toggle aria-label="x" />);
    expect(screen.getByRole("switch")).toHaveAttribute(
      "data-state",
      "unchecked",
    );
  });

  it("reflects checked state", () => {
    render(<Toggle aria-label="x" checked />);
    expect(screen.getByRole("switch")).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  it("fires onCheckedChange when toggled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Toggle aria-label="x" onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole("switch"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("respects disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Toggle aria-label="x" disabled onCheckedChange={onCheckedChange} />,
    );
    await user.click(screen.getByRole("switch"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("applies bg-accent class when checked", () => {
    render(<Toggle aria-label="x" checked />);
    expect(screen.getByRole("switch").className).toMatch(/data-\[state=checked\]:bg-accent/);
  });
});
