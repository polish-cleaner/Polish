import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "../../pages/Dashboard";
import { useRoute } from "../../hooks/useRoute";
import { makeQueryWrapper } from "../test-utils/withQuery";

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
  windows_build: 26200,
};

beforeEach(() => {
  invokeMock.mockReset();
  invokeMock.mockImplementation((cmd: string) => {
    if (cmd === "detect_env") return Promise.resolve(envFixture);
    if (cmd === "scan") return Promise.resolve([]);
    return Promise.reject(new Error(`unknown command: ${cmd}`));
  });
  useRoute.setState({ route: "dashboard" });
});

function renderDashboard() {
  const { Wrapper } = makeQueryWrapper();
  return render(<Dashboard />, { wrapper: Wrapper });
}

describe("Dashboard", () => {
  it("renders the editorial hero headline as the page h1", async () => {
    renderDashboard();
    // The hero IS the page title — matches the prototype's
    // "You can reclaim <em>X GB</em> across N categories." treatment.
    expect(
      screen.getByRole("heading", { level: 1, name: /You can reclaim/ }),
    ).toBeInTheDocument();
    // Small section-label strip above the headline.
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("defaults to Live mode and shows the run-scan empty state", async () => {
    renderDashboard();
    expect(
      await screen.findByRole("button", { name: /Run scan/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/No live scan yet/)).toBeInTheDocument();
  });

  it("switching to Preview mode renders fixture-driven widgets", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await user.click(screen.getByRole("tab", { name: /Preview design/ }));
    expect(
      await screen.findByText(/Recoverable now/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Where the space lives/i)).toBeInTheDocument();
    expect(screen.getByText(/Recovery trend/i)).toBeInTheDocument();
    expect(screen.getByText(/Scanner coverage/i)).toBeInTheDocument();
  });

  it("clicking Run scan in Live mode fires the scan command", async () => {
    const user = userEvent.setup();
    renderDashboard();
    const btn = await screen.findByRole("button", { name: /Run scan/ });
    await user.click(btn);
    await waitFor(() => {
      expect(invokeMock).toHaveBeenCalledWith("scan");
    });
  });

  it("Open Clean wizard from RecoverableCard routes to 'clean'", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await user.click(screen.getByRole("tab", { name: /Preview design/ }));
    const wizardBtn = await screen.findByRole("button", {
      name: /Open Clean wizard/,
    });
    await user.click(wizardBtn);
    expect(useRoute.getState().route).toBe("clean");
  });

  it("QuickActionsRow Settings chip routes to 'settings'", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await user.click(screen.getByRole("tab", { name: /Preview design/ }));
    const settingsBtn = await screen.findByRole("button", {
      name: /^Settings$/,
    });
    await user.click(settingsBtn);
    expect(useRoute.getState().route).toBe("settings");
  });
});
