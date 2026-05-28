import type { HTMLAttributes } from "react";

export type CardVariant = "default" | "sunken";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}
