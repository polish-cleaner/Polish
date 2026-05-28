import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant = "default" | "accent" | "warn" | "danger" | "pro";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  leading?: ReactNode;
}
