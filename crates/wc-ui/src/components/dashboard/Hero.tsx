import { motion } from "framer-motion";
import NumDisplay from "../ui/NumDisplay";
import { fadeUp } from "../../lib/motion";
import { bytesToGiB } from "../../lib/format";
import { detectedToolCount } from "../../lib/dashboard-helpers";
import type { HeroProps } from "../../types/dashboard-widget";

/**
 * Editorial display-italic wordmark for the Dashboard. Mirrors the
 * prototype's "You can reclaim <em>87.6 GB</em> across 12 categories"
 * hero line. The big italic-accent number animates in via the
 * NumDisplay count-up. Environment detection summary appears beneath.
 */
export default function Hero({ env, totalBytes, categoryCount }: HeroProps) {
  const gib = bytesToGiB(totalBytes);
  const envSummary =
    env === null
      ? "Detecting your environment…"
      : `${detectedToolCount(env)} of 7 tools detected · build ${env.windows_build ?? "—"}`;

  return (
    <motion.section
      variants={fadeUp}
      className="mb-10 flex flex-col gap-3"
      aria-label="Dashboard hero"
    >
      <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-muted">
        Dashboard
      </p>
      <h2 className="font-display text-[44px] leading-[1.05] m-0 max-w-[760px] text-ink">
        You can reclaim{" "}
        <em className="font-display italic text-accent">
          <NumDisplay
            value={gib}
            unit="GB"
            animate
            fractionDigits={1}
            className="font-display italic text-accent"
          />
        </em>{" "}
        across {categoryCount} categor{categoryCount === 1 ? "y" : "ies"}.
      </h2>
      <p className="text-[12px] text-ink-muted m-0">{envSummary}</p>
    </motion.section>
  );
}
