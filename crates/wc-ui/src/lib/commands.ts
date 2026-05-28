import { invoke } from "@tauri-apps/api/core";
import type { Finding } from "../types/finding";
import type { Environment } from "../types/environment";

export function scan(): Promise<Finding[]> {
  return invoke<Finding[]>("scan");
}

export function detectEnv(): Promise<Environment> {
  return invoke<Environment>("detect_env");
}
