import type { PageLayoutProps } from "../types/page-layout";

const INNER_CLASS = "max-w-[1240px] mx-auto px-10 pt-10 pb-16";
const TITLE_CLASS =
  "font-display font-normal text-[44px] leading-none tracking-[-0.015em] m-0 text-ink";
const SUBTITLE_CLASS = "text-ink-soft mt-3 text-[14px] max-w-[56ch] m-0";

/**
 * Page chrome wrapper used by every page composed by App.tsx. Renders
 * the editorial page-title (display serif, optional italic accent
 * word), optional subtitle, optional right-aligned action slot, and
 * the children below. Spacing mirrors the prototype's .page-inner
 * paddings exactly.
 */
export default function PageLayout({
  title,
  titleAccent,
  subtitle,
  actions,
  children,
}: PageLayoutProps) {
  return (
    <div className={INNER_CLASS}>
      <header className="flex items-start justify-between gap-6 mb-8">
        <div className="min-w-0">
          <h1 className={TITLE_CLASS}>
            {title}
            {titleAccent && (
              <>
                {" "}
                <em className="font-display italic text-accent">{titleAccent}</em>
              </>
            )}
          </h1>
          {subtitle && <p className={SUBTITLE_CLASS}>{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </header>
      <div>{children}</div>
    </div>
  );
}
