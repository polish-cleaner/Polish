import clsx from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Canonical class-name composer for Polish atoms.
 *
 * Combines `clsx` (conditional joining) with `tailwind-merge` (last-write-wins
 * conflict resolution between Tailwind utilities). Standard shadcn helper —
 * every atom in `components/ui/` funnels its `className` prop through here.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
