import type { CSSProperties } from "react";
export type IconName =
  | "home"
  | "calls"
  | "check"
  | "star"
  | "settings"
  | "help"
  | "search"
  | "chevron"
  | "plus"
  | "arrow"
  | "mic"
  | "upload"
  | "calendar"
  | "clock"
  | "file"
  | "grid"
  | "list"
  | "close"
  | "download"
  | "more"
  | "sun"
  | "moon"
  | "logout"
  | "pause"
  | "play"
  | "stop"
  | "trash"
  | "headphones"
  | "sparkles"
  | "globe"
  | "link"
  | "menu"
  | "checkmark"
  | "mail"
  | "lock";
const paths: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />
    </>
  ),
  calls: (
    <>
      <rect x="3" y="4" width="14" height="16" rx="3" />
      <path d="m17 9 4-2v10l-4-2M7 8h6M7 12h4" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  star: (
    <path d="m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.5l-5.7 3 1.1-6.3-4.6-4.5 6.4-.9Z" />
  ),
  settings: (
    <>
      <path
        d="m9 3-.5 3-2 1.2-2.9-.9-2 3.4 2.3 2v2.6l-2.3 2 2 3.4 2.9-.9 2 1.2.5 3h4l.5-3 2-1.2 2.9.9 2-3.4-2.3-2v-2.6l2.3-2-2-3.4-2.9.9-2-1.2L13 3Z"
        transform="translate(1 -1) scale(.95)"
      />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4M12 17h.01" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  chevron: <path d="m9 5 7 7-7 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  mic: (
    <>
      <rect x="9" y="2" width="6" height="13" rx="3" />
      <path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V3m-5 5 5-5 5 5M4 14v6h16v-6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M7 3v5M17 3v5M3 11h18M7 15h2M13 15h2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  file: (
    <>
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
      <path d="M13 2v7h7M8 13h8M8 17h5" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.1M3 12h.1M3 18h.1" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />,
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1" />
    </>
  ),
  moon: <path d="M21 13a9 9 0 0 1-10-10 9 9 0 1 0 10 10Z" />,
  logout: (
    <>
      <path d="M9 3H4v18h5M9 12h12m-5-5 5 5-5 5" />
    </>
  ),
  pause: (
    <>
      <path d="M8 5v14M16 5v14" strokeWidth="4" />
    </>
  ),
  play: <path d="m7 4 13 8-13 8Z" />,
  stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
  trash: (
    <>
      <path d="M3 6h18M5 6l1 15h12l1-15M9 6V3h6v3M10 10v7M14 10v7" />
    </>
  ),
  headphones: (
    <>
      <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
      <rect x="3" y="12" width="4" height="8" rx="2" />
      <rect x="17" y="12" width="4" height="8" rx="2" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v5M17.5 4.5h5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </>
  ),
  link: (
    <>
      <path
        d="m10 13 4-4M8 15l-2 2a4 4 0 0 1-5-5l4-4a4 4 0 0 1 6 0M13 9l2-2a4 4 0 1 1 5 5l-4 4a4 4 0 0 1-6 0"
        transform="translate(1 0)"
      />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  checkmark: <path d="m5 12 4 4L19 6" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V6a4 4 0 0 1 8 0v4" />
    </>
  ),
};
export function Icon({
  name,
  size = 20,
  className = "",
  style,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
export function Logo() {
  return (
    <span className="minute-logo">
      <span className="logo-wave">
        <i />
        <i />
        <i />
        <i />
      </span>
      minute<span className="logo-dot">.</span>
    </span>
  );
}
