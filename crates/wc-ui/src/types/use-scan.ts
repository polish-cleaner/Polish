import type { Finding } from "./finding";

/**
 * Legacy {findings,scanning,error,runScan} adapter shape returned by
 * the Phase-3 `useScan()` shim. Phase 5 retires this in favour of the
 * `useScanMutation()` mutation result directly.
 */
export interface UseScanResult {
  findings: Finding[] | null;
  scanning: boolean;
  error: string | null;
  runScan: () => Promise<void>;
}
