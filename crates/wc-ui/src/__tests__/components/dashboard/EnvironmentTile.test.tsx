import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EnvironmentTile from "../../../components/dashboard/EnvironmentTile";
import type { Environment } from "../../../types/environment";

const ENV: Environment = {
  has_npm: true,
  has_pnpm: false,
  has_cargo: true,
  has_wsl: false,
  has_chrome: true,
  has_edge: false,
  has_firefox: false,
  windows_build: 26200,
};

describe("EnvironmentTile", () => {
  it("renders the section label", () => {
    render(<EnvironmentTile env={ENV} />);
    expect(screen.getByText(/Scanner coverage/i)).toBeInTheDocument();
  });

  it("renders the count of detected tools", () => {
    render(<EnvironmentTile env={ENV} />);
    // 3 detected / 7 total.
    expect(screen.getByText("3 / 7")).toBeInTheDocument();
  });

  it("renders one row per environment flag", () => {
    render(<EnvironmentTile env={ENV} />);
    ["npm", "pnpm", "cargo", "WSL", "Chrome", "Edge", "Firefox"].forEach(
      (label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      },
    );
  });

  it("renders 'missing' for undetected flags", () => {
    render(<EnvironmentTile env={ENV} />);
    // 4 missing flags.
    expect(screen.getAllByText("missing").length).toBe(4);
    expect(screen.getAllByText("detected").length).toBe(3);
  });

  it("renders all 'missing' when env is null", () => {
    render(<EnvironmentTile env={null} />);
    expect(screen.getAllByText("missing").length).toBe(7);
  });
});
