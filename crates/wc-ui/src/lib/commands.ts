import { invoke } from "@tauri-apps/api/core";
import type { Finding } from "../types/finding";
import type { Environment } from "../types/environment";
import type { ExecuteResult } from "../types/execute-result";

export function scan(): Promise<Finding[]> {
  return invoke<Finding[]>("scan");
}

export function detectEnv(): Promise<Environment> {
  return invoke<Environment>("detect_env");
}

export function execute(
  findings: Finding[],
  skipLocked: boolean,
): Promise<ExecuteResult> {
  return invoke<ExecuteResult>("execute", { findings, skipLocked });
}

export function restore(bundle: string, destRoot: string): Promise<void> {
  return invoke<void>("restore", { bundle, destRoot });
}

export function verify(bundle: string): Promise<void> {
  return invoke<void>("verify", { bundle });
}
