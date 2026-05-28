import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDensity } from "../../hooks/useDensity";
import { DENSITY_VALUES, DEFAULT_DENSITY } from "../../types/density";

beforeEach(() => {
  document.documentElement.style.cssText = "";
  useDensity.setState({ density: DEFAULT_DENSITY });
});

describe("useDensity", () => {
  it("starts on 'regular' by default", () => {
    const { result } = renderHook(() => useDensity());
    expect(result.current.density).toBe("regular");
  });

  it("setDensity updates state", () => {
    const { result } = renderHook(() => useDensity());
    act(() => result.current.setDensity("compact"));
    expect(result.current.density).toBe("compact");
  });

  it("writes --density CSS var to :root", () => {
    const { result } = renderHook(() => useDensity());
    act(() => result.current.setDensity("comfy"));
    expect(document.documentElement.style.getPropertyValue("--density")).toBe(
      DENSITY_VALUES.comfy.toString(),
    );
  });

  it("switches between all three density values cleanly", () => {
    const { result } = renderHook(() => useDensity());
    act(() => result.current.setDensity("compact"));
    expect(document.documentElement.style.getPropertyValue("--density")).toBe("0.85");
    act(() => result.current.setDensity("regular"));
    expect(document.documentElement.style.getPropertyValue("--density")).toBe("1");
    act(() => result.current.setDensity("comfy"));
    expect(document.documentElement.style.getPropertyValue("--density")).toBe("1.15");
  });
});
