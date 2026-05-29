import { useMemo, useState } from "react";
import { motion } from "framer-motion";
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
const PAGE_INNER_CLASS = "max-w-[1240px] mx-auto px-10 pt-10 pb-16";
const TOOLBAR_CLASS = "flex justify-end mb-6";
const CHARTS_ROW_CLASS =
  "grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-[14px]";

const MODE_OPTIONS = [
  { value: "live", label: "Live" },
  { value: "preview", label: "Preview design" },
] as const;

/**
 * Editorial Dashboard. Mirrors the prototype dashboard.jsx
 * composition exactly — hero strip / KPI card / chart row /
 * scanner-coverage tile / quick-actions row. The Segmented control
 * (Live | Preview design) sits in a slim toolbar above the hero so
 * the editorial wordmark is not interrupted.
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
            <RecoverableCard
              totalBytes={total}
              findings={findings}
              onOpenClean={() => setRoute("clean")}
              onRunLight={() => setRoute("clean")}
            />
            <div className={CHARTS_ROW_CLASS}>
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
    </div>
  );
}
