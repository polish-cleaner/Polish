import { motion } from "framer-motion";
import Card from "../ui/Card";
import Dot from "../ui/Dot";
import { fadeUp } from "../../lib/motion";
import { envFlags } from "../../lib/dashboard-helpers";
import type { EnvironmentTileProps } from "../../types/dashboard-widget";

/**
 * Grid of small detection tiles — one per dev tool / browser the
 * Polish scanner asks about. Each tile shows the friendly label and a
 * coloured `Dot` (good = detected, danger = missing). Drives the
 * scanner-coverage trust signal in the Dashboard.
 */
export default function EnvironmentTile({ env }: EnvironmentTileProps) {
  const flags = envFlags(env);

  return (
    <motion.div variants={fadeUp}>
      <Card className="p-7 flex flex-col gap-4">
        <header className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-ink-muted">
            Scanner coverage
          </span>
          <span className="font-mono text-[11px] text-ink-soft">
            {flags.filter((f) => f.detected).length} / {flags.length}
          </span>
        </header>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 m-0 p-0 list-none">
          {flags.map((flag) => (
            <li
              key={flag.id}
              className="flex items-center gap-2 text-[13px] text-ink-soft"
            >
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
