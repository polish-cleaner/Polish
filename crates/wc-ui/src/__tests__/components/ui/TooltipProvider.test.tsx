import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TooltipProvider from "../../../components/ui/TooltipProvider";

describe("TooltipProvider", () => {
  it("renders children", () => {
    render(
      <TooltipProvider>
        <span data-testid="child">hi</span>
      </TooltipProvider>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("accepts a custom delayDuration without throwing", () => {
    render(
      <TooltipProvider delayDuration={50}>
        <span>x</span>
      </TooltipProvider>,
    );
    expect(screen.getByText("x")).toBeInTheDocument();
  });
});
