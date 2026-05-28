import { forwardRef } from "react";
import * as RadixProgress from "@radix-ui/react-progress";
import { motion } from "framer-motion";
import { cn } from "./cn";
import { DURATION_BASE, EASE_OUT } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import type { ProgressProps } from "../../types/progress";

const INDETERMINATE_DURATION_S = 1.6;
const TRACK_CLASS =
  "relative h-[4px] w-full overflow-hidden rounded-pill bg-surface-sunken";
const BAR_CLASS = "h-full rounded-pill bg-accent";

const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, indeterminate, ariaLabel, className, ...rest },
  ref,
) {
  const reduced = usePrefersReducedMotion();

  if (indeterminate) {
    return (
      <RadixProgress.Root
        ref={ref}
        aria-label={ariaLabel}
        className={cn(TRACK_CLASS, className)}
        {...rest}
      >
        <motion.div
          className={cn(BAR_CLASS, "absolute top-0 left-0 w-[30%]")}
          initial={{ x: "-100%" }}
          animate={{ x: ["-100%", "400%"] }}
          transition={{
            duration: reduced ? DURATION_BASE : INDETERMINATE_DURATION_S,
            ease: EASE_OUT,
            repeat: Infinity,
          }}
        />
      </RadixProgress.Root>
    );
  }

  const pct = Math.max(0, Math.min(100, value ?? 0));
  return (
    <RadixProgress.Root
      ref={ref}
      value={pct}
      aria-label={ariaLabel}
      className={cn(TRACK_CLASS, className)}
      {...rest}
    >
      <RadixProgress.Indicator
        className={BAR_CLASS}
        style={{ width: `${pct}%`, transition: `width ${DURATION_BASE}s` }}
      />
    </RadixProgress.Root>
  );
});

export default Progress;
