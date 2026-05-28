import { useState } from "react";
import type { Finding } from "../types/finding";
import type { ExecuteResult } from "../types/execute-result";
import { execute } from "../lib/commands";

export interface UseExecuteResult {
  executing: boolean;
  result: ExecuteResult | null;
  error: string | null;
  runExecute: (findings: Finding[], skipLocked: boolean) => Promise<void>;
  reset: () => void;
}

export function useExecute(): UseExecuteResult {
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<ExecuteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runExecute(
    findings: Finding[],
    skipLocked: boolean,
  ): Promise<void> {
    setExecuting(true);
    setError(null);
    try {
      const r = await execute(findings, skipLocked);
      setResult(r);
    } catch (e) {
      setError(String(e));
    } finally {
      setExecuting(false);
    }
  }

  function reset(): void {
    setResult(null);
    setError(null);
  }

  return { executing, result, error, runExecute, reset };
}
