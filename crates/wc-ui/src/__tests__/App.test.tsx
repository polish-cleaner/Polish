import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

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

const findingsFixture = [
  { path: "C:\\a\\foo", size: 1_048_576, category_id: "dev.npm.cache" },
  { path: "C:\\a\\bar", size: 2_097_152, category_id: "dev.npm.cache" },
  { path: "C:\\b\\baz", size: 524_288, category_id: "windows.temp" },
];

const okExecuteResult = {
  bundle_path: "C:\\Temp\\polish-cleanup-42.pq",
  packed_count: 3,
  locked_files: [],
  needs_user_decision: false,
};

beforeEach(() => {
  invokeMock.mockReset();
  invokeMock.mockImplementation((cmd: string) => {
    if (cmd === "detect_env") return Promise.resolve(envFixture);
    if (cmd === "scan") return Promise.resolve(findingsFixture);
    if (cmd === "execute") return Promise.resolve(okExecuteResult);
    return Promise.reject(new Error(`unknown command: ${cmd}`));
  });
});

describe("App", () => {
  it("renders header", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /Polish/i })).toBeInTheDocument();
  });

  it("loads environment on mount and renders detected tools", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/npm: ✓/)).toBeInTheDocument();
    });
    expect(screen.getByText(/pnpm: ✗/)).toBeInTheDocument();
    expect(screen.getByText(/chrome: ✓/)).toBeInTheDocument();
  });

  it("scan button is enabled before scanning, shows table after click", async () => {
    const user = userEvent.setup();
    render(<App />);
    const button = screen.getByRole("button", { name: /^Scan$/ });
    expect(button).not.toBeDisabled();
    await user.click(button);
    await waitFor(() => {
      expect(screen.getByText("dev.npm.cache")).toBeInTheDocument();
    });
    expect(screen.getByText("windows.temp")).toBeInTheDocument();
    expect(screen.getByText(/Findings:/)).toBeInTheDocument();
  });

  it("Quarantine button only appears after scan returns findings", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.queryByRole("button", { name: /Quarantine all/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Scan$/ }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Quarantine all/ })).toBeInTheDocument();
    });
  });

  it("clicking Quarantine opens confirmation modal; Cancel dismisses without invoking execute", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /^Scan$/ }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Quarantine all/ })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /Quarantine all/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/move/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(invokeMock).not.toHaveBeenCalledWith("execute", expect.anything());
  });

  it("confirming the modal invokes execute(skipLocked=false) and shows the bundle path", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /^Scan$/ }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Quarantine all/ })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /Quarantine all/ }));
    const dialog = screen.getByRole("dialog");
    const confirmBtn = within(dialog).getByRole("button", { name: "Quarantine" });
    await user.click(confirmBtn);
    await waitFor(() => {
      expect(invokeMock).toHaveBeenCalledWith("execute", {
        findings: findingsFixture,
        skipLocked: false,
      });
    });
    expect(
      await screen.findByText(/Quarantined/, {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/polish-cleanup-42/).length).toBeGreaterThan(0);
  });

  it("surfaces an error if scan rejects", async () => {
    invokeMock.mockImplementation((cmd: string) => {
      if (cmd === "detect_env") return Promise.resolve(envFixture);
      return Promise.reject(new Error("scan blew up"));
    });
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /^Scan$/ }));
    await waitFor(() => {
      expect(screen.getByText(/scan blew up/)).toBeInTheDocument();
    });
  });

  it("surfaces backend execute error including the chained source (path + reason)", async () => {
    const chainedErr =
      "bundle pack failed: C:\\Users\\v\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache\\Cache_Data\\f_000123: The process cannot access the file because it is being used by another process. (os error 32)";
    invokeMock.mockImplementation((cmd: string) => {
      if (cmd === "detect_env") return Promise.resolve(envFixture);
      if (cmd === "scan") return Promise.resolve(findingsFixture);
      if (cmd === "execute") return Promise.reject(chainedErr);
      return Promise.reject(new Error(`unknown command: ${cmd}`));
    });
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /^Scan$/ }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Quarantine all/ })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /Quarantine all/ }));
    const dialog = screen.getByRole("dialog");
    const confirmBtn = within(dialog).getByRole("button", { name: "Quarantine" });
    await user.click(confirmBtn);
    expect(
      await screen.findByText(/bundle pack failed/, {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/f_000123/)).toBeInTheDocument();
    expect(screen.getByText(/being used by another process/)).toBeInTheDocument();
  });

  it("shows LockedFilesModal when needs_user_decision; Skip retries with skipLocked=true", async () => {
    let attempt = 0;
    invokeMock.mockImplementation((cmd: string, args?: { skipLocked: boolean }) => {
      if (cmd === "detect_env") return Promise.resolve(envFixture);
      if (cmd === "scan") return Promise.resolve(findingsFixture);
      if (cmd === "execute") {
        attempt += 1;
        if (attempt === 1) {
          return Promise.resolve({
            bundle_path: null,
            packed_count: 0,
            locked_files: ["C:\\Chrome\\Cache\\f_001", "C:\\Chrome\\Cache\\f_002"],
            needs_user_decision: true,
          });
        }
        // Retry packs the readable subset.
        expect(args?.skipLocked).toBe(true);
        return Promise.resolve({
          bundle_path: "C:\\Temp\\polish-cleanup-42.pq",
          packed_count: 1,
          locked_files: ["C:\\Chrome\\Cache\\f_001", "C:\\Chrome\\Cache\\f_002"],
          needs_user_decision: false,
        });
      }
      return Promise.reject(new Error(`unknown command: ${cmd}`));
    });

    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /^Scan$/ }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Quarantine all/ })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /Quarantine all/ }));
    const confirmDialog = screen.getByRole("dialog");
    await user.click(within(confirmDialog).getByRole("button", { name: "Quarantine" }));

    // First invoke returns needs_user_decision=true → LockedFilesModal shows.
    expect(
      await screen.findByRole("heading", { name: /2 files can't be read/ }, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.getByText("C:\\Chrome\\Cache\\f_001")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Skip locked/ }));

    // Second invoke fires with skipLocked=true; success line shows.
    await waitFor(() => {
      expect(invokeMock).toHaveBeenCalledWith("execute", {
        findings: findingsFixture,
        skipLocked: true,
      });
    });
    expect(
      await screen.findByText(/Quarantined/, {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Skipped/)).toBeInTheDocument();
  });

  it("Skip filters out locked findings before retrying", async () => {
    // First findings entry is in the locked_files set; Skip should
    // exclude it from the retry payload (so the backend doesn't
    // re-pre-flight files it already knows are locked).
    const lockedPath = findingsFixture[0].path;
    let secondInvokeArgs:
      | { findings: typeof findingsFixture; skipLocked: boolean }
      | undefined;
    let attempt = 0;
    invokeMock.mockImplementation(
      (cmd: string, args?: { findings: typeof findingsFixture; skipLocked: boolean }) => {
        if (cmd === "detect_env") return Promise.resolve(envFixture);
        if (cmd === "scan") return Promise.resolve(findingsFixture);
        if (cmd === "execute") {
          attempt += 1;
          if (attempt === 1) {
            return Promise.resolve({
              bundle_path: null,
              packed_count: 0,
              locked_files: [lockedPath],
              needs_user_decision: true,
            });
          }
          secondInvokeArgs = args;
          return Promise.resolve({
            bundle_path: "C:\\Temp\\ok.pq",
            packed_count: 2,
            locked_files: [lockedPath],
            needs_user_decision: false,
          });
        }
        return Promise.reject(new Error(`unknown command: ${cmd}`));
      },
    );

    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /^Scan$/ }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Quarantine all/ })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /Quarantine all/ }));
    const confirmDialog = screen.getByRole("dialog");
    await user.click(within(confirmDialog).getByRole("button", { name: "Quarantine" }));

    await screen.findByRole("heading", { name: /1 file can't be read/ }, { timeout: 5000 });
    await user.click(screen.getByRole("button", { name: /Skip locked/ }));

    await waitFor(() => {
      expect(secondInvokeArgs?.skipLocked).toBe(true);
    });
    // Retry payload excludes the path that was locked.
    expect(secondInvokeArgs?.findings.map((f) => f.path)).not.toContain(lockedPath);
    expect(secondInvokeArgs?.findings).toHaveLength(findingsFixture.length - 1);
  });

  it("Skip closes the LockedFilesModal immediately (does not wait for the retry to resolve)", async () => {
    let resolveSecond: (value: unknown) => void = () => {};
    let attempt = 0;
    invokeMock.mockImplementation((cmd: string) => {
      if (cmd === "detect_env") return Promise.resolve(envFixture);
      if (cmd === "scan") return Promise.resolve(findingsFixture);
      if (cmd === "execute") {
        attempt += 1;
        if (attempt === 1) {
          return Promise.resolve({
            bundle_path: null,
            packed_count: 0,
            locked_files: ["C:\\Chrome\\Cache\\f_001"],
            needs_user_decision: true,
          });
        }
        // Hang the second invoke so we can observe the modal close
        // BEFORE the retry resolves.
        return new Promise((resolve) => {
          resolveSecond = resolve;
        });
      }
      return Promise.reject(new Error(`unknown: ${cmd}`));
    });

    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /^Scan$/ }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Quarantine all/ })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /Quarantine all/ }));
    const confirmDialog = screen.getByRole("dialog");
    await user.click(within(confirmDialog).getByRole("button", { name: "Quarantine" }));
    await screen.findByRole("heading", { name: /1 file can't be read/ }, { timeout: 5000 });

    await user.click(screen.getByRole("button", { name: /Skip locked/ }));

    // Modal should close before the second invoke resolves.
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // Unblock the hanging promise so the test cleans up.
    resolveSecond({
      bundle_path: "ok.pq",
      packed_count: 2,
      locked_files: ["C:\\Chrome\\Cache\\f_001"],
      needs_user_decision: false,
    });
  });

  it("LockedFilesModal Cancel resets execute state and does not retry", async () => {
    invokeMock.mockImplementation((cmd: string) => {
      if (cmd === "detect_env") return Promise.resolve(envFixture);
      if (cmd === "scan") return Promise.resolve(findingsFixture);
      if (cmd === "execute") {
        return Promise.resolve({
          bundle_path: null,
          packed_count: 0,
          locked_files: ["C:\\locked"],
          needs_user_decision: true,
        });
      }
      return Promise.reject(new Error(`unknown command: ${cmd}`));
    });
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /^Scan$/ }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Quarantine all/ })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /Quarantine all/ }));
    const confirmDialog = screen.getByRole("dialog");
    await user.click(within(confirmDialog).getByRole("button", { name: "Quarantine" }));

    await screen.findByRole("heading", { name: /1 file can't be read/ }, { timeout: 5000 });
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // execute was called exactly once.
    const executeCalls = invokeMock.mock.calls.filter((c) => c[0] === "execute");
    expect(executeCalls).toHaveLength(1);
  });
});
