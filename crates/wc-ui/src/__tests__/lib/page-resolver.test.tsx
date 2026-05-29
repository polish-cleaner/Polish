import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { resolvePage } from "../../lib/page-resolver";
import { makeQueryWrapper } from "../test-utils/withQuery";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn().mockResolvedValue({
    has_npm: false,
    has_pnpm: false,
    has_cargo: false,
    has_wsl: false,
    has_chrome: false,
    has_edge: false,
    has_firefox: false,
    windows_build: null,
  }),
}));

describe("resolvePage", () => {
  it("returns Dashboard for the dashboard route", () => {
    const { Wrapper } = makeQueryWrapper();
    const el = resolvePage("dashboard");
    render(el, { wrapper: Wrapper });
    // Dashboard's hero IS the page title — the prototype's
    // "You can reclaim X GB across N categories." headline.
    expect(
      screen.getByRole("heading", { level: 1, name: /You can reclaim/ }),
    ).toBeInTheDocument();
    // Small section-label strip above the editorial headline.
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("returns Home for the clean route (legacy scan UX)", () => {
    const { Wrapper } = makeQueryWrapper();
    const el = resolvePage("clean");
    render(el, { wrapper: Wrapper });
    expect(
      screen.getByRole("heading", { level: 1, name: /Dashboard/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Scan$/ })).toBeInTheDocument();
  });

  it("returns PlaceholderPage for non-dashboard / non-clean routes", () => {
    const { Wrapper } = makeQueryWrapper();
    const el = resolvePage("history");
    render(el, { wrapper: Wrapper });
    expect(
      screen.getByRole("heading", { level: 1, name: /History/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Coming soon/)).toBeInTheDocument();
  });
});
