import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type ChangeHandler = (event: MediaQueryListEvent) => void;

interface MockMQL {
  matches: boolean;
  addEventListener: (type: "change", handler: ChangeHandler) => void;
  removeEventListener: (type: "change", handler: ChangeHandler) => void;
  addListener?: (handler: ChangeHandler) => void;
  removeListener?: (handler: ChangeHandler) => void;
  __fire: (matches: boolean) => void;
}

function makeMQL(initialMatches: boolean): MockMQL {
  let handlers: ChangeHandler[] = [];
  return {
    matches: initialMatches,
    addEventListener: (_type, handler) => {
      handlers.push(handler);
    },
    removeEventListener: (_type, handler) => {
      handlers = handlers.filter((h) => h !== handler);
    },
    __fire(matches: boolean) {
      this.matches = matches;
      const evt = { matches } as MediaQueryListEvent;
      handlers.forEach((h) => h(evt));
    },
  };
}

let currentMQL: MockMQL;

beforeEach(() => {
  currentMQL = makeMQL(false);
  vi.stubGlobal(
    "matchMedia",
    vi.fn((q: string) => {
      expect(q).toBe("(prefers-reduced-motion: reduce)");
      return currentMQL;
    }) as unknown as typeof window.matchMedia,
  );
  // jsdom puts matchMedia on window only — also patch the property.
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (q: string) => {
      expect(q).toBe("(prefers-reduced-motion: reduce)");
      return currentMQL as unknown as MediaQueryList;
    },
  });
});

describe("usePrefersReducedMotion", () => {
  it("returns false when the media query does not match", () => {
    currentMQL = makeMQL(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it("returns true when the media query matches at mount", () => {
    currentMQL = makeMQL(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it("updates when the preference flips via media-query change event", () => {
    currentMQL = makeMQL(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
    act(() => currentMQL.__fire(true));
    expect(result.current).toBe(true);
    act(() => currentMQL.__fire(false));
    expect(result.current).toBe(false);
  });
});
