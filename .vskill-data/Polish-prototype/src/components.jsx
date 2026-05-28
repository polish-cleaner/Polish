// Shared UI primitives — Button, Card, Badge, Checkbox, Toggle, Segmented, ProgressBar, NumDisplay, etc.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

const Button = ({ variant = 'secondary', size = 'md', leading, trailing, children, ...rest }) => {
  const cls = `btn btn-${variant}${size !== 'md' ? ` btn-${size}` : ''}`;
  return (
    <button className={cls} {...rest}>
      {leading}
      {children && <span>{children}</span>}
      {trailing}
    </button>
  );
};

const Card = ({ children, sunken, style, className = '', ...rest }) => (
  <div className={`card${sunken ? ' card-sunken' : ''} ${className}`} style={style} {...rest}>
    {children}
  </div>
);

const Badge = ({ variant = 'default', children, leading, style }) => (
  <span className={`badge${variant !== 'default' ? ` badge-${variant}` : ''}`} style={style}>
    {leading}
    {children}
  </span>
);

const Dot = ({ kind = 'good', pulsing = false, style }) => (
  <span className={`dot dot-${kind}${pulsing ? ' dot-pulsing' : ''}`} style={style} />
);

const Checkbox = ({ checked, indeterminate, onChange, ariaLabel }) => {
  const cls = `check${checked ? ' checked' : ''}${indeterminate && !checked ? ' indeterminate' : ''}`;
  return (
    <span
      className={cls}
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(e) => { e.stopPropagation(); onChange && onChange(!checked); }}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') onChange && onChange(!checked); }}
      tabIndex={0}
    >
      <IconCheck size={11} strokeWidth={2.5} />
    </span>
  );
};

const Switch = ({ on, onChange, ariaLabel }) => (
  <span
    className={`toggle${on ? ' on' : ''}`}
    role="switch"
    aria-checked={on}
    aria-label={ariaLabel}
    onClick={() => onChange && onChange(!on)}
    tabIndex={0}
    onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange && onChange(!on); } }}
  />
);

const Segmented = ({ value, onChange, options }) => (
  <div className="segmented">
    {options.map(opt => (
      <button
        key={opt.value || opt}
        className={value === (opt.value || opt) ? 'active' : ''}
        onClick={() => onChange(opt.value || opt)}
      >
        {opt.label || opt}
      </button>
    ))}
  </div>
);

const ProgressBar = ({ value, max = 100, indeterminate, style, height }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="progress" style={{ ...style, height: height ? `${height}px` : undefined }}>
      <div
        className={`progress-bar${indeterminate ? ' progress-bar-indeterminate' : ''}`}
        style={{ width: indeterminate ? undefined : `${pct}%` }}
      />
    </div>
  );
};

// NumDisplay — large mono number with smaller, non-mono unit.
const NumDisplay = ({ value, unit, size = 32, weight = 500, color, style }) => (
  <span className="num-display" style={{ fontSize: size, fontWeight: weight, color, ...style }}>
    {value}
    {unit && <span className="num-unit">{unit}</span>}
  </span>
);

// AnimatedCounter — counts up from 0 to a target byte count.
const AnimatedCounter = ({ targetBytes, durationMs = 1400, size = 64, color }) => {
  const [bytes, setBytes] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setBytes(targetBytes * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetBytes, durationMs]);
  const { num, unit } = fmtBytes(bytes);
  return <NumDisplay value={num} unit={unit} size={size} weight={500} color={color} />;
};

