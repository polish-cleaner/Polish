// App — root component. Routing, toast stack, tweaks panel.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent":     "#3d7050",
  "density":    "regular",
  "scenario":   "midlife",
  "showPro":    true,
  "tagline":    "Polish your PC.",
}/*EDITMODE-END*/;

// Accent → CSS variable mapping
const ACCENT_PALETTES = {
  '#3d7050': { // deep moss (default)
    accent: 'oklch(0.420 0.085 155)',
    deep:   'oklch(0.320 0.072 155)',
    hover:  'oklch(0.380 0.085 155)',
    soft:   'oklch(0.940 0.030 155)',
    ink:    'oklch(0.280 0.060 155)',
  },
  '#2f5f7a': { // deep ocean
    accent: 'oklch(0.450 0.080 230)',
    deep:   'oklch(0.350 0.070 230)',
    hover:  'oklch(0.410 0.080 230)',
    soft:   'oklch(0.945 0.025 230)',
    ink:    'oklch(0.290 0.060 230)',
  },
  '#7a4f2f': { // burnt amber
    accent: 'oklch(0.520 0.115 55)',
    deep:   'oklch(0.420 0.105 55)',
    hover:  'oklch(0.480 0.115 55)',
    soft:   'oklch(0.945 0.035 70)',
    ink:    'oklch(0.380 0.090 55)',
  },
  '#5c4a78': { // muted plum
    accent: 'oklch(0.440 0.085 300)',
    deep:   'oklch(0.350 0.075 300)',
    hover:  'oklch(0.400 0.085 300)',
    soft:   'oklch(0.945 0.030 310)',
    ink:    'oklch(0.310 0.070 300)',
  },
};

const App = () => {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [page, setPage] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [showDailyToast, setShowDailyToast] = useState(false);
  const [cleanInit, setCleanInit] = useState(null);

  // Apply tweak vars to root
  useEffect(() => {
    const root = document.documentElement;
    const palette = ACCENT_PALETTES[t.accent] || ACCENT_PALETTES['#3d7050'];
    root.style.setProperty('--accent', palette.accent);
    root.style.setProperty('--accent-deep', palette.deep);
    root.style.setProperty('--accent-hover', palette.hover);
    root.style.setProperty('--accent-soft', palette.soft);
    root.style.setProperty('--accent-ink', palette.ink);
    root.style.setProperty('--density', t.density === 'compact' ? 0.85 : t.density === 'comfy' ? 1.15 : 1);
  }, [t.accent, t.density]);

  // Surface a single demo toast 6 seconds in (only on dashboard, only once)
  useEffect(() => {
    if (page !== 'dashboard') return;
    const tid = setTimeout(() => setShowDailyToast(true), 5500);
    return () => clearTimeout(tid);
  }, [page]);

  const notify = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 5000);
  }, []);

  const dismissToast = (id) => setToasts(prev => prev.filter(x => x.id !== id));

  const startCleanWith = (mode, selected) => {
    setCleanInit({ mode, selected });
    setPage('clean');
  };

  const navigate = (id) => {
    if (id === 'about') {
      notify({ kind: 'good', title: 'About', body: 'v1.0.4 · MIT · signed by SignPath Foundation.' });
      return;
    }
    if (id !== 'clean') setCleanInit(null);
    setPage(id);
  };

  // === Render page ===
  let pageEl;
  if (page === 'dashboard') {
    pageEl = <Dashboard onNavigate={navigate} onStartCleanWith={startCleanWith} />;
  } else if (page === 'clean') {
    pageEl = (
      <CleanWizard
        key={cleanInit?.mode || 'default'}
        initialMode={cleanInit?.mode}
        initialSelected={cleanInit?.selected}
        onExit={() => { setCleanInit(null); setPage('dashboard'); }}
        onNavigate={navigate}
      />
    );
  } else if (page === 'quarantine') {
    pageEl = <Quarantine onNotify={notify} />;
  } else if (page === 'history') {
    pageEl = <History />;
  } else if (page === 'settings') {
    pageEl = <Settings />;
  } else if (page === 'format-prep') {
    pageEl = <FormatPrep onNavigate={navigate} showProBadges={t.showPro} />;
  }

  return (
    <>
      <Sidebar currentPage={page} onNavigate={navigate} showProBadges={t.showPro} />
      {pageEl}

      {/* Daily toast demo */}
      {showDailyToast && (
        <div className="toast-stack">
          <Toast
            kind="good"
            title="Polish — Daily summary"
            body="You can reclaim ~41.8 GB across 12 categories."
            action={
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { setShowDailyToast(false); navigate('clean'); }}
                >
                  Clean now
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowDailyToast(false)}
                  style={{ color: 'var(--ink-muted)' }}
                >
                  Snooze
                </button>
              </div>
            }
            onDismiss={() => setShowDailyToast(false)}
          />
        </div>
      )}

      {/* Other notifications */}
      {toasts.length > 0 && (
        <div className="toast-stack" style={{ bottom: showDailyToast ? 160 : 24 }}>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              kind={toast.kind}
              title={toast.title}
              body={toast.body}
              onDismiss={() => dismissToast(toast.id)}
            />
          ))}
        </div>
      )}

      {/* Tweaks panel */}
      <TweaksPanel>
        <TweakSection label="Identity" />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={['#3d7050', '#2f5f7a', '#7a4f2f', '#5c4a78']}
          onChange={(v) => setTweak('accent', v)}
        />

        <TweakSection label="Layout" />
        <TweakRadio
          label="Density"
          value={t.density}
          options={['compact', 'regular', 'comfy']}
          onChange={(v) => setTweak('density', v)}
        />

        <TweakSection label="State" />
        <TweakToggle
          label="Show Pro badges"
          value={t.showPro}
          onChange={(v) => setTweak('showPro', v)}
        />
      </TweaksPanel>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
