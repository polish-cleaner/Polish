import type { Finding } from "../types/finding";
import type { CategoryGroup } from "../types/category-group";

const BYTES_PER_KIB = 1024;
const BYTES_PER_MIB = 1024 * 1024;
const BYTES_PER_GIB = 1024 * 1024 * 1024;
const BYTES_PER_TIB = 1024 * 1024 * 1024 * 1024;

export function formatMiB(bytes: number): string {
  return (bytes / BYTES_PER_MIB).toFixed(2) + " MiB";
}

/**
 * Smart byte formatter that returns the value and the unit separately
 * so the Dashboard can render the unit in a smaller, muted style
 * beside the big mono number. Mirrors the prototype's `fmtBytes`.
 */
export function smartBytes(
  n: number,
  fractionDigits = 1,
): { num: string; unit: string } {
  if (n >= BYTES_PER_TIB) {
    return { num: (n / BYTES_PER_TIB).toFixed(fractionDigits), unit: "TB" };
  }
  if (n >= BYTES_PER_GIB) {
    return { num: (n / BYTES_PER_GIB).toFixed(fractionDigits), unit: "GB" };
  }
  if (n >= BYTES_PER_MIB) {
    return { num: (n / BYTES_PER_MIB).toFixed(fractionDigits), unit: "MB" };
  }
  if (n >= BYTES_PER_KIB) {
    return { num: (n / BYTES_PER_KIB).toFixed(fractionDigits), unit: "KB" };
  }
  return { num: String(Math.round(n)), unit: "B" };
}

/** Numeric GiB rounded — useful for the count-up animation. */
export function bytesToGiB(n: number, fractionDigits = 1): number {
  return Number((n / BYTES_PER_GIB).toFixed(fractionDigits));
}

export function groupByCategory(findings: Finding[]): CategoryGroup[] {
  const groups = new Map<string, { count: number; size: number }>();
  for (const f of findings) {
    const g = groups.get(f.category_id) ?? { count: 0, size: 0 };
    g.count += 1;
    g.size += f.size;
    groups.set(f.category_id, g);
  }
  return Array.from(groups.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.size - a.size);
}

export function totalBytes(findings: Finding[]): number {
  return findings.reduce((sum, f) => sum + f.size, 0);
}
