import { useState } from "react";
import type { Finding } from "../types/finding";
import { scan } from "../lib/commands";

export interface UseScanResult {
  findings: Finding[] | null;
  scanning: boolean;
  error: string | null;
  runScan: () => Promise<void>;
}

export function useScan(): UseScanResult {
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runScan(): Promise<void> {
    setScanning(true);
    setError(null);
    try {
      setFindings(await scan());
    } catch (e) {
      setError(String(e));
    } finally {
      setScanning(false);
    }
  }

  return { findings, scanning, error, runScan };
}
