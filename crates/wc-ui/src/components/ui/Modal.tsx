import { useId } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "./cn";
import { fade, scaleIn } from "../../lib/motion";
import type { ModalProps } from "../../types/modal";

const BACKDROP_CLASS =
  "fixed inset-0 z-50 flex items-center justify-center bg-[oklch(0.20_0.012_250/0.35)] backdrop-blur-[2px]";
const PANEL_CLASS = [
  "relative w-[90vw] max-w-[480px] bg-surface",
  "border border-line rounded-lg",
  "shadow-[0_20px_60px_oklch(0.20_0.012_250/0.18)]",
  "p-6",
].join(" ");
const TITLE_CLASS = "font-display text-[20px] leading-[1.2] m-0";
const TITLE_DESTRUCTIVE = "text-status-danger";
const DESCRIPTION_CLASS = "text-ink-soft text-[14px] leading-[1.55] mt-3";
const FOOTER_CLASS = "flex justify-end gap-3 mt-6";

export default function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  variant = "default",
  titleId,
  showTitle = true,
  className,
}: ModalProps) {
  const autoId = useId();
  const id = titleId ?? autoId;
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className={BACKDROP_CLASS}
                variants={fade}
                initial="initial"
                animate="animate"
                exit="exit"
              />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              forceMount
              aria-labelledby={id}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                variants={scaleIn}
                initial="initial"
                animate="animate"
                exit="exit"
                className="fixed inset-0 z-50 flex items-center justify-center"
              >
                <div className={cn(PANEL_CLASS, "pointer-events-auto", className)}>
                  <Dialog.Title
                    id={id}
                    className={cn(
                      TITLE_CLASS,
                      variant === "destructive" && TITLE_DESTRUCTIVE,
                      !showTitle && "sr-only",
                    )}
                  >
                    {title}
                  </Dialog.Title>
                  {description && (
                    <Dialog.Description className={DESCRIPTION_CLASS}>
                      {description}
                    </Dialog.Description>
                  )}
                  {children && <div className="mt-3 text-ink text-[14px] leading-[1.55]">{children}</div>}
                  {footer && <div className={FOOTER_CLASS}>{footer}</div>}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
