import { motion } from "framer-motion";
import {
  Archive,
  History,
  LayoutDashboard,
  Settings,
  Sparkles,
  Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Badge from "./ui/Badge";
import { cn } from "./ui/cn";
import { fadeUp } from "../lib/motion";
import type { SidebarItemProps } from "../types/sidebar";

/**
 * Static name → component map. Lucide ships ~1.4k icons; importing
 * every one keyed by string would bloat the bundle. The 6 routes use a
 * known closed set, so a switch is the cheapest correct mapping.
 */
const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Sparkles,
  Archive,
  History,
  Settings,
  Wand2,
};

const ROW_BASE = [
  "relative flex items-center gap-[10px] w-full",
  "px-[10px] py-[8px] rounded-md text-left text-[13px]",
  "transition-colors duration-[var(--t-base)] ease-[var(--ease-out)]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
].join(" ");

export default function SidebarItem({ meta, active, onSelect }: SidebarItemProps) {
  const Icon = ICONS[meta.icon] ?? LayoutDashboard;
  return (
    <motion.button
      type="button"
      variants={fadeUp}
      onClick={onSelect}
      aria-current={active ? "page" : undefined}
      className={cn(
        ROW_BASE,
        active
          ? "bg-accent-soft text-accent-ink font-medium"
          : "text-ink-soft hover:bg-surface-sunken hover:text-ink",
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active-bar"
          aria-hidden="true"
          className="absolute left-0 top-1 bottom-1 w-[2px] rounded-r bg-accent"
        />
      )}
      <Icon size={15} className={active ? "text-accent" : "text-current"} aria-hidden="true" />
      <span className="flex-1 truncate">{meta.label}</span>
      {meta.pro && (
        <Badge variant="pro" aria-label="Pro feature">
          Pro
        </Badge>
      )}
    </motion.button>
  );
}
