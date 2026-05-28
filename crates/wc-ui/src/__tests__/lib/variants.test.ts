import { describe, it, expect } from "vitest";
import {
  buttonVariants,
  cardVariants,
  badgeVariants,
  dotVariants,
} from "../../lib/variants";

describe("buttonVariants", () => {
  it("returns default primary classes when no args given", () => {
    const cls = buttonVariants();
    expect(cls).toContain("bg-accent");
    expect(cls).toContain("text-white");
  });

  it("returns secondary variant classes", () => {
    const cls = buttonVariants({ variant: "secondary" });
    expect(cls).toContain("bg-surface");
    expect(cls).toContain("border-line-strong");
  });

  it("returns ghost variant classes", () => {
    const cls = buttonVariants({ variant: "ghost" });
    expect(cls).toContain("text-ink-soft");
  });

  it("returns danger variant classes", () => {
    const cls = buttonVariants({ variant: "danger" });
    expect(cls).toContain("bg-status-danger");
  });

  it("sizes apply distinct padding", () => {
    expect(buttonVariants({ size: "sm" })).toContain("text-[12px]");
    expect(buttonVariants({ size: "lg" })).toContain("text-[14px]");
  });
});

describe("cardVariants", () => {
  it("default uses bg-surface", () => {
    expect(cardVariants()).toContain("bg-surface");
  });
  it("sunken uses bg-surface-warm", () => {
    expect(cardVariants({ variant: "sunken" })).toContain("bg-surface-warm");
  });
});

describe("badgeVariants", () => {
  it("default produces base badge classes", () => {
    const cls = badgeVariants();
    expect(cls).toContain("bg-surface");
    expect(cls).toContain("text-ink-soft");
  });
  it("accent + warn + danger + pro emit their tokens", () => {
    expect(badgeVariants({ variant: "accent" })).toContain("bg-accent-soft");
    expect(badgeVariants({ variant: "warn" })).toContain("bg-status-warn-soft");
    expect(badgeVariants({ variant: "danger" })).toContain(
      "bg-status-danger-soft",
    );
    expect(badgeVariants({ variant: "pro" })).toContain("font-mono");
  });
});

describe("dotVariants", () => {
  it("good is default", () => {
    expect(dotVariants()).toContain("bg-status-good");
  });
  it("each variant maps to its colour", () => {
    expect(dotVariants({ variant: "base" })).toContain("bg-ink-faint");
    expect(dotVariants({ variant: "warn" })).toContain("bg-status-warn");
    expect(dotVariants({ variant: "danger" })).toContain("bg-status-danger");
  });
});
