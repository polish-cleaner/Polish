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

beforeEach(() => {
  invokeMock.mockReset();
  invokeMock.mockImplementation((cmd: string) => {
    if (cmd === "detect_env") return Promise.resolve(envFixture);
    if (cmd === "scan") return Promise.resolve(findingsFixture);
    if (cmd === "execute") return Promise.resolve("C:\\Temp\\polish-cleanup-42.pq");
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

  it("confirming the modal invokes execute and shows the bundle path", async () => {
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
      expect(invokeMock).toHaveBeenCalledWith("execute", { findings: findingsFixture });
    });
    expect(
      await screen.findByText(/Quarantined to/, {}, { timeout: 5000 }),
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
});
