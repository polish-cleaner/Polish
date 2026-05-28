import { forwardRef } from "react";
import * as RadixSwitch from "@radix-ui/react-switch";
import { motion } from "framer-motion";
import { cn } from "./cn";
import { DURATION_BASE, DURATION_FAST, EASE_SPRING } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import type { ToggleProps } from "../../types/toggle";

const ROOT_CLASS = [
  "relative inline-flex h-[18px] w-[30px] shrink-0 cursor-pointer items-center rounded-pill",
  "bg-line-strong data-[state=checked]:bg-accent",
  "transition-colors duration-[var(--t-fast)] ease-[var(--ease-out)]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  "disabled:opacity-40 disabled:pointer-events-none",
].join(" ");

const THUMB_CLASS =
  "absolute top-[2px] left-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.15)]";

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { className, checked, ...rest },
  ref,
) {
  const reduced = usePrefersReducedMotion();
  return (
    <RadixSwitch.Root
      ref={ref}
      checked={checked}
      className={cn(ROOT_CLASS, className)}
      {...rest}
    >
      <RadixSwitch.Thumb asChild>
        <motion.span
          className={THUMB_CLASS}
          animate={{ x: checked ? 12 : 0 }}
          transition={{
            duration: reduced ? DURATION_FAST : DURATION_BASE,
            ease: EASE_SPRING,
          }}
        />
      </RadixSwitch.Thumb>
    </RadixSwitch.Root>
  );
});

export default Toggle;
