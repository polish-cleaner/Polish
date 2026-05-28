// Mock data for the realistic mid-life PC scenario.
// 41.8 GB reclaimable, 3 quarantine runs, last scan 14m ago.

const DRIVES = [
  { id: 'C', label: 'C:', kind: 'system', name: 'Windows', used: 371, total: 375, isPrimary: true },
  { id: 'D', label: 'D:', kind: 'fixed', name: 'Work', used: 29, total: 99, isPrimary: false },
  { id: 'E', label: 'E:', kind: 'fixed', name: 'Media', used: 0.4, total: 14, isPrimary: false },
];

// Cleanup categories — grouped by safety tier, mirrors PLAN §8.2.
const CATEGORIES = [
  // === ALWAYS SAFE ===
  { id: 'recycle-bin', tier: 'always-safe', label: 'Recycle Bin', detail: '1,247 items',
    bytes: 1.8 * 1024**3, action: 'move', irreversible: false, defaultModes: ['light','balanced','aggressive'] },
  { id: 'temp', tier: 'always-safe', label: 'System temp files', detail: '%TEMP% + C:\\Windows\\Temp',
    bytes: 4.2 * 1024**3, action: 'move', irreversible: false, defaultModes: ['light','balanced','aggressive'] },
  { id: 'browser-chrome', tier: 'always-safe', label: 'Chrome cache', detail: 'Default profile only',
    bytes: 1.4 * 1024**3, action: 'move', irreversible: false, defaultModes: ['light','balanced','aggressive'] },
  { id: 'browser-edge', tier: 'always-safe', label: 'Edge cache', detail: '2 profiles',
    bytes: 0.6 * 1024**3, action: 'move', irreversible: false, defaultModes: ['light','balanced','aggressive'] },
  { id: 'windows-update', tier: 'always-safe', label: 'Windows Update cache', detail: 'SoftwareDistribution\\Download',
    bytes: 2.1 * 1024**3, action: 'move', irreversible: false, defaultModes: ['light','balanced','aggressive'] },
  { id: 'crash-dumps', tier: 'always-safe', label: 'Crash dumps + WER queue', detail: '3 dumps, oldest 41d',
    bytes: 0.5 * 1024**3, action: 'move', irreversible: false, defaultModes: ['light','balanced','aggressive'] },
  { id: 'thumbnails', tier: 'always-safe', label: 'Thumbnail cache', detail: 'Rebuilds on demand',
    bytes: 0.18 * 1024**3, action: 'move', irreversible: false, defaultModes: ['light','balanced','aggressive'] },

  // === SAFE FOR DEVS ===
  { id: 'npm-cache', tier: 'safe-devs', label: 'npm cache', detail: '%AppData%\\npm-cache',
    bytes: 2.6 * 1024**3, action: 'move', irreversible: false, defaultModes: ['balanced','aggressive'] },
  { id: 'pnpm-store', tier: 'safe-devs', label: 'pnpm store', detail: 'Content-addressable; rebuilds',
    bytes: 8.4 * 1024**3, action: 'move', irreversible: false, defaultModes: ['balanced','aggressive'] },
  { id: 'cargo', tier: 'safe-devs', label: 'Cargo registry + git cache', detail: '.cargo\\registry\\cache + git',
    bytes: 3.1 * 1024**3, action: 'move', irreversible: false, defaultModes: ['balanced','aggressive'] },
  { id: 'vite-caches', tier: 'safe-devs', label: 'Vite / Next.js build caches', detail: '17 detected project folders',
    bytes: 1.9 * 1024**3, action: 'move', irreversible: false, defaultModes: ['balanced','aggressive'] },

  // === SYSTEM CLEANUP ===
  { id: 'dism', tier: 'system', label: 'Superseded Windows components', detail: 'DISM /ResetBase — irreversible',
    bytes: 6.8 * 1024**3, action: 'dism', irreversible: true, requiresHold: true, defaultModes: ['balanced','aggressive'] },
  { id: 'windows-old', tier: 'system', label: 'Windows.old', detail: 'Old install snapshot, 28d',
    bytes: 11.4 * 1024**3, action: 'delete', irreversible: true, requiresHold: true, defaultModes: ['aggressive'] },

  // === LARGE USER CONTENT (Aggressive only, always prompts) ===
  { id: 'lmstudio', tier: 'large-user', label: 'LM Studio cached models', detail: '4 models · llama, qwen',
    bytes: 23.7 * 1024**3, action: 'move', irreversible: false, defaultModes: [] },
  { id: 'old-downloads', tier: 'large-user', label: 'Downloads older than 90 days', detail: '52 files',
    bytes: 1.8 * 1024**3, action: 'move', irreversible: false, defaultModes: [] },
  { id: 'docker', tier: 'large-user', label: 'Docker unused images + layers', detail: 'WSL2 backend',
    bytes: 12.1 * 1024**3, action: 'move', irreversible: false, defaultModes: [] },

  // === APP CACHES ===
  { id: 'slack', tier: 'app-cache', label: 'Slack cache', detail: 'Messages preserved',
    bytes: 0.9 * 1024**3, action: 'move', irreversible: false, defaultModes: ['balanced','aggressive'] },
  { id: 'spotify', tier: 'app-cache', label: 'Spotify cache', detail: 'Re-downloads on next play',
    bytes: 2.3 * 1024**3, action: 'move', irreversible: false, defaultModes: ['balanced','aggressive'] },
  { id: 'discord', tier: 'app-cache', label: 'Discord cache', detail: 'Messages preserved',
    bytes: 1.1 * 1024**3, action: 'move', irreversible: false, defaultModes: ['aggressive'] },
  { id: 'teams', tier: 'app-cache', label: 'Teams cache', detail: 'Sign-out preserved',
    bytes: 0.7 * 1024**3, action: 'move', irreversible: false, defaultModes: ['balanced','aggressive'] },
];

