import type { ReactNode } from "react";

export type TooltipSide = "top" | "right" | "bottom" | "left";

export interface TooltipProps {
  /** Element that triggers the tooltip on hover/focus. */
  children: ReactNode;
  /** Text or rich content shown inside the floating panel. */
  content: ReactNode;
  side?: TooltipSide;
  /** Override the default 300ms delay. */
  delayDuration?: number;
  /** Force-open for tests / always-on UI. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}
