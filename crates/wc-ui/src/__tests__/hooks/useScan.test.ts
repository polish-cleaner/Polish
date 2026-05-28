import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useScan } from "../../hooks/useScan";
import { makeQueryWrapper } from "../test-utils/withQuery";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";
const invokeMock = vi.mocked(invoke);

const findingsFixture = [
  { path: "C:\\a\\foo", size: 100, category_id: "dev.npm.cache" },
  { path: "C:\\a\\bar", size: 200, category_id: "windows.temp" },
];

beforeEach(() => {
  invokeMock.mockReset();
});

describe("useScan", () => {
  it("returns null findings and not-scanning initially", () => {
    const { Wrapper } = makeQueryWrapper();
    const { result } = renderHook(() => useScan(), { wrapper: Wrapper });
    expect(result.current.findings).toBeNull();
    expect(result.current.scanning).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("populates findings after runScan resolves", async () => {
    invokeMock.mockResolvedValue(findingsFixture);
    const { Wrapper } = makeQueryWrapper();
    const { result } = renderHook(() => useScan(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.runScan();
    });
    await waitFor(() => {
      expect(result.current.findings).toEqual(findingsFixture);
    });
    expect(result.current.scanning).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets scanning=true while runScan in flight, false after", async () => {
    let resolveScan: (value: typeof findingsFixture) => void = () => {};
    invokeMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveScan = resolve;
        }),
    );
    const { Wrapper } = makeQueryWrapper();
    const { result } = renderHook(() => useScan(), { wrapper: Wrapper });
    let scanPromise: Promise<void>;
    act(() => {
      scanPromise = result.current.runScan();
    });
    await waitFor(() => {
      expect(result.current.scanning).toBe(true);
    });
    await act(async () => {
      resolveScan(findingsFixture);
      await scanPromise;
    });
    await waitFor(() => {
      expect(result.current.scanning).toBe(false);
    });
  });

  it("captures error if scan rejects", async () => {
    invokeMock.mockRejectedValue(new Error("scan failed"));
    const { Wrapper } = makeQueryWrapper();
    const { result } = renderHook(() => useScan(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.runScan();
    });
    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(result.current.error).toContain("scan failed");
    expect(result.current.findings).toBeNull();
  });
});
