import type { HTMLAttributes } from "react";

export interface NumDisplayProps extends HTMLAttributes<HTMLSpanElement> {
  /** Numeric value to display. Strings allowed for pre-formatted output. */
  value: number | string;
  /** Optional unit (e.g. "MB", "GB") — rendered smaller, non-mono. */
  unit?: string;
  /** When true and `value` is a number, count up via Framer Motion. */
  animate?: boolean;
  /** Animation duration in milliseconds — defaults to 1400. */
  durationMs?: number;
  /** Decimal places to show when animating — defaults to 1. */
  fractionDigits?: number;
}
