import type { ReactNode } from "react";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** Pixel width of the drawer panel. Defaults to 560. */
  width?: number;
  className?: string;
}
