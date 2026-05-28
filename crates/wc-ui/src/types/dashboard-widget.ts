import type { Environment } from "./environment";
import type { Finding } from "./finding";
import type { TrendPoint } from "./charts";

export interface HeroProps {
  /** Environment payload (null while detection is pending). */
  env: Environment | null;
  /** Total recoverable bytes (drives the wordmark accent number). */
  totalBytes: number;
  /** Number of distinct categories with findings. */
  categoryCount: number;
}

export interface RecoverableCardProps {
  totalBytes: number;
  findings: ReadonlyArray<Finding>;
  /** Click handler for the primary "Open Clean wizard" CTA. */
  onOpenClean: () => void;
  /** Click handler for the secondary "Run Light cleanup" ghost button. */
  onRunLight: () => void;
}

export interface CategoryBreakdownProps {
  findings: ReadonlyArray<Finding>;
}

export interface RecoveryTrendProps {
  points: ReadonlyArray<TrendPoint>;
}

export interface EnvironmentTileProps {
  env: Environment | null;
}

export interface QuickActionsRowProps {
  onVerify: () => void;
  onRestore: () => void;
  onSettings: () => void;
}
