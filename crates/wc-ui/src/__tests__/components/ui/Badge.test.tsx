import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "../../../components/ui/Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>new</Badge>);
    expect(screen.getByText("new")).toBeInTheDocument();
  });

  it("default variant uses surface bg", () => {
    render(<Badge data-testid="b">x</Badge>);
    expect(screen.getByTestId("b").className).toMatch(/bg-surface/);
  });

  it("accent variant uses bg-accent-soft", () => {
    render(
      <Badge data-testid="b" variant="accent">
        x
      </Badge>,
    );
    expect(screen.getByTestId("b").className).toMatch(/bg-accent-soft/);
  });

  it("warn variant uses warn-soft bg", () => {
    render(
      <Badge data-testid="b" variant="warn">
        x
      </Badge>,
    );
    expect(screen.getByTestId("b").className).toMatch(/bg-status-warn-soft/);
  });

  it("danger variant uses danger-soft bg", () => {
    render(
      <Badge data-testid="b" variant="danger">
        x
      </Badge>,
    );
    expect(screen.getByTestId("b").className).toMatch(/bg-status-danger-soft/);
  });

  it("pro variant uses uppercase mono", () => {
    render(
      <Badge data-testid="b" variant="pro">
        pro
      </Badge>,
    );
    expect(screen.getByTestId("b").className).toMatch(/font-mono/);
    expect(screen.getByTestId("b").className).toMatch(/uppercase/);
  });

  it("renders leading slot", () => {
    render(
      <Badge leading={<span data-testid="lead" />}>x</Badge>,
    );
    expect(screen.getByTestId("lead")).toBeInTheDocument();
  });
});
