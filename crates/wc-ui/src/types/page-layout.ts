import type { ReactNode } from "react";

export interface PageLayoutProps {
  /** Plain title text (e.g. "Dashboard"). */
  title: string;
  /**
   * Optional italic-accent word appended after the title (mirrors the
   * prototype's `<em>` treatment on the .page-title element). When
   * omitted the title stands alone.
   */
  titleAccent?: string;
  /** Optional short subhead under the title, max ~56ch. */
  subtitle?: ReactNode;
  /** Optional right-side action slot — typically a <Button>. */
  actions?: ReactNode;
  children: ReactNode;
}
