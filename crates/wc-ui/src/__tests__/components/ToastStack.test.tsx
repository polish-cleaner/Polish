import { describe, it, expect, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ToastStack from "../../components/ToastStack";
import { useToastStack } from "../../hooks/useToastStack";

beforeEach(() => {
  useToastStack.setState({ toasts: [] });
});

describe("ToastStack", () => {
  it("renders nothing when the store is empty", () => {
    render(<ToastStack />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders one Toast per stored item", () => {
    render(<ToastStack />);
    act(() => {
      useToastStack.getState().push({ title: "A" });
      useToastStack.getState().push({ title: "B" });
    });
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("clicking the dismiss control removes that toast from the store", async () => {
    const user = userEvent.setup();
    render(<ToastStack />);
    act(() => {
      useToastStack.getState().push({ title: "dismiss-me" });
    });
    expect(useToastStack.getState().toasts).toHaveLength(1);
    const dismiss = screen.getByRole("button", { name: /dismiss/i });
    await user.click(dismiss);
    expect(useToastStack.getState().toasts).toHaveLength(0);
  });

  it("exposes a labelled region for screen-readers", () => {
    render(<ToastStack />);
    expect(screen.getByRole("region", { name: /notifications/i })).toBeInTheDocument();
  });
});
