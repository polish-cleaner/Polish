import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Progress from "../components/ui/Progress";
import Segmented from "../components/ui/Segmented";
import Hero from "../components/dashboard/Hero";
import DashboardWidgetGrid from "../components/dashboard/DashboardWidgetGrid";
import QuickActionsRow from "../components/dashboard/QuickActionsRow";
import { useEnvironmentQuery } from "../hooks/useEnvironment";
import { useScanMutation } from "../hooks/useScan";
import { useRoute } from "../hooks/useRoute";
import { stagger } from "../lib/motion";
import { groupByCategory, totalBytes } from "../lib/format";
import { buildDashboardData } from "../lib/dashboard-data";
import {
  MIDLIFE_ENVIRONMENT,
  MIDLIFE_FINDINGS,
} from "../lib/fixtures/dashboard";
import type { DashboardMode } from "../types/dashboard";

const PAGE_STAGGER = stagger(0, 0.06);
const PAGE_INNER_CLASS = "max-w-[1240px] mx-auto px-10 pt-10 pb-16";
const TOOLBAR_CLASS = "flex justify-end mb-6";

const MODE_OPTIONS = [
  { value: "live", label: "Live" },
  { value: "preview", label: "Preview design" },
] as const;

/**
 * Editorial Dashboard. Mirrors the prototype dashboard.jsx widget set:
 * Hero → KpiBand → CategoryBreakdown + RecoveryTrend → Opportunities
 * + DriveGauge → ActivityHeatmap + EnvironmentTile → TopReclaimTable
 * → QuarantineSummary + FormatPrepCta → QuickActionsRow. The
 * Segmented control above the hero swaps in fixture data so the
 * editorial layout renders even before a real scan. Widget grid is
 * composed in DashboardWidgetGrid to keep this page within the cap.
 */
export default function Dashboard() {
  const [mode, setMode] = useState<DashboardMode>("live");
  const envQuery = useEnvironmentQuery();
  const scanMutation = useScanMutation();
  const setRoute = useRoute((s) => s.setRoute);

  const liveFindings = scanMutation.data ?? [];
  const findings = mode === "preview" ? MIDLIFE_FINDINGS : liveFindings;
  const env = mode === "preview" ? MIDLIFE_ENVIRONMENT : envQuery.data ?? null;

  const total = useMemo(() => totalBytes(findings), [findings]);
  const categoryCount = useMemo(
    () => groupByCategory(findings).length,
    [findings],
  );
  const data = useMemo(() => buildDashboardData(mode, findings), [mode, findings]);

  const showLiveEmpty =
    mode === "live" && !scanMutation.isPending && liveFindings.length === 0;

  return (
    <div className={PAGE_INNER_CLASS}>
      <div className={TOOLBAR_CLASS}>
        <Segmented
          aria-label="Dashboard data mode"
          value={mode}
          onValueChange={(v) => setMode(v as DashboardMode)}
          options={MODE_OPTIONS}
        />
      </div>
      <motion.div
        variants={PAGE_STAGGER}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-[22px]"
      >
        <Hero
          env={env}
          totalBytes={total}
          categoryCount={categoryCount}
          onRescan={() => scanMutation.mutate()}
          onReviewClean={() => setRoute("clean")}
        />
        {showLiveEmpty ? (
          <Card className="p-8 flex flex-col items-center text-center gap-4 max-w-[560px] mx-auto">
            <p className="font-display text-[22px] m-0 text-ink">
              No live scan yet.
            </p>
            <p className="text-[13px] text-ink-soft m-0 max-w-[42ch]">
              Run a quick scan to populate the dashboard with real numbers, or
              switch to <strong>Preview design</strong> to see the layout with
              fixtures.
            </p>
            <motion.div whileHover={{ y: -1 }}>
              <Button
                variant="primary"
                onClick={() => scanMutation.mutate()}
                disabled={scanMutation.isPending}
              >
                Run scan
              </Button>
            </motion.div>
            {scanMutation.error && (
              <p className="text-[12px] text-status-danger m-0">
                {String(scanMutation.error.message ?? scanMutation.error)}
              </p>
            )}
          </Card>
        ) : scanMutation.isPending && mode === "live" ? (
          <Card className="p-[22px] flex flex-col gap-3">
            <p className="text-[13px] text-ink-soft m-0">Scanning…</p>
            <Progress indeterminate ariaLabel="Scan in progress" />
          </Card>
        ) : (
          <>
            <DashboardWidgetGrid
              findings={findings}
              env={env}
              totalBytes={total}
              data={data}
              onClean={() => setRoute("clean")}
              onQuarantine={() => setRoute("quarantine")}
              onFormatPrep={() => setRoute("format-prep")}
            />
            <QuickActionsRow
              onVerify={() => setRoute("quarantine")}
              onRestore={() => setRoute("quarantine")}
              onSettings={() => setRoute("settings")}
            />
          </>
        )}
      </motion.div>
    </div>
  );
}
