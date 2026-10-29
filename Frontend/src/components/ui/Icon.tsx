// src/components/ui/Icon.tsx
//
// ══════════════════════════════════════════════════════════
// SET DE ICONOS
//
// Un solo trazo para toda la app: rejilla de 24, trazo de 1.6,
// extremos redondeados y `currentColor`, de modo que un icono
// siempre hereda el color del texto que acompaña.
//
// Sustituye a los emoji que había repartidos por las pantallas:
// un emoji lo dibuja el sistema operativo, así que cambia de
// forma y de color en cada dispositivo y nunca casa con la marca.
// ══════════════════════════════════════════════════════════

export type IconName =
  // Navegación y dominio
  | "dumbbell" | "scale" | "calendar" | "plate" | "user" | "chart"
  | "target" | "monitor" | "video" | "phone" | "chat" | "pin"
  | "book" | "shield" | "home" | "clock" | "file"
  // Comidas
  | "sunrise" | "apple" | "cup" | "bolt" | "moon"
  // Acciones
  | "check" | "close" | "plus" | "minus" | "pencil" | "trash"
  | "search" | "send" | "logout" | "settings" | "download"
  | "arrow-left" | "arrow-right" | "chevron-left" | "chevron-right"
  | "heart" | "heart-filled" | "toggle-on" | "toggle-off"
  // Estado
  | "info" | "alert" | "image" | "quote"
  | "bell" | "copy" | "refresh"
  // Marcas
  | "instagram" | "whatsapp";

type Props = {
  name: IconName;
  /** Lado del cuadro en píxeles. */
  size?: number;
  /** Grosor del trazo; súbelo un poco en tamaños pequeños. */
  strokeWidth?: number;
  className?: string;
  /** Texto para lectores de pantalla. Sin él, el icono se oculta. */
  title?: string;
};

export default function Icon({ name, size = 20, strokeWidth = 1.6, className, title }: Props) {
  const decorative = !title;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={decorative || undefined}
      role={decorative ? undefined : "img"}
      focusable="false"
    >
      {title && <title>{title}</title>}
      {PATHS[name]}
    </svg>
  );
}

