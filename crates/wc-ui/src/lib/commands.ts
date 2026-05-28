import { invoke } from "@tauri-apps/api/core";
import type { Finding } from "../types/finding";
import type { Environment } from "../types/environment";

export function scan(): Promise<Finding[]> {
  return invoke<Finding[]>("scan");
}

export function detectEnv(): Promise<Environment> {
  return invoke<Environment>("detect_env");
}

export function execute(findings: Finding[]): Promise<string> {
  return invoke<string>("execute", { findings });
}

export function restore(bundle: string, destRoot: string): Promise<void> {
  return invoke<void>("restore", { bundle, destRoot });
}

export function verify(bundle: string): Promise<void> {
  return invoke<void>("verify", { bundle });
}
