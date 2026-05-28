import { forwardRef } from "react";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "./cn";
import type { CheckboxProps } from "../../types/checkbox";

const ROOT_CLASS = [
  "inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center",
  "rounded-sm border-[1.5px] border-line-strong bg-surface cursor-pointer",
  "transition-colors duration-[var(--t-fast)] ease-[var(--ease-out)]",
  "hover:border-ink-muted",
  "data-[state=checked]:bg-accent data-[state=checked]:border-accent",
  "data-[state=indeterminate]:bg-surface data-[state=indeterminate]:border-accent",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  "disabled:opacity-40 disabled:pointer-events-none",
].join(" ");

const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { className, checked, ...rest },
  ref,
) {
  return (
    <RadixCheckbox.Root
      ref={ref}
      checked={checked}
      className={cn(ROOT_CLASS, className)}
      {...rest}
    >
      <RadixCheckbox.Indicator className="flex items-center justify-center text-white">
        {checked === "indeterminate" ? (
          <span className="block h-[1.5px] w-[8px] rounded-[1px] bg-accent" />
        ) : (
          <Check size={11} strokeWidth={2.5} />
        )}
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
});

export default Checkbox;
