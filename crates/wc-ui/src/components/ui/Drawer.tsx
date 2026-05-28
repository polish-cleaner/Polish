import { useId } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "./cn";
import { fade, slideFromRight } from "../../lib/motion";
import type { DrawerProps } from "../../types/drawer";

const DEFAULT_WIDTH = 560;
const BACKDROP_CLASS =
  "fixed inset-0 z-40 bg-[oklch(0.20_0.012_250/0.25)] backdrop-blur-[2px]";
const PANEL_CLASS = [
  "fixed top-0 right-0 bottom-0 z-50",
  "flex flex-col bg-surface border-l border-line",
  "shadow-[-8px_0_32px_oklch(0.20_0.012_250/0.08)]",
  "max-w-[90vw]",
].join(" ");
const HEADER_CLASS = "px-6 py-4 border-b border-line";
const TITLE_CLASS = "font-display text-[20px] leading-[1.2] m-0";
const DESCRIPTION_CLASS = "text-ink-soft text-[13px] mt-2";
const BODY_CLASS = "flex-1 overflow-y-auto px-6 py-4";
const FOOTER_CLASS = "px-6 py-4 border-t border-line flex justify-end gap-3";

export default function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  width = DEFAULT_WIDTH,
  className,
}: DrawerProps) {
  const id = useId();
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
            <Dialog.Content asChild forceMount aria-labelledby={id}>
              <motion.div
                variants={slideFromRight}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ width }}
                className={cn(PANEL_CLASS, className)}
              >
                <div className={HEADER_CLASS}>
                  <Dialog.Title id={id} className={TITLE_CLASS}>
                    {title}
                  </Dialog.Title>
                  {description && (
                    <Dialog.Description className={DESCRIPTION_CLASS}>
                      {description}
                    </Dialog.Description>
                  )}
                </div>
                <div className={BODY_CLASS}>{children}</div>
                {footer && <div className={FOOTER_CLASS}>{footer}</div>}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
