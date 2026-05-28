import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "./cn";
import { dotVariants } from "../../lib/variants";
import { DURATION_FAST, EASE_OUT } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import type { DotProps } from "../../types/dot";

const PULSE_DURATION_S = 2.4;
const PULSE_KEYFRAMES = ["0 0 0 0px rgba(0,0,0,0.0)", "0 0 0 5px rgba(0,0,0,0.0)"];

const Dot = forwardRef<HTMLSpanElement, DotProps>(function Dot(
  { variant, pulsing = false, className, ...rest },
  ref,
) {
  const reduced = usePrefersReducedMotion();
  const classes = cn(dotVariants({ variant }), className);

  if (!pulsing) {
    return <span ref={ref} className={classes} {...rest} />;
  }

  // Framer-driven pulse (no CSS keyframe, per Rule 7). Reduced motion → static.
  // Note: we do NOT spread `...rest` onto motion.span because Framer's
  // drag/onDrag prop types collide with React's native DragEventHandler.
  // Tests pass `data-testid` via the `data-*` attrs in the span path.
  const { ...passThrough } = rest;
  return (
    <motion.span
      ref={ref}
      className={classes}
      animate={
        reduced
          ? undefined
          : { boxShadow: PULSE_KEYFRAMES, opacity: [1, 0.85, 1] }
      }
      transition={{
        duration: reduced ? DURATION_FAST : PULSE_DURATION_S,
        ease: EASE_OUT,
        repeat: reduced ? 0 : Infinity,
      }}
      {...(passThrough as object)}
    />
  );
});

export default Dot;
