import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecoverableCard from "../../../components/dashboard/RecoverableCard";
import type { Finding } from "../../../types/finding";

const FINDINGS: Finding[] = [
  { path: "a", size: 1024 ** 3,     category_id: "dev.npm.cache" },
  { path: "b", size: 1024 ** 3 / 2, category_id: "windows.temp" },
];

describe("RecoverableCard", () => {
  it("renders the section label", () => {
    const onOpenClean = vi.fn();
    const onRunLight = vi.fn();
    render(
      <RecoverableCard
        totalBytes={1024 ** 3 * 5}
        findings={FINDINGS}
        onOpenClean={onOpenClean}
        onRunLight={onRunLight}
      />,
    );
    expect(screen.getByText(/Recoverable now/i)).toBeInTheDocument();
  });

  it("renders chips for each category present in findings", () => {
    render(
      <RecoverableCard
        totalBytes={1024 ** 3 * 1.5}
        findings={FINDINGS}
        onOpenClean={() => {}}
        onRunLight={() => {}}
      />,
    );
    expect(screen.getByText(/npm cache/i)).toBeInTheDocument();
  });

  it("primary button invokes the Light cleanup callback", async () => {
    const onRunLight = vi.fn();
    const user = userEvent.setup();
    render(
      <RecoverableCard
        totalBytes={0}
        findings={[]}
        onOpenClean={() => {}}
        onRunLight={onRunLight}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Run Light cleanup/ }));
    expect(onRunLight).toHaveBeenCalledTimes(1);
  });

  it("ghost button invokes the Clean wizard callback", async () => {
    const onOpenClean = vi.fn();
    const user = userEvent.setup();
    render(
      <RecoverableCard
        totalBytes={0}
        findings={[]}
        onOpenClean={onOpenClean}
        onRunLight={() => {}}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Open Clean wizard/ }));
    expect(onOpenClean).toHaveBeenCalledTimes(1);
  });
});
