import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Card from "../../../components/ui/Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card data-testid="c">hello</Card>);
    expect(screen.getByTestId("c")).toHaveTextContent("hello");
  });

  it("applies default bg-surface variant", () => {
    render(<Card data-testid="c">x</Card>);
    expect(screen.getByTestId("c").className).toMatch(/bg-surface/);
  });

  it("applies sunken variant when variant=sunken", () => {
    render(
      <Card data-testid="c" variant="sunken">
        x
      </Card>,
    );
    expect(screen.getByTestId("c").className).toMatch(/bg-surface-warm/);
  });

  it("applies border-line and rounded-md base classes", () => {
    render(<Card data-testid="c">x</Card>);
    const cls = screen.getByTestId("c").className;
    expect(cls).toMatch(/border-line/);
    expect(cls).toMatch(/rounded-md/);
  });

  it("merges custom className", () => {
    render(
      <Card data-testid="c" className="my-extra">
        x
      </Card>,
    );
    expect(screen.getByTestId("c").className).toMatch(/my-extra/);
  });
});
