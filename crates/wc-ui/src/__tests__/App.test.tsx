import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { useRoute } from "../hooks/useRoute";
import { useToastStack } from "../hooks/useToastStack";
import { makeQueryWrapper } from "./test-utils/withQuery";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";
const invokeMock = vi.mocked(invoke);

const envFixture = {
  has_npm: false,
  has_pnpm: false,
  has_cargo: false,
  has_wsl: false,
  has_chrome: false,
  has_edge: false,
  has_firefox: false,
  windows_build: null,
};

beforeEach(() => {
  invokeMock.mockReset();
  invokeMock.mockImplementation((cmd: string) => {
    if (cmd === "detect_env") return Promise.resolve(envFixture);
    return Promise.reject(new Error(`unknown command: ${cmd}`));
  });
  useRoute.setState({ route: "dashboard" });
  useToastStack.setState({ toasts: [] });
});

function renderApp() {
  const { Wrapper } = makeQueryWrapper();
  return render(<App />, { wrapper: Wrapper });
}

describe("App shell", () => {
  it("renders the sidebar wordmark", () => {
    renderApp();
    expect(screen.getByText("Polish")).toBeInTheDocument();
  });

  it("renders the global toast region", () => {
    renderApp();
    expect(screen.getByRole("region", { name: /notifications/i })).toBeInTheDocument();
  });

  it("defaults to the Dashboard route on mount (Dashboard page is shown)", async () => {
    renderApp();
    await waitFor(() => {
      // Dashboard hero IS the page h1 (prototype-matched).
      expect(
        screen.getByRole("heading", { level: 1, name: /You can reclaim/ }),
      ).toBeInTheDocument();
    });
  });

  it("clicking a sidebar entry swaps the page chrome", async () => {
    const user = userEvent.setup();
    renderApp();
    const nav = screen.getByRole("navigation", { name: /sections/i });
    await user.click(within(nav).getByRole("button", { name: /History/ }));
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: /History/ })).toBeInTheDocument();
    });
    expect(useRoute.getState().route).toBe("history");
  });

  it("clicking the About button surfaces a toast in the global stack", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: /^About$/ }));
    expect(await screen.findByText(/About Polish/)).toBeInTheDocument();
    expect(useToastStack.getState().toasts).toHaveLength(1);
  });

  it("Format Prep route renders the placeholder page", async () => {
    const user = userEvent.setup();
    renderApp();
    const nav = screen.getByRole("navigation", { name: /sections/i });
    await user.click(within(nav).getByRole("button", { name: /Prepare for format/ }));
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: /Prepare for format/ }),
      ).toBeInTheDocument();
    });
  });
});
