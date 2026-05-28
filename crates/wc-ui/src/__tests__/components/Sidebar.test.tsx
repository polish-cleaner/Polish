import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sidebar from "../../components/Sidebar";
import { useRoute } from "../../hooks/useRoute";
import { useToastStack } from "../../hooks/useToastStack";

beforeEach(() => {
  useRoute.setState({ route: "dashboard" });
  useToastStack.setState({ toasts: [] });
});

describe("Sidebar", () => {
  it("renders the Polish wordmark", () => {
    render(<Sidebar />);
    expect(screen.getByText("Polish")).toBeInTheDocument();
  });

  it("renders all 6 route entries in the nav", () => {
    render(<Sidebar />);
    const nav = screen.getByRole("navigation", { name: /sections/i });
    expect(within(nav).getByRole("button", { name: /Dashboard/ })).toBeInTheDocument();
    expect(within(nav).getByRole("button", { name: /^Clean/ })).toBeInTheDocument();
    expect(within(nav).getByRole("button", { name: /Quarantine/ })).toBeInTheDocument();
    expect(within(nav).getByRole("button", { name: /History/ })).toBeInTheDocument();
    expect(within(nav).getByRole("button", { name: /Settings/ })).toBeInTheDocument();
    expect(within(nav).getByRole("button", { name: /Prepare for format/ })).toBeInTheDocument();
  });

  it("highlights Dashboard by default (aria-current=page)", () => {
    render(<Sidebar />);
    const dashBtn = screen.getByRole("button", { name: /Dashboard/ });
    expect(dashBtn).toHaveAttribute("aria-current", "page");
  });

  it("clicking a nav item updates the route store and the active highlight", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);
    const cleanBtn = screen.getByRole("button", { name: /^Clean/ });
    await user.click(cleanBtn);
    expect(useRoute.getState().route).toBe("clean");
    expect(cleanBtn).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /Dashboard/ })).not.toHaveAttribute("aria-current");
  });

  it("renders the Pro badge on the Format Prep entry", () => {
    render(<Sidebar />);
    const formatBtn = screen.getByRole("button", { name: /Prepare for format/ });
    expect(within(formatBtn).getByText("Pro")).toBeInTheDocument();
  });

  it("Dashboard / Clean / Quarantine etc. do NOT carry a Pro badge", () => {
    render(<Sidebar />);
    const dashBtn = screen.getByRole("button", { name: /Dashboard/ });
    expect(within(dashBtn).queryByText("Pro")).not.toBeInTheDocument();
    const cleanBtn = screen.getByRole("button", { name: /^Clean/ });
    expect(within(cleanBtn).queryByText("Pro")).not.toBeInTheDocument();
  });

  it("clicking About pushes a versioned toast onto the stack", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);
    await user.click(screen.getByRole("button", { name: /^About$/ }));
    const stack = useToastStack.getState().toasts;
    expect(stack).toHaveLength(1);
    expect(stack[0].title).toBe("About Polish");
    expect(stack[0].body).toMatch(/v0\.1\.0/);
  });
});
