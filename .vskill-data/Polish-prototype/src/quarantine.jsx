// Quarantine — list of past runs + detail drawer with restore + purge actions.

const Quarantine = ({ onNotify }) => {
  const [runs, setRuns] = useState(QUARANTINE_RUNS);
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { kind, runId, label }
  const [filter, setFilter] = useState('all'); // all | light | balanced | aggressive

  const selectedRun = runs.find(r => r.id === selectedRunId);

  const filteredRuns = runs.filter(r => filter === 'all' || r.mode === filter);

  const totalBytes = useMemo(() => runs.reduce((s, r) => s + r.bytes, 0), [runs]);
  const totalItems = useMemo(() => runs.reduce((s, r) => s + r.itemCount, 0), [runs]);
  const totalFmt = fmtBytes(totalBytes);

  const handleRestore = (run, categoryIds) => {
    setConfirmAction({
      kind: 'restore',
      runId: run.id,
      label: categoryIds === 'all' ? 'restore everything from this run' : `restore ${categoryIds.length} selected items`,
      onConfirm: () => {
        onNotify && onNotify({
          kind: 'good',
          title: 'Restored',
          body: `${categoryIds === 'all' ? run.itemCount : categoryIds.length} items restored to original paths.`,
        });
        setConfirmAction(null);
        setSelectedRunId(null);
      },
    });
  };

  const handlePurge = (run) => {
    setConfirmAction({
      kind: 'purge',
      runId: run.id,
      label: `purge ${run.id}`,
      destructive: true,
      onConfirm: () => {
        setRuns(prev => prev.filter(r => r.id !== run.id));
        onNotify && onNotify({
          kind: 'good',
          title: 'Bundle purged',
          body: `${fmtBytes(run.bytes).num} GB freed from D:\\PolishQuarantine\\.`,
        });
        setConfirmAction(null);
        setSelectedRunId(null);
      },
    });
  };

  return (
    <div className="page">
      <div className="page-inner" style={{ paddingTop: 36 }}>
        <SectionLabel style={{ marginBottom: 10 }}>Quarantine</SectionLabel>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, gap: 24 }}>
          <div>
            <h1 className="display" style={{ fontSize: 40, margin: 0, lineHeight: 1.05 }}>
              <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{totalFmt.num}<span style={{ fontFamily: 'var(--font-body)', fontSize: '0.5em', fontWeight: 400, marginLeft: '0.15em' }}>{totalFmt.unit}</span></em> waiting on disk,
              <br />ready to restore.
            </h1>
            <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: 14, maxWidth: '56ch', lineHeight: 1.5 }}>
              {runs.length} {runs.length === 1 ? 'run' : 'runs'} across <span className="mono" style={{ color: 'var(--ink)' }}>{totalItems.toLocaleString()}</span> items on D:\PolishQuarantine\.
              Anything older than its retention will auto‑purge.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Segmented
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'light', label: 'Light' },
                { value: 'balanced', label: 'Balanced' },
                { value: 'aggressive', label: 'Aggressive' },
              ]}
            />
          </div>
        </div>

        {/* Run table */}
        <Card>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '24px 1.4fr 0.9fr 0.7fr 0.9fr 0.9fr 32px',
            gap: 16,
            padding: '12px 20px',
            background: 'var(--surface-warm)',
            borderBottom: '1px solid var(--line)',
          }}>
            <div></div>
            <div className="label" style={{ fontSize: 10 }}>Run</div>
            <div className="label" style={{ fontSize: 10 }}>Mode</div>
            <div className="label" style={{ fontSize: 10 }}>Items</div>
            <div className="label" style={{ fontSize: 10 }}>Size</div>
            <div className="label" style={{ fontSize: 10 }}>Auto‑purge</div>
            <div></div>
          </div>
          {filteredRuns.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-muted)' }}>
              No runs match this filter.
            </div>
          )}
          {filteredRuns.map(run => {
            const fmt = fmtBytes(run.bytes);
            const purgeUrgent = run.daysUntilPurge <= 5;
            return (
              <div
                key={run.id}
                onClick={() => setSelectedRunId(run.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 1.4fr 0.9fr 0.7fr 0.9fr 0.9fr 32px',
                  gap: 16,
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--line-soft)',
                  cursor: 'pointer',
                  transition: 'background 100ms',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-warm)'}
                onMouseLeave={(e) => e.currentTarget.style.background = ''}
              >
                <IconBox size={14} style={{ color: 'var(--ink-muted)' }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.01em' }}>
                    {run.id}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginTop: 2 }}>
                    {fmtTime(run.timestamp)} · <span className="mono">{run.daysAgo}d ago</span>
                  </div>
                </div>
                <div>
                  <Badge variant={run.mode === 'aggressive' ? 'warn' : 'default'}>{MODES[run.mode].label}</Badge>
                </div>
                <div className="mono" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                  {run.itemCount.toLocaleString()}
                </div>
                <div>
                  <NumDisplay value={fmt.num} unit={fmt.unit} size={14} color="var(--ink)" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {purgeUrgent && <Dot kind="warn" />}
                  <span className="mono" style={{ fontSize: 12.5, color: purgeUrgent ? 'var(--status-warn)' : 'var(--ink-soft)' }}>
                    in {run.daysUntilPurge}d
                  </span>
                </div>
                <IconChevronRight size={14} style={{ color: 'var(--ink-faint)' }} />
              </div>
            );
          })}
        </Card>

        {/* Help footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 20, color: 'var(--ink-muted)', fontSize: 12 }}>
          <IconInfo size={13} />
          <span>Restoring is itself logged. Anything older than its retention is purged automatically at 03:00 local.</span>
        </div>
      </div>

      {/* Detail drawer */}
      {selectedRun && (
        <>
          <div className="drawer-backdrop" onClick={() => setSelectedRunId(null)} />
          <div className="drawer">
            <QuarantineDetail
              run={selectedRun}
              onClose={() => setSelectedRunId(null)}
              onRestore={handleRestore}
              onPurge={handlePurge}
            />
          </div>
        </>
      )}

      {/* Confirm modal */}
      {confirmAction && (
        <ConfirmModal
          {...confirmAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};

// ===== Detail drawer =====
const QuarantineDetail = ({ run, onClose, onRestore, onPurge }) => {
  const [selectedCats, setSelectedCats] = useState(new Set());

  const toggleCat = (id) => {
    setSelectedCats(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const fmt = fmtBytes(run.bytes);

  return (
    <>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <SectionLabel style={{ marginBottom: 6 }}>Run detail</SectionLabel>
          <div className="mono" style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>
            {run.id}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginTop: 4 }}>
            {fmtTime(run.timestamp)}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close" style={{ padding: 6 }}>
          <IconX size={16} />
        </button>
      </div>

      {/* Summary */}
      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, borderBottom: '1px solid var(--line)' }}>
        <div>
          <SectionLabel style={{ marginBottom: 6 }}>Size</SectionLabel>
          <NumDisplay value={fmt.num} unit={fmt.unit} size={20} />
        </div>
        <div>
          <SectionLabel style={{ marginBottom: 6 }}>Items</SectionLabel>
          <NumDisplay value={run.itemCount.toLocaleString()} size={20} />
        </div>
        <div>
          <SectionLabel style={{ marginBottom: 6 }}>Purges in</SectionLabel>
          <NumDisplay value={run.daysUntilPurge} unit="days" size={20} color={run.daysUntilPurge <= 5 ? 'var(--status-warn)' : undefined} />
        </div>
      </div>

      {/* Categories */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        <div style={{ padding: '14px 24px 6px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <SectionLabel>Manifest</SectionLabel>
          <span className="micro">{selectedCats.size} selected</span>
        </div>
        {run.categories.map(c => {
          const cFmt = fmtBytes(c.bytes);
          const checked = selectedCats.has(c.id);
          const meta = CATEGORIES.find(x => x.id === c.id);
          return (
            <div
              key={c.id}
              onClick={() => toggleCat(c.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 24px',
                cursor: 'pointer',
                transition: 'background 100ms',
                borderTop: '1px solid var(--line-soft)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-warm)'}
              onMouseLeave={(e) => e.currentTarget.style.background = ''}
            >
              <Checkbox checked={checked} onChange={() => toggleCat(c.id)} />
              {meta && <CategoryIcon tier={meta.tier} size={14} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--ink)' }}>{c.label}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>
                  {c.count.toLocaleString()} items
                </div>
              </div>
              <NumDisplay value={cFmt.num} unit={cFmt.unit} size={13} color="var(--ink-soft)" />
            </div>
          );
        })}

        {/* Metadata */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--line)', marginTop: 8 }}>
          <SectionLabel style={{ marginBottom: 10 }}>Bundle metadata</SectionLabel>
          <dl style={{ margin: 0, fontSize: 12 }}>
            {[
              ['Destination', run.destination],
              ['Compression', 'Zstd · level 6'],
              ['Encryption', 'none'],
              ['System restore point', run.restorePointId ? `#${run.restorePointId}` : 'not created'],
              ['Mode', MODES[run.mode].label],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid var(--line-soft)' }}>
                <dt style={{ width: 160, color: 'var(--ink-muted)' }}>{k}</dt>
                <dd className="mono" style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 11.5 }}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Action bar */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line)', background: 'var(--surface-warm)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button
          variant="primary"
          size="sm"
          leading={<IconRestore size={13} />}
          disabled={selectedCats.size === 0}
          onClick={() => onRestore(run, Array.from(selectedCats))}
        >
          Restore selected ({selectedCats.size})
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onRestore(run, 'all')}>
          Restore all
        </Button>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" size="sm" leading={<IconDownload size={13} />}>
          Export .pq
        </Button>
        <Button variant="ghost" size="sm" leading={<IconTrash size={13} />} onClick={() => onPurge(run)} style={{ color: 'var(--status-danger)' }}>
          Purge
        </Button>
      </div>
    </>
  );
};

// ===== Confirm modal =====
const ConfirmModal = ({ kind, label, destructive, onCancel, onConfirm }) => {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" style={{ padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          {destructive ? (
            <IconAlertTriangle size={20} style={{ color: 'var(--status-warn)' }} />
          ) : (
            <IconRestore size={20} style={{ color: 'var(--accent)' }} />
          )}
          <div className="display-italic" style={{ fontSize: 22 }}>
            {destructive ? 'Are you sure?' : 'Confirm restore'}
          </div>
        </div>
        <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, lineHeight: 1.55, margin: '0 0 24px' }}>
          {destructive
            ? `You're about to ${label}. This is irreversible — once purged, the bundle cannot be recovered.`
            : `You're about to ${label}. Files will be moved back to their original paths.`}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          {destructive ? (
            <HoldButton durationMs={3500} onConfirm={onConfirm}>
              Hold to purge
            </HoldButton>
          ) : (
            <Button variant="primary" onClick={onConfirm}>Restore</Button>
          )}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Quarantine });
