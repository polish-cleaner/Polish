import { motion } from "framer-motion";
import Card from "../ui/Card";
import Dot from "../ui/Dot";
import { fadeUp } from "../../lib/motion";
import { envFlags } from "../../lib/dashboard-helpers";
import type { EnvironmentTileProps } from "../../types/dashboard-widget";

const CARD_CLASS = "p-[22px] flex flex-col gap-[14px]";
const HEADER_CLASS = "flex items-baseline justify-between";
const HEADER_TITLE_CLASS =
  "font-medium text-[10.5px] tracking-[0.12em] uppercase text-ink-muted";
const HEADER_COUNT_CLASS = "font-mono text-[11px] text-ink-soft";
const ROW_CLASS = "flex items-center gap-2 text-[13px] text-ink-soft";

/**
 * Grid of small detection tiles — one per dev tool / browser the
 * Polish scanner asks about. Each tile shows the friendly label and a
 * coloured `Dot` (good = detected, danger = missing). Drives the
 * scanner-coverage trust signal in the Dashboard. Padding and
 * spacing match the prototype's chart-card rhythm.
 */
export default function EnvironmentTile({ env }: EnvironmentTileProps) {
  const flags = envFlags(env);
  const detected = flags.filter((f) => f.detected).length;
  return (
    <motion.div variants={fadeUp}>
      <Card className={CARD_CLASS}>
        <header className={HEADER_CLASS}>
          <span className={HEADER_TITLE_CLASS}>Scanner coverage</span>
          <span className={HEADER_COUNT_CLASS}>
            {detected} / {flags.length}
          </span>
        </header>
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-[10px] m-0 p-0 list-none">
          {flags.map((flag) => (
            <li key={flag.id} className={ROW_CLASS}>
              <Dot variant={flag.detected ? "good" : "danger"} />
              <span>{flag.label}</span>
              <span className="ml-auto font-mono text-[11px] text-ink-muted">
                {flag.detected ? "detected" : "missing"}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </motion.div>
  );
}
