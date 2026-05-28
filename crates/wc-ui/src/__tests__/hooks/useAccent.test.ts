import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAccent } from "../../hooks/useAccent";
import { ACCENT_PALETTES, DEFAULT_ACCENT } from "../../types/accent";

beforeEach(() => {
  // Reset store + root vars to default between tests.
  document.documentElement.style.cssText = "";
  useAccent.setState({ accent: DEFAULT_ACCENT });
});

describe("useAccent", () => {
  it("starts on deep-moss by default", () => {
    const { result } = renderHook(() => useAccent());
    expect(result.current.accent).toBe("deep-moss");
  });

  it("setAccent updates state to the new palette name", () => {
    const { result } = renderHook(() => useAccent());
    act(() => result.current.setAccent("deep-ocean"));
    expect(result.current.accent).toBe("deep-ocean");
  });

  it("setAccent writes 5 accent CSS vars to :root", () => {
    const { result } = renderHook(() => useAccent());
    act(() => result.current.setAccent("burnt-amber"));
    const root = document.documentElement;
    const p = ACCENT_PALETTES["burnt-amber"];
    expect(root.style.getPropertyValue("--accent")).toBe(p.accent);
    expect(root.style.getPropertyValue("--accent-deep")).toBe(p.deep);
    expect(root.style.getPropertyValue("--accent-hover")).toBe(p.hover);
    expect(root.style.getPropertyValue("--accent-soft")).toBe(p.soft);
    expect(root.style.getPropertyValue("--accent-ink")).toBe(p.ink);
  });

  it("switching twice keeps vars consistent with the last call", () => {
    const { result } = renderHook(() => useAccent());
    act(() => result.current.setAccent("muted-plum"));
    act(() => result.current.setAccent("deep-moss"));
    expect(document.documentElement.style.getPropertyValue("--accent")).toBe(
      ACCENT_PALETTES["deep-moss"].accent,
    );
  });
});
