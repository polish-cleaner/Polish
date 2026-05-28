import * as RadixTooltip from "@radix-ui/react-tooltip";
import { cn } from "./cn";
import type { TooltipProps } from "../../types/tooltip";

const DEFAULT_DELAY_MS = 300;
const CONTENT_CLASS = [
  "z-[100] rounded-sm bg-ink text-surface",
  "px-2 py-1 text-[11px] leading-[1.4]",
  "pointer-events-none select-none whitespace-nowrap",
  "shadow-[0_2px_8px_rgba(0,0,0,0.12)]",
  "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out",
].join(" ");

export default function Tooltip({
  children,
  content,
  side = "top",
  delayDuration = DEFAULT_DELAY_MS,
  open,
  defaultOpen,
  onOpenChange,
  className,
}: TooltipProps) {
  return (
    <RadixTooltip.Root
      delayDuration={delayDuration}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className={cn(CONTENT_CLASS, className)}
        >
          {content}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
