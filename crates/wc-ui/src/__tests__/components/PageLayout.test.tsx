import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PageLayout from "../../components/PageLayout";

describe("PageLayout", () => {
  it("renders the title as an h1", () => {
    render(
      <PageLayout title="Dashboard">
        <div>body</div>
      </PageLayout>,
    );
    expect(screen.getByRole("heading", { level: 1, name: /Dashboard/ })).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("renders the italic accent word when provided", () => {
    render(
      <PageLayout title="Polish your" titleAccent="machine">
        <div>body</div>
      </PageLayout>,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toMatch(/Polish your machine/);
    // The accent word lives inside an <em>.
    const em = heading.querySelector("em");
    expect(em).not.toBeNull();
    expect(em?.textContent).toBe("machine");
  });

  it("renders the subtitle when provided", () => {
    render(
      <PageLayout title="History" subtitle="Recent quarantine bundles">
        <div />
      </PageLayout>,
    );
    expect(screen.getByText(/Recent quarantine bundles/)).toBeInTheDocument();
  });

  it("renders the actions slot when provided", () => {
    render(
      <PageLayout title="Clean" actions={<button>Run</button>}>
        <div />
      </PageLayout>,
    );
    expect(screen.getByRole("button", { name: "Run" })).toBeInTheDocument();
  });

  it("omits the subtitle node entirely when not provided", () => {
    render(
      <PageLayout title="Quarantine">
        <div>contents</div>
      </PageLayout>,
    );
    // Sanity: no paragraph node before the children area.
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.nextElementSibling).toBeNull();
  });
});
