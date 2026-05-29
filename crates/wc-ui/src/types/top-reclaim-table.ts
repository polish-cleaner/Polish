/**
 * TopReclaimTable widget — small table of the top reclaimable
 * categories. One row per category, sorted by size desc.
 */
export interface ReclaimTableRow {
  id: string;
  category: string;
  files: number;
  bytes: number;
  /** Last-seen relative string e.g. "14m ago" or "—". */
  last_seen?: string;
}

export interface TopReclaimTableProps {
  rows: ReadonlyArray<ReclaimTableRow>;
}
