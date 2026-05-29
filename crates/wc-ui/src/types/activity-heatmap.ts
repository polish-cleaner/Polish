/**
 * ActivityHeatmap widget — 30-day grid of squares colored by scan
 * activity intensity. Mirrors prototype DayGrid.
 */
export interface ActivityCell {
  /** Display date (e.g. "May 12"). */
  date: string;
  /** Bytes found that day; 0 = scanned-but-clean. */
  bytes: number;
  /** Whether the day was scanned at all (false = no data). */
  scanned: boolean;
}

export interface HeatmapBucket {
  date: string;
  bytes: number;
  scanned: boolean;
  /** 0-4 intensity bucket — 0 = empty, 4 = peak. */
  intensity: 0 | 1 | 2 | 3 | 4;
}

export interface ActivityHeatmapProps {
  cells: ReadonlyArray<ActivityCell>;
  /** Optional "(preview data)" micro-tag below the title. */
  previewTag?: boolean;
}
