import { motion } from "framer-motion";
import Card from "../ui/Card";
import Tooltip from "../ui/Tooltip";
import { DURATION_BASE, EASE_OUT, fadeUp, stagger } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { activityHeatmapBuckets } from "../../lib/dashboard-helpers";
import { smartBytes } from "../../lib/format";
import type { ActivityHeatmapProps } from "../../types/activity-heatmap";

const HEATMAP_STAGGER = stagger(0, 0.005);

const CARD_CLASS = "p-[22px] flex flex-col gap-[14px] h-full";
const HEADER_TITLE_CLASS =
  "font-medium text-[10.5px] tracking-[0.12em] uppercase text-ink-muted mb-1";
const HEADER_SUB_CLASS = "text-[12px] text-ink-muted";
const GRID_CLASS =
  "grid grid-cols-10 gap-[4px] auto-rows-max";
const CELL_CLASS =
  "w-[20px] h-[20px] rounded-sm border border-line-soft cursor-default";
const LEGEND_CLASS =
  "flex justify-between items-center mt-3 text-[10.5px] text-ink-muted font-mono";
const PREVIEW_TAG_CLASS = "text-[11px] text-ink-muted ml-2";

// 5 buckets — token-driven color-mix mirrors prototype DayGrid.
const INTENSITY_BG = [
  "var(--line)",
  "color-mix(in oklch, var(--accent) 18%, var(--surface))",
  "color-mix(in oklch, var(--accent) 38%, var(--surface))",
  "color-mix(in oklch, var(--accent) 62%, var(--surface))",
  "color-mix(in oklch, var(--accent) 92%, var(--surface))",
] as const;

const LEGEND_INTENSITIES = [1, 2, 3, 4] as const;

/**
 * 30-day calendar heatmap — one square per day, colored by activity
 * intensity (bytes found that day, bucketed 0-4). Empty squares
 * (no scan recorded) render as the sunken-surface stub. Tooltips
 * via Radix expose `date + size cleaned` on hover. Mirrors the
 * prototype DayGrid widget.
 */
export default function ActivityHeatmap({
  cells,
  previewTag,
}: ActivityHeatmapProps) {
  const reduced = usePrefersReducedMotion();
  const buckets = activityHeatmapBuckets(cells);
  const scannedDays = buckets.filter((b) => b.scanned).length;
  const duration = reduced ? 0 : DURATION_BASE;
  return (
    <motion.div variants={fadeUp}>
      <Card className={CARD_CLASS}>
        <header>
          <div className={HEADER_TITLE_CLASS}>
            30-day activity
            {previewTag && (
              <span className={PREVIEW_TAG_CLASS}>(preview data)</span>
            )}
          </div>
          <div className={HEADER_SUB_CLASS}>
            <span className="font-mono">{scannedDays}</span> scans · darker = more found
          </div>
        </header>
        <motion.div
          className={GRID_CLASS}
          variants={HEATMAP_STAGGER}
          initial="initial"
          animate="animate"
          role="grid"
          aria-label="30-day scan activity heatmap"
        >
          {buckets.map((b, i) => {
            const fmt = smartBytes(b.bytes);
            const label = !b.scanned
              ? `${b.date}: no scan`
              : b.bytes > 0
                ? `${b.date}: ${fmt.num} ${fmt.unit} found`
                : `${b.date}: clean`;
            const bg = !b.scanned
              ? "var(--surface-sunken)"
              : INTENSITY_BG[b.intensity];
            return (
              <Tooltip key={`${b.date}-${i}`} content={label}>
                <motion.div
                  className={CELL_CLASS}
                  style={{ background: bg }}
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration, ease: EASE_OUT }}
                  role="gridcell"
                  aria-label={label}
                  tabIndex={0}
                />
              </Tooltip>
            );
          })}
        </motion.div>
        <div className={LEGEND_CLASS}>
          <span>30d ago</span>
          <span className="flex items-center gap-1">
            <span>less</span>
            {LEGEND_INTENSITIES.map((i) => (
              <span
                key={i}
                className="w-[10px] h-[10px] rounded-sm border border-line-soft"
                style={{ background: INTENSITY_BG[i] }}
              />
            ))}
            <span>more</span>
          </span>
          <span>today</span>
        </div>
      </Card>
    </motion.div>
  );
}
