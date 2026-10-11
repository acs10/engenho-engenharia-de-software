import type { ReactNode } from "react";

export type IconName =
  | "book"
  | "check"
  | "chevron"
  | "clock"
  | "diagram"
  | "file"
  | "folder"
  | "help"
  | "home"
  | "layers"
  | "more"
  | "play"
  | "plus"
  | "settings"
  | "sparkles"
  | "trash"
  | "download"
  | "upload"
  | "back"
  | "lock"
  | "target"
  | "users"
  | "list"
  | "arrow-up"
  | "arrow-down"
  | "x"
  | "copy"
  | "alert";

/** Ícones do design (Figma Make) + os que as telas novas precisam, no mesmo traço. */
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v15h4.5a2.5 2.5 0 0 1 2.5 2.5v-15Z" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    diagram: <><rect x="3" y="3" width="7" height="5" rx="1" /><rect x="14" y="16" width="7" height="5" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /><path d="M6.5 8v4h11v4M6.5 12v4" /></>,
    file: <><path d="M6 2h8l4 4v16H6z" /><path d="M14 2v5h5M9 13h6M9 17h6" /></>,
    folder: <path d="M3 6h7l2 2h9v11H3z" />,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.3 2.3 0 1 1 3.1 2.2c-.9.4-.9 1.1-.9 1.8M12 17h.01" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
    layers: <><path d="m12 2 9 5-9 5-9-5z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    play: <path d="m9 7 8 5-8 5z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
    sparkles: <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2zM5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8zM19 14l.6 1.4L21 16l-1.4.6L19 18l-.6-1.4L17 16l1.4-.6z" /></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
    download: <><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></>,
    upload: <><path d="M12 20V9M7 14l5-5 5 5M5 4h14" /></>,
    back: <path d="m15 18-6-6 6-6" />,
    lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
    list: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
    "arrow-up": <path d="m6 15 6-6 6 6" />,
    "arrow-down": <path d="m6 9 6 6 6-6" />,
    x: <path d="M6 6l12 12M18 6 6 18" />,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    alert: <><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4M12 17h.01" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
