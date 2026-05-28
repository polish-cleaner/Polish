import type { HTMLAttributes } from "react";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** 0–100. Ignored when `indeterminate` is true. */
  value?: number;
  /** When true, render an indeterminate sliding bar. */
  indeterminate?: boolean;
  /** Accessible label (Radix requires this for assistive tech). */
  ariaLabel?: string;
}
