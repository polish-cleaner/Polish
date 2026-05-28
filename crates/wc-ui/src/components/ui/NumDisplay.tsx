import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  animate,
} from "framer-motion";
import { cn } from "./cn";
import { EASE_OUT } from "../../lib/motion";
import type { NumDisplayProps } from "../../types/num-display";

const DEFAULT_DURATION_MS = 1400;
const ROOT_CLASS =
  "font-mono font-medium tracking-[-0.01em] tabular-nums [font-feature-settings:'tnum'_1,'zero'_1]";
const UNIT_CLASS =
  "font-body font-normal text-ink-muted text-[0.65em] ml-[0.2em] tracking-[0.02em]";

export default function NumDisplay({
  value,
  unit,
  animate: shouldAnimate = false,
  durationMs = DEFAULT_DURATION_MS,
  fractionDigits = 1,
  className,
  ...rest
}: NumDisplayProps) {
  const reduced = useReducedMotion();
  const mv = useMotionValue(0);
  const display = useTransform(mv, (n) => n.toFixed(fractionDigits));
  const isNumeric = typeof value === "number" && shouldAnimate;

  useEffect(() => {
    if (!isNumeric) return;
    if (reduced) {
      mv.set(value as number);
      return;
    }
    const controls = animate(mv, value as number, {
      duration: durationMs / 1000,
      ease: EASE_OUT,
    });
    return () => controls.stop();
  }, [isNumeric, value, durationMs, reduced, mv]);

  if (isNumeric) {
    return (
      <span className={cn(ROOT_CLASS, className)} {...rest}>
        <motion.span>{display}</motion.span>
        {unit && <span className={UNIT_CLASS}>{unit}</span>}
      </span>
    );
  }
  return (
    <span className={cn(ROOT_CLASS, className)} {...rest}>
      {value}
      {unit && <span className={UNIT_CLASS}>{unit}</span>}
    </span>
  );
}
