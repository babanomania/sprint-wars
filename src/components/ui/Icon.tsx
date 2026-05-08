import type { ReactElement, SVGProps } from 'react';
import clsx from 'clsx';

export type IconName =
  | 'dashboard'
  | 'kanban'
  | 'inbox'
  | 'alert'
  | 'users'
  | 'plus'
  | 'network'
  | 'chart'
  | 'chat'
  | 'sun'
  | 'moon'
  | 'volume-on'
  | 'volume-off'
  | 'play'
  | 'forward'
  | 'skip'
  | 'home'
  | 'dice'
  | 'target'
  | 'undo'
  | 'check'
  | 'x'
  | 'gear'
  | 'bolt'
  | 'arrow-down'
  | 'logout'
  | 'arrow-right'
  | 'sparkles'
  | 'flame'
  | 'lock'
  | 'star'
  | 'refresh'
  | 'search';

interface Props extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  className?: string;
}

// All icons are 24×24, stroke-based (currentColor), so they inherit text colors.
const PATHS: Record<IconName, ReactElement> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  kanban: (
    <>
      <rect x="3" y="4" width="4.5" height="16" rx="1" />
      <rect x="9.75" y="4" width="4.5" height="11" rx="1" />
      <rect x="16.5" y="4" width="4.5" height="7" rx="1" />
    </>
  ),
  inbox: (
    <>
      <path d="M3 14h4l2 3h6l2-3h4" />
      <path d="M3 14V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 2.5 20h19L12 3z" />
      <path d="M12 10v5" />
      <path d="M12 18.2v.1" strokeWidth="2.4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M16 14.2c2.5.4 4.5 2.5 4.5 4.8" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  network: (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M7.5 7.5 10.5 10.5M16.5 7.5 13.5 10.5M7.5 16.5 10.5 13.5M16.5 16.5 13.5 13.5" />
    </>
  ),
  chart: (
    <>
      <path d="M3 20h18" />
      <path d="M5 16l4-5 4 3 6-7" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-4 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
    </>
  ),
  moon: <path d="M21 13.5A8.5 8.5 0 0 1 10.5 3a7 7 0 1 0 10.5 10.5z" />,
  'volume-on': (
    <>
      <path d="M4 9.5v5h3.5L13 19V5L7.5 9.5H4z" />
      <path d="M16 8.5a4 4 0 0 1 0 7" />
      <path d="M18.5 5a8 8 0 0 1 0 14" />
    </>
  ),
  'volume-off': (
    <>
      <path d="M4 9.5v5h3.5L13 19V5L7.5 9.5H4z" />
      <path d="M22 9l-6 6M16 9l6 6" />
    </>
  ),
  play: <path d="M6 4l14 8-14 8V4z" />,
  forward: (
    <>
      <path d="M4 5l9 7-9 7V5zM14 5l7 7-7 7V5z" />
    </>
  ),
  skip: (
    <>
      <path d="M5 5l9 7-9 7V5z" />
      <path d="M16 5v14" />
    </>
  ),
  home: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </>
  ),
  dice: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  undo: (
    <>
      <path d="M9 13L4 8l5-5" />
      <path d="M4 8h10a6 6 0 0 1 6 6v0a6 6 0 0 1-6 6h-3" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
  'arrow-down': <path d="M12 4v15M5 12l7 7 7-7" />,
  'arrow-right': <path d="M5 12h14M12 5l7 7-7 7" />,
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
      <path d="M5.5 5.5 9 9M14.5 14.5 18.5 18.5M5.5 18.5 9 15M14.5 9 18.5 5.5" />
    </>
  ),
  flame: (
    <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1.5.7-2.7 1.5-3.5C8.7 8.7 8 10 8 12c0 4 4 8 4 8s4-4 4-8a8 8 0 0 0-4-10z" />
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  star: <path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.8l6.5-.9L12 3z" />,
  refresh: (
    <>
      <path d="M4 12a8 8 0 0 1 13.7-5.7L21 9" />
      <path d="M21 4v5h-5" />
      <path d="M20 12a8 8 0 0 1-13.7 5.7L3 15" />
      <path d="M3 20v-5h5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4-4" />
    </>
  ),
};

export default function Icon({ name, size = 16, className, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={clsx('inline-block shrink-0', className)}
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
