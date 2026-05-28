import { TooltipProvider as RadixTooltipProvider } from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

const DEFAULT_DELAY_MS = 300;

interface TooltipProviderProps {
  children: ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
}

export default function TooltipProvider({
  children,
  delayDuration = DEFAULT_DELAY_MS,
  skipDelayDuration,
}: TooltipProviderProps) {
  return (
    <RadixTooltipProvider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
    >
      {children}
    </RadixTooltipProvider>
  );
}
