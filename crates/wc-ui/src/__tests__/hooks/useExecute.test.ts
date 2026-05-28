import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useExecute } from "../../hooks/useExecute";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";
const invokeMock = vi.mocked(invoke);

const findingsFixture = [
  { path: "C:\\a\\foo", size: 100, category_id: "dev.npm.cache" },
];

beforeEach(() => {
  invokeMock.mockReset();
});

describe("useExecute", () => {
  it("returns idle state initially", () => {
    const { result } = renderHook(() => useExecute());
    expect(result.current.executing).toBe(false);
    expect(result.current.bundlePath).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("populates bundlePath after runExecute resolves", async () => {
    invokeMock.mockResolvedValue("C:\\Temp\\polish-cleanup-42.pq");
    const { result } = renderHook(() => useExecute());
    await act(async () => {
      await result.current.runExecute(findingsFixture);
    });
    expect(result.current.bundlePath).toBe("C:\\Temp\\polish-cleanup-42.pq");
    expect(result.current.executing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("captures error if execute rejects, leaves bundlePath null", async () => {
    invokeMock.mockRejectedValue(new Error("pack failed"));
    const { result } = renderHook(() => useExecute());
    await act(async () => {
      await result.current.runExecute(findingsFixture);
    });
    expect(result.current.error).toContain("pack failed");
    expect(result.current.bundlePath).toBeNull();
    expect(result.current.executing).toBe(false);
  });

  it("passes findings array through to the command", async () => {
    invokeMock.mockResolvedValue("ok.pq");
    const { result } = renderHook(() => useExecute());
    await act(async () => {
      await result.current.runExecute(findingsFixture);
    });
    expect(invokeMock).toHaveBeenCalledExactlyOnceWith("execute", {
      findings: findingsFixture,
    });
  });
});
