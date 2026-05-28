import { describe, it, expect, vi, beforeEach } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { scan, detectEnv } from "../../lib/commands";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

const invokeMock = vi.mocked(invoke);

beforeEach(() => {
  invokeMock.mockReset();
});

describe("scan", () => {
  it("calls invoke('scan') and returns findings", async () => {
    invokeMock.mockResolvedValue([
      { path: "a", size: 100, category_id: "dev.npm.cache" },
    ]);
    const result = await scan();
    expect(invokeMock).toHaveBeenCalledExactlyOnceWith("scan");
    expect(result).toEqual([
      { path: "a", size: 100, category_id: "dev.npm.cache" },
    ]);
  });

  it("propagates invoke errors", async () => {
    invokeMock.mockRejectedValue(new Error("boom"));
    await expect(scan()).rejects.toThrow("boom");
  });
});

describe("detectEnv", () => {
  it("calls invoke('detect_env') and returns environment", async () => {
    invokeMock.mockResolvedValue({
      has_npm: true,
      has_pnpm: false,
      has_cargo: true,
      has_wsl: true,
      has_chrome: true,
      has_edge: false,
      has_firefox: false,
      windows_build: null,
    });
    const env = await detectEnv();
    expect(invokeMock).toHaveBeenCalledExactlyOnceWith("detect_env");
    expect(env.has_npm).toBe(true);
    expect(env.has_pnpm).toBe(false);
  });
});
