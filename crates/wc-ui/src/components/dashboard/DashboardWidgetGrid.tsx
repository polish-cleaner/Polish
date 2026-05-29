import RecoverableCard from "./RecoverableCard";
import CategoryBreakdown from "./CategoryBreakdown";
import RecoveryTrend from "./RecoveryTrend";
import EnvironmentTile from "./EnvironmentTile";
import KpiBand from "./KpiBand";
import LargestOpportunities from "./LargestOpportunities";
import ActivityHeatmap from "./ActivityHeatmap";
import DriveGauge from "./DriveGauge";
import TopReclaimTable from "./TopReclaimTable";
import QuarantineSummary from "./QuarantineSummary";
import FormatPrepCta from "./FormatPrepCta";
import {
  MIDLIFE_TREND,
  MIDLIFE_ACTIVITY,
  MIDLIFE_DRIVES,
  MIDLIFE_QUARANTINE,
} from "../../lib/fixtures/dashboard";
import type { DashboardWidgetGridProps } from "../../types/dashboard-widget-grid";

const TWO_UP_CLASS =
  "grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-[14px]";
const DUO_CLASS = "grid grid-cols-1 lg:grid-cols-2 gap-[14px]";

/**
 * Composed widget grid for the Dashboard's post-hero render. Splits
 * the widget composition out of Dashboard.tsx so the page file stays
 * within the 150-line cap and the Live/Empty/Pending branches at the
 * page level remain readable.
 */
export default function DashboardWidgetGrid({
  findings,
  env,
  totalBytes,
  data,
  onClean,
  onQuarantine,
  onFormatPrep,
}: DashboardWidgetGridProps) {
  return (
    <>
      <RecoverableCard
        totalBytes={totalBytes}
        findings={findings}
        onOpenClean={onClean}
        onRunLight={onClean}
      />
      <KpiBand tiles={data.kpiTiles} />
      <div className={TWO_UP_CLASS}>
        <CategoryBreakdown findings={findings} />
        <RecoveryTrend points={MIDLIFE_TREND} />
      </div>
      <div className={TWO_UP_CLASS}>
        <LargestOpportunities
          rows={data.opportunities}
          previewTag={data.previewTag}
        />
        <DriveGauge drives={MIDLIFE_DRIVES} previewTag={data.previewTag} />
      </div>
      <div className={TWO_UP_CLASS}>
        <ActivityHeatmap
          cells={MIDLIFE_ACTIVITY}
          previewTag={data.previewTag}
        />
        <EnvironmentTile env={env} />
      </div>
      <TopReclaimTable rows={data.tableRows} />
      <div className={DUO_CLASS}>
        <QuarantineSummary
          bundle_count={MIDLIFE_QUARANTINE.bundle_count}
          total_bytes={MIDLIFE_QUARANTINE.total_bytes}
          days_until_purge={MIDLIFE_QUARANTINE.days_until_purge}
          onOpen={onQuarantine}
          onRestoreLast={onQuarantine}
        />
        <FormatPrepCta onStart={onFormatPrep} />
      </div>
    </>
  );
}
