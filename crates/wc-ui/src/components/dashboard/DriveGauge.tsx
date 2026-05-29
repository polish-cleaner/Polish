import { motion } from "framer-motion";
import Card from "../ui/Card";
import NumDisplay from "../ui/NumDisplay";
import { DURATION_SLOW, EASE_OUT, fadeUp } from "../../lib/motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { driveStatus } from "../../lib/dashboard-helpers";
import { smartBytes } from "../../lib/format";
import type { DriveGaugeProps, DriveStatus } from "../../types/drive-gauge";

const CARD_CLASS = "px-[22px] py-[14px] flex flex-col h-full";
const HEADER_CLASS =
  "flex items-baseline justify-between mb-2";
const HEADER_TITLE_CLASS =
  "font-medium text-[10.5px] tracking-[0.12em] uppercase text-ink-muted";
const HEADER_NOTE_CLASS = "text-[11.5px] text-ink-muted";
const ROW_CLASS = "flex items-center gap-[14px] py-[6px]";
const LABEL_CELL_CLASS =
  "flex items-baseline gap-[6px] w-[80px] shrink-0";
const TRACK_CLASS =
  "flex-1 min-w-[80px] h-[8px] bg-surface-sunken rounded-pill overflow-hidden border border-line-soft";
const VALUE_CELL_CLASS =
  "flex items-baseline gap-1 shrink-0 min-w-[110px] justify-end";
const DIVIDER_CLASS = "h-[1px] bg-line-soft my-[4px]";
const PREVIEW_TAG_CLASS = "text-[11px] text-ink-muted ml-2";

const STATUS_BG: Record<DriveStatus, string> = {
  ok: "var(--accent)",
  warn: "var(--status-warn)",
  danger: "var(--status-danger)",
};

const STATUS_NOTE: Record<DriveStatus, string> = {
  ok: "text-ink-muted",
  warn: "text-status-warn",
  danger: "text-status-danger",
};

/**
 * "All drives" card — one row per drive showing the mount label,
 * a horizontal capacity capsule colored by status, and a mono
 * "used / total" pair. Capsule width animates from 0 → pct over
 * DURATION_SLOW. Mirrors the prototype DiskGauge widget; the
 * brief calls this a "DriveGauge" radial but the prototype is a
 * linear capsule and the prototype is the visual truth source.
 */
export default function DriveGauge({ drives, previewTag }: DriveGaugeProps) {
  const reduced = usePrefersReducedMotion();
  const duration = reduced ? 0 : DURATION_SLOW;
  const headline = drives[0]
    ? driveStatus(drives[0].used_bytes, drives[0].total_bytes)
    : "ok";
  const headlinePct = drives[0]
    ? Math.round((drives[0].used_bytes / drives[0].total_bytes) * 100)
    : 0;
  return (
    <motion.div variants={fadeUp}>
      <Card className={CARD_CLASS}>
        <header className={HEADER_CLASS}>
          <span className={HEADER_TITLE_CLASS}>
            All drives
            {previewTag && (
              <span className={PREVIEW_TAG_CLASS}>(preview data)</span>
            )}
          </span>
          {drives[0] && (
            <span className={HEADER_NOTE_CLASS}>
              {drives[0].label}{" "}
              <span className={STATUS_NOTE[headline]}>
                {headlinePct}% full
              </span>
            </span>
          )}
        </header>
        {drives.map((drive, i) => {
          const status = driveStatus(drive.used_bytes, drive.total_bytes);
          const pct =
            drive.total_bytes > 0
              ? (drive.used_bytes / drive.total_bytes) * 100
              : 0;
          const usedFmt = smartBytes(drive.used_bytes);
          const totalFmt = smartBytes(drive.total_bytes);
          return (
            <div key={drive.id}>
              {i > 0 && <div className={DIVIDER_CLASS} aria-hidden="true" />}
              <div
                className={ROW_CLASS}
                role="group"
                aria-label={`${drive.label} ${drive.name} ${usedFmt.num} ${usedFmt.unit} of ${totalFmt.num} ${totalFmt.unit}`}
              >
                <div className={LABEL_CELL_CLASS}>
                  <span className="font-mono text-[15px] font-medium text-ink">
                    {drive.label}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    {drive.name}
                  </span>
                </div>
                <div className={TRACK_CLASS}>
                  <motion.div
                    className="h-full rounded-pill"
                    style={{ background: STATUS_BG[status] }}
                    initial={reduced ? false : { width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration, ease: EASE_OUT }}
                  />
                </div>
                <div className={VALUE_CELL_CLASS}>
                  <NumDisplay
                    value={usedFmt.num}
                    unit={usedFmt.unit}
                    className="text-[13px] text-ink font-medium"
                  />
                  <span className="text-ink-faint text-[11px] mx-[2px]">/</span>
                  <NumDisplay
                    value={totalFmt.num}
                    unit={totalFmt.unit}
                    className="text-[12px] text-ink-muted"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </Card>
    </motion.div>
  );
}
