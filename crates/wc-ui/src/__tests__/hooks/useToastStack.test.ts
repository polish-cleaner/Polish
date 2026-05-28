import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useToastStack } from "../../hooks/useToastStack";

beforeEach(() => {
  vi.useFakeTimers();
  useToastStack.setState({ toasts: [] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useToastStack", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useToastStack());
    expect(result.current.toasts).toEqual([]);
  });

  it("push appends a toast with a stable id and returns the id", () => {
    const { result } = renderHook(() => useToastStack());
    let id = "";
    act(() => {
      id = result.current.push({ title: "Hello", variant: "good" });
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].id).toBe(id);
    expect(result.current.toasts[0].title).toBe("Hello");
    expect(result.current.toasts[0].variant).toBe("good");
  });

  it("multiple pushes stack in insertion order", () => {
    const { result } = renderHook(() => useToastStack());
    act(() => {
      result.current.push({ title: "first" });
      result.current.push({ title: "second" });
      result.current.push({ title: "third" });
    });
    expect(result.current.toasts.map((t) => t.title)).toEqual([
      "first",
      "second",
      "third",
    ]);
  });

  it("dismiss removes the toast with the given id", () => {
    const { result } = renderHook(() => useToastStack());
    let id = "";
    act(() => {
      id = result.current.push({ title: "x" });
      result.current.push({ title: "y" });
    });
    act(() => result.current.dismiss(id));
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe("y");
  });

  it("auto-dismisses a toast after 5000ms", () => {
    const { result } = renderHook(() => useToastStack());
    act(() => {
      result.current.push({ title: "ephemeral" });
    });
    expect(result.current.toasts).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("manual dismiss cancels the pending auto-dismiss (no double removal)", () => {
    const { result } = renderHook(() => useToastStack());
    let id = "";
    act(() => {
      id = result.current.push({ title: "to dismiss" });
    });
    act(() => result.current.dismiss(id));
    expect(result.current.toasts).toHaveLength(0);
    // Advancing past the auto-dismiss interval must not throw / blow state.
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("dismissing an unknown id is a safe no-op", () => {
    const { result } = renderHook(() => useToastStack());
    act(() => {
      result.current.push({ title: "kept" });
    });
    act(() => result.current.dismiss("nope"));
    expect(result.current.toasts).toHaveLength(1);
  });
});
