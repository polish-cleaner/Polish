import { useQuery } from "@tanstack/react-query";
import type { Environment } from "../types/environment";
import type { UseEnvironmentResult } from "../types/use-environment";
import { detectEnv } from "../lib/commands";

/**
 * Canonical TanStack Query wrapper around `detectEnv()` IPC call.
 * Per AGENTS.md Rule 8 this is the locked-stack pattern for server /
 * IPC state. Components and pages should prefer this hook directly.
 */
export function useEnvironmentQuery() {
  return useQuery<Environment, Error>({
    queryKey: ["environment"],
    queryFn: detectEnv,
    staleTime: 60_000,
  });
}

/**
 * Legacy `{ env, error }` adapter so Phase-3 callers (Home.tsx) keep
 * compiling. Phase 5 migrates Home off this shape; keep this thin
 * shim until then.
 *
 * @deprecated Use `useEnvironmentQuery()` directly in new code.
 */
export function useEnvironment(): UseEnvironmentResult {
  const { data, error } = useEnvironmentQuery();
  return {
    env: data ?? null,
    error: error ? String(error.message ?? error) : null,
  };
}
