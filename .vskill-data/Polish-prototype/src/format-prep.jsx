// Format Prep — Pro-locked feature teaser. Shows the 7-step wizard outline
// with a beautiful "locked" overlay treatment.

const FormatPrep = ({ onNavigate, showProBadges }) => {
  const steps = [
    { num: '01', label: 'System snapshot',     desc: 'Inventory installed apps, IDE extensions, dev toolchain versions, env vars, services, drivers, taskbar pins. Writes inventory.json + inventory.md.' },
    { num: '02', label: 'Backup destination',  desc: 'Pick a target drive. Auto‑detects external. Optional AES‑256 encryption with password in Credential Manager.' },
    { num: '03', label: 'Backup execution',    desc: 'Copies credentials (.ssh, .aws, .azure, .gnupg), AI/dev tool configs (Claude, Cursor, VS Code), app data, browser data, databases, WSL distros, Docker volumes.' },
    { num: '04', label: 'Verify integrity',    desc: 'SHA‑256 across every backed‑up file vs. source. Any mismatch must resolve before continuing.' },
    { num: '05', label: 'Cleanup',             desc: 'Optional. Aggressive mode pre‑selected, you approve. Skippable if you just want the restore plan.' },
    { num: '06', label: 'Generate restore plan', desc: 'Outputs winget‑export.json, vscode‑extensions.txt, npm‑globals.txt, pip‑freeze.txt, env‑vars.reg, RESTORE‑README.md.' },
    { num: '07', label: 'Final greenlight',    desc: 'Printable checklist. Big "OK to format" button only goes green when every prior checkpoint did.' },
  ];

  return (
    <div className="page">
      <div className="page-inner" style={{ paddingTop: 36, maxWidth: 1080 }}>
        {/* Pro badge strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <SectionLabel>Prepare for format</SectionLabel>
          {showProBadges && <Badge variant="pro">Pro · v1.2</Badge>}
          <span className="micro">7‑step guided wizard</span>
        </div>

        <h1 className="display" style={{ fontSize: 56, margin: 0, lineHeight: 1.04, maxWidth: 720 }}>
          About to reformat?
          <br />
          <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Don't lose anything.</em>
        </h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 15.5, marginTop: 20, maxWidth: '52ch', lineHeight: 1.55 }}>
          The journey every Windows user faces a few times in a PC's life. Polish walks you through inventory, backup, verify, and restore plan — then greenlights the format only when every checkpoint passes.
        </p>

        {/* 7-step grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, marginTop: 56 }}>
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="fade-up"
              style={{
                animationDelay: `${i * 60}ms`,
                padding: '22px 24px',
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 5,
                display: 'flex', gap: 18,
                position: 'relative',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--surface-warm)',
                border: '1px solid var(--line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500,
                color: 'var(--ink-soft)',
                flexShrink: 0,
              }}>
                {s.num}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 19, lineHeight: 1.2, marginBottom: 6 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-muted)', lineHeight: 1.55 }}>
                  {s.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        {showProBadges ? (
          <div style={{
            marginTop: 48,
            padding: '36px 40px',
            background: 'var(--ink)',
            borderRadius: 6,
            color: '#fff',
            display: 'flex', alignItems: 'center', gap: 32,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                <IconLock size={14} style={{ color: 'oklch(0.72 0.01 250)' }} />
                <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'oklch(0.72 0.01 250)' }}>
                  Polish Pro · ships v1.2
                </span>
              </div>
              <div className="display-italic" style={{ fontSize: 32, lineHeight: 1.1, marginBottom: 10 }}>
                Annual sub or capped lifetime.
              </div>
              <p style={{ color: 'oklch(0.78 0.005 250)', fontSize: 13.5, margin: 0, lineHeight: 1.55, maxWidth: '50ch' }}>
                Format Prep is the flagship Pro feature. First 500 seats get a $79 lifetime promo for the v1.x major. After that, annual only.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200 }}>
              <div style={{ padding: 14, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 5, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'oklch(0.72 0.01 250)', marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Annual</div>
                <NumDisplay value="$29" size={32} color="#fff" />
                <div style={{ fontSize: 11, color: 'oklch(0.72 0.01 250)', marginTop: 4 }}>/ year</div>
              </div>
              <div style={{ padding: 14, background: 'var(--accent)', borderRadius: 5, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'oklch(0.85 0.06 155)', marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Lifetime</div>
                <NumDisplay value="$79" size={32} color="#fff" />
                <div style={{ fontSize: 11, color: 'oklch(0.88 0.04 155)', marginTop: 4 }}>v1.x major · capped 500</div>
              </div>
              <Button variant="secondary" size="sm" style={{ background: '#fff', borderColor: '#fff', color: 'var(--ink)' }}>
                Join the waitlist
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 48, padding: 28, background: 'var(--surface-warm)', borderRadius: 6, border: '1px solid var(--line)' }}>
            <div className="display-italic" style={{ fontSize: 22, marginBottom: 8 }}>Ships in v1.2.</div>
            <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, margin: 0, maxWidth: '54ch', lineHeight: 1.55 }}>
              Until then, you can still inventory and back up manually. The PLAN.md spec covers everything we'll automate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { FormatPrep });
