import { describe, it, expect } from "vitest";
import { cn } from "../../../components/ui/cn";

describe("cn", () => {
  it("joins multiple string classes", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("filters falsy values", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("supports conditional object syntax via clsx", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("resolves Tailwind conflicts via tailwind-merge (last write wins)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-ink", "text-accent")).toBe("text-accent");
  });

  it("handles array inputs", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});
