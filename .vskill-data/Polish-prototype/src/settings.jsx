// Settings — single well-built page with sub-nav. Notifications section is the hero.

const SettingsRow = ({ label, hint, control, last }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: 24, padding: '18px 0',
    borderBottom: last ? 'none' : '1px solid var(--line-soft)',
  }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{label}</div>
      {hint && <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4, lineHeight: 1.5, maxWidth: '60ch' }}>{hint}</div>}
    </div>
    <div style={{ flexShrink: 0 }}>{control}</div>
  </div>
);

const Settings = () => {
  const [section, setSection] = useState('notifications');
  const [s, setS] = useState({
    notifDaily: true,
    notifTime: '10:00',
    notifThreshold: 1.0,
    notifWeekends: false,
    notifCritical: true,
    bgScan: true,
    scanCadence: '30 min',
    scanThrottle: 5,
    scanOnBattery: false,
    quietStart: '22:00',
    quietEnd: '08:00',
    bootStart: true,
    loginLaunch: true,
    theme: 'light',
    holdConfirm: 5,
    starPrompt: 3,
    telemetry: false,
    crashReports: false,
    autoCleanPolicy: 'notify-only',
  });

  const set = (k, v) => setS(prev => ({ ...prev, [k]: v }));

  const sections = [
    { id: 'general', label: 'General' },
    { id: 'scanning', label: 'Scanning' },
    { id: 'cleanup', label: 'Cleanup defaults' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'autoclean', label: 'Auto‑clean' },
    { id: 'quarantine', label: 'Quarantine' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'service', label: 'Service' },
    { id: 'updates', label: 'Updates' },
    { id: 'advanced', label: 'Advanced' },
  ];

  return (
    <div className="page">
      <div className="page-inner" style={{ paddingTop: 36 }}>
        <SectionLabel style={{ marginBottom: 10 }}>Settings</SectionLabel>
        <h1 className="display" style={{ fontSize: 40, margin: 0, lineHeight: 1.05, marginBottom: 36 }}>
          Make Polish your own.
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 36, alignItems: 'start' }}>
          {/* Sub-nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'sticky', top: 36 }}>
            {sections.map(sec => {
              const active = section === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setSection(sec.id)}
                  style={{
                    textAlign: 'left',
                    padding: '7px 12px',
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: active ? 500 : 400,
                    color: active ? 'var(--accent-ink)' : 'var(--ink-soft)',
                    background: active ? 'var(--accent-soft)' : 'transparent',
                    transition: 'all 120ms',
                  }}
                >
                  {sec.label}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div style={{ minWidth: 0 }}>
            {section === 'notifications' && (
              <div className="fade-in">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, margin: '0 0 8px', fontWeight: 400 }}>
                  Notifications
                </h2>
                <p style={{ color: 'var(--ink-muted)', fontSize: 13, margin: '0 0 24px', lineHeight: 1.55, maxWidth: '60ch' }}>
                  Polish notifies <em style={{ color: 'var(--ink-soft)' }}>once a day, max</em> — batched into a digest. Quiet hours, DND, and weekends are all respected.
                </p>

                <Card style={{ padding: '4px 24px' }}>
                  <SettingsRow
                    label="Daily summary toast"
                    hint="A single grouped notification with the day's reclaim opportunities. Click to open Clean with items pre‑selected."
                    control={<Switch on={s.notifDaily} onChange={v => set('notifDaily', v)} />}
                  />
                  <SettingsRow
                    label="Daily summary time"
                    hint="Posted at this local time during the next idle window."
                    control={
                      <div className="mono" style={{
                        padding: '7px 10px', border: '1px solid var(--line-strong)', borderRadius: 4,
                        fontSize: 13, color: 'var(--ink)', minWidth: 72, textAlign: 'center',
                      }}>{s.notifTime}</div>
                    }
                  />
                  <SettingsRow
                    label="Minimum reclaim to notify"
                    hint="No toast unless we can free at least this much. Keeps Polish from interrupting over 80 MB of cache."
                    control={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="range" min="0.1" max="10" step="0.1"
                          value={s.notifThreshold}
                          onChange={(e) => set('notifThreshold', parseFloat(e.target.value))}
                          style={{ width: 140, accentColor: 'var(--accent)' }}
                        />
                        <NumDisplay value={s.notifThreshold.toFixed(1)} unit="GB" size={14} color="var(--ink)" />
                      </div>
                    }
                  />
                  <SettingsRow
                    label="Weekend notifications"
                    hint="Off by default. Polish stays quiet Saturday and Sunday."
                    control={<Switch on={s.notifWeekends} onChange={v => set('notifWeekends', v)} />}
                  />
                  <SettingsRow
                    label="Critical disk‑full alerts"
                    hint="Interrupts outside the daily window when the system drive drops below 5%. Always DND‑aware."
                    control={<Switch on={s.notifCritical} onChange={v => set('notifCritical', v)} />}
                    last
                  />
                </Card>

                <div style={{ marginTop: 24, padding: 16, background: 'var(--surface-warm)', borderRadius: 5, border: '1px solid var(--line-soft)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <IconShield size={14} style={{ color: 'var(--accent)', marginTop: 1 }} />
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
                    Polish never invents urgency. We won't show "PC at risk" toasts or paint cache red. We won't re‑enable disabled notifications on update.
                  </div>
                </div>

                {/* Toast preview */}
                <div style={{ marginTop: 32 }}>
                  <SectionLabel style={{ marginBottom: 12 }}>Preview</SectionLabel>
                  <div style={{
                    padding: 20,
                    background: 'var(--ink)',
                    borderRadius: 6,
                    maxWidth: 380,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 16, height: 16, borderRadius: 3, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 11, lineHeight: 1, paddingBottom: 1 }}>P</div>
                      <span style={{ fontSize: 11, color: 'oklch(0.72 0.01 250)', letterSpacing: '0.02em' }}>Polish — Daily summary</span>
                    </div>
                    <div style={{ color: '#fff', fontSize: 13.5, lineHeight: 1.5, marginBottom: 14 }}>
                      You can reclaim ~14.8 GB across 5 categories.
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.10)', color: '#fff', fontSize: 11, borderRadius: 4, fontWeight: 500 }}>Clean now</button>
                      <button style={{ padding: '6px 12px', color: 'oklch(0.72 0.01 250)', fontSize: 11, borderRadius: 4 }}>Snooze ▾</button>
                      <button style={{ padding: '6px 12px', color: 'oklch(0.72 0.01 250)', fontSize: 11, borderRadius: 4 }}>Dismiss</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {section === 'general' && (
              <div className="fade-in">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, margin: '0 0 8px', fontWeight: 400 }}>General</h2>
                <p style={{ color: 'var(--ink-muted)', fontSize: 13, margin: '0 0 24px' }}>How and when Polish launches.</p>
                <Card style={{ padding: '4px 24px' }}>
                  <SettingsRow label="Start Polish at Windows boot" hint="The background service starts before login." control={<Switch on={s.bootStart} onChange={v => set('bootStart', v)} />} />
                  <SettingsRow label="Launch UI at login" hint="Bring up the tray icon when you sign in." control={<Switch on={s.loginLaunch} onChange={v => set('loginLaunch', v)} />} />
                  <SettingsRow label="Theme" hint="Light is friendlier. Dark feels more focused. Auto follows Windows." control={
                    <Segmented value={s.theme} onChange={v => set('theme', v)} options={['auto', 'light', 'dark']} />
                  } last />
                </Card>
              </div>
            )}

            {section === 'scanning' && (
              <div className="fade-in">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, margin: '0 0 8px', fontWeight: 400 }}>Scanning</h2>
                <p style={{ color: 'var(--ink-muted)', fontSize: 13, margin: '0 0 24px' }}>The background service uses idle CPU only. You can pause it from the tray any time.</p>
                <Card style={{ padding: '4px 24px' }}>
                  <SettingsRow label="Background scanning" hint="Idle‑aware. Throttles at 5% CPU. Pauses on battery unless above 50%." control={<Switch on={s.bgScan} onChange={v => set('bgScan', v)} />} />
                  <SettingsRow label="Incremental scan every" control={
                    <Segmented value={s.scanCadence} onChange={v => set('scanCadence', v)} options={['15 min', '30 min', '60 min']} />
                  } />
                  <SettingsRow label="Maximum CPU during scan" control={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="range" min="1" max="20" value={s.scanThrottle} onChange={(e) => set('scanThrottle', parseInt(e.target.value))} style={{ width: 140, accentColor: 'var(--accent)' }} />
                      <NumDisplay value={s.scanThrottle} unit="%" size={14} />
                    </div>
                  } />
                  <SettingsRow label="Scan on battery" hint="Off by default to preserve battery life." control={<Switch on={s.scanOnBattery} onChange={v => set('scanOnBattery', v)} />} last />
                </Card>
              </div>
            )}

            {section === 'privacy' && (
              <div className="fade-in">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, margin: '0 0 8px', fontWeight: 400 }}>Privacy</h2>
                <p style={{ color: 'var(--ink-muted)', fontSize: 13, margin: '0 0 24px', lineHeight: 1.55, maxWidth: '60ch' }}>
                  Polish is local‑first. Both toggles below are <em style={{ color: 'var(--ink-soft)' }}>off by default</em>. We never collect file paths, file names, contents, environment variables, hostname, username, or IP.
                </p>
                <Card style={{ padding: '4px 24px' }}>
                  <SettingsRow label="Send anonymous usage stats" hint="OS version + app version + counts (scans run, items cleaned). Opt‑in only." control={<Switch on={s.telemetry} onChange={v => set('telemetry', v)} />} />
                  <SettingsRow label="Send crash reports" hint="Sanitized stack traces. Opt‑in only." control={<Switch on={s.crashReports} onChange={v => set('crashReports', v)} />} last />
                </Card>
                <div style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-muted)' }}>
                  <a style={{ color: 'var(--accent-ink)', textDecoration: 'underline', textDecorationColor: 'var(--accent-soft)', textUnderlineOffset: 3 }} href="#">
                    Read the full data collection schema →
                  </a>
                </div>
              </div>
            )}

            {section === 'cleanup' && (
              <div className="fade-in">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, margin: '0 0 8px', fontWeight: 400 }}>Cleanup defaults</h2>
                <p style={{ color: 'var(--ink-muted)', fontSize: 13, margin: '0 0 24px' }}>Choices that apply each time you open the Clean wizard.</p>
                <Card style={{ padding: '4px 24px' }}>
                  <SettingsRow label="Default mode" control={
                    <Segmented value="balanced" onChange={() => {}} options={['light', 'balanced', 'aggressive']} />
                  } />
                  <SettingsRow label="Hold‑to‑confirm duration" hint="For irreversible actions like DISM and Windows.old." control={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="range" min="1" max="10" value={s.holdConfirm} onChange={(e) => set('holdConfirm', parseInt(e.target.value))} style={{ width: 140, accentColor: 'var(--accent)' }} />
                      <NumDisplay value={s.holdConfirm} unit="sec" size={14} />
                    </div>
                  } />
                  <SettingsRow label="Show 'Star us on GitHub' prompt" hint="After this many successful cleans. Set to 0 to disable." control={
                    <div className="mono" style={{ padding: '5px 10px', border: '1px solid var(--line-strong)', borderRadius: 4, fontSize: 13, minWidth: 40, textAlign: 'center' }}>
                      {s.starPrompt}
                    </div>
                  } last />
                </Card>
              </div>
            )}

            {section === 'autoclean' && (
              <div className="fade-in">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, margin: '0 0 8px', fontWeight: 400 }}>Auto‑clean</h2>
                <p style={{ color: 'var(--ink-muted)', fontSize: 13, margin: '0 0 8px', lineHeight: 1.55, maxWidth: '60ch' }}>
                  By default, Polish only <em>notifies</em>. It will never delete on a schedule unless you explicitly opt in.
                </p>
                <div style={{ marginBottom: 24, padding: 14, background: 'var(--status-warn-soft)', borderRadius: 5, border: '1px solid oklch(0.85 0.06 70)', display: 'flex', gap: 10 }}>
                  <IconAlertTriangle size={14} style={{ color: 'var(--status-warn)', marginTop: 2, flexShrink: 0 }} />
                  <div style={{ fontSize: 12, color: 'oklch(0.40 0.12 65)', lineHeight: 1.55 }}>
                    Enabling auto‑clean means Polish will run on a schedule without confirmation. Quarantine still applies — nothing is permanently deleted before retention ends.
                  </div>
                </div>
                <Card style={{ padding: 24 }}>
                  {[
                    { v: 'notify-only', t: 'Notify only', d: 'Polish surfaces opportunities. You confirm every clean.', recommended: true },
                    { v: 'safe-auto', t: 'Safe auto', d: 'Always‑safe categories may auto‑clean during idle. Other tiers still prompt.' },
                    { v: 'full-auto', t: 'Full auto (whitelist)', d: 'Categories on your whitelist auto‑clean. Caution: requires opt‑in toggle.' },
                  ].map((o, i) => (
                    <label
                      key={o.v}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                        padding: '14px 0',
                        borderTop: i === 0 ? 'none' : '1px solid var(--line-soft)',
                        cursor: 'pointer',
                      }}
                      onClick={() => set('autoCleanPolicy', o.v)}
                    >
                      <span style={{
                        width: 14, height: 14, borderRadius: '50%',
                        border: `1.5px solid ${s.autoCleanPolicy === o.v ? 'var(--accent)' : 'var(--line-strong)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: 2,
                      }}>
                        {s.autoCleanPolicy === o.v && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {o.t}
                          {o.recommended && <Badge variant="accent">Recommended</Badge>}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 3, lineHeight: 1.55 }}>{o.d}</div>
                      </div>
                    </label>
                  ))}
                </Card>
              </div>
            )}

            {(['quarantine', 'service', 'updates', 'advanced'].includes(section)) && (
              <div className="fade-in" style={{ padding: '40px 0', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink-soft)' }}>
                  {sections.find(x => x.id === section).label} settings live here.
                </div>
                <div className="micro" style={{ marginTop: 8 }}>
                  Prototype focuses on Notifications, General, Scanning, Cleanup defaults, Auto‑clean, and Privacy.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Settings });
