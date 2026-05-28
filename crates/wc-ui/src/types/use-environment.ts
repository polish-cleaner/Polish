import type { Environment } from "./environment";

/**
 * Legacy {env,error} adapter shape returned by the Phase-3
 * `useEnvironment()` shim. Phase 5 retires this in favour of the
 * `useEnvironmentQuery()` TanStack Query result.
 */
export interface UseEnvironmentResult {
  env: Environment | null;
  error: string | null;
}
