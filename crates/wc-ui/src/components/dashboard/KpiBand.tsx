import { motion } from "framer-motion";
import { Sparkles, HardDrive, Box, RotateCcw } from "lucide-react";
import Card from "../ui/Card";
import NumDisplay from "../ui/NumDisplay";
import { fadeUp } from "../../lib/motion";
import type { KpiBandProps } from "../../types/kpi-band";

const ICON_MAP = {
  "sparkles": Sparkles,
  "hard-drive": HardDrive,
  "box": Box,
  "rotate-ccw": RotateCcw,
} as const;

const ACCENT_CLASS = {
  "accent": "text-accent",
  "danger": "text-status-danger",
  "ink-soft": "text-ink-soft",
} as const;

const TREND_CLASS = {
  "up": "text-status-good",
  "down": "text-status-warn",
  "neutral": "text-ink-muted",
} as const;

const ROOT_CLASS =
  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px]";
const CARD_CLASS =
  "p-[18px] flex flex-col gap-3 relative overflow-hidden";
const HEADER_CLASS = "flex items-center gap-2";
const LABEL_CLASS =
  "font-medium text-[10.5px] tracking-[0.12em] uppercase text-ink-muted";
const TREND_BASE_CLASS = "font-mono text-[11px] font-medium";
const SUB_CLASS = "text-[11px] text-ink-muted";

/**
 * Strip of 4 small KPI tiles above the chart row. Each tile shows a
 * small-caps label + lucide icon, the big mono value + unit through
 * NumDisplay, and a thin trend hairline + sub-line. Mirrors the
 * prototype dashboard.jsx "KPI band" composition.
 */
export default function KpiBand({ tiles }: KpiBandProps) {
  return (
    <motion.div variants={fadeUp} className={ROOT_CLASS}>
      {tiles.map((tile) => {
        const Icon = ICON_MAP[tile.icon];
        const iconCls = tile.accent
          ? ACCENT_CLASS[tile.accent]
          : "text-ink-muted";
        const trendCls = TREND_CLASS[tile.trendKind ?? "neutral"];
        return (
          <Card key={tile.id} className={CARD_CLASS}>
            <header className={HEADER_CLASS}>
              <Icon size={13} className={iconCls} aria-hidden="true" />
              <span className={LABEL_CLASS}>{tile.label}</span>
            </header>
            <NumDisplay
              value={tile.value}
              unit={tile.unit}
              animate={tile.animate ?? true}
              fractionDigits={1}
              className="text-[26px] text-ink"
            />
            {(tile.trend || tile.sub) && (
              <div className="flex items-center gap-2">
                {tile.trend && (
                  <span className={`${TREND_BASE_CLASS} ${trendCls}`}>
                    {tile.trend}
                  </span>
                )}
                {tile.sub && <span className={SUB_CLASS}>{tile.sub}</span>}
              </div>
            )}
          </Card>
        );
      })}
    </motion.div>
  );
}
