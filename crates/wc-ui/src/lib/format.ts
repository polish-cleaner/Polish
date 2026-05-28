import type { Finding } from "../types/finding";
import type { CategoryGroup } from "../types/category-group";

const BYTES_PER_MIB = 1_048_576;

export function formatMiB(bytes: number): string {
  return (bytes / BYTES_PER_MIB).toFixed(2) + " MiB";
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
