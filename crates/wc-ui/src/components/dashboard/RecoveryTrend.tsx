import { motion } from "framer-motion";
import Card from "../ui/Card";
import NumDisplay from "../ui/NumDisplay";
import { DURATION_SLOW, EASE_OUT, fadeUp } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { pointsToPath, totalTrendBytes } from "../../lib/charts";
import { bytesToGiB } from "../../lib/format";
import type { RecoveryTrendProps } from "../../types/dashboard-widget";

const WIDTH = 340;
const HEIGHT = 88;

const CARD_CLASS = "p-[22px] flex flex-col gap-[14px] h-full";
const HEADER_TITLE_CLASS =
  "font-medium text-[10.5px] tracking-[0.12em] uppercase text-ink-muted mb-1";
const HEADER_SUB_CLASS = "text-[12px] text-ink-muted";

/**
 * 12-week recovery trend area chart mirroring the prototype's
 * "Reclaim trend" widget. Header + big stat + 88px area sparkline
 * with hairline x-axis and dot markers. Animates via Framer's
 * motion.path `pathLength` from 0 → 1 over DURATION_SLOW.
 *
 * Pure path math lives in `src/lib/charts.ts` per Rule 4.
 */
export default function RecoveryTrend({ points }: RecoveryTrendProps) {
  const reduced = usePrefersReducedMotion();
  const path = pointsToPath(points, WIDTH, HEIGHT);
  const total = totalTrendBytes(points);
  const totalGiB = bytesToGiB(total);
  return (
    <motion.div variants={fadeUp}>
      <Card className={CARD_CLASS}>
        <header>
          <div className={HEADER_TITLE_CLASS}>Recovery trend</div>
          <div className={HEADER_SUB_CLASS}>Past 12 weeks · weekly total</div>
        </header>
        <div className="flex items-baseline gap-[6px]">
          <NumDisplay
            value={totalGiB}
            unit="GB"
            animate
            fractionDigits={1}
            className="text-[28px] text-ink"
          />
          <span className="text-[11px] text-status-good font-medium ml-[6px]">
            ↑ 31% vs prior 12w
          </span>
        </div>
        <div className="flex-1 min-h-[88px]">
          <svg
            width="100%"
            viewBox={path.viewBox}
            preserveAspectRatio="none"
            style={{ display: "block", overflow: "visible" }}
            aria-label="Recovery trend area chart"
          >
            <line
              x1={4}
              y1={HEIGHT - 4}
              x2={WIDTH - 4}
              y2={HEIGHT - 4}
              stroke="var(--line)"
              strokeWidth={1}
            />
            <motion.path
              d={path.areaD}
              fill="var(--accent)"
              fillOpacity={0.1}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: reduced ? 0 : DURATION_SLOW,
                ease: EASE_OUT,
              }}
            />
            <motion.path
              d={path.lineD}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={1.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: reduced ? 0 : DURATION_SLOW,
                ease: EASE_OUT,
              }}
            />
          </svg>
        </div>
        {points.length > 0 && (
          <div className="flex justify-between font-mono text-[10px] text-ink-faint">
            <span>{points[0].day}</span>
            <span>{points[points.length - 1].day}</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
