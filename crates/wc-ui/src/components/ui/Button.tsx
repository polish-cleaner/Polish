import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./cn";
import { buttonVariants } from "../../lib/variants";
import type { ButtonProps } from "../../types/button";

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    asChild = false,
    leading,
    trailing,
    className,
    children,
    type = "button",
    ...rest
  },
  ref,
) {
  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...rest}
      >
        {children}
      </Slot>
    );
  }
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...rest}
    >
      {leading}
      {children}
      {trailing}
    </button>
  );
});

export default Button;
