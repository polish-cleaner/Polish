import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import type { Finding } from "../types/finding";
import type { UseScanResult } from "../types/use-scan";
import { scan } from "../lib/commands";

/**
 * Canonical TanStack Query mutation around `scan()` IPC call. Scans
 * are user-triggered, not cached — mutation semantics fit best per
 * AGENTS.md Rule 8.
 */
export function useScanMutation() {
  return useMutation<Finding[], Error>({ mutationFn: scan });
}

/**
 * Legacy `{ findings, scanning, error, runScan }` adapter so Phase-3
 * callers (Home.tsx) keep compiling. Internally drives the mutation.
 *
 * @deprecated Use `useScanMutation()` directly in new code.
 */
export function useScan(): UseScanResult {
  const mutation = useScanMutation();
  const runScan = useCallback(async (): Promise<void> => {
    try {
      await mutation.mutateAsync();
    } catch {
      // Error is captured on `mutation.error`; swallow so the caller's
      // legacy contract (Promise<void> never rejects) is preserved.
    }
  }, [mutation]);
  return {
    findings: mutation.data ?? null,
    scanning: mutation.isPending,
    error: mutation.error ? String(mutation.error.message ?? mutation.error) : null,
    runScan,
  };
}
