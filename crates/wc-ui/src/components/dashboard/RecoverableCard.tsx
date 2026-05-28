import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Card from "../ui/Card";
import NumDisplay from "../ui/NumDisplay";
import { fadeUp } from "../../lib/motion";
import { bytesToGiB, smartBytes } from "../../lib/format";
import { findingsToDonut } from "../../lib/dashboard-helpers";
import type { RecoverableCardProps } from "../../types/dashboard-widget";

const TOP_CHIPS = 4;

/**
 * Hero card. Big mono count-up number, breakdown chips for the top
 * categories, and the two primary CTA buttons. Mirrors the prototype's
 * "recoverable total" widget but rebuilt entirely in Tailwind utilities
 * sourced from design tokens.
 */
export default function RecoverableCard({
  totalBytes,
  findings,
  onOpenClean,
  onRunLight,
}: RecoverableCardProps) {
  const headline = bytesToGiB(totalBytes);
  const chips = findingsToDonut(findings).slice(0, TOP_CHIPS);

  return (
    <motion.div variants={fadeUp}>
      <Card className="p-7 flex flex-col gap-6">
        <div className="flex items-baseline gap-3">
          <Sparkles size={14} className="text-accent" aria-hidden="true" />
          <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-ink-muted">
            Recoverable now
          </span>
        </div>
        <NumDisplay
          value={headline}
          unit="GB"
          animate
          fractionDigits={1}
          className="text-[44px] text-ink"
        />
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => {
              const fmt = smartBytes(c.value);
              return (
                <Badge key={c.id} variant="default">
                  <span className="text-ink-soft">{c.label}</span>
                  <span className="font-mono text-ink ml-2">
                    {fmt.num}
                    <span className="text-ink-muted ml-[2px]">{fmt.unit}</span>
                  </span>
                </Badge>
              );
            })}
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            onClick={onRunLight}
            trailing={<ArrowRight size={13} aria-hidden="true" />}
          >
            Run Light cleanup
          </Button>
          <Button variant="ghost" onClick={onOpenClean}>
            Open Clean wizard
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
