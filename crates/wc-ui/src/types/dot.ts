import type { HTMLAttributes } from "react";

export type DotVariant = "base" | "good" | "warn" | "danger";

export interface DotProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: DotVariant;
  pulsing?: boolean;
}