const TIERS = {
  'always-safe': { label: 'Always safe',        desc: 'Rebuilds automatically. No risk to user data.' },
  'safe-devs':   { label: 'Safe for developers', desc: 'Package manager + build caches. Caches re-download on next use.' },
  'system':      { label: 'System cleanup',      desc: 'Irreversible. Always requires hold-to-confirm.' },
  'large-user':  { label: 'Large user content',  desc: 'Heavy items. Always reviewed individually.' },
  'app-cache':   { label: 'Application caches',  desc: 'Per-app — preserves your data, drops media/asset cache.' },
};

const MODES = {
  light:      { id: 'light',      label: 'Light',      time: '~5 min',  desc: 'Always-safe categories only.',                       retentionDays: 7  },
  balanced:   { id: 'balanced',   label: 'Balanced',   time: '~15 min', desc: 'Light + dev caches + system cleanup (with confirm).', retentionDays: 14 },
  aggressive: { id: 'aggressive', label: 'Aggressive', time: '~30 min', desc: 'Adds duplicates, Docker prune, WSL audit, uninstalls.',retentionDays: 30 },
  custom:     { id: 'custom',     label: 'Custom',     time: '—',       desc: 'User-defined. Saveable as .polishprofile.',           retentionDays: 14 },
};

// Past quarantine runs.
const QUARANTINE_RUNS = [
  {
    id: 'polish-2026-05-25-09-14',
    timestamp: '2026-05-25T09:14:22+05:30',
    daysAgo: 3,
    mode: 'balanced',
    bytes: 14.2 * 1024**3,
    itemCount: 8421,
    destination: 'D:\\PolishQuarantine\\',
    status: 'active',
    daysUntilPurge: 11,
    categories: [
      { id: 'temp', label: 'System temp files', count: 1842, bytes: 3.8 * 1024**3 },
      { id: 'npm-cache', label: 'npm cache', count: 2103, bytes: 2.4 * 1024**3 },
      { id: 'pnpm-store', label: 'pnpm store', count: 3284, bytes: 6.1 * 1024**3 },
      { id: 'browser-chrome', label: 'Chrome cache', count: 924, bytes: 1.2 * 1024**3 },
      { id: 'thumbnails', label: 'Thumbnail cache', count: 268, bytes: 0.16 * 1024**3 },
      { id: 'crash-dumps', label: 'Crash dumps', count: 2, bytes: 0.51 * 1024**3 },
    ],
    restorePointId: '12847',
  },
  {
    id: 'polish-2026-05-18-21-30',
    timestamp: '2026-05-18T21:30:11+05:30',
    daysAgo: 10,
    mode: 'light',
    bytes: 6.8 * 1024**3,
    itemCount: 3119,
    destination: 'D:\\PolishQuarantine\\',
    status: 'active',
    daysUntilPurge: 4,
    categories: [
      { id: 'recycle-bin', label: 'Recycle Bin', count: 814, bytes: 2.1 * 1024**3 },
      { id: 'temp', label: 'System temp', count: 1422, bytes: 3.4 * 1024**3 },
      { id: 'browser-chrome', label: 'Chrome cache', count: 883, bytes: 1.3 * 1024**3 },
    ],
    restorePointId: null,
  },
  {
    id: 'polish-2026-05-11-14-02',
    timestamp: '2026-05-11T14:02:48+05:30',
    daysAgo: 17,
    mode: 'aggressive',
    bytes: 22.1 * 1024**3,
    itemCount: 4288,
    destination: 'D:\\PolishQuarantine\\',
    status: 'active',
    daysUntilPurge: 13,
    categories: [
      { id: 'docker', label: 'Docker unused images', count: 412, bytes: 12.1 * 1024**3 },
      { id: 'old-downloads', label: 'Downloads >90d', count: 52, bytes: 1.8 * 1024**3 },
      { id: 'npm-cache', label: 'npm cache', count: 1844, bytes: 2.0 * 1024**3 },
      { id: 'cargo', label: 'Cargo cache', count: 1968, bytes: 6.2 * 1024**3 },
    ],
    restorePointId: '12822',
  },
];

