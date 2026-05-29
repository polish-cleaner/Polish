import { motion } from "framer-motion";
import { ArrowRight, Rocket } from "lucide-react";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import { fadeUp } from "../../lib/motion";
import type { FormatPrepCtaProps } from "../../types/format-prep-cta";

const CARD_CLASS =
  "p-[22px] flex flex-col gap-[10px] h-full bg-ink text-surface border-ink";
const HEADER_CLASS = "flex items-center gap-2";
const KICKER_CLASS =
  "text-[11px] uppercase tracking-[0.1em] text-ink-faint font-medium";
const HEADLINE_CLASS =
  "font-display italic text-[26px] leading-[1.15] m-0 text-surface";
const COPY_CLASS =
  "text-[12.5px] text-ink-faint m-0 leading-[1.55]";
const CTA_CLASS =
  "mt-auto pt-[10px] inline-flex items-center gap-1 text-[12px] font-medium text-surface hover:underline";

/**
 * Dark "Prepare for format" CTA card. Mirrors the prototype's
 * dashboard.jsx format-prep card — small lucide rocket + small-caps
 * kicker + Pro badge + Instrument-Serif italic headline + body copy
 * + button-styled link routing to the Format Prep wizard.
 */
export default function FormatPrepCta({ onStart }: FormatPrepCtaProps) {
  return (
    <motion.div variants={fadeUp}>
      <Card className={CARD_CLASS}>
        <header className={HEADER_CLASS}>
          <Rocket size={14} className="text-surface" aria-hidden="true" />
          <span className={KICKER_CLASS}>Prepare for format</span>
          <Badge variant="pro" className="ml-auto bg-surface text-ink">
            Pro
          </Badge>
        </header>
        <p className={HEADLINE_CLASS}>Don&rsquo;t lose anything.</p>
        <p className={COPY_CLASS}>
          Inventory, back up, verify, generate a restore plan — then format
          with confidence.
        </p>
        <button type="button" onClick={onStart} className={CTA_CLASS}>
          Start the wizard <ArrowRight size={12} aria-hidden="true" />
        </button>
      </Card>
    </motion.div>
  );
}
