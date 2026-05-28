import type { ReactNode } from "react";

export type ModalVariant = "default" | "destructive";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Footer slot — usually a row of <Button> atoms. */
  footer?: ReactNode;
  /** Destructive styling tints the title bar red. */
  variant?: ModalVariant;
  /** Optional id used for aria-labelledby. Auto-generated otherwise. */
  titleId?: string;
  /** When false, hide the visually-rendered title (kept for a11y). */
  showTitle?: boolean;
  className?: string;
}
