import { motion } from "framer-motion";
import Card from "../ui/Card";
import NumDisplay from "../ui/NumDisplay";
import { DURATION_SLOW, EASE_OUT, fadeUp } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { smartBytes } from "../../lib/format";
import type { LargestOpportunitiesProps } from "../../types/largest-opportunities";

const CARD_CLASS = "p-[22px] flex flex-col gap-[18px] h-full";
const HEADER_TITLE_CLASS =
  "font-medium text-[10.5px] tracking-[0.12em] uppercase text-ink-muted mb-1";
const HEADER_SUB_CLASS = "text-[12px] text-ink-muted";
const ROW_CLASS = "flex items-center gap-3";
const ROW_LABEL_CLASS =
  "flex-[0_0_130px] min-w-0 text-[12px] text-ink-soft truncate";
const TRACK_CLASS =
  "flex-1 h-[6px] bg-surface-sunken rounded-pill overflow-hidden";
const VALUE_CELL_CLASS = "flex-[0_0_60px] text-right";
const PREVIEW_TAG_CLASS = "text-[11px] text-ink-muted ml-2";

/**
 * Horizontal bar list — top reclaimable categories sorted by size.
 * Each row = label (130px) + filled bar (flex-1, var(--accent) by
 * default) + mono size on the right (60px). Bars animate from width
 * 0 → pct over DURATION_SLOW on mount. Mirrors prototype HBars.
 */
export default function LargestOpportunities({
  rows,
  previewTag,
}: LargestOpportunitiesProps) {
  const reduced = usePrefersReducedMotion();
  const peak = rows.length === 0 ? 1 : Math.max(...rows.map((r) => r.bytes), 1);
  const duration = reduced ? 0 : DURATION_SLOW;
  return (
    <motion.div variants={fadeUp}>
      <Card className={CARD_CLASS}>
        <header>
          <div className={HEADER_TITLE_CLASS}>
            Largest opportunities
            {previewTag && (
              <span className={PREVIEW_TAG_CLASS}>(preview data)</span>
            )}
          </div>
          <div className={HEADER_SUB_CLASS}>Sorted by reclaimable size</div>
        </header>
        {rows.length === 0 ? (
          <p className="text-[12px] text-ink-muted m-0">
            No reclaimable categories yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-[10px] m-0 p-0 list-none">
            {rows.map((row) => {
              const pct = peak > 0 ? (row.bytes / peak) * 100 : 0;
              const fmt = smartBytes(row.bytes);
              return (
                <li key={row.id} className={ROW_CLASS}>
                  <span className={ROW_LABEL_CLASS}>{row.label}</span>
                  <div className={TRACK_CLASS}>
                    <motion.div
                      className="h-full rounded-pill"
                      style={{ background: row.color ?? "var(--accent)" }}
                      initial={reduced ? false : { width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration, ease: EASE_OUT }}
                    />
                  </div>
                  <span className={VALUE_CELL_CLASS}>
                    <NumDisplay
                      value={fmt.num}
                      unit={fmt.unit}
                      className="text-[12.5px] text-ink"
                    />
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </motion.div>
  );
}
