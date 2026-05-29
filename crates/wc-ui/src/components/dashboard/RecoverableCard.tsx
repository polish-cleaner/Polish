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
const CARD_CLASS = "p-[22px] flex flex-col gap-4";
const HEADER_CLASS = "flex items-center gap-2";
const LABEL_CLASS =
  "font-mono text-[10.5px] tracking-[0.12em] uppercase text-ink-muted font-medium";
const CHIP_LABEL_CLASS = "text-ink-soft";
const CHIP_VALUE_CLASS = "font-mono text-ink ml-2";
const CHIP_UNIT_CLASS = "text-ink-muted ml-[2px]";
const ACTIONS_CLASS = "flex flex-wrap gap-2 mt-1";

/**
 * KPI-styled "Reclaimable now" card. Mirrors the prototype's
 * primary KPI tile: tiny icon + small-caps label header, big mono
 * count-up number with smaller muted unit, breakdown chips for the
 * top categories, and the two primary action buttons. Padding,
 * type sizes, and gaps match Polish.html `.card` + `.label` +
 * `.num-display` design tokens exactly.
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
      <Card className={CARD_CLASS}>
        <header className={HEADER_CLASS}>
          <Sparkles size={13} className="text-accent" aria-hidden="true" />
          <span className={LABEL_CLASS}>Recoverable now</span>
        </header>
        <NumDisplay
          value={headline}
          unit="GB"
          animate
          fractionDigits={1}
          className="text-[30px] text-ink"
        />
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => {
              const fmt = smartBytes(c.value);
              return (
                <Badge key={c.id} variant="default">
                  <span className={CHIP_LABEL_CLASS}>{c.label}</span>
                  <span className={CHIP_VALUE_CLASS}>
                    {fmt.num}
                    <span className={CHIP_UNIT_CLASS}>{fmt.unit}</span>
                  </span>
                </Badge>
              );
            })}
          </div>
        )}
        <div className={ACTIONS_CLASS}>
          <Button
            variant="primary"
            size="sm"
            onClick={onRunLight}
            trailing={<ArrowRight size={12} aria-hidden="true" />}
          >
            Run Light cleanup
          </Button>
          <Button variant="ghost" size="sm" onClick={onOpenClean}>
            Open Clean wizard
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
