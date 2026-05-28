import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useRoute } from "../../hooks/useRoute";

beforeEach(() => {
  useRoute.setState({ route: "dashboard" });
});

describe("useRoute", () => {
  it("defaults to dashboard", () => {
    const { result } = renderHook(() => useRoute());
    expect(result.current.route).toBe("dashboard");
  });

  it("setRoute updates the current route", () => {
    const { result } = renderHook(() => useRoute());
    act(() => result.current.setRoute("clean"));
    expect(result.current.route).toBe("clean");
  });

  it("setRoute can flip across all known routes in sequence", () => {
    const { result } = renderHook(() => useRoute());
    const targets = ["clean", "quarantine", "history", "settings", "format-prep"] as const;
    for (const target of targets) {
      act(() => result.current.setRoute(target));
      expect(result.current.route).toBe(target);
    }
  });

  it("state is shared across hook instances (single Zustand store)", () => {
    const a = renderHook(() => useRoute());
    const b = renderHook(() => useRoute());
    act(() => a.result.current.setRoute("history"));
    expect(b.result.current.route).toBe("history");
  });
});
