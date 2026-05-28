import type { Finding } from "../../types/finding";
import type { Environment } from "../../types/environment";

/**
 * "Mid-life PC" fixture scenario ported from the prototype
 * `.vskill-data/Polish-prototype/src/data.jsx`. Used by the Dashboard
 * when the user selects the "Preview design" segmented control — lets
 * the editorial layout render with realistic numbers even when no
 * scan has actually run (or no Tauri host is present).
 *
 * Each `Finding` row represents a synthetic average-size file inside
 * the category; `count` × `avgSize` reproduces the prototype's
 * gigabyte totals. We materialise them as individual `Finding` rows so
 * the existing `groupByCategory`/`totalBytes` helpers work unchanged.
 */

const GIB = 1024 * 1024 * 1024;

interface CategorySeed {
  id: string;
  count: number;
  totalBytes: number;
}

// Mirrors the prototype CATEGORIES table — id → category-id used by
// the Dashboard widgets. We collapse the prototype's labelled buckets
// down to the Polish category-id taxonomy used by the Rust scanner.
const SEEDS: CategorySeed[] = [
  { id: "windows.recycle_bin",          count: 1247, totalBytes:  1.8 * GIB },
  { id: "windows.temp",                 count: 4821, totalBytes:  4.2 * GIB },
  { id: "browser.chrome.cache",         count:  924, totalBytes:  1.4 * GIB },
  { id: "browser.edge.cache",           count:  612, totalBytes:  0.6 * GIB },
  { id: "windows.update_cache",         count:  342, totalBytes:  2.1 * GIB },
  { id: "windows.crash_dumps",          count:    3, totalBytes:  0.5 * GIB },
  { id: "windows.thumbnails",           count:  268, totalBytes: 0.18 * GIB },
  { id: "dev.npm.cache",                count: 2103, totalBytes:  2.6 * GIB },
  { id: "dev.pnpm.store",               count: 3284, totalBytes:  8.4 * GIB },
  { id: "dev.cargo.cache",              count: 1968, totalBytes:  3.1 * GIB },
  { id: "dev.vite.cache",               count:  742, totalBytes:  1.9 * GIB },
  { id: "app.slack.cache",              count:  411, totalBytes:  0.9 * GIB },
  { id: "app.spotify.cache",            count:  812, totalBytes:  2.3 * GIB },
  { id: "app.teams.cache",              count:  221, totalBytes:  0.7 * GIB },
];

function expand(seed: CategorySeed): Finding[] {
  const avg = Math.max(1, Math.floor(seed.totalBytes / seed.count));
  const out: Finding[] = [];
  for (let i = 0; i < seed.count; i += 1) {
    out.push({
      path: `C:\\Polish\\preview\\${seed.id}\\f_${i.toString(16).padStart(5, "0")}`,
      size: avg,
      category_id: seed.id,
    });
  }
  return out;
}

export const MIDLIFE_FINDINGS: Finding[] = SEEDS.flatMap(expand);

export const MIDLIFE_ENVIRONMENT: Environment = {
  has_npm: true,
  has_pnpm: true,
  has_cargo: true,
  has_wsl: true,
  has_chrome: true,
  has_edge: true,
  has_firefox: false,
  windows_build: 26200,
};

/**
 * Friendly labels for the category-id namespace. Sourced from the
 * prototype `CATEGORIES` table. Missing entries default-format from
 * the id (e.g. "dev.unknown.cache" → "dev unknown cache").
 */
export const CATEGORY_LABELS: Record<string, string> = {
  "windows.recycle_bin":      "Recycle Bin",
  "windows.temp":             "System temp files",
  "windows.update_cache":     "Windows Update cache",
  "windows.crash_dumps":      "Crash dumps + WER queue",
  "windows.thumbnails":       "Thumbnail cache",
  "browser.chrome.cache":     "Chrome cache",
  "browser.edge.cache":       "Edge cache",
  "browser.firefox.cache":    "Firefox cache",
  "dev.npm.cache":            "npm cache",
  "dev.pnpm.store":           "pnpm store",
  "dev.cargo.cache":          "Cargo registry + git",
  "dev.vite.cache":           "Vite / Next.js caches",
  "app.slack.cache":          "Slack cache",
  "app.spotify.cache":        "Spotify cache",
  "app.discord.cache":        "Discord cache",
  "app.teams.cache":          "Teams cache",
};

/** Friendly label for a category id, with a deterministic fallback. */
export function labelForCategory(id: string): string {
  return CATEGORY_LABELS[id] ?? id.replace(/[._]/g, " ");
}

/**
 * Synthetic 12-week reclaim trend used by the RecoveryTrend chart
 * while Polish lacks real history. Values in bytes. Zeros mean no
 * cleanup that week.
 */
export const MIDLIFE_TREND: { day: string; bytes: number }[] = [
  { day: "Mar 02", bytes: 0 },
  { day: "Mar 09", bytes:  8.2 * GIB },
  { day: "Mar 16", bytes: 0 },
  { day: "Mar 23", bytes:  3.1 * GIB },
  { day: "Mar 30", bytes: 11.4 * GIB },
  { day: "Apr 06", bytes: 0 },
  { day: "Apr 13", bytes:  6.0 * GIB },
  { day: "Apr 20", bytes:  4.8 * GIB },
  { day: "Apr 27", bytes: 22.1 * GIB },
  { day: "May 04", bytes: 0 },
  { day: "May 11", bytes: 22.1 * GIB },
  { day: "May 25", bytes: 14.2 * GIB },
];
