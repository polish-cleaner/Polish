import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Card from "../ui/Card";
import NumDisplay from "../ui/NumDisplay";
import { fadeUp } from "../../lib/motion";
import { bytesToGiB } from "../../lib/format";
import type { QuarantineSummaryProps } from "../../types/quarantine-summary";

const CARD_CLASS = "p-[22px] flex flex-col gap-[14px] h-full";
const HEADER_CLASS = "flex items-baseline justify-between";
const HEADER_TITLE_CLASS =
  "font-medium text-[10.5px] tracking-[0.12em] uppercase text-ink-muted";
const VALUE_ROW_CLASS = "flex items-baseline gap-[10px]";
const SUB_CLASS = "text-[12px] text-ink-muted";
const ACTIONS_CLASS =
  "mt-auto pt-[14px] border-t border-line-soft flex gap-2";

/**
 * Quarantine summary card — count of bundles + total restorable
 * size + Browse / Restore actions. Mirrors prototype dashboard.jsx
 * "Quarantine summary card" block.
 */
export default function QuarantineSummary({
  bundle_count,
  total_bytes,
  days_until_purge,
  onOpen,
  onRestoreLast,
}: QuarantineSummaryProps) {
  const gib = bytesToGiB(total_bytes);
  const sub =
    days_until_purge !== undefined
      ? `${bundle_count} runs · purge in ${days_until_purge}d`
      : `${bundle_count} runs`;
  return (
    <motion.div variants={fadeUp}>
      <Card className={CARD_CLASS}>
        <header className={HEADER_CLASS}>
          <span className={HEADER_TITLE_CLASS}>Quarantine</span>
          <Badge>{bundle_count} runs</Badge>
        </header>
        <div className={VALUE_ROW_CLASS}>
          <NumDisplay
            value={gib}
            unit="GB"
            animate
            fractionDigits={1}
            className="text-[30px] text-ink"
          />
          <span className={SUB_CLASS}>restorable on D:\</span>
        </div>
        <p className={`${SUB_CLASS} m-0`}>{sub}</p>
        <div className={ACTIONS_CLASS}>
          <Button variant="secondary" size="sm" onClick={onOpen}>
            Open quarantine
          </Button>
          {onRestoreLast && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRestoreLast}
              leading={<RotateCcw size={13} aria-hidden="true" />}
            >
              Restore last
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
