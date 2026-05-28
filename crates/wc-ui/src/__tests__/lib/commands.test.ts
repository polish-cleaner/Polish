import { describe, it, expect, vi, beforeEach } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { scan, detectEnv, execute, restore, verify } from "../../lib/commands";

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

describe("execute", () => {
  it("calls invoke('execute', { findings, skipLocked }) and returns the outcome", async () => {
    const outcome = {
      bundle_path: "C:\\Temp\\polish-cleanup-123.pq",
      packed_count: 1,
      locked_files: [],
      needs_user_decision: false,
    };
    invokeMock.mockResolvedValue(outcome);
    const findings = [
      { path: "a", size: 100, category_id: "dev.npm.cache" },
    ];
    const result = await execute(findings, false);
    expect(invokeMock).toHaveBeenCalledExactlyOnceWith("execute", {
      findings,
      skipLocked: false,
    });
    expect(result).toEqual(outcome);
  });

  it("forwards skipLocked=true on retry", async () => {
    invokeMock.mockResolvedValue({
      bundle_path: "ok.pq",
      packed_count: 0,
      locked_files: [],
      needs_user_decision: false,
    });
    await execute([], true);
    expect(invokeMock).toHaveBeenCalledExactlyOnceWith("execute", {
      findings: [],
      skipLocked: true,
    });
  });

  it("propagates errors as rejected promises", async () => {
    invokeMock.mockRejectedValue(new Error("disk full"));
    await expect(execute([], false)).rejects.toThrow("disk full");
  });
});

describe("restore", () => {
  it("calls invoke('restore', { bundle, destRoot })", async () => {
    invokeMock.mockResolvedValue(undefined);
    await restore("C:\\bundle.pq", "C:\\restored");
    expect(invokeMock).toHaveBeenCalledExactlyOnceWith("restore", {
      bundle: "C:\\bundle.pq",
      destRoot: "C:\\restored",
    });
  });
});

describe("verify", () => {
  it("calls invoke('verify', { bundle })", async () => {
    invokeMock.mockResolvedValue(undefined);
    await verify("C:\\bundle.pq");
    expect(invokeMock).toHaveBeenCalledExactlyOnceWith("verify", {
      bundle: "C:\\bundle.pq",
    });
  });
});
