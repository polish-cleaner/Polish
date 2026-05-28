// Chart widgets — pure SVG, no libs. All charts respect --accent and theme tokens.

// =========================================================================
// DONUT — segments with center stat. Each segment: { id, label, value, color }
// =========================================================================
const DonutChart = ({ segments, size = 180, thickness = 22, centerLabel, centerValue, centerUnit }) => {
  const radius = (size - thickness) / 2;
  const circ = 2 * Math.PI * radius;
  const total = segments.reduce((s, x) => s + x.value, 0);
  let cumulative = 0;

  const [hoverIdx, setHoverIdx] = useState(null);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="var(--surface-sunken)"
            strokeWidth={thickness}
          />
          {segments.map((seg, i) => {
            const len = (seg.value / total) * circ;
            const offset = -cumulative;
            cumulative += len;
            const isHover = hoverIdx === i;
            return (
              <circle
                key={seg.id}
                cx={size / 2} cy={size / 2} r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={`${len - 1.5} ${circ - len + 1.5}`}
                strokeDashoffset={offset}
                style={{
                  cursor: 'pointer',
                  opacity: hoverIdx === null || isHover ? 1 : 0.4,
                  transition: 'opacity 160ms var(--ease-out)',
                }}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              />
            );
          })}
        </svg>
        {/* Center label */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div className="label" style={{ fontSize: 9.5 }}>
            {hoverIdx !== null ? segments[hoverIdx].label : centerLabel}
          </div>
          <NumDisplay
            value={hoverIdx !== null ? fmtBytes(segments[hoverIdx].value).num : centerValue}
            unit={hoverIdx !== null ? fmtBytes(segments[hoverIdx].value).unit : centerUnit}
            size={26}
            color="var(--ink)"
            style={{ marginTop: 4 }}
          />
          <div className="micro" style={{ marginTop: 4 }}>
            {hoverIdx !== null
              ? `${((segments[hoverIdx].value / total) * 100).toFixed(1)}%`
              : 'of disk'}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {segments.map((seg, i) => {
          const pct = ((seg.value / total) * 100).toFixed(1);
          const fmt = fmtBytes(seg.value);
          const isHover = hoverIdx === i;
          return (
            <div
              key={seg.id}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '5px 8px',
                borderRadius: 4,
                background: isHover ? 'var(--surface-warm)' : 'transparent',
                transition: 'background 100ms',
                cursor: 'pointer',
                fontSize: 12,
                opacity: hoverIdx !== null && !isHover ? 0.5 : 1,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
              <span style={{ flex: 1, color: 'var(--ink-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {seg.label}
              </span>
              <span className="mono" style={{ color: 'var(--ink)', fontWeight: 500 }}>
                {fmt.num}<span style={{ color: 'var(--ink-muted)', fontWeight: 400, marginLeft: 2 }}>{fmt.unit}</span>
              </span>
              <span className="mono micro" style={{ width: 36, textAlign: 'right' }}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =========================================================================
// AREA SPARKLINE — points over time. With axis ticks.
// =========================================================================
const AreaSparkline = ({ data, width = 100, height = 60, color = 'var(--accent)', fillOpacity = 0.12, showDots = false, showAxis = false, padding = 4 }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const w = width - padding * 2;
  const h = height - padding * 2;
  const step = data.length > 1 ? w / (data.length - 1) : 0;

  // Smooth path using cardinal spline approximation (catmull-rom)
  const points = data.map((d, i) => ({ x: padding + i * step, y: padding + h - (d.value / max) * h }));
  const linePath = points.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding + h} L ${points[0].x} ${padding + h} Z`;

  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      {showAxis && (
        <line x1={padding} y1={padding + h} x2={width - padding} y2={padding + h}
              stroke="var(--line)" strokeWidth="1" />
      )}
      <path d={areaPath} fill={color} fillOpacity={fillOpacity} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {showDots && points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="var(--surface)" stroke={color} strokeWidth="1.5" />
      ))}
    </svg>
  );
};

// =========================================================================
// VERTICAL BAR CHART — for week-over-week or run history
// =========================================================================
const BarChart = ({ data, width = 100, height = 60, color = 'var(--accent)', barWidth = 8, gap = 4, padding = 4, dimZero = true }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const h = height - padding * 2;
  const totalW = data.length * (barWidth + gap) - gap;
  const startX = (width - totalW) / 2;

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {data.map((d, i) => {
        const barH = (d.value / max) * h;
        const x = startX + i * (barWidth + gap);
        const y = padding + h - barH;
        return (
          <g key={i}>
            {d.value === 0 ? (
              <rect x={x} y={padding + h - 2} width={barWidth} height={2} fill="var(--line-strong)" rx={1} />
            ) : (
              <rect x={x} y={y} width={barWidth} height={barH || 2} fill={color} rx={1.5}
                    opacity={dimZero && d.dim ? 0.35 : 1} />
            )}
          </g>
        );
      })}
    </svg>
  );
};

// =========================================================================
// HORIZONTAL BARS — labels + value bars
// =========================================================================
const HBars = ({ data, maxValue, barColor = 'var(--accent)', height = 6 }) => {
  const max = maxValue || Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: '0 0 130px', minWidth: 0, fontSize: 12, color: 'var(--ink-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {d.label}
          </div>
          <div style={{ flex: 1, height: height, background: 'var(--surface-sunken)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              width: `${(d.value / max) * 100}%`,
              height: '100%',
              background: d.color || barColor,
              borderRadius: 999,
              transition: 'width 700ms var(--ease-out)',
            }} />
          </div>
          <div style={{ flex: '0 0 60px', textAlign: 'right' }}>
            {(() => { const f = fmtBytes(d.value); return <NumDisplay value={f.num} unit={f.unit} size={12.5} color="var(--ink)" />; })()}
          </div>
        </div>
      ))}
    </div>
  );
};

// =========================================================================
// DAY GRID — 30-day activity heatmap, calendar-style.
// =========================================================================
const DayGrid = ({ data, cellSize = 12, gap = 3, color = 'var(--accent)' }) => {
  // data: array of { date, value, scanned }, oldest first
  const max = Math.max(...data.map(d => d.value), 1);
  const cols = 10;
  const rows = Math.ceil(data.length / cols);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap: gap }}>
      {data.map((d, i) => {
        const intensity = d.value / max;
        const bg = !d.scanned
          ? 'var(--surface-sunken)'
          : d.value === 0
            ? 'var(--line)'
            : `color-mix(in oklch, ${color} ${Math.max(15, intensity * 100)}%, var(--surface))`;
        return (
          <div
            key={i}
            data-tip={`${d.date}: ${d.scanned ? (d.value > 0 ? `${fmtBytes(d.value).num} ${fmtBytes(d.value).unit} found` : 'clean') : 'no scan'}`}
            style={{
              width: cellSize, height: cellSize,
              borderRadius: 2,
              background: bg,
              border: '1px solid var(--line-soft)',
              cursor: 'pointer',
            }}
          />
        );
      })}
    </div>
  );
};

// =========================================================================
// KPI card — single number widget
// =========================================================================
const KpiCard = ({ label, value, unit, sub, trend, trendKind, icon, accent }) => (
  <Card style={{ padding: 18, position: 'relative', overflow: 'hidden' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      {icon && <span style={{ color: accent || 'var(--ink-muted)' }}>{icon}</span>}
      <SectionLabel>{label}</SectionLabel>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <NumDisplay value={value} unit={unit} size={26} color="var(--ink)" />
    </div>
    {(sub || trend) && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        {trend && (
          <span style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: trendKind === 'up' ? 'var(--status-good)' : trendKind === 'down' ? 'var(--status-warn)' : 'var(--ink-muted)',
            fontWeight: 500,
          }}>
            {trend}
          </span>
        )}
        {sub && <span className="micro">{sub}</span>}
      </div>
    )}
  </Card>
);

Object.assign(window, { DonutChart, AreaSparkline, BarChart, HBars, DayGrid, KpiCard });
