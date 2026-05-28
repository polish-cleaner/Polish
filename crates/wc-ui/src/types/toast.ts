import type { ReactNode } from "react";

export type ToastVariant = "info" | "good" | "warn" | "danger";

export interface ToastProps {
  title: ReactNode;
  body?: ReactNode;
  variant?: ToastVariant;
  /** Optional action node (usually a <Button> atom). */
  action?: ReactNode;
  onClose?: () => void;
  className?: string;
}

/**
 * Stack-managed toast item. Identical visual contract as ToastProps
 * but with a stable id assigned by the store on push() so the
 * AnimatePresence in ToastStack can key entries correctly.
 */
export interface ToastStackItem {
  id: string;
  variant?: ToastVariant;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
}

/**
 * Input shape for useToastStack().push() — like ToastStackItem minus
 * the store-assigned id.
 */
export type ToastStackInput = Omit<ToastStackItem, "id">;
