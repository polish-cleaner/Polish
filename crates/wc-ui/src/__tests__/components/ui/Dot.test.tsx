import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Dot from "../../../components/ui/Dot";

describe("Dot", () => {
  it("renders a span with default good variant", () => {
    const { container } = render(<Dot />);
    const dot = container.querySelector("span");
    expect(dot).toBeTruthy();
    expect(dot!.className).toMatch(/bg-status-good/);
  });

  it("applies base variant", () => {
    const { container } = render(<Dot variant="base" />);
    expect(container.querySelector("span")!.className).toMatch(/bg-ink-faint/);
  });

  it("applies warn variant", () => {
    const { container } = render(<Dot variant="warn" />);
    expect(container.querySelector("span")!.className).toMatch(/bg-status-warn/);
  });

  it("applies danger variant", () => {
    const { container } = render(<Dot variant="danger" />);
    expect(container.querySelector("span")!.className).toMatch(
      /bg-status-danger/,
    );
  });

  it("renders a motion.span when pulsing=true", () => {
    const { container } = render(<Dot pulsing data-testid="d" />);
    const el = container.querySelector("[data-testid='d']");
    expect(el).toBeTruthy();
    // Should still carry the dot classes
    expect((el as HTMLElement).className).toMatch(/bg-status-good/);
  });

  it("merges custom className", () => {
    const { container } = render(<Dot className="my-pulse" />);
    expect(container.querySelector("span")!.className).toMatch(/my-pulse/);
  });
});
