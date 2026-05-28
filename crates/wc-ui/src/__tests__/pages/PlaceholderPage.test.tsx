import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PlaceholderPage from "../../pages/PlaceholderPage";
import { ROUTE_META } from "../../lib/routes";
import { PLACEHOLDER_SUBTITLES } from "../../types/placeholder-page";
import type { RouteId } from "../../types/route";

const NON_DASHBOARD: RouteId[] = ["clean", "quarantine", "history", "settings", "format-prep"];

describe("PlaceholderPage", () => {
  for (const id of NON_DASHBOARD) {
    it(`renders the page title for ${id}`, () => {
      render(<PlaceholderPage routeId={id} />);
      expect(
        screen.getByRole("heading", { level: 1, name: new RegExp(ROUTE_META[id].label, "i") }),
      ).toBeInTheDocument();
    });

    it(`renders the per-route hint for ${id}`, () => {
      render(<PlaceholderPage routeId={id} />);
      expect(screen.getByText(PLACEHOLDER_SUBTITLES[id])).toBeInTheDocument();
    });
  }

  it("renders a 'Coming soon' heading inside the card", () => {
    render(<PlaceholderPage routeId="history" />);
    expect(
      screen.getByRole("heading", { level: 2, name: /Coming soon/ }),
    ).toBeInTheDocument();
  });
});
