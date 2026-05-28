// Clean wizard — Select -> Preview -> Run -> Result.

const WIZARD_STEPS = [
  { id: 'select',  num: '01', label: 'Select' },
  { id: 'preview', num: '02', label: 'Preview' },
  { id: 'run',     num: '03', label: 'Run' },
  { id: 'result',  num: '04', label: 'Result' },
];

const CleanWizard = ({ initialMode = 'balanced', initialSelected, onExit, onNavigate, defaultMode }) => {
  const [step, setStep] = useState('select');
  const [mode, setMode] = useState(initialMode || defaultMode || 'balanced');
  const [selected, setSelected] = useState(() => initialSelected || defaultSelections(initialMode || defaultMode || 'balanced'));
  const [destination, setDestination] = useState('D');
  const [progress, setProgress] = useState(0);
  const [runState, setRunState] = useState('idle'); // idle | running | paused | done
  const [currentItem, setCurrentItem] = useState(null);
  const [logLines, setLogLines] = useState([]);
  const [resultBytes, setResultBytes] = useState(0);

  const stepIdx = WIZARD_STEPS.findIndex(s => s.id === step);

  // === computed ===
  const selectedCats = useMemo(() => CATEGORIES.filter(c => selected.has(c.id)), [selected]);
  const totalBytes = useMemo(() => selectedCats.reduce((s, c) => s + c.bytes, 0), [selectedCats]);
  const totalFmt = fmtBytes(totalBytes);
  const irreversibles = selectedCats.filter(c => c.irreversible);

  // === Mode switch ===
  const switchMode = (m) => {
    setMode(m);
    if (m !== 'custom') setSelected(defaultSelections(m));
  };

  // === Run loop ===
  useEffect(() => {
    if (runState !== 'running') return;
    let raf;
    const start = performance.now() - (progress / 100) * 8000;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 8000);
      setProgress(t * 100);
      const itemIdx = Math.floor(t * selectedCats.length);
      if (selectedCats[itemIdx]) setCurrentItem(selectedCats[itemIdx]);

      // Add log entries
      setLogLines(prev => {
        const target = Math.floor(t * 30);
        if (prev.length >= target) return prev;
        const idx = Math.floor(t * selectedCats.length);
        const cat = selectedCats[Math.min(idx, selectedCats.length - 1)];
        const next = [...prev];
        for (let i = prev.length; i < target; i++) {
          const c = selectedCats[Math.floor((i / 30) * selectedCats.length)] || cat;
          next.push({ time: now, msg: `Moving ${c.label} → quarantine`, kind: 'move' });
        }
        return next.slice(-12);
      });

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setRunState('done');
        setResultBytes(totalBytes);
        setStep('result');
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [runState, selectedCats, totalBytes]);

  // === Categories grouped by tier ===
  const tieredCats = useMemo(() => {
    const groups = {};
    CATEGORIES.forEach(c => {
      if (!groups[c.tier]) groups[c.tier] = [];
      groups[c.tier].push(c);
    });
    return groups;
  }, []);

  const toggleCat = (id) => {
    setMode('custom');
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const toggleTier = (tier) => {
    setMode('custom');
    setSelected(prev => {
      const n = new Set(prev);
      const tierCats = tieredCats[tier] || [];
      const allSelected = tierCats.every(c => n.has(c.id));
      tierCats.forEach(c => {
        if (allSelected) n.delete(c.id);
        else n.add(c.id);
      });
      return n;
    });
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="page">
      <div className="page-inner" style={{ paddingTop: 36 }}>
        {/* Header strip */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <SectionLabel style={{ marginBottom: 10 }}>Clean</SectionLabel>
            <h1 className="display" style={{ fontSize: 40, margin: 0, lineHeight: 1.05 }}>
              {step === 'select' && <>Choose what to <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>reclaim</em>.</>}
              {step === 'preview' && <>Review before <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>committing</em>.</>}
              {step === 'run' && <>Moving items to <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>quarantine</em>…</>}
              {step === 'result' && <>Done.</>}
            </h1>
          </div>
          <div className="wizard-steps">
            {WIZARD_STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                {i > 0 && <div className="wizard-step-line" />}
                <div className={`wizard-step ${stepIdx === i ? 'active' : stepIdx > i ? 'done' : ''}`}>
                  <span className="wizard-step-num">
                    {stepIdx > i ? <IconCheck size={10} strokeWidth={3} /> : s.num}
                  </span>
                  <span>{s.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* === STEP 1: SELECT === */}
        {step === 'select' && (
          <div className="fade-up">
            {/* Mode selector */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
              {Object.values(MODES).map(m => {
                const active = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => switchMode(m.id)}
                    style={{
                      flex: 1,
                      padding: '16px 18px',
                      background: active ? 'var(--accent-soft)' : 'var(--surface)',
                      border: `1px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
                      borderRadius: 6,
                      textAlign: 'left',
                      transition: 'all 160ms var(--ease-out)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontWeight: 500, color: active ? 'var(--accent-ink)' : 'var(--ink)', fontSize: 14 }}>
                        {m.label}
                      </span>
                      <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-muted)' }}>
                        {m.time}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: active ? 'var(--accent-ink)' : 'var(--ink-soft)', lineHeight: 1.4 }}>
                      {m.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Category tree */}
            <Card>
              {Object.entries(tieredCats).map(([tier, cats], tIdx) => {
                const t = TIERS[tier];
                const tierBytes = cats.reduce((s, c) => s + c.bytes, 0);
                const selCount = cats.filter(c => selected.has(c.id)).length;
                const tierFmt = fmtBytes(tierBytes);
                const allChecked = selCount === cats.length;
                const someChecked = selCount > 0 && !allChecked;
                return (
                  <div key={tier} style={{ borderTop: tIdx === 0 ? 'none' : '1px solid var(--line)' }}>
                    {/* Tier header */}
                    <div
                      style={{
                        padding: '14px 22px',
                        background: 'var(--surface-warm)',
                        display: 'flex', alignItems: 'center', gap: 14,
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleTier(tier)}
                    >
                      <Checkbox checked={allChecked} indeterminate={someChecked} onChange={() => toggleTier(tier)} />
                      <CategoryIcon tier={tier} size={14} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--ink)' }}>{t.label}</span>
                          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                            {selCount}/{cats.length} selected
                          </span>
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginTop: 1 }}>{t.desc}</div>
                      </div>
                      <NumDisplay value={tierFmt.num} unit={tierFmt.unit} size={14} color="var(--ink-soft)" />
                    </div>
                    {/* Tier items */}
                    <div>
                      {cats.map((c, i) => {
                        const fmt = fmtBytes(c.bytes);
                        const checked = selected.has(c.id);
                        return (
                          <div
                            key={c.id}
                            onClick={() => toggleCat(c.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 14,
                              padding: '11px 22px 11px 60px',
                              borderTop: i === 0 ? 'none' : '1px solid var(--line-soft)',
                              cursor: 'pointer',
                              transition: 'background 100ms',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-warm)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = ''}
                          >
                            <Checkbox checked={checked} onChange={() => toggleCat(c.id)} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, color: 'var(--ink)' }}>
                                {c.label}
                                {c.irreversible && (
                                  <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--status-warn)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                    <IconAlertTriangle size={10} /> irreversible
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginTop: 1 }}>{c.detail}</div>
                            </div>
                            <NumDisplay value={fmt.num} unit={fmt.unit} size={13} color="var(--ink-soft)" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </Card>

            {/* Sticky footer */}
            <div style={{
              marginTop: 24,
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '14px 20px',
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 6,
            }}>
              <SectionLabel>Will quarantine</SectionLabel>
              <NumDisplay value={totalFmt.num} unit={totalFmt.unit} size={22} color="var(--accent-ink)" />
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                · {selected.size} {selected.size === 1 ? 'category' : 'categories'}
              </span>
              <div style={{ flex: 1 }} />
              <Button variant="ghost" onClick={onExit}>Cancel</Button>
              <Button
                variant="primary"
                trailing={<IconArrowRight size={14} />}
                onClick={() => setStep('preview')}
                disabled={selected.size === 0}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* === STEP 2: PREVIEW === */}
        {step === 'preview' && (
          <div className="fade-up">
            {/* Summary banner */}
            <Card style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
                <div>
                  <SectionLabel style={{ marginBottom: 8 }}>Mode</SectionLabel>
                  <div style={{ fontSize: 17, fontWeight: 500 }}>{MODES[mode].label}</div>
                </div>
                <div>
                  <SectionLabel style={{ marginBottom: 8 }}>Categories</SectionLabel>
                  <NumDisplay value={selected.size} size={20} />
                </div>
                <div>
                  <SectionLabel style={{ marginBottom: 8 }}>Will reclaim</SectionLabel>
                  <NumDisplay value={totalFmt.num} unit={totalFmt.unit} size={20} color="var(--accent-ink)" />
                </div>
                <div>
                  <SectionLabel style={{ marginBottom: 8 }}>Quarantine retention</SectionLabel>
                  <NumDisplay value={MODES[mode].retentionDays} unit="days" size={20} />
                </div>
              </div>
            </Card>

            {/* Destination */}
            <Card style={{ padding: 20, marginBottom: 20 }}>
              <SectionLabel style={{ marginBottom: 12 }}>Quarantine destination</SectionLabel>
              <div style={{ display: 'flex', gap: 10 }}>
                {DRIVES.map(d => {
                  const recommended = d.id === 'D';
                  const active = destination === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setDestination(d.id)}
                      style={{
                        flex: 1,
                        padding: '12px 14px',
                        background: active ? 'var(--accent-soft)' : 'var(--surface)',
                        border: `1px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
                        borderRadius: 5,
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <IconHardDrive size={13} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>
                          {d.label}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{d.name}</span>
                        {recommended && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--accent-ink)', fontWeight: 500, letterSpacing: '0.05em' }}>RECOMMENDED</span>}
                      </div>
                      <div className="micro">
                        <span className="mono">{(d.total - d.used).toFixed(0)}</span> GB free of <span className="mono">{d.total}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="micro" style={{ marginTop: 12, lineHeight: 1.55 }}>
                Polish will create <span className="mono" style={{ color: 'var(--ink-soft)' }}>{destination}:\PolishQuarantine\polish-2026-05-28-10-12\</span>. Compression: Zstd, level 6.
              </div>
            </Card>

            {/* Irreversibles callout */}
            {irreversibles.length > 0 && (
              <Card style={{ padding: 18, marginBottom: 20, borderColor: 'var(--status-warn)', background: 'var(--status-warn-soft)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <IconAlertTriangle size={18} style={{ color: 'var(--status-warn)', marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13.5, marginBottom: 4, color: 'oklch(0.40 0.12 65)' }}>
                      {irreversibles.length} irreversible {irreversibles.length === 1 ? 'action' : 'actions'} included
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                      {irreversibles.map(c => <li key={c.id}>{c.label} — {c.detail}</li>)}
                    </ul>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginTop: 8 }}>
                      These cannot be restored from quarantine. You'll be asked to hold‑to‑confirm.
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <Button variant="ghost" leading={<IconChevronLeft size={14} />} onClick={() => setStep('select')}>Back</Button>
              <Button
                variant="primary"
                trailing={<IconPlay size={12} />}
                onClick={() => { setStep('run'); setRunState('running'); }}
              >
                Run cleanup
              </Button>
            </div>
          </div>
        )}

        {/* === STEP 3: RUN === */}
        {step === 'run' && (
          <div className="fade-up">
            <Card style={{ padding: 32, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                <SectionLabel>Progress</SectionLabel>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <NumDisplay value={progress.toFixed(0)} size={42} color="var(--ink)" />
                  <span style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', fontSize: 16 }}>%</span>
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <ProgressBar value={progress} height={6} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
                <div>
                  <SectionLabel style={{ marginBottom: 6 }}>Quarantined</SectionLabel>
                  {(() => {
                    const f = fmtBytes(totalBytes * (progress / 100));
                    return <NumDisplay value={f.num} unit={f.unit} size={18} />;
                  })()}
                </div>
                <div>
                  <SectionLabel style={{ marginBottom: 6 }}>Current</SectionLabel>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
                    {currentItem?.label || '—'}
                  </div>
                </div>
                <div>
                  <SectionLabel style={{ marginBottom: 6 }}>ETA</SectionLabel>
                  <NumDisplay value={Math.max(0, Math.ceil((100 - progress) / 100 * 8))} unit="sec" size={18} />
                </div>
              </div>
            </Card>

            {/* Live log */}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-warm)' }}>
                <SectionLabel>Activity</SectionLabel>
                <div style={{ flex: 1 }} />
                <Dot kind={runState === 'paused' ? 'warn' : 'good'} pulsing={runState === 'running'} />
                <span style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
                  {runState === 'running' ? 'live' : runState === 'paused' ? 'paused' : 'idle'}
                </span>
              </div>
              <div style={{
                padding: '14px 18px',
                fontFamily: 'var(--font-mono)',
                fontSize: 11.5,
                color: 'var(--ink-soft)',
                lineHeight: 1.7,
                minHeight: 200,
                maxHeight: 280,
                overflowY: 'auto',
              }}>
                {logLines.length === 0 && <div style={{ color: 'var(--ink-faint)' }}>Waiting for first event…</div>}
                {logLines.map((l, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, opacity: 0.4 + (i / logLines.length) * 0.6 }}>
                    <span style={{ color: 'var(--ink-faint)' }}>{i.toString().padStart(3, '0')}</span>
                    <span style={{ color: 'var(--status-good)' }}>✓</span>
                    <span>{l.msg}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <Button
                variant="ghost"
                leading={runState === 'paused' ? <IconPlay size={12} /> : <IconPause size={12} />}
                onClick={() => setRunState(s => s === 'running' ? 'paused' : 'running')}
              >
                {runState === 'paused' ? 'Resume' : 'Pause'}
              </Button>
              <Button variant="secondary" onClick={onExit}>Cancel (rolls back)</Button>
            </div>
          </div>
        )}

        {/* === STEP 4: RESULT === */}
        {step === 'result' && (
          <div className="fade-up" style={{ textAlign: 'center', paddingTop: 16 }}>
            <div style={{ marginBottom: 14 }}>
              <Badge variant="accent" leading={<IconCheck size={11} strokeWidth={2.5} />}>Cleanup complete</Badge>
            </div>
            <div className="display-italic" style={{ fontSize: 28, color: 'var(--ink-soft)', marginBottom: 18 }}>
              You reclaimed
            </div>
            <div style={{ marginBottom: 8 }}>
              <AnimatedCounter targetBytes={resultBytes} size={96} color="var(--accent)" />
            </div>
            <div style={{ color: 'var(--ink-muted)', fontSize: 13, maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.55 }}>
              Moved <span className="mono" style={{ color: 'var(--ink-soft)' }}>{selected.size}</span> categories into a quarantine bundle on <span className="mono" style={{ color: 'var(--ink-soft)' }}>{destination}:\PolishQuarantine\</span>. Restorable for <span className="mono" style={{ color: 'var(--ink-soft)' }}>{MODES[mode].retentionDays}</span> days.
            </div>

            {/* Before / after */}
            <Card style={{ padding: 24, marginBottom: 24, textAlign: 'left' }}>
              <SectionLabel style={{ marginBottom: 14 }}>C: drive · before / after</SectionLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 6 }}>Before</div>
                  <div style={{ height: 8, background: 'var(--surface-sunken)', borderRadius: 999, overflow: 'hidden', border: '1px solid var(--line-soft)' }}>
                    <div style={{ width: '99%', height: '100%', background: 'var(--status-danger)' }} />
                  </div>
                  <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 6 }}>371 / 375 GB</div>
                </div>
                <IconArrowRight size={18} style={{ color: 'var(--ink-muted)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--accent-ink)', marginBottom: 6, fontWeight: 500 }}>After</div>
                  <div style={{ height: 8, background: 'var(--surface-sunken)', borderRadius: 999, overflow: 'hidden', border: '1px solid var(--line-soft)' }}>
                    <div
                      style={{ width: `${((371 - resultBytes/1024**3) / 375 * 100).toFixed(1)}%`, height: '100%', background: 'var(--accent)', transition: 'width 1200ms var(--ease-out) 400ms' }}
                    />
                  </div>
                  <div className="mono" style={{ fontSize: 11.5, color: 'var(--accent-ink)', marginTop: 6 }}>
                    {(371 - resultBytes/1024**3).toFixed(1)} / 375 GB · <span style={{ color: 'var(--ink-muted)' }}>−{(resultBytes/1024**3).toFixed(1)} GB</span>
                  </div>
                </div>
              </div>
            </Card>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Button variant="ghost" leading={<IconRestore size={13} />} onClick={() => onNavigate('quarantine')}>Browse quarantine</Button>
              <Button variant="secondary" onClick={() => onNavigate('history')}>View manifest</Button>
              <Button variant="primary" onClick={onExit} trailing={<IconArrowRight size={13} />}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { CleanWizard });
