// History — append-only activity log with filters.

const ACTION_LABELS = {
  'scan.start': 'Scan started',
  'scan.complete': 'Scan complete',
  'clean.start': 'Clean started',
  'clean.execute': 'Clean executed',
  'quarantine.auto-purge': 'Auto‑purged',
  'quarantine.restore': 'Restored',
  'settings.set': 'Setting changed',
  'service.update': 'Service updated',
};

const History = () => {
  const [search, setSearch] = useState('');
  const [actorFilter, setActorFilter] = useState('all');

  const filtered = HISTORY.filter(h => {
    if (actorFilter !== 'all' && h.actor !== actorFilter) return false;
    if (search && !`${h.action} ${h.target} ${h.outcome}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="page">
      <div className="page-inner" style={{ paddingTop: 36 }}>
        <SectionLabel style={{ marginBottom: 10 }}>History</SectionLabel>
        <h1 className="display" style={{ fontSize: 40, margin: 0, lineHeight: 1.05, marginBottom: 10 }}>
          Everything Polish has done.
        </h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, maxWidth: '56ch', lineHeight: 1.55, marginBottom: 32 }}>
          Append‑only. Filterable. Exportable to CSV or JSON. Use this for bug reports — "what did Polish do at 2pm Tuesday."
        </p>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 12px', background: 'var(--surface)',
            border: '1px solid var(--line)', borderRadius: 5,
            flex: 1, maxWidth: 360,
          }}>
            <IconSearch size={13} style={{ color: 'var(--ink-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actions, targets, outcomes…"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--ink)' }}
            />
          </div>
          <Segmented
            value={actorFilter}
            onChange={setActorFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'user', label: 'User' },
              { value: 'service', label: 'Service' },
            ]}
          />
          <div style={{ flex: 1 }} />
          <Button variant="ghost" size="sm" leading={<IconDownload size={12} />}>Export CSV</Button>
        </div>

        {/* Table */}
        <Card>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '140px 70px 1.2fr 2fr',
            gap: 16,
            padding: '10px 20px',
            background: 'var(--surface-warm)',
            borderBottom: '1px solid var(--line)',
            alignItems: 'center',
          }}>
            <div className="label" style={{ fontSize: 10 }}>Time</div>
            <div className="label" style={{ fontSize: 10 }}>Actor</div>
            <div className="label" style={{ fontSize: 10 }}>Action</div>
            <div className="label" style={{ fontSize: 10 }}>Outcome</div>
          </div>
          {filtered.map((h, i) => (
            <div
              key={i}
              className="fade-in"
              style={{
                animationDelay: `${i * 30}ms`,
                display: 'grid',
                gridTemplateColumns: '140px 70px 1.2fr 2fr',
                gap: 16,
                padding: '12px 20px',
                borderBottom: i === filtered.length - 1 ? 'none' : '1px solid var(--line-soft)',
                alignItems: 'baseline',
                fontSize: 12.5,
              }}
            >
              <div>
                <div className="mono" style={{ color: 'var(--ink-soft)', fontSize: 12 }}>
                  {fmtAgo(h.minsAgo)}
                </div>
                <div className="micro" style={{ marginTop: 2 }}>{fmtTime(h.ts)}</div>
              </div>
              <div>
                <Badge>{h.actor}</Badge>
              </div>
              <div>
                <div style={{ fontWeight: 500, color: 'var(--ink)', fontSize: 13 }}>
                  {ACTION_LABELS[h.action] || h.action}
                </div>
                <div className="mono micro" style={{ marginTop: 2 }}>{h.target}</div>
              </div>
              <div style={{ color: 'var(--ink-soft)' }}>{h.outcome}</div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-muted)' }}>
              No matching events.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

Object.assign(window, { History });
