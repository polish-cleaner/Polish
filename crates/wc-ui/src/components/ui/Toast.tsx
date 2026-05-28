import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "./cn";
import { toastSlide } from "../../lib/motion";
import Dot from "./Dot";
import type { ToastProps } from "../../types/toast";
import type { DotVariant } from "../../types/dot";

const ROOT_CLASS = [
  "flex items-start gap-3 min-w-[280px] max-w-[360px]",
  "bg-surface border border-line rounded-md p-4",
  "shadow-[0_8px_24px_oklch(0.20_0.012_250/0.10)]",
].join(" ");

const DOT_VARIANT_MAP: Record<NonNullable<ToastProps["variant"]>, DotVariant> = {
  info: "good",
  good: "good",
  warn: "warn",
  danger: "danger",
};

export default function Toast({
  title,
  body,
  variant = "info",
  action,
  onClose,
  className,
}: ToastProps) {
  const dotVariant = DOT_VARIANT_MAP[variant];
  return (
    <motion.div
      role="status"
      aria-live="polite"
      className={cn(ROOT_CLASS, className)}
      variants={toastSlide}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Dot variant={dotVariant} className="mt-[6px]" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[13px] text-ink">{title}</div>
        {body && <div className="text-[12.5px] text-ink-soft mt-[3px]">{body}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onClose}
          className="p-1 rounded-sm text-ink-muted hover:text-ink hover:bg-surface-sunken transition-colors duration-[var(--t-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <X size={14} />
        </button>
      )}
    </motion.div>
  );
}
