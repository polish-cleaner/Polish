import type { Finding } from "../../types/finding";
import type { Environment } from "../../types/environment";
import type { OpportunityRow } from "../../types/largest-opportunities";
import type { ActivityCell } from "../../types/activity-heatmap";
import type { DriveRow } from "../../types/drive-gauge";
import type { ReclaimTableRow } from "../../types/top-reclaim-table";

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

/** KPI band scenario numbers — prototype mid-life PC at 14m ago. */
export const MIDLIFE_KPIS = {
  reclaimable_bytes: 41.8 * GIB,
  drive_free_bytes: 4.0 * GIB,
  drive_total_bytes: 375 * GIB,
  quarantine_bytes: 43.1 * GIB,
  freed_90d_bytes: 91.9 * GIB,
  category_count: 12,
  cleans_count: 8,
} as const;

/** Top opportunities — sorted desc, top 6 from the prototype CATEGORIES table. */
export const MIDLIFE_OPPORTUNITIES: OpportunityRow[] = [
  { id: "ai.lmstudio.models",   label: "LM Studio cached models",  bytes: 23.7 * GIB },
  { id: "app.docker.unused",    label: "Docker unused images",     bytes: 12.1 * GIB },
  { id: "windows.system.old",   label: "Windows.old",              bytes: 11.4 * GIB },
  { id: "dev.pnpm.store",       label: "pnpm store",               bytes:  8.4 * GIB },
  { id: "windows.dism.super",   label: "Superseded components",    bytes:  6.8 * GIB },
  { id: "windows.temp",         label: "System temp files",        bytes:  4.2 * GIB },
];

/** 30-day scan activity — deterministic pattern from prototype DAY_ACTIVITY. */
export const MIDLIFE_ACTIVITY: ActivityCell[] = (() => {
  const findings = [
    0,    0.4,  0,   2.1, 0,   0,   1.8,
    0.6,  0,    3.2, 0,   1.1, 0,   0,
    14.0, 0,    0.8, 0,   2.3, 0,   1.4,
    0,    6.0,  0,   1.0, 0,   3.5, 41.8, null, null,
  ];
  const out: ActivityCell[] = [];
  for (let i = 0; i < 30; i += 1) {
    const v = findings[i];
    out.push({
      date: `May ${i + 1}`,
      bytes: v === null ? 0 : (v as number) * GIB,
      scanned: v !== null,
    });
  }
  return out;
})();

/** Drives — prototype DRIVES table (system + work + media). */
export const MIDLIFE_DRIVES: DriveRow[] = [
  { id: "C", label: "C:", name: "Windows", used_bytes: 371 * GIB, total_bytes: 375 * GIB },
  { id: "D", label: "D:", name: "Work",    used_bytes:  29 * GIB, total_bytes:  99 * GIB },
];

/** Top reclaim rows — drives the TopReclaimTable preview render. */
export const MIDLIFE_TABLE_ROWS: ReclaimTableRow[] = [
  { id: "ai.lmstudio.models",  category: "LM Studio cached models", files:    4, bytes: 23.7 * GIB, last_seen: "14m ago" },
  { id: "app.docker.unused",   category: "Docker unused images",    files:  412, bytes: 12.1 * GIB, last_seen: "14m ago" },
  { id: "windows.system.old",  category: "Windows.old",             files:    1, bytes: 11.4 * GIB, last_seen: "14m ago" },
  { id: "dev.pnpm.store",      category: "pnpm store",              files: 3284, bytes:  8.4 * GIB, last_seen: "14m ago" },
  { id: "windows.dism.super",  category: "Superseded components",   files:   42, bytes:  6.8 * GIB, last_seen: "14m ago" },
  { id: "windows.temp",        category: "System temp files",       files: 4821, bytes:  4.2 * GIB, last_seen: "14m ago" },
];

/** Quarantine snapshot — count of bundles + total restorable size. */
export const MIDLIFE_QUARANTINE = {
  bundle_count: 3,
  total_bytes: 43.1 * GIB,
  days_until_purge: 4,
} as const;
