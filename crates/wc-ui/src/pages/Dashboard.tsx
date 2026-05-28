import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageLayout from "../components/PageLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Progress from "../components/ui/Progress";
import Segmented from "../components/ui/Segmented";
import Hero from "../components/dashboard/Hero";
import RecoverableCard from "../components/dashboard/RecoverableCard";
import CategoryBreakdown from "../components/dashboard/CategoryBreakdown";
import RecoveryTrend from "../components/dashboard/RecoveryTrend";
import EnvironmentTile from "../components/dashboard/EnvironmentTile";
import QuickActionsRow from "../components/dashboard/QuickActionsRow";
import { useEnvironmentQuery } from "../hooks/useEnvironment";
import { useScanMutation } from "../hooks/useScan";
import { useRoute } from "../hooks/useRoute";
import { stagger } from "../lib/motion";
import { groupByCategory, totalBytes } from "../lib/format";
import {
  MIDLIFE_ENVIRONMENT,
  MIDLIFE_FINDINGS,
  MIDLIFE_TREND,
} from "../lib/fixtures/dashboard";
import type { DashboardMode } from "../types/dashboard";

const PAGE_STAGGER = stagger(0, 0.06);

const MODE_OPTIONS = [
  { value: "live", label: "Live" },
  { value: "preview", label: "Preview design" },
] as const;

/**
 * Editorial Dashboard. Composes the hero / recoverable / charts / env
 * sub-widgets per Phase 4 spec. A segmented switch toggles between
 * live IPC data (default) and the prototype "midlife" fixture so the
 * user can validate the design without an active scan.
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

  const showLiveEmpty =
    mode === "live" && !scanMutation.isPending && liveFindings.length === 0;

  return (
    <PageLayout
      title="Dashboard"
      titleAccent="overview"
      subtitle="Polish your PC."
      actions={
        <Segmented
          aria-label="Dashboard data mode"
          value={mode}
          onValueChange={(v) => setMode(v as DashboardMode)}
          options={MODE_OPTIONS}
        />
      }
    >
      <motion.div
        variants={PAGE_STAGGER}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-6"
      >
        <Hero env={env} totalBytes={total} categoryCount={categoryCount} />

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
          <Card className="p-6 flex flex-col gap-3">
            <p className="text-[13px] text-ink-soft m-0">Scanning…</p>
            <Progress indeterminate ariaLabel="Scan in progress" />
          </Card>
        ) : (
          <>
            <RecoverableCard
              totalBytes={total}
              findings={findings}
              onOpenClean={() => setRoute("clean")}
              onRunLight={() => setRoute("clean")}
            />
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
              <CategoryBreakdown findings={findings} />
              <RecoveryTrend points={MIDLIFE_TREND} />
            </div>
            <EnvironmentTile env={env} />
            <QuickActionsRow
              onVerify={() => setRoute("quarantine")}
              onRestore={() => setRoute("quarantine")}
              onSettings={() => setRoute("settings")}
            />
          </>
        )}
      </motion.div>
    </PageLayout>
  );
}
