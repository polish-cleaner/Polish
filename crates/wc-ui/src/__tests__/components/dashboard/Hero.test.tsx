import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Hero from "../../../components/dashboard/Hero";
import type { Environment } from "../../../types/environment";

const ENV: Environment = {
  has_npm: true,
  has_pnpm: true,
  has_cargo: false,
  has_wsl: false,
  has_chrome: true,
  has_edge: false,
  has_firefox: false,
  windows_build: 26200,
};

describe("Hero", () => {
  it("renders the editorial wordmark", () => {
    render(<Hero env={ENV} totalBytes={1024 ** 3 * 8} categoryCount={4} />);
    expect(screen.getByText(/You can reclaim/)).toBeInTheDocument();
    expect(screen.getByText(/across 4 categories/)).toBeInTheDocument();
  });

  it("singular noun for category count of 1", () => {
    render(<Hero env={ENV} totalBytes={1024 ** 3} categoryCount={1} />);
    expect(screen.getByText(/across 1 category/)).toBeInTheDocument();
  });

  it("displays 'Detecting' summary when env is null", () => {
    render(<Hero env={null} totalBytes={0} categoryCount={0} />);
    expect(screen.getByText(/Detecting your environment/)).toBeInTheDocument();
  });

  it("displays detection count when env is supplied", () => {
    render(<Hero env={ENV} totalBytes={0} categoryCount={0} />);
    expect(screen.getByText(/3 of 7 tools detected/)).toBeInTheDocument();
    expect(screen.getByText(/build 26200/)).toBeInTheDocument();
  });
});
