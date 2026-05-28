// Sidebar — left rail nav.

const Sidebar = ({ currentPage, onNavigate, showProBadges }) => {
  const items = [
    { id: 'dashboard',   label: 'Dashboard',          Icon: IconHome },
    { id: 'clean',       label: 'Clean',              Icon: IconBroom },
    { id: 'format-prep', label: 'Prepare for format', Icon: IconRocket, pro: true },
    { id: 'quarantine',  label: 'Quarantine',         Icon: IconBox, badge: '3' },
    { id: 'history',     label: 'History',            Icon: IconScroll },
    { id: 'settings',    label: 'Settings',           Icon: IconSettings },
    { id: 'about',       label: 'About',              Icon: IconInfo },
  ];

  return (
    <aside style={{
      width: 232,
      background: 'var(--bg-deep)',
      borderRight: '1px solid var(--line)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ padding: '22px 22px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 22, height: 22,
          borderRadius: 5,
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff',
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 16,
          lineHeight: 1,
          paddingBottom: 2,
        }}>
          P
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 21,
          letterSpacing: '-0.005em',
          color: 'var(--ink)',
          lineHeight: 1,
        }}>
          Polish
        </div>
        <span className="badge" style={{ marginLeft: 'auto', fontSize: 9.5, padding: '2px 6px', borderColor: 'transparent', background: 'transparent', color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
          v1.0.4
        </span>
      </div>

      {/* Nav */}
      <nav style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
        {items.map(item => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 5,
                color: active ? 'var(--ink)' : 'var(--ink-soft)',
                background: active ? 'var(--surface)' : 'transparent',
                fontWeight: active ? 500 : 400,
                fontSize: 13,
                textAlign: 'left',
                transition: 'all 120ms var(--ease-out)',
                border: active ? '1px solid var(--line)' : '1px solid transparent',
                boxShadow: active ? '0 1px 1px rgba(0,0,0,0.02)' : 'none',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--surface-warm)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <item.Icon size={15} style={{ color: active ? 'var(--accent)' : 'currentColor' }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--ink-muted)',
                  background: active ? 'var(--surface-sunken)' : 'transparent',
                  padding: '1px 5px',
                  borderRadius: 3,
                }}>
                  {item.badge}
                </span>
              )}
              {item.pro && showProBadges && <Badge variant="pro">Pro</Badge>}
            </button>
          );
        })}
      </nav>

      {/* Bottom — service status + disk gauge mini */}
      <div style={{ padding: '12px 16px 18px', borderTop: '1px solid var(--line)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 4px',
          fontSize: 11.5, color: 'var(--ink-soft)',
        }}>
          <Dot kind="good" pulsing />
          <span style={{ flex: 1 }}>Service healthy</span>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-muted)' }}>{SERVICE.cpu}% CPU</span>
        </div>
        <div style={{ marginTop: 6 }}>
          <DiskGauge drive={DRIVES[0]} />
        </div>
      </div>
    </aside>
  );
};

Object.assign(window, { Sidebar });
