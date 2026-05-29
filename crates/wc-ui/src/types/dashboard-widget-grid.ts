import type { Environment } from "./environment";
import type { Finding } from "./finding";
import type { DashboardData } from "./dashboard-data";

export interface DashboardWidgetGridProps {
  findings: ReadonlyArray<Finding>;
  env: Environment | null;
  totalBytes: number;
  data: DashboardData;
  /** Route to the Clean wizard (RecoverableCard CTAs). */
  onClean: () => void;
  /** Route to Quarantine page (QuarantineSummary CTAs). */
  onQuarantine: () => void;
  /** Route to Format Prep wizard. */
  onFormatPrep: () => void;
}
