export interface Environment {
  has_npm: boolean;
  has_pnpm: boolean;
  has_cargo: boolean;
  has_wsl: boolean;
  has_chrome: boolean;
  has_edge: boolean;
  has_firefox: boolean;
  windows_build: number | null;
}
