import * as RadixTabs from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { cn } from "./cn";
import { DURATION_BASE, EASE_OUT } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import type { SegmentedProps } from "../../types/segmented";

const ROOT_CLASS =
  "inline-flex gap-[2px] rounded-md border border-line bg-surface-sunken p-[3px]";
const TRIGGER_CLASS = [
  "relative px-3 py-[6px] text-[12px] font-medium leading-none",
  "text-ink-soft hover:text-ink",
  "transition-colors duration-[var(--t-fast)] ease-[var(--ease-out)]",
  "data-[state=active]:text-ink",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
].join(" ");
const ACTIVE_PILL_CLASS =
  "absolute inset-0 rounded-sm bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_0_0_0.5px_var(--line-strong)]";

export default function Segmented<V extends string = string>({
  value,
  onValueChange,
  options,
  "aria-label": ariaLabel,
  className,
}: SegmentedProps<V>) {
  const reduced = usePrefersReducedMotion();
  return (
    <RadixTabs.Root
      value={value}
      onValueChange={(v) => onValueChange(v as V)}
      className={cn(ROOT_CLASS, className)}
    >
      <RadixTabs.List aria-label={ariaLabel} className="flex gap-[2px]">
        {options.map((opt) => (
          <RadixTabs.Trigger key={opt.value} value={opt.value} className={TRIGGER_CLASS}>
            {opt.value === value && (
              <motion.span
                layoutId="segmented-active"
                className={ACTIVE_PILL_CLASS}
                transition={{ duration: reduced ? 0 : DURATION_BASE, ease: EASE_OUT }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
    </RadixTabs.Root>
  );
}
