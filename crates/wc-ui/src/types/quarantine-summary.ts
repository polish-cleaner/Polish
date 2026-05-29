/**
 * QuarantineSummary widget — count + size + open-quarantine CTA.
 */
export interface QuarantineSummaryProps {
  bundle_count: number;
  total_bytes: number;
  /** Days until next auto-purge (sub-line). */
  days_until_purge?: number;
  onOpen: () => void;
  onRestoreLast?: () => void;
}
