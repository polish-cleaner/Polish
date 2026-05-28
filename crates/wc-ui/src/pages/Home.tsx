import { useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import LockedFilesModal from "../components/LockedFilesModal";
import PageLayout from "../components/PageLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { formatMiB, groupByCategory, totalBytes } from "../lib/format";
import { useEnvironment } from "../hooks/useEnvironment";
import { useScan } from "../hooks/useScan";
import { useExecute } from "../hooks/useExecute";

/**
 * Phase 3 placeholder dashboard — preserves the legacy single-page
 * scan / quarantine UX so the route shell can ship before Phase 4
 * lands the real dashboard. Wrapped in PageLayout so the editorial
 * page-title chrome stays consistent with the rest of the app.
 */
export default function Home() {
  const { env, error: envError } = useEnvironment();
  const { findings, scanning, error: scanError, runScan } = useScan();
  const {
    executing,
    result: executeResult,
    error: executeError,
    runExecute,
    reset: resetExecute,
  } = useExecute();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const error = envError ?? scanError ?? executeError;
  const groups = findings ? groupByCategory(findings) : [];
  const total = findings ? totalBytes(findings) : 0;
  const lockedDecisionPending = executeResult?.needs_user_decision === true;
  const successResult =
    executeResult && !executeResult.needs_user_decision ? executeResult : null;

  return (
    <PageLayout
      title="Dashboard"
      subtitle="Trust-first Windows maintenance — scan and quarantine recoverable space."
    >
      <Card className="p-6 mb-6">
        <h2 className="font-display text-[22px] m-0 mb-3">Environment</h2>
        {env === null ? (
          <p className="text-ink-soft text-[13px]">Detecting…</p>
        ) : (
          <ul className="list-none p-0 m-0 grid grid-cols-2 gap-y-1 text-[13px]">
            <li>npm: {env.has_npm ? "✓" : "✗"}</li>
            <li>pnpm: {env.has_pnpm ? "✓" : "✗"}</li>
            <li>cargo: {env.has_cargo ? "✓" : "✗"}</li>
            <li>wsl: {env.has_wsl ? "✓" : "✗"}</li>
            <li>chrome: {env.has_chrome ? "✓" : "✗"}</li>
            <li>edge: {env.has_edge ? "✓" : "✗"}</li>
            <li>firefox: {env.has_firefox ? "✓" : "✗"}</li>
          </ul>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-[22px] m-0 mb-3">Scan</h2>
        <div className="flex gap-2 mb-3">
          <Button onClick={runScan} disabled={scanning || executing}>
            {scanning ? "Scanning…" : "Scan"}
          </Button>
          {findings && findings.length > 0 && (
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={executing}
              variant="danger"
            >
              {executing ? "Quarantining…" : "Quarantine all"}
            </Button>
          )}
        </div>
        {error && <p className="text-status-danger text-[13px]">Error: {error}</p>}
        {successResult && successResult.bundle_path && (
          <p className="text-[13px] text-ink-soft">
            Quarantined <strong>{successResult.packed_count.toLocaleString()}</strong>{" "}
            file{successResult.packed_count === 1 ? "" : "s"} to{" "}
            <code>{successResult.bundle_path}</code>.{" "}
            {successResult.locked_files.length > 0 && (
              <>
                Skipped <strong>{successResult.locked_files.length.toLocaleString()}</strong>{" "}
                locked file{successResult.locked_files.length === 1 ? "" : "s"}.{" "}
              </>
            )}
            Restore via{" "}
            <code>
              polish restore --bundle "{successResult.bundle_path}" --dest &lt;dir&gt;
            </code>.
          </p>
        )}
        {findings && (
          <>
            <p className="text-[13px] mb-3">
              Findings: <strong>{findings.length.toLocaleString()}</strong> files,{" "}
              <strong>{formatMiB(total)}</strong>
            </p>
            <table className="w-full text-[13px] border-collapse">
              <thead className="text-ink-muted">
                <tr><th className="text-left py-1">Category</th><th className="text-left py-1">Files</th><th className="text-left py-1">Size</th></tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <tr key={g.id} className="border-t border-line">
                    <td className="py-1"><code>{g.id}</code></td>
                    <td className="py-1">{g.count.toLocaleString()}</td>
                    <td className="py-1">{formatMiB(g.size)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Card>

      <ConfirmModal
        open={confirmOpen}
        destructive
        title="Quarantine all findings?"
        message={
          <>
            This will move <strong>{findings?.length.toLocaleString() ?? 0}</strong>{" "}
            files ({formatMiB(total)}) into a <code>.pq</code> bundle and delete the
            originals from disk. The bundle is verifiable and restorable.
          </>
        }
        confirmLabel="Quarantine"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          if (findings) runExecute(findings, false);
        }}
      />

      <LockedFilesModal
        open={lockedDecisionPending}
        lockedFiles={executeResult?.locked_files ?? []}
        totalFindings={findings?.length ?? 0}
        onCancel={resetExecute}
        onSkip={() => {
          if (!findings || !executeResult) return;
          const lockedSet = new Set(executeResult.locked_files);
          const readableOnly = findings.filter((f) => !lockedSet.has(f.path));
          resetExecute();
          runExecute(readableOnly, true);
        }}
      />
    </PageLayout>
  );
}
