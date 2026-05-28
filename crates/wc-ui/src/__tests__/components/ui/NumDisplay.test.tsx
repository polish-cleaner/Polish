import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NumDisplay from "../../../components/ui/NumDisplay";

describe("NumDisplay", () => {
  it("renders a numeric value", () => {
    render(<NumDisplay data-testid="n" value={42} />);
    expect(screen.getByTestId("n")).toHaveTextContent("42");
  });

  it("renders a string value verbatim", () => {
    render(<NumDisplay data-testid="n" value="1.23" />);
    expect(screen.getByTestId("n")).toHaveTextContent("1.23");
  });

  it("renders a unit suffix", () => {
    render(<NumDisplay data-testid="n" value={5} unit="MB" />);
    expect(screen.getByTestId("n")).toHaveTextContent("5");
    expect(screen.getByTestId("n")).toHaveTextContent("MB");
  });

  it("applies the mono font + tabular-nums class on the root", () => {
    render(<NumDisplay data-testid="n" value={1} />);
    const root = screen.getByTestId("n");
    expect(root.className).toMatch(/font-mono/);
    expect(root.className).toMatch(/tabular-nums/);
  });

  it("animate prop accepts numeric target without crashing", () => {
    render(<NumDisplay data-testid="n" value={100} animate />);
    expect(screen.getByTestId("n")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    render(<NumDisplay data-testid="n" value={1} className="big-num" />);
    expect(screen.getByTestId("n").className).toMatch(/big-num/);
  });
});
