import { forwardRef } from "react";
import { cn } from "./cn";
import { cardVariants } from "../../lib/variants";
import type { CardProps } from "../../types/card";

const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...rest}
    >
      {children}
    </div>
  );
});

export default Card;
