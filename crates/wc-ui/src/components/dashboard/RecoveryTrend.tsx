import { motion } from "framer-motion";
import Card from "../ui/Card";
import NumDisplay from "../ui/NumDisplay";
import { DURATION_SLOW, EASE_OUT, fadeUp } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { pointsToPath, totalTrendBytes } from "../../lib/charts";
import { bytesToGiB } from "../../lib/format";
import type { RecoveryTrendProps } from "../../types/dashboard-widget";

const WIDTH = 340;
const HEIGHT = 96;

/**
 * 12-week recovery trend area chart. Animates via Framer's
 * `motion.path pathLength` from 0 → 1 over `DURATION_SLOW` on mount.
 * Reduced-motion snaps to the final state.
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
      <Card className="p-7 flex flex-col gap-3 h-full">
        <header className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-ink-muted">
            Recovery trend
          </span>
          <span className="font-mono text-[11px] text-ink-soft">
            past 12 weeks
          </span>
        </header>
        <div className="flex items-baseline gap-2">
          <NumDisplay
            value={totalGiB}
            unit="GB"
            animate
            fractionDigits={1}
            className="text-[28px] text-ink"
          />
          <span className="text-[12px] text-status-good font-medium">
            cumulative
          </span>
        </div>
        <div className="flex-1 min-h-[100px] mt-2">
          <svg
            width="100%"
            viewBox={path.viewBox}
            preserveAspectRatio="none"
            style={{ display: "block" }}
            aria-label="Recovery trend area chart"
          >
            <motion.path
              d={path.areaD}
              fill="var(--accent)"
              fillOpacity={0.10}
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
