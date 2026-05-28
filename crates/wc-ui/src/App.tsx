import { useState } from "react";
import ConfirmModal from "./components/ConfirmModal";
import { formatMiB, groupByCategory, totalBytes } from "./lib/format";
import { useEnvironment } from "./hooks/useEnvironment";
import { useScan } from "./hooks/useScan";
import { useExecute } from "./hooks/useExecute";

export default function App() {
  const { env, error: envError } = useEnvironment();
  const { findings, scanning, error: scanError, runScan } = useScan();
  const { executing, bundlePath, error: executeError, runExecute } = useExecute();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const error = envError ?? scanError ?? executeError;
  const groups = findings ? groupByCategory(findings) : [];
  const total = findings ? totalBytes(findings) : 0;

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
        {bundlePath && (
          <p className="status success">
            Quarantined to <code>{bundlePath}</code>. Restore via{" "}
            <code>polish restore --bundle "{bundlePath}" --dest &lt;dir&gt;</code>.
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
          if (findings) runExecute(findings);
        }}
      />
    </main>
  );
}
