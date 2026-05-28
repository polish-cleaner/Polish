import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "../../../components/ui/Button";

describe("Button", () => {
  it("renders children inside a <button>", () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole("button", { name: "Click me" });
    expect(btn).toBeInTheDocument();
    expect(btn.tagName).toBe("BUTTON");
  });

  it("applies primary classes by default", () => {
    render(<Button>P</Button>);
    expect(screen.getByRole("button").className).toMatch(/bg-accent/);
  });

  it("applies secondary classes when variant=secondary", () => {
    render(<Button variant="secondary">S</Button>);
    expect(screen.getByRole("button").className).toMatch(/border-line-strong/);
  });

  it("applies ghost classes when variant=ghost", () => {
    render(<Button variant="ghost">G</Button>);
    expect(screen.getByRole("button").className).toMatch(/text-ink-soft/);
  });

  it("applies danger classes when variant=danger", () => {
    render(<Button variant="danger">D</Button>);
    expect(screen.getByRole("button").className).toMatch(/bg-status-danger/);
  });

  it("applies size sm/lg padding", () => {
    const { rerender } = render(<Button size="sm">x</Button>);
    expect(screen.getByRole("button").className).toMatch(/text-\[12px\]/);
    rerender(<Button size="lg">x</Button>);
    expect(screen.getByRole("button").className).toMatch(/text-\[14px\]/);
  });

  it("renders leading and trailing slots", () => {
    render(
      <Button leading={<span data-testid="L" />} trailing={<span data-testid="T" />}>
        x
      </Button>,
    );
    expect(screen.getByTestId("L")).toBeInTheDocument();
    expect(screen.getByTestId("T")).toBeInTheDocument();
  });

  it("fires onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("respects disabled state", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        x
      </Button>,
    );
    expect(screen.getByRole("button")).toBeDisabled();
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("asChild renders through the child element via Slot", () => {
    render(
      <Button asChild>
        <a href="/x">link</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "link" });
    expect(link.tagName).toBe("A");
    expect(link.className).toMatch(/bg-accent/);
  });

  it("forwards a custom className", () => {
    render(<Button className="extra-class">x</Button>);
    expect(screen.getByRole("button").className).toMatch(/extra-class/);
  });
});
