import { formatMiB, groupByCategory, totalBytes } from "./lib/format";
import { useEnvironment } from "./hooks/useEnvironment";
import { useScan } from "./hooks/useScan";

export default function App() {
  const { env, error: envError } = useEnvironment();
  const { findings, scanning, error: scanError, runScan } = useScan();
  const error = envError ?? scanError;
  const groups = findings ? groupByCategory(findings) : [];

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
        <button onClick={runScan} disabled={scanning}>
          {scanning ? "Scanning…" : "Scan"}
        </button>
        {error && <p className="error">Error: {error}</p>}
        {findings && (
          <>
            <p className="status">
              Findings: <strong>{findings.length.toLocaleString()}</strong> files,{" "}
              <strong>{formatMiB(totalBytes(findings))}</strong>
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
    </main>
  );
}
