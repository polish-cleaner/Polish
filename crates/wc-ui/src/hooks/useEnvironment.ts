import { useEffect, useState } from "react";
import type { Environment } from "../types/environment";
import { detectEnv } from "../lib/commands";

export interface UseEnvironmentResult {
  env: Environment | null;
  error: string | null;
}

export function useEnvironment(): UseEnvironmentResult {
  const [env, setEnv] = useState<Environment | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectEnv()
      .then(setEnv)
      .catch((e) => setError(String(e)));
  }, []);

  return { env, error };
}