// HoldButton — for irreversible actions. Press and hold; fires onConfirm when held N ms.
const HoldButton = ({ durationMs = 5000, onConfirm, children, variant = 'danger' }) => {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startRef.current = null;
    setProgress(0);
  }, []);

  const start = useCallback(() => {
    startRef.current = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - startRef.current) / durationMs);
      setProgress(t);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else {
        rafRef.current = null;
        onConfirm && onConfirm();
        setProgress(0);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [durationMs, onConfirm]);

  useEffect(() => () => stop(), [stop]);

  const bg = variant === 'danger' ? 'var(--status-danger)' : 'var(--accent)';
  return (
    <button
      className={`btn btn-${variant}`}
      style={{ position: 'relative', overflow: 'hidden' }}
      onMouseDown={start}
      onMouseUp={stop}
      onMouseLeave={stop}
      onTouchStart={start}
      onTouchEnd={stop}
    >
      <span
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${progress * 100}%`,
          background: 'rgba(255,255,255,0.18)',
          transition: progress === 0 ? 'width 200ms' : 'none',
        }}
      />
      <span style={{ position: 'relative' }}>
        {progress > 0 ? `Hold to confirm… ${Math.ceil((1 - progress) * (durationMs / 1000))}s` : children}
      </span>
    </button>
  );
};

// SectionLabel — small caps label used above content.
const SectionLabel = ({ children, style }) => (
  <div className="label" style={style}>{children}</div>
);

// Toast — controlled by app-level state.
const Toast = ({ kind = 'info', title, body, onDismiss, action }) => {
  const dotKind = kind === 'good' ? 'good' : kind === 'warn' ? 'warn' : kind === 'danger' ? 'danger' : 'good';
  return (
    <div className="toast">
      <Dot kind={dotKind} style={{ marginTop: 6 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ink)' }}>{title}</div>
        {body && <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 3 }}>{body}</div>}
        {action && <div style={{ marginTop: 8 }}>{action}</div>}
      </div>
      <button
        className="btn-ghost"
        style={{ padding: 4, borderRadius: 4, color: 'var(--ink-muted)' }}
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        <IconX size={14} />
      </button>
    </div>
  );
};

// DiskGauge — vertical capsule showing used/total.
const DiskGauge = ({ drive, large = false }) => {
  const pct = (drive.used / drive.total) * 100;
  const usedFmt = fmtBytes(drive.used * 1024**3);
  const totalFmt = fmtBytes(drive.total * 1024**3);
  const isCritical = pct > 92;
  const isWarn = pct > 80 && !isCritical;
  const barColor = isCritical ? 'var(--status-danger)' : isWarn ? 'var(--status-warn)' : 'var(--accent)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '6px 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, width: 80, flexShrink: 0 }}>
        <span className="num-display" style={{ fontSize: large ? 18 : 15, fontWeight: 500 }}>{drive.label}</span>
        <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{drive.name}</span>
      </div>
      <div style={{ flex: 1, minWidth: 80 }}>
        <div style={{
          height: large ? 8 : 6,
          background: 'var(--surface-sunken)',
          borderRadius: 999,
          overflow: 'hidden',
          border: '1px solid var(--line-soft)',
        }}>
          <div style={{
            width: `${pct}%`,
            height: '100%',
            background: barColor,
            transition: 'width 600ms var(--ease-out)',
          }} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexShrink: 0, minWidth: 110, justifyContent: 'flex-end' }}>
        <NumDisplay value={usedFmt.num} unit={usedFmt.unit} size={large ? 15 : 13} weight={500} color="var(--ink)" />
        <span style={{ color: 'var(--ink-faint)', fontSize: 11, margin: '0 2px' }}>/</span>
        <NumDisplay value={totalFmt.num} unit={totalFmt.unit} size={large ? 13 : 12} weight={400} color="var(--ink-muted)" />
      </div>
    </div>
  );
};

// CategoryIcon — derives an icon from category tier
const CategoryIcon = ({ tier, size = 14 }) => {
  const map = {
    'always-safe': IconSparkles,
    'safe-devs':   IconCode,
    'system':      IconCpu,
    'large-user':  IconHardDrive,
    'app-cache':   IconFolder,
  };
  const Cmp = map[tier] || IconFile;
  const color = {
    'always-safe': 'var(--status-good)',
    'safe-devs':   'var(--status-info)',
    'system':      'var(--status-warn)',
    'large-user':  'var(--ink-soft)',
    'app-cache':   'var(--ink-muted)',
  }[tier] || 'var(--ink-muted)';
  return <Cmp size={size} style={{ color }} />;
};

Object.assign(window, {
  Button, Card, Badge, Dot, Checkbox, Switch, Segmented, ProgressBar,
  NumDisplay, AnimatedCounter, HoldButton, SectionLabel, Toast,
  DiskGauge, CategoryIcon,
});
