import { useState } from "react";
import type { Finding } from "../types/finding";
import { execute } from "../lib/commands";

export interface UseExecuteResult {
  executing: boolean;
  bundlePath: string | null;
  error: string | null;
  runExecute: (findings: Finding[]) => Promise<void>;
}

export function useExecute(): UseExecuteResult {
  const [executing, setExecuting] = useState(false);
  const [bundlePath, setBundlePath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runExecute(findings: Finding[]): Promise<void> {
    setExecuting(true);
    setError(null);
    try {
      const path = await execute(findings);
      setBundlePath(path);
    } catch (e) {
      setError(String(e));
    } finally {
      setExecuting(false);
    }
  }

  return { executing, bundlePath, error, runExecute };
}
