import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TooltipProvider from "../../../components/ui/TooltipProvider";
import Tooltip from "../../../components/ui/Tooltip";

describe("Tooltip", () => {
  it("renders the trigger child by default", () => {
    render(
      <TooltipProvider>
        <Tooltip content="hi">
          <button>trigger</button>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByRole("button", { name: "trigger" })).toBeInTheDocument();
  });

  it("shows content when open=true (controlled)", () => {
    render(
      <TooltipProvider>
        <Tooltip content="ToolTip body" open>
          <button>trigger</button>
        </Tooltip>
      </TooltipProvider>,
    );
    // Radix may render multiple copies (visual + a11y); at least one should exist.
    expect(screen.getAllByText("ToolTip body").length).toBeGreaterThan(0);
  });

  it("does not show content when open=false", () => {
    render(
      <TooltipProvider>
        <Tooltip content="ToolTip body" open={false}>
          <button>trigger</button>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.queryByText("ToolTip body")).not.toBeInTheDocument();
  });

  it("supports a custom side prop without throwing", () => {
    render(
      <TooltipProvider>
        <Tooltip content="x" side="right" open>
          <button>trigger</button>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
