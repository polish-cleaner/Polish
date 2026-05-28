import type { Environment } from "../types/environment";
import type { Finding } from "../types/finding";
import type { DonutSegment } from "../types/charts";
import { labelForCategory } from "./fixtures/dashboard";
import { groupByCategory } from "./format";

/** Number of "true" flags in a detected environment. */
export function detectedToolCount(env: Environment): number {
  return [
    env.has_npm,
    env.has_pnpm,
    env.has_cargo,
    env.has_wsl,
    env.has_chrome,
    env.has_edge,
    env.has_firefox,
  ].filter(Boolean).length;
}

/**
 * Map of OS / dev tool labels and their detection booleans, in the
 * order the EnvironmentTile grid renders them. Lives in `lib/` so the
 * EnvironmentTile component file stays JSX-only (Rule 4).
 */
export interface EnvFlag {
  id: string;
  label: string;
  detected: boolean;
}

export function envFlags(env: Environment | null): EnvFlag[] {
  return [
    { id: "npm",     label: "npm",     detected: env?.has_npm ?? false },
    { id: "pnpm",    label: "pnpm",    detected: env?.has_pnpm ?? false },
    { id: "cargo",   label: "cargo",   detected: env?.has_cargo ?? false },
    { id: "wsl",     label: "WSL",     detected: env?.has_wsl ?? false },
    { id: "chrome",  label: "Chrome",  detected: env?.has_chrome ?? false },
    { id: "edge",    label: "Edge",    detected: env?.has_edge ?? false },
    { id: "firefox", label: "Firefox", detected: env?.has_firefox ?? false },
  ];
}

/**
 * Deterministic palette for the donut segments. The same category id
 * always lands on the same colour so the chart is comparable across
 * sessions. Mirrors the prototype's "safety tier" palette but lifted
 * into the design-token CSS-var space.
 */
const SEGMENT_PALETTE = [
  "var(--accent)",
  "var(--accent-deep)",
  "var(--status-good)",
  "var(--status-info)",
  "var(--status-warn)",
  "var(--ink-soft)",
  "var(--ink-muted)",
  "var(--accent-hover)",
];

/**
 * Convert a Finding list to the donut chart's segment shape: one
 * segment per top-N category, with a final "Other" pooling smaller
 * tails. Output is sorted by bytes descending (largest slice first).
 */
export function findingsToDonut(
  findings: ReadonlyArray<Finding>,
  topN = 7,
): DonutSegment[] {
  const groups = groupByCategory(findings as Finding[]);
  if (groups.length === 0) return [];

  const head = groups.slice(0, topN);
  const tail = groups.slice(topN);
  const segments: DonutSegment[] = head.map((g, i) => ({
    id: g.id,
    label: labelForCategory(g.id),
    value: g.size,
    color: SEGMENT_PALETTE[i % SEGMENT_PALETTE.length],
  }));
  if (tail.length > 0) {
    const otherBytes = tail.reduce((s, g) => s + g.size, 0);
    if (otherBytes > 0) {
      segments.push({
        id: "__other",
        label: "Other",
        value: otherBytes,
        color: "var(--ink-faint)",
      });
    }
  }
  return segments;
}
