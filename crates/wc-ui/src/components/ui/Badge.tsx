import { forwardRef } from "react";
import { cn } from "./cn";
import { badgeVariants } from "../../lib/variants";
import type { BadgeProps } from "../../types/badge";

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant, leading, className, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...rest}
    >
      {leading}
      {children}
    </span>
  );
});

export default Badge;