// History activity log.
const HISTORY = [
  { ts: '2026-05-28T10:01:14+05:30', minsAgo: 14, actor: 'service', action: 'scan.complete', target: 'all categories', outcome: 'Found 41.8 GB across 12 categories', severity: 'info' },
  { ts: '2026-05-28T09:00:00+05:30', minsAgo: 75, actor: 'service', action: 'scan.start',    target: 'scheduled',       outcome: 'Idle-aware full scan started', severity: 'info' },
  { ts: '2026-05-25T09:21:48+05:30', minsAgo: 4560, actor: 'user', action: 'clean.execute',  target: 'balanced · 6 cat', outcome: '14.2 GB quarantined to D:', severity: 'info' },
  { ts: '2026-05-25T09:14:22+05:30', minsAgo: 4567, actor: 'user', action: 'clean.start',    target: 'balanced',         outcome: 'Created restore point #12847', severity: 'info' },
  { ts: '2026-05-21T18:42:11+05:30', minsAgo: 9858, actor: 'user', action: 'settings.set',   target: 'notifications.daily_time', outcome: '09:00 → 10:00 local', severity: 'info' },
  { ts: '2026-05-19T03:00:02+05:30', minsAgo: 14401, actor: 'service', action: 'quarantine.auto-purge', target: 'polish-2026-05-05-...', outcome: 'Purged 8.1 GB (14-day retention)', severity: 'info' },
  { ts: '2026-05-18T21:30:11+05:30', minsAgo: 14491, actor: 'user', action: 'clean.execute', target: 'light · 3 cat',    outcome: '6.8 GB quarantined to D:', severity: 'info' },
  { ts: '2026-05-12T11:20:04+05:30', minsAgo: 23921, actor: 'service', action: 'service.update', target: 'v1.0.3 → v1.0.4', outcome: 'Auto-updated at 04:00 local', severity: 'info' },
  { ts: '2026-05-11T14:08:21+05:30', minsAgo: 24403, actor: 'user', action: 'clean.execute', target: 'aggressive · 8 cat', outcome: '22.1 GB quarantined to D:', severity: 'warn' },
];

const SCAN_LAST = { minsAgo: 14, foundBytes: 41.8 * 1024**3, categoryCount: 12 };

// Service status
const SERVICE = { status: 'healthy', uptime: '3d 4h 11m', version: '1.0.4', cpu: 0.2 };

// === Dashboard widget data ===

// C: drive composition — what's eating 371 GB?
// Colors use the accent palette + neutrals; defined via oklch so they shift
// with the accent tweak (we use --accent and tinted versions).
const DISK_BREAKDOWN = [
  { id: 'system',   label: 'Windows + system',       value: 95.0 * 1024**3, color: 'oklch(0.42 0.085 155)' },
  { id: 'apps',     label: 'Installed applications', value: 78.0 * 1024**3, color: 'oklch(0.55 0.075 155)' },
  { id: 'devcache', label: 'Dev caches',             value: 42.0 * 1024**3, color: 'oklch(0.68 0.060 155)' },
  { id: 'ai',       label: 'AI models',              value: 35.0 * 1024**3, color: 'oklch(0.45 0.060 70)'  },
  { id: 'docs',     label: 'Documents',              value: 28.0 * 1024**3, color: 'oklch(0.55 0.040 250)' },
  { id: 'browser',  label: 'Browser data',           value: 12.0 * 1024**3, color: 'oklch(0.68 0.025 250)' },
  { id: 'temp',     label: 'Temp + recycle',         value:  9.0 * 1024**3, color: 'oklch(0.78 0.018 250)' },
  { id: 'other',    label: 'Other',                  value: 72.0 * 1024**3, color: 'oklch(0.85 0.010 250)' },
];

