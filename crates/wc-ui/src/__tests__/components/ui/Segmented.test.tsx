import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Segmented from "../../../components/ui/Segmented";

const OPTIONS = [
  { value: "light", label: "Light" },
  { value: "balanced", label: "Balanced" },
  { value: "aggressive", label: "Aggressive" },
] as const;

describe("Segmented", () => {
  it("renders all option labels", () => {
    render(
      <Segmented
        value="balanced"
        onValueChange={() => {}}
        options={[...OPTIONS]}
        aria-label="mode"
      />,
    );
    expect(screen.getByRole("tab", { name: "Light" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Balanced" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Aggressive" })).toBeInTheDocument();
  });

  it("marks the active value with data-state=active", () => {
    render(
      <Segmented
        value="balanced"
        onValueChange={() => {}}
        options={[...OPTIONS]}
        aria-label="mode"
      />,
    );
    expect(screen.getByRole("tab", { name: "Balanced" })).toHaveAttribute(
      "data-state",
      "active",
    );
    expect(screen.getByRole("tab", { name: "Light" })).toHaveAttribute(
      "data-state",
      "inactive",
    );
  });

  it("fires onValueChange when a different tab is clicked", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Segmented
        value="light"
        onValueChange={onValueChange}
        options={[...OPTIONS]}
        aria-label="mode"
      />,
    );
    await user.click(screen.getByRole("tab", { name: "Aggressive" }));
    expect(onValueChange).toHaveBeenCalledWith("aggressive");
  });

  it("applies sunken track background", () => {
    const { container } = render(
      <Segmented
        value="light"
        onValueChange={() => {}}
        options={[...OPTIONS]}
        aria-label="mode"
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/bg-surface-sunken/);
  });
});
