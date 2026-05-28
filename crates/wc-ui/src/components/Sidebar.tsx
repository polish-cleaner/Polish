import { motion } from "framer-motion";
import SidebarItem from "./SidebarItem";
import { ROUTE_LIST } from "../lib/routes";
import { useRoute } from "../hooks/useRoute";
import { useToastStack } from "../hooks/useToastStack";
import { stagger } from "../lib/motion";

const ASIDE_CLASS = [
  "flex flex-col flex-shrink-0",
  "w-[240px] bg-bg-deep border-r border-line",
].join(" ");

const ABOUT_BUTTON_CLASS = [
  "w-full text-left text-[12px] text-ink-soft",
  "px-[10px] py-[6px] rounded-md",
  "transition-colors duration-[var(--t-base)] ease-[var(--ease-out)]",
  "hover:bg-surface-sunken hover:text-ink",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
].join(" ");

const ABOUT_TOAST = {
  title: "About Polish",
  body: "v0.1.0 · MIT · pre-release",
  variant: "good" as const,
};

const NAV_STAGGER = stagger(0, 0.04);

export default function Sidebar() {
  const route = useRoute((s) => s.route);
  const setRoute = useRoute((s) => s.setRoute);
  const pushToast = useToastStack((s) => s.push);

  return (
    <aside className={ASIDE_CLASS} aria-label="Primary navigation">
      {/* Wordmark */}
      <div className="flex items-baseline gap-1 px-[22px] pt-[22px] pb-[16px]">
        <span className="font-display text-[22px] leading-none tracking-[-0.005em] text-ink">
          Polish
        </span>
        <em className="font-display not-italic text-accent text-[22px] leading-none">
          .
        </em>
      </div>

      {/* Nav list — stagger on initial mount */}
      <motion.nav
        className="flex flex-col gap-[1px] px-[12px] py-[8px] flex-1"
        variants={NAV_STAGGER}
        initial="initial"
        animate="animate"
        aria-label="Sections"
      >
        {ROUTE_LIST.map((meta) => (
          <SidebarItem
            key={meta.id}
            meta={meta}
            active={route === meta.id}
            onSelect={() => setRoute(meta.id)}
          />
        ))}
      </motion.nav>

      {/* Footer */}
      <div className="px-[16px] py-[14px] border-t border-line">
        <button
          type="button"
          className={ABOUT_BUTTON_CLASS}
          onClick={() => pushToast(ABOUT_TOAST)}
        >
          About
        </button>
      </div>
    </aside>
  );
}
