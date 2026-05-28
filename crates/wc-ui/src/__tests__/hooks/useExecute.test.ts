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
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("populates the result on success", async () => {
    invokeMock.mockResolvedValue({
      bundle_path: "C:\\Temp\\polish-cleanup-42.pq",
      packed_count: 1,
      locked_files: [],
      needs_user_decision: false,
    });
    const { result } = renderHook(() => useExecute());
    await act(async () => {
      await result.current.runExecute(findingsFixture, false);
    });
    expect(result.current.result?.bundle_path).toBe("C:\\Temp\\polish-cleanup-42.pq");
    expect(result.current.result?.packed_count).toBe(1);
    expect(result.current.result?.needs_user_decision).toBe(false);
    expect(result.current.executing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("captures error if execute rejects, leaves result null", async () => {
    invokeMock.mockRejectedValue(new Error("pack failed"));
    const { result } = renderHook(() => useExecute());
    await act(async () => {
      await result.current.runExecute(findingsFixture, false);
    });
    expect(result.current.error).toContain("pack failed");
    expect(result.current.result).toBeNull();
    expect(result.current.executing).toBe(false);
  });

  it("passes findings + skipLocked through to the command", async () => {
    invokeMock.mockResolvedValue({
      bundle_path: "ok.pq",
      packed_count: 0,
      locked_files: [],
      needs_user_decision: false,
    });
    const { result } = renderHook(() => useExecute());
    await act(async () => {
      await result.current.runExecute(findingsFixture, true);
    });
    expect(invokeMock).toHaveBeenCalledExactlyOnceWith("execute", {
      findings: findingsFixture,
      skipLocked: true,
    });
  });

  it("captures needs_user_decision outcomes (no bundle, locked files listed)", async () => {
    invokeMock.mockResolvedValue({
      bundle_path: null,
      packed_count: 0,
      locked_files: ["C:\\locked\\f1", "C:\\locked\\f2"],
      needs_user_decision: true,
    });
    const { result } = renderHook(() => useExecute());
    await act(async () => {
      await result.current.runExecute(findingsFixture, false);
    });
    expect(result.current.result?.needs_user_decision).toBe(true);
    expect(result.current.result?.locked_files).toHaveLength(2);
    expect(result.current.result?.bundle_path).toBeNull();
  });

  it("reset() clears result and error", async () => {
    invokeMock.mockResolvedValue({
      bundle_path: null,
      packed_count: 0,
      locked_files: ["x"],
      needs_user_decision: true,
    });
    const { result } = renderHook(() => useExecute());
    await act(async () => {
      await result.current.runExecute(findingsFixture, false);
    });
    expect(result.current.result).not.toBeNull();
    act(() => {
      result.current.reset();
    });
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
