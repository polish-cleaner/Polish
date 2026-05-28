import { cva } from "class-variance-authority";

/**
 * Class-variance-authority variant configs for atoms whose visual
 * permutations are stable enough to express declaratively. Per Rule 4
 * these live in `lib/` rather than inside the component files.
 *
 * Every utility class here is a Tailwind v4 utility mapped to a Polish
 * design token via `styles/index.css` `@theme inline`. No raw colour
 * hex values; no inline `style={}`.
 */

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const TRANSITION =
  "transition-colors duration-[var(--t-base)] ease-[var(--ease-out)]";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-md border border-transparent font-medium leading-none",
    "active:translate-y-[0.5px]",
    "disabled:opacity-40 disabled:pointer-events-none disabled:active:translate-y-0",
    TRANSITION,
    FOCUS,
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-accent text-white hover:bg-accent-hover",
        secondary:
          "bg-surface border-line-strong text-ink hover:bg-surface-sunken hover:border-ink-muted",
        ghost: "text-ink-soft hover:bg-surface-sunken hover:text-ink",
        danger: "bg-status-danger text-white hover:brightness-95",
      },
      size: {
        sm: "px-[10px] py-[6px] text-[12px]",
        default: "px-[14px] py-[9px] text-[13px]",
        lg: "px-[20px] py-[12px] text-[14px]",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export const cardVariants = cva("border border-line rounded-md overflow-hidden", {
  variants: {
    variant: { default: "bg-surface", sunken: "bg-surface-warm" },
  },
  defaultVariants: { variant: "default" },
});

export const badgeVariants = cva(
  [
    "inline-flex items-center gap-[5px] rounded-pill",
    "px-[8px] py-[3px] text-[10.5px] font-medium leading-[1.2] tracking-[0.02em]",
    "border border-line bg-surface text-ink-soft",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "",
        accent: "bg-accent-soft border-transparent text-accent-ink",
        warn: "bg-status-warn-soft border-transparent text-[oklch(0.42_0.12_65)]",
        danger:
          "bg-status-danger-soft border-transparent text-[oklch(0.42_0.16_25)]",
        pro: [
          "bg-ink text-surface border-none font-mono uppercase",
          "text-[9.5px] tracking-[0.06em] px-[7px] py-[3px]",
        ].join(" "),
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export const dotVariants = cva("inline-block w-[6px] h-[6px] rounded-full", {
  variants: {
    variant: {
      base: "bg-ink-faint",
      good: "bg-status-good shadow-[0_0_0_3px_oklch(0.545_0.110_155/0.15)]",
      warn: "bg-status-warn",
      danger: "bg-status-danger",
    },
  },
  defaultVariants: { variant: "good" },
});
