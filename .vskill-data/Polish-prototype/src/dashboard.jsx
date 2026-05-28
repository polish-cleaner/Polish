// Dashboard — widget-driven layout. Hero stat band → chart widgets row →
// reclaim opportunities table → quarantine + format prep CTAs.

const Dashboard = ({ onNavigate, onStartCleanWith }) => {
  const reclaimItems = useMemo(() => CATEGORIES
    .filter(c => c.bytes >= 1.0 * 1024**3)
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 5), []);

  const [selectedReclaim, setSelectedReclaim] = useState(() => {
    const s = new Set();
    reclaimItems.forEach(c => { if (c.defaultModes.includes('balanced')) s.add(c.id); });
    return s;
  });

  const reclaimSelectedBytes = useMemo(() =>
    reclaimItems.filter(c => selectedReclaim.has(c.id)).reduce((s, c) => s + c.bytes, 0),
  [selectedReclaim, reclaimItems]);

  const totalReclaim = useMemo(() => CATEGORIES.reduce((s, c) => s + c.bytes, 0), []);
  const totalFmt = fmtBytes(totalReclaim);
  const selectedFmt = fmtBytes(reclaimSelectedBytes);

  // Computed numbers
  const totalReclaim90d = useMemo(() =>
    RECLAIM_TREND.reduce((s, w) => s + w.value, 0), []);
  const totalReclaimFmt = fmtBytes(totalReclaim90d);
  const cleansLast90 = RECLAIM_TREND.filter(w => w.value > 0).length;
  const scannedDays = DAY_ACTIVITY.filter(d => d.scanned).length;

  const cDrive = DRIVES[0];
  const cFree = cDrive.total - cDrive.used;

  const toggleReclaim = (id) => {
    setSelectedReclaim(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="page">
      <div className="page-inner">
        {/* Hero strip */}
        <div className="fade-up" style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 12 }}>
          <SectionLabel>Dashboard</SectionLabel>
          <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
            Last scanned <span className="mono" style={{ color: 'var(--ink-soft)' }}>{fmtAgo(SCAN_LAST.minsAgo)}</span> · Background scanner is on
          </span>
        </div>
        <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32, marginBottom: 32 }}>
          <h1 className="display" style={{ fontSize: 44, margin: 0, lineHeight: 1.05, maxWidth: 720 }}>
            You can reclaim{' '}
            <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>
              {totalFmt.num}<span style={{ fontFamily: 'var(--font-body)', fontSize: '0.5em', fontWeight: 400, marginLeft: '0.15em' }}>{totalFmt.unit}</span>
            </em>{' '}
            across {SCAN_LAST.categoryCount} categories.
          </h1>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <Button variant="ghost" leading={<IconRefresh size={13} />} onClick={() => onNavigate('clean')}>
              Rescan
            </Button>
            <Button variant="primary" onClick={() => onStartCleanWith && onStartCleanWith('balanced', selectedReclaim)} trailing={<IconArrowRight size={13} />}>
              Review &amp; clean
            </Button>
          </div>
        </div>

        {/* KPI band */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
          <KpiCard
            label="Reclaimable now"
            value={totalFmt.num}
            unit={totalFmt.unit}
            sub={`${SCAN_LAST.categoryCount} categories`}
            trend="↑ 18%"
            trendKind="up"
            icon={<IconSparkles size={13} />}
            accent="var(--accent)"
          />
          <KpiCard
            label="C: drive free"
            value={cFree.toFixed(1)}
            unit="GB"
            sub={`${((cFree / cDrive.total) * 100).toFixed(1)}% of ${cDrive.total} GB`}
            trend="critical"
            trendKind="down"
            icon={<IconHardDrive size={13} />}
            accent="var(--status-danger)"
          />
          <KpiCard
            label="In quarantine"
            value="43.1"
            unit="GB"
            sub="3 runs · purge in 4d"
            icon={<IconBox size={13} />}
            accent="var(--ink-soft)"
          />
          <KpiCard
            label="Freed last 90 days"
            value={totalReclaimFmt.num}
            unit={totalReclaimFmt.unit}
            sub={`across ${cleansLast90} cleans`}
            trend="↑ 31%"
            trendKind="up"
            icon={<IconRestore size={13} />}
            accent="var(--accent)"
          />
        </div>

        {/* Chart widgets row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 14, marginBottom: 22 }}>
          {/* Disk breakdown donut — primary widget */}
          <Card style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <SectionLabel style={{ marginBottom: 4 }}>What's on C:</SectionLabel>
                <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                  Inventoried during last full scan · <span className="mono">{fmtAgo(SCAN_LAST.minsAgo)}</span>
                </div>
              </div>
              <Badge>371 GB used</Badge>
            </div>
            <DonutChart
              segments={DISK_BREAKDOWN}
              size={180}
              thickness={22}
              centerLabel="C: used"
              centerValue="371"
              centerUnit="GB"
            />
          </Card>

          {/* Reclaim trend sparkline */}
          <Card style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 18 }}>
              <SectionLabel style={{ marginBottom: 4 }}>Reclaim trend</SectionLabel>
              <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                Past 12 weeks · weekly total
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
              <NumDisplay value={totalReclaimFmt.num} unit={totalReclaimFmt.unit} size={28} color="var(--ink)" />
              <span style={{ fontSize: 11, color: 'var(--status-good)', fontWeight: 500, marginLeft: 6 }}>↑ 31% vs prior 12w</span>
            </div>
            <div style={{ flex: 1, minHeight: 80 }}>
              <AreaSparkline
                data={RECLAIM_TREND}
                width={340}
                height={88}
                color="var(--accent)"
                fillOpacity={0.10}
                showDots
                showAxis
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>
              <span>{RECLAIM_TREND[0].week}</span>
              <span>{RECLAIM_TREND[RECLAIM_TREND.length - 1].week}</span>
            </div>
          </Card>
        </div>

        {/* Second row — top categories + activity heatmap */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 14, marginBottom: 32 }}>
          {/* Top categories horizontal bars */}
          <Card style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <SectionLabel style={{ marginBottom: 4 }}>Largest opportunities</SectionLabel>
                <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                  Colored by safety tier
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 10.5, color: 'var(--ink-muted)' }}>
                {[
                  { c: 'var(--accent)', l: 'always safe' },
                  { c: 'oklch(0.55 0.075 155)', l: 'devs' },
                  { c: 'oklch(0.68 0.060 155)', l: 'large user' },
                  { c: 'var(--status-warn)', l: 'system' },
                ].map(x => (
                  <span key={x.l} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: x.c }} />
                    {x.l}
                  </span>
                ))}
              </div>
            </div>
            <HBars data={TOP_CATEGORIES_VIEW} height={6} />
          </Card>

          {/* 30-day scan activity */}
          <Card style={{ padding: 22 }}>
            <div style={{ marginBottom: 18 }}>
              <SectionLabel style={{ marginBottom: 4 }}>30‑day scan activity</SectionLabel>
              <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                <span className="mono">{scannedDays}</span> scans · darker = more found
              </div>
            </div>
            <DayGrid data={DAY_ACTIVITY} cellSize={20} gap={4} color="oklch(0.42 0.085 155)" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 10.5, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>30d ago</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>less</span>
                {[0.15, 0.4, 0.7, 1].map((o, i) => (
                  <span key={i} style={{ width: 10, height: 10, borderRadius: 2, background: `color-mix(in oklch, var(--accent) ${o * 100}%, var(--surface))`, border: '1px solid var(--line-soft)' }} />
                ))}
                <span>more</span>
              </div>
              <span>today</span>
            </div>
          </Card>
        </div>

        {/* Disk gauges — kept as a wide horizontal row */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <SectionLabel>All drives</SectionLabel>
            <span style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>
              C: <span style={{ color: 'var(--status-danger)' }}>99% full</span>
            </span>
          </div>
          <Card style={{ padding: '14px 22px' }}>
            {DRIVES.map((d, i) => (
              <React.Fragment key={d.id}>
                {i > 0 && <div className="divider" style={{ margin: '4px 0', background: 'var(--line-soft)' }} />}
                <DiskGauge drive={d} large />
              </React.Fragment>
            ))}
          </Card>
        </div>

        {/* Top reclaim opportunities table */}
        <section style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <SectionLabel>Top reclaim opportunities</SectionLabel>
            <span style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>
              Sorted by size · check or uncheck to refine
            </span>
          </div>
          <Card>
            <div role="list">
              {reclaimItems.map((c, i) => {
                const fmt = fmtBytes(c.bytes);
                const checked = selectedReclaim.has(c.id);
                return (
                  <div
                    key={c.id}
                    role="listitem"
                    onClick={() => toggleReclaim(c.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 20px',
                      borderTop: i === 0 ? 'none' : '1px solid var(--line-soft)',
                      cursor: 'pointer',
                      transition: 'background 100ms',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-warm)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = ''}
                  >
                    <Checkbox checked={checked} onChange={() => toggleReclaim(c.id)} />
                    <CategoryIcon tier={c.tier} size={15} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{c.label}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginTop: 2 }}>{c.detail}</div>
                    </div>
                    <Badge variant={c.tier === 'always-safe' ? 'accent' : c.tier === 'system' ? 'warn' : 'default'}>
                      {TIERS[c.tier].label}
                    </Badge>
                    <div style={{ minWidth: 80, textAlign: 'right' }}>
                      <NumDisplay value={fmt.num} unit={fmt.unit} size={15} color="var(--ink)" />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{
              borderTop: '1px solid var(--line)',
              padding: '14px 20px',
              background: 'var(--surface-warm)',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                <span className="mono" style={{ color: 'var(--ink-soft)', marginRight: 3 }}>{selectedReclaim.size}</span> of <span className="mono" style={{ marginLeft: 2 }}>{reclaimItems.length}</span> selected
              </span>
              <div className="divider-vertical" style={{ height: 20 }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <SectionLabel>Will reclaim</SectionLabel>
                <NumDisplay value={selectedFmt.num} unit={selectedFmt.unit} size={17} color="var(--accent-ink)" />
              </div>
              <div style={{ flex: 1 }} />
              <Button
                variant="primary"
                size="sm"
                onClick={() => onStartCleanWith && onStartCleanWith('balanced', selectedReclaim)}
                trailing={<IconArrowRight size={13} />}
              >
                Clean selected
              </Button>
            </div>
          </Card>
        </section>

        {/* Quarantine + Format Prep duo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Quarantine summary card */}
          <Card style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
              <SectionLabel>Quarantine</SectionLabel>
              <Badge>3 runs</Badge>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
              <NumDisplay value="43.1" unit="GB" size={30} color="var(--ink)" />
              <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>restorable on D:\</span>
            </div>
            <div style={{ marginTop: 16 }}>
              <BarChart
                data={QUARANTINE_BARS}
                width={300}
                height={56}
                color="var(--accent)"
                barWidth={48}
                gap={20}
              />
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8, fontSize: 10.5, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                <span>17d ago</span>
                <span>10d ago</span>
                <span>3d ago</span>
              </div>
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line-soft)', display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="sm" onClick={() => onNavigate('quarantine')}>Browse</Button>
              <Button variant="ghost" size="sm" leading={<IconRestore size={13} />}>Restore last</Button>
            </div>
          </Card>

          {/* Format prep CTA card */}
          <Card style={{ padding: 22, background: 'var(--ink)', borderColor: 'var(--ink)', color: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <IconRocket size={14} style={{ color: '#fff' }} />
              <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'oklch(0.72 0.01 250)', fontWeight: 500 }}>
                Prepare for format
              </span>
              <Badge variant="pro" style={{ marginLeft: 'auto', background: '#fff', color: 'var(--ink)' }}>Pro</Badge>
            </div>
            <div className="display-italic" style={{ fontSize: 26, lineHeight: 1.15, marginBottom: 10, color: '#fff' }}>
              Don't lose anything.
            </div>
            <p style={{ fontSize: 12.5, color: 'oklch(0.82 0.005 250)', margin: 0, lineHeight: 1.55 }}>
              Inventory, back up, verify, generate a restore plan — then format with confidence.
            </p>
            <button
              onClick={() => onNavigate('format-prep')}
              style={{
                marginTop: 18,
                fontSize: 12, fontWeight: 500,
                color: '#fff',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              Start the wizard <IconArrowRight size={12} />
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Dashboard });
