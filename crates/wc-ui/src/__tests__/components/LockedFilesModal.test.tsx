import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LockedFilesModal from "../../components/LockedFilesModal";

describe("LockedFilesModal", () => {
  it("renders nothing when open is false", () => {
    render(
      <LockedFilesModal
        open={false}
        lockedFiles={["x"]}
        totalFindings={10}
        onSkip={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders count and remaining when open", () => {
    render(
      <LockedFilesModal
        open
        lockedFiles={["a", "b", "c"]}
        totalFindings={10}
        onSkip={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /3 files can't be read/ })).toBeInTheDocument();
    expect(screen.getByText(/remaining 7 files/)).toBeInTheDocument();
  });

  it("shows up to 5 preview entries inline", () => {
    const many = Array.from({ length: 10 }, (_, i) => `C:\\f${i}`);
    render(
      <LockedFilesModal
        open
        lockedFiles={many}
        totalFindings={20}
        onSkip={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByText("C:\\f0")).toBeInTheDocument();
    expect(screen.getByText("C:\\f4")).toBeInTheDocument();
    expect(screen.queryByText("C:\\f5")).not.toBeInTheDocument();
    expect(screen.getByText(/and 5 more/)).toBeInTheDocument();
  });

  it("calls onSkip when Skip clicked, onCancel when Cancel clicked", async () => {
    const user = userEvent.setup();
    const onSkip = vi.fn();
    const onCancel = vi.fn();
    render(
      <LockedFilesModal
        open
        lockedFiles={["x"]}
        totalFindings={5}
        onSkip={onSkip}
        onCancel={onCancel}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Skip locked/ }));
    expect(onSkip).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("uses singular file phrasing for one locked file", () => {
    render(
      <LockedFilesModal
        open
        lockedFiles={["solo"]}
        totalFindings={2}
        onSkip={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByRole("heading", { name: /1 file can't be read/ })).toBeInTheDocument();
  });
});
