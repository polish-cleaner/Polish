// Icons — thin, geometric, 1.5px stroke. No filled shapes.
// All icons accept size + color.

const Icon = ({ children, size = 16, strokeWidth = 1.5, style = {}, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
    className={className}
  >
    {children}
  </svg>
);

const IconHome = (p) => <Icon {...p}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" /></Icon>;
const IconBroom = (p) => <Icon {...p}><path d="M19 4l-7 7" /><path d="M11 5l8 8" /><path d="M14 12l-6 6c-1.5 1.5-4 1.5-4-1l3-3c2.5 0 3 -2 3 -2z" /></Icon>;
const IconRocket = (p) => <Icon {...p}><path d="M9 11a4 4 0 0 1 4-4l5-2-2 5a4 4 0 0 1-4 4z" /><path d="M9 11l-3 3a2 2 0 0 0 0 3l1 1a2 2 0 0 0 3 0l3-3" /><path d="M7 17l-2 2" /></Icon>;
const IconBox = (p) => <Icon {...p}><path d="M3 7l9-4 9 4-9 4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></Icon>;
const IconScroll = (p) => <Icon {...p}><path d="M6 3h12a2 2 0 0 1 2 2v3h-3" /><path d="M6 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-9H8" /></Icon>;
const IconSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></Icon>;
const IconInfo = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></Icon>;
const IconCheck = (p) => <Icon {...p}><path d="M4 12l5 5L20 6" /></Icon>;
const IconX = (p) => <Icon {...p}><path d="M6 6l12 12M18 6l-12 12" /></Icon>;
const IconChevronRight = (p) => <Icon {...p}><path d="M9 6l6 6-6 6" /></Icon>;
const IconChevronDown = (p) => <Icon {...p}><path d="M6 9l6 6 6-6" /></Icon>;
const IconChevronLeft = (p) => <Icon {...p}><path d="M15 6l-6 6 6 6" /></Icon>;
const IconArrowRight = (p) => <Icon {...p}><path d="M5 12h14M13 5l7 7-7 7" /></Icon>;
const IconPlus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;
const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.5-4.5" /></Icon>;
const IconRefresh = (p) => <Icon {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></Icon>;
const IconTrash = (p) => <Icon {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" /><path d="M10 11v6M14 11v6" /></Icon>;
const IconRestore = (p) => <Icon {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></Icon>;
const IconLock = (p) => <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Icon>;
const IconAlertTriangle = (p) => <Icon {...p}><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4M12 17h.01" /></Icon>;
const IconPause = (p) => <Icon {...p}><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></Icon>;
const IconPlay = (p) => <Icon {...p}><path d="M5 4l15 8-15 8z" /></Icon>;
const IconDownload = (p) => <Icon {...p}><path d="M12 3v14M5 12l7 7 7-7M5 21h14" /></Icon>;
const IconUpload = (p) => <Icon {...p}><path d="M12 21V7M5 12l7-7 7 7M5 3h14" /></Icon>;
const IconFolder = (p) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></Icon>;
const IconFile = (p) => <Icon {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></Icon>;
const IconHardDrive = (p) => <Icon {...p}><rect x="3" y="11" width="18" height="8" rx="2" /><path d="M5 11l3-6h8l3 6" /><circle cx="7" cy="15" r=".8" /></Icon>;
const IconExternal = (p) => <Icon {...p}><path d="M15 3h6v6" /><path d="M10 14L21 3" /><path d="M21 13v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7" /></Icon>;
const IconShield = (p) => <Icon {...p}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /></Icon>;
const IconStar = (p) => <Icon {...p}><path d="M12 2l3.1 6.3 7 1-5 4.9 1.2 7-6.3-3.3-6.3 3.3 1.2-7-5-4.9 7-1z" /></Icon>;
const IconBell = (p) => <Icon {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10 21a2 2 0 0 0 4 0" /></Icon>;
const IconGithub = (p) => <Icon {...p}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></Icon>;
const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>;
const IconEye = (p) => <Icon {...p}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></Icon>;
const IconCpu = (p) => <Icon {...p}><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" /></Icon>;
const IconCode = (p) => <Icon {...p}><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" /></Icon>;
const IconSparkles = (p) => <Icon {...p}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" /><path d="M19 14l.7 2.1 2.3.4-2.3.4-.7 2.1-.7-2.1-2.3-.4 2.3-.4z" /><path d="M5 4l.5 1.5L7 6l-1.5.5L5 8l-.5-1.5L3 6l1.5-.5z" /></Icon>;

Object.assign(window, {
  Icon, IconHome, IconBroom, IconRocket, IconBox, IconScroll, IconSettings, IconInfo,
  IconCheck, IconX, IconChevronRight, IconChevronDown, IconChevronLeft, IconArrowRight,
  IconPlus, IconSearch, IconRefresh, IconTrash, IconRestore, IconLock, IconAlertTriangle,
  IconPause, IconPlay, IconDownload, IconUpload, IconFolder, IconFile, IconHardDrive,
  IconExternal, IconShield, IconStar, IconBell, IconGithub, IconClock, IconEye,
  IconCpu, IconCode, IconSparkles,
});
