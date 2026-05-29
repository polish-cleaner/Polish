import { motion } from "framer-motion";
import { ArrowRight, RotateCw } from "lucide-react";
import Button from "../ui/Button";
import { fadeUp } from "../../lib/motion";
import { bytesToGiB } from "../../lib/format";
import { detectedToolCount } from "../../lib/dashboard-helpers";
import type { HeroProps } from "../../types/dashboard-widget";

const STRIP_CLASS =
  "flex items-baseline gap-4 mb-3 text-[12px] text-ink-muted";
const LABEL_CLASS =
  "font-medium text-[10.5px] tracking-[0.12em] uppercase text-ink-muted";
const HEADLINE_ROW_CLASS =
  "flex items-end justify-between gap-8 mb-8";
const HEADLINE_CLASS =
  "font-display font-normal text-[44px] leading-[1.05] tracking-[-0.01em] m-0 max-w-[720px] text-ink";
const ACCENT_CLASS =
  "font-display italic text-accent";
const UNIT_CLASS =
  "font-body font-normal text-[0.5em] ml-[0.15em] tracking-[0.02em]";

/**
 * Hero strip — mirrors the prototype dashboard.jsx hero exactly.
 * Small section label + meta info row, then the big editorial
 * "You can reclaim X GB across N categories." headline in
 * Instrument Serif with an italic-accent number. Action buttons
 * (Rescan / Review & clean) sit on the right of the headline row.
 */
export default function Hero({
  env,
  totalBytes,
  categoryCount,
  onRescan,
  onReviewClean,
}: HeroProps) {
  const gib = bytesToGiB(totalBytes).toFixed(1);
  const envSummary =
    env === null
      ? "Detecting your environment…"
      : `${detectedToolCount(env)} of 7 tools detected · build ${env.windows_build ?? "—"}`;
  return (
    <motion.section
      variants={fadeUp}
      aria-label="Dashboard hero"
    >
      <div className={STRIP_CLASS}>
        <span className={LABEL_CLASS}>Dashboard</span>
        <span>{envSummary} · Background scanner is on</span>
      </div>
      <div className={HEADLINE_ROW_CLASS}>
        <h1 className={HEADLINE_CLASS}>
          You can reclaim{" "}
          <em className={ACCENT_CLASS}>
            {gib}
            <span className={UNIT_CLASS}>GB</span>
          </em>{" "}
          across {categoryCount} categor{categoryCount === 1 ? "y" : "ies"}.
        </h1>
        <div className="flex gap-[10px] shrink-0">
          <Button
            variant="ghost"
            onClick={onRescan}
            leading={<RotateCw size={13} aria-hidden="true" />}
          >
            Rescan
          </Button>
          <Button
            variant="primary"
            onClick={onReviewClean}
            trailing={<ArrowRight size={13} aria-hidden="true" />}
          >
            Review &amp; clean
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
