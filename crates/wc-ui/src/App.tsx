import { useState } from "react";
import ConfirmModal from "./components/ConfirmModal";
import LockedFilesModal from "./components/LockedFilesModal";
import { formatMiB, groupByCategory, totalBytes } from "./lib/format";
import { useEnvironment } from "./hooks/useEnvironment";
import { useScan } from "./hooks/useScan";
import { useExecute } from "./hooks/useExecute";

export default function App() {
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
    <main className="app">
      <header>
        <h1>Polish</h1>
        <p className="tagline">Trust-first Windows maintenance suite</p>
      </header>

      <section>
        <h2>Environment</h2>
        {env === null ? (
          <p className="status">Detecting…</p>
        ) : (
          <ul className="env-list">
            <li>npm: {env.has_npm ? "✓" : "✗"}</li>
            <li>pnpm: {env.has_pnpm ? "✓" : "✗"}</li>
            <li>cargo: {env.has_cargo ? "✓" : "✗"}</li>
            <li>wsl: {env.has_wsl ? "✓" : "✗"}</li>
            <li>chrome: {env.has_chrome ? "✓" : "✗"}</li>
            <li>edge: {env.has_edge ? "✓" : "✗"}</li>
            <li>firefox: {env.has_firefox ? "✓" : "✗"}</li>
          </ul>
        )}
      </section>

      <section>
        <h2>Scan</h2>
        <div className="actions">
          <button onClick={runScan} disabled={scanning || executing}>
            {scanning ? "Scanning…" : "Scan"}
          </button>
          {findings && findings.length > 0 && (
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={executing}
              className="destructive"
            >
              {executing ? "Quarantining…" : "Quarantine all"}
            </button>
          )}
        </div>
        {error && <p className="error">Error: {error}</p>}
        {successResult && successResult.bundle_path && (
          <p className="status success">
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
            <p className="status">
              Findings: <strong>{findings.length.toLocaleString()}</strong> files,{" "}
              <strong>{formatMiB(total)}</strong>
            </p>
            <table className="categories">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Files</th>
                  <th>Size</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <tr key={g.id}>
                    <td><code>{g.id}</code></td>
                    <td>{g.count.toLocaleString()}</td>
                    <td>{formatMiB(g.size)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

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
    </main>
  );
}
