/**
 * LargestOpportunities widget — horizontal bars listing the top
 * reclaimable categories by size. Mirrors prototype HBars.
 */
export interface OpportunityRow {
  id: string;
  label: string;
  /** Bytes — same unit across the list, drives the bar width. */
  bytes: number;
  /** Optional bar color (CSS var). Defaults to var(--accent). */
  color?: string;
}

export interface LargestOpportunitiesProps {
  rows: ReadonlyArray<OpportunityRow>;
  /** Optional "(preview data)" micro-tag below the title. */
  previewTag?: boolean;
}
