import { motion } from "framer-motion";
import Card from "../ui/Card";
import NumDisplay from "../ui/NumDisplay";
import { DURATION_SLOW, EASE_OUT, fadeUp } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { segmentsToArcs, totalSegmentValue } from "../../lib/charts";
import { findingsToDonut } from "../../lib/dashboard-helpers";
import { bytesToGiB, smartBytes } from "../../lib/format";
import type { CategoryBreakdownProps } from "../../types/dashboard-widget";

const SIZE = 180;
const THICKNESS = 22;
const RADIUS = (SIZE - THICKNESS) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

/**
 * Donut chart showing recoverable bytes by category. Pure SVG +
 * Framer Motion animation on `strokeDashoffset` — no charting library.
 *
 * Math (segments → arcs) lives in `src/lib/charts.ts` per Rule 4.
 */
export default function CategoryBreakdown({ findings }: CategoryBreakdownProps) {
  const reduced = usePrefersReducedMotion();
  const segments = findingsToDonut(findings);
  const arcs = segmentsToArcs(segments, RADIUS);
  const total = totalSegmentValue(segments);
  const totalFmt = smartBytes(total);
  const totalGiB = bytesToGiB(total);
  const ariaLabel = `Recovery breakdown: ${totalFmt.num} ${totalFmt.unit} across ${segments.length} categories`;

  return (
    <motion.div variants={fadeUp}>
      <Card className="p-7 flex flex-col gap-4 h-full">
        <header className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-ink-muted">Where the space lives</span>
          <span className="font-mono text-[11px] text-ink-soft">{segments.length} categories</span>
        </header>
        <div className="flex items-center gap-7">
          <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }} role="img" aria-label={ariaLabel}>
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--surface-sunken)" strokeWidth={THICKNESS} />
              {arcs.map((arc, i) => (
                <motion.circle
                  key={arc.id}
                  cx={CENTER} cy={CENTER} r={RADIUS}
                  fill="none" stroke={arc.segment.color} strokeWidth={THICKNESS} strokeLinecap="butt"
                  strokeDasharray={`${arc.dashLength} ${CIRCUMFERENCE - arc.dashLength}`}
                  initial={reduced ? false : { strokeDashoffset: -CIRCUMFERENCE }}
                  animate={{ strokeDashoffset: arc.dashOffset }}
                  transition={{ duration: reduced ? 0 : DURATION_SLOW, delay: reduced ? 0 : i * 0.04, ease: EASE_OUT }}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-muted">total</span>
              <NumDisplay value={totalGiB} unit="GB" animate fractionDigits={1} className="text-[24px] text-ink mt-1" />
            </div>
          </div>
          <ul className="flex-1 min-w-0 flex flex-col gap-2 m-0 p-0 list-none">
            {segments.map((seg) => {
              const fmt = smartBytes(seg.value);
              const pct = total > 0 ? ((seg.value / total) * 100).toFixed(1) : "0.0";
              return (
                <li key={seg.id} className="flex items-center gap-3 text-[12px] text-ink-soft">
                  <span className="block w-[8px] h-[8px] rounded-sm shrink-0" style={{ background: seg.color }} />
                  <span className="flex-1 min-w-0 truncate">{seg.label}</span>
                  <span className="font-mono text-ink">
                    {fmt.num}<span className="text-ink-muted ml-[2px]">{fmt.unit}</span>
                  </span>
                  <span className="font-mono text-ink-muted w-[40px] text-right">{pct}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      </Card>
    </motion.div>
  );
}