/* Cada entrada es el interior del <svg>: solo geometría. */
const PATHS: Record<IconName, React.ReactNode> = {
  // ── Navegación y dominio ──
  dumbbell: (
    <>
      <path d="M6.5 6.5v11M17.5 6.5v11M4 9.5v5M20 9.5v5M6.5 12h11" />
    </>
  ),
  scale: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 7.5h8" />
      <circle cx="12" cy="14" r="3" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </>
  ),
  plate: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  chart: (
    <>
      <path d="M3 17.5l5.5-5.5 3.5 3.5L21 7" />
      <path d="M16 7h5v5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  monitor: (
    <>
      <rect x="2.5" y="4" width="19" height="13" rx="2.5" />
      <path d="M8.5 21h7M12 17v4" />
      <path d="M10.5 8.5l4 2-4 2z" />
    </>
  ),
  video: (
    <>
      <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
      <path d="M15.5 10.5l6-3.5v10l-6-3.5z" />
    </>
  ),
  phone: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M10.5 18.5h3" />
    </>
  ),
  chat: (
    <>
      <path d="M20.5 11.6a8 8 0 0 1-8.6 8 9 9 0 0 1-4-1L3.5 20l1.4-4.2a8 8 0 0 1 7-11.8 8 8 0 0 1 8.6 7.6z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21.5s7-6.4 7-11.3A7 7 0 0 0 5 10.2C5 15.1 12 21.5 12 21.5z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  book: (
    <>
      <path d="M4.5 19V5.5A2.5 2.5 0 0 1 7 3h12.5v16H7a2.5 2.5 0 0 0-2.5 2.5" />
      <path d="M4.5 19A2.5 2.5 0 0 0 7 21.5h12.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2.8l7.5 3v5.5c0 4.7-3.1 8.4-7.5 10.4-4.4-2-7.5-5.7-7.5-10.4V5.8z" />
    </>
  ),
  home: (
    <>
      <path d="M3.5 10.5L12 3.5l8.5 7" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M9.5 20v-6h5v6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.3l3.3 2" />
    </>
  ),
  file: (
    <>
      <path d="M14 2.8H7.5A2.5 2.5 0 0 0 5 5.3v13.4a2.5 2.5 0 0 0 2.5 2.5h9a2.5 2.5 0 0 0 2.5-2.5V7.8z" />
      <path d="M14 2.8v5h5" />
    </>
  ),

  // ── Comidas ──
  sunrise: (
    <>
      <path d="M17 17.5a5 5 0 0 0-10 0" />
      <path d="M2.5 17.5h19M12 4v3.5M5.6 10.1l2.1 2.1M18.4 10.1l-2.1 2.1" />
    </>
  ),
  apple: (
    <>
      <path d="M12 8.5c-3 0-5 2.2-5 5.6S9.2 21 12 21s5-3.5 5-6.9-2-5.6-5-5.6z" />
      <path d="M12 8.5c0-2.2 1.2-3.7 3.4-4.2" />
    </>
  ),
  cup: (
    <>
      <path d="M6.5 7.5h11l-1.1 12.2a2 2 0 0 1-2 1.8h-4.8a2 2 0 0 1-2-1.8z" />
      <path d="M9 3.5h6l.8 4M9 3.5l-.8 4" />
    </>
  ),
  bolt: (
    <>
      <path d="M13.2 2.5L4.5 14h6.3l-1 7.5L19.5 10h-6.3z" />
    </>
  ),
  moon: (
    <>
      <path d="M20.8 13.2A8.6 8.6 0 1 1 10.8 3.2a6.8 6.8 0 0 0 10 10z" />
    </>
  ),

  // ── Acciones ──
  check: <path d="M4.5 12.5l5 5 10-10" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  pencil: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M14.5 5.5l4 4" />
    </>
  ),
  trash: (
    <>
      <path d="M4 6.5h16M9.5 6.5V4h5v2.5" />
      <path d="M6.5 6.5l.9 13.1a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9l.9-13.1" />
      <path d="M10.5 11v6M13.5 11v6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M16.2 16.2L20.5 20.5" />
    </>
  ),
  send: (
    <>
      <path d="M21.5 2.5L2.5 9.8l7.7 3.3 3.3 7.7z" />
      <path d="M21.5 2.5l-11.3 10.6" />
    </>
  ),
  logout: (
    <>
      <path d="M15 8V5.5A2.5 2.5 0 0 0 12.5 3h-6A2.5 2.5 0 0 0 4 5.5v13A2.5 2.5 0 0 0 6.5 21h6a2.5 2.5 0 0 0 2.5-2.5V16" />
      <path d="M9.5 12h11M17 8.5l3.5 3.5L17 15.5" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7.5h7M15 7.5h5M4 16.5h3M11 16.5h9" />
      <circle cx="13" cy="7.5" r="2" />
      <circle cx="9" cy="16.5" r="2" />
    </>
  ),
  download: (
    <>
      <path d="M12 3.5v11M8 11l4 3.5 4-3.5" />
      <path d="M4.5 17v1.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V17" />
    </>
  ),
  "arrow-left": <path d="M19.5 12H4.5M11 5.5L4.5 12l6.5 6.5" />,
  "arrow-right": <path d="M4.5 12h15M13 5.5l6.5 6.5-6.5 6.5" />,
  "chevron-left": <path d="M15 5.5L8.5 12l6.5 6.5" />,
  "chevron-right": <path d="M9 5.5l6.5 6.5L9 18.5" />,
  heart: (
    <path d="M12 20.3s-7.5-4.8-7.5-10A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.7c0 5.2-7.5 10-7.5 10z" />
  ),
  "heart-filled": (
    <path
      d="M12 20.3s-7.5-4.8-7.5-10A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.7c0 5.2-7.5 10-7.5 10z"
      fill="currentColor"
    />
  ),
  "toggle-on": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3.8" fill="currentColor" stroke="none" />
    </>
  ),
  "toggle-off": <circle cx="12" cy="12" r="8.5" />,

  // ── Estado ──
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.8" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5L21.5 20H2.5z" />
      <path d="M12 9.5v4.5" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.8" />
      <path d="M21 15.5L16 10.5 5.5 20" />
    </>
  ),
  quote: (
    <>
      <path d="M9 6.5C6 8 4.5 10.3 4.5 13.2c0 2.6 1.4 4.3 3.4 4.3 1.8 0 3.1-1.3 3.1-3.1 0-1.7-1.2-3-2.8-3-.3 0-.6 0-.8.1.3-1.5 1.4-2.9 3-3.8z" />
      <path d="M19 6.5c-3 1.5-4.5 3.8-4.5 6.7 0 2.6 1.4 4.3 3.4 4.3 1.8 0 3.1-1.3 3.1-3.1 0-1.7-1.2-3-2.8-3-.3 0-.6 0-.8.1.3-1.5 1.4-2.9 3-3.8z" />
    </>
  ),

  // ── Marcas ──
  instagram: (
    <>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  whatsapp: (
    <path
      fill="currentColor"
      stroke="none"
      d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.23-.64.08-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.53.14-.17.19-.3.29-.5.1-.19.05-.37-.03-.52-.07-.15-.66-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.03 1.02-1.03 2.48s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.7.3 1.26.48 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.57-.34M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.89-9.88 9.89m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.42z"
    />
  ),

  // ── Avisos y acciones del panel ──
  bell: (
    <>
      <path d="M18 9a6 6 0 1 0-12 0c0 4.5-1.5 5.5-2 6.5h16c-.5-1-2-2-2-6.5" />
      <path d="M10.3 19a2 2 0 0 0 3.4 0" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 5.5A1.5 1.5 0 0 0 13.5 4H6a2 2 0 0 0-2 2v7.5A1.5 1.5 0 0 0 5.5 15" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 4.5V11h-6.5" />
    </>
  ),
};
