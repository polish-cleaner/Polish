import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Finding {
  path: string;
  size: number;
  category_id: string;
}

interface Environment {
  has_npm: boolean;
  has_pnpm: boolean;
  has_cargo: boolean;
  has_wsl: boolean;
  has_chrome: boolean;
  has_edge: boolean;
  has_firefox: boolean;
  windows_build: number | null;
}

function formatMiB(bytes: number): string {
  return (bytes / 1_048_576).toFixed(2) + " MiB";
}

function groupByCategory(findings: Finding[]): { id: string; count: number; size: number }[] {
  const groups = new Map<string, { count: number; size: number }>();
  for (const f of findings) {
    const g = groups.get(f.category_id) ?? { count: 0, size: 0 };
    g.count += 1;
    g.size += f.size;
    groups.set(f.category_id, g);
  }
  return Array.from(groups.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.size - a.size);
}

export default function App() {
  const [env, setEnv] = useState<Environment | null>(null);
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    invoke<Environment>("detect_env")
      .then(setEnv)
      .catch((e) => setError(String(e)));
  }, []);

  async function runScan() {
    setScanning(true);
    setError(null);
    try {
      const result = await invoke<Finding[]>("scan");
      setFindings(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setScanning(false);
    }
  }

  const totalBytes = findings?.reduce((s, f) => s + f.size, 0) ?? 0;
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
              <strong>{formatMiB(totalBytes)}</strong>
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
