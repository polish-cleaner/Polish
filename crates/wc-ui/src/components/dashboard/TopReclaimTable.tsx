import { motion } from "framer-motion";
import Card from "../ui/Card";
import NumDisplay from "../ui/NumDisplay";
import { fadeUp } from "../../lib/motion";
import { smartBytes } from "../../lib/format";
import type { TopReclaimTableProps } from "../../types/top-reclaim-table";

const CARD_CLASS = "overflow-hidden";
const TABLE_CLASS = "w-full border-collapse";
const HEADER_TITLE_CLASS =
  "font-medium text-[10.5px] tracking-[0.12em] uppercase text-ink-muted";
const HEADER_SUB_CLASS = "text-[11.5px] text-ink-muted";
const SECTION_HEADER_CLASS =
  "flex items-baseline justify-between px-[20px] py-[14px] border-b border-line";
const CELL_CLASS = "px-[20px] py-[12px] text-[13px] text-ink";
const HEAD_CELL_CLASS =
  "px-[20px] py-[10px] text-left text-[10.5px] uppercase tracking-[0.12em] text-ink-muted font-medium bg-surface-warm border-b border-line-soft";
const ROW_CLASS =
  "border-t border-line-soft transition-colors hover:bg-surface-warm";
const NUM_CELL_CLASS = "text-right font-mono";

/**
 * Compact table of the top reclaimable categories. Surface card,
 * hairline row dividers, mono numbers right-aligned, ~6 rows.
 * Header row uses the .label small-caps style. Sorted by bytes
 * desc by the caller (see `findingsToTableRows`).
 */
export default function TopReclaimTable({ rows }: TopReclaimTableProps) {
  return (
    <motion.div variants={fadeUp}>
      <Card className={CARD_CLASS}>
        <header className={SECTION_HEADER_CLASS}>
          <span className={HEADER_TITLE_CLASS}>Top reclaim opportunities</span>
          <span className={HEADER_SUB_CLASS}>Sorted by size · top {rows.length}</span>
        </header>
        {rows.length === 0 ? (
          <p className="px-[20px] py-[16px] text-[12px] text-ink-muted m-0">
            No reclaimable categories yet — run a scan to populate this list.
          </p>
        ) : (
          <table className={TABLE_CLASS}>
            <thead>
              <tr>
                <th className={HEAD_CELL_CLASS}>Category</th>
                <th className={`${HEAD_CELL_CLASS} text-right`}>Files</th>
                <th className={`${HEAD_CELL_CLASS} text-right`}>Size</th>
                <th className={`${HEAD_CELL_CLASS} text-right`}>Last seen</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const fmt = smartBytes(row.bytes);
                return (
                  <tr key={row.id} className={ROW_CLASS}>
                    <td className={CELL_CLASS}>{row.category}</td>
                    <td className={`${CELL_CLASS} ${NUM_CELL_CLASS}`}>
                      {row.files.toLocaleString()}
                    </td>
                    <td className={`${CELL_CLASS} ${NUM_CELL_CLASS}`}>
                      <NumDisplay
                        value={fmt.num}
                        unit={fmt.unit}
                        className="text-[13px] text-ink"
                      />
                    </td>
                    <td
                      className={`${CELL_CLASS} ${NUM_CELL_CLASS} text-ink-muted text-[11.5px]`}
                    >
                      {row.last_seen ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </motion.div>
  );
}
