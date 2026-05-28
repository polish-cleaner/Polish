import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuickActionsRow from "../../../components/dashboard/QuickActionsRow";

describe("QuickActionsRow", () => {
  it("renders three chip buttons", () => {
    render(
      <QuickActionsRow
        onVerify={() => {}}
        onRestore={() => {}}
        onSettings={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: /Verify a bundle/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Restore a bundle/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Settings/ })).toBeInTheDocument();
  });

  it("each chip fires its callback once", async () => {
    const onVerify = vi.fn();
    const onRestore = vi.fn();
    const onSettings = vi.fn();
    const user = userEvent.setup();
    render(
      <QuickActionsRow
        onVerify={onVerify}
        onRestore={onRestore}
        onSettings={onSettings}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Verify a bundle/ }));
    await user.click(screen.getByRole("button", { name: /Restore a bundle/ }));
    await user.click(screen.getByRole("button", { name: /^Settings$/ }));
    expect(onVerify).toHaveBeenCalledTimes(1);
    expect(onRestore).toHaveBeenCalledTimes(1);
    expect(onSettings).toHaveBeenCalledTimes(1);
  });
});