// Reclaim trend — last 12 weeks. Zeros = no clean that week.
const RECLAIM_TREND = [
  { week: 'Mar 02', value: 0 },
  { week: 'Mar 09', value: 8.2 * 1024**3 },
  { week: 'Mar 16', value: 0 },
  { week: 'Mar 23', value: 3.1 * 1024**3 },
  { week: 'Mar 30', value: 11.4 * 1024**3 },
  { week: 'Apr 06', value: 0 },
  { week: 'Apr 13', value: 6.0 * 1024**3 },
  { week: 'Apr 20', value: 4.8 * 1024**3 },
  { week: 'Apr 27', value: 22.1 * 1024**3 },
  { week: 'May 04', value: 0 },
  { week: 'May 11', value: 22.1 * 1024**3 },
  { week: 'May 25', value: 14.2 * 1024**3 },
];

// Quarantine runs as bars
const QUARANTINE_BARS = QUARANTINE_RUNS.map(r => ({ value: r.bytes, label: r.id })).reverse();

// 30-day scan activity heatmap.
const DAY_ACTIVITY = (() => {
  const out = [];
  const today = 28; // 28 May
  // Build 30 days. Use a deterministic pattern.
  const findings = [
    0,    0.4,  0,   2.1, 0,   0,   1.8,
    0.6,  0,    3.2, 0,   1.1, 0,   0,
    14.0, 0,    0.8, 0,   2.3, 0,   1.4,
    0,    6.0,  0,   1.0, 0,   3.5, 41.8, null, null,
  ];
  for (let i = 0; i < 30; i++) {
    const v = findings[i];
    const day = i + 1;
    out.push({
      date: `May ${day}`,
      value: v === null ? 0 : v * 1024**3,
      scanned: v !== null,
    });
  }
  return out;
})();

// Top categories for HBars widget
const TOP_CATEGORIES_VIEW = CATEGORIES
  .filter(c => c.bytes >= 1 * 1024**3)
  .sort((a, b) => b.bytes - a.bytes)
  .slice(0, 6)
  .map(c => ({
    id: c.id,
    label: c.label,
    value: c.bytes,
    color: c.tier === 'always-safe' ? 'var(--accent)'
         : c.tier === 'safe-devs'   ? 'oklch(0.55 0.075 155)'
         : c.tier === 'large-user'  ? 'oklch(0.68 0.060 155)'
         : c.tier === 'system'      ? 'var(--status-warn)'
         : 'oklch(0.55 0.040 250)',
  }));

// === Utility formatters ===
function fmtBytes(n, opts = {}) {
  const { precision = 1, unit } = opts;
  if (unit) {
    const factor = { GB: 1024**3, MB: 1024**2, KB: 1024 }[unit];
    return { num: (n / factor).toFixed(precision), unit };
  }
  if (n >= 1024**4) return { num: (n / 1024**4).toFixed(precision), unit: 'TB' };
  if (n >= 1024**3) return { num: (n / 1024**3).toFixed(precision), unit: 'GB' };
  if (n >= 1024**2) return { num: (n / 1024**2).toFixed(precision), unit: 'MB' };
  if (n >= 1024)    return { num: (n / 1024).toFixed(precision),    unit: 'KB' };
  return { num: String(n), unit: 'B' };
}

function fmtAgo(mins) {
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`;
  if (mins < 60 * 24 * 30) return `${Math.round(mins / 60 / 24)}d ago`;
  return `${Math.round(mins / 60 / 24 / 30)}mo ago`;
}

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// Default selected categories based on mode (Light + 1 Dev category = default in mid-life)
function defaultSelections(mode) {
  const set = new Set();
  CATEGORIES.forEach(c => {
    if (c.defaultModes.includes(mode)) set.add(c.id);
  });
  return set;
}

Object.assign(window, {
  DRIVES, CATEGORIES, TIERS, MODES, QUARANTINE_RUNS, HISTORY, SCAN_LAST, SERVICE,
  DISK_BREAKDOWN, RECLAIM_TREND, QUARANTINE_BARS, DAY_ACTIVITY, TOP_CATEGORIES_VIEW,
  fmtBytes, fmtAgo, fmtTime, defaultSelections,
});
