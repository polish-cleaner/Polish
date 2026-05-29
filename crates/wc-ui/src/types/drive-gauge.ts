/**
 * DriveGauge widget — one row per drive showing label + used/total
 * capsule. Mirrors prototype DiskGauge.
 */
export type DriveStatus = "ok" | "warn" | "danger";

export interface DriveRow {
  id: string;
  /** Mount label, e.g. "C:". */
  label: string;
  /** Friendly drive name, e.g. "Windows". */
  name: string;
  /** Used bytes. */
  used_bytes: number;
  /** Total capacity in bytes. */
  total_bytes: number;
}

export interface DriveGaugeProps {
  drives: ReadonlyArray<DriveRow>;
  /** Optional "(preview data)" micro-tag below the title. */
  previewTag?: boolean;
}
