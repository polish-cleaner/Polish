import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useEnvironment } from "../../hooks/useEnvironment";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";
const invokeMock = vi.mocked(invoke);

const envFixture = {
  has_npm: true,
  has_pnpm: false,
  has_cargo: true,
  has_wsl: false,
  has_chrome: true,
  has_edge: false,
  has_firefox: false,
  windows_build: null,
};

beforeEach(() => {
  invokeMock.mockReset();
});

describe("useEnvironment", () => {
  it("returns null env initially", () => {
    invokeMock.mockResolvedValue(envFixture);
    const { result } = renderHook(() => useEnvironment());
    expect(result.current.env).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("populates env after detect_env resolves", async () => {
    invokeMock.mockResolvedValue(envFixture);
    const { result } = renderHook(() => useEnvironment());
    await waitFor(() => {
      expect(result.current.env).not.toBeNull();
    });
    expect(result.current.env?.has_npm).toBe(true);
    expect(result.current.env?.has_pnpm).toBe(false);
    expect(invokeMock).toHaveBeenCalledExactlyOnceWith("detect_env");
  });

  it("captures error if detect_env rejects", async () => {
    invokeMock.mockRejectedValue(new Error("detect failed"));
    const { result } = renderHook(() => useEnvironment());
    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(result.current.error).toContain("detect failed");
    expect(result.current.env).toBeNull();
  });
});
