import React from 'react'
import type { ReactNode } from 'react'

export type PanelId = 'adjust' | 'color' | 'effects' | 'curve' | 'crop' | 'heal' | 'local' | 'presets'

/** Same line icons as the app's PanelIcon. */
const PANEL: Record<PanelId, ReactNode> = {
  adjust: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </>
  ),
  color: <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5S12.5 5.5 12 3c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z" />,
  effects: (
    <>
      <path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6z" />
      <path d="M18 14l.8 2.2 2.2.8-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z" />
    </>
  ),
  curve: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 17c5 0 5-10 10-10" />
    </>
  ),
  crop: <path d="M6 2v14a2 2 0 0 0 2 2h14M18 22V8a2 2 0 0 0-2-2H2" />,
  heal: (
    <g transform="rotate(-45 12 12)">
      <rect x="2" y="7.5" width="20" height="9" rx="4.5" />
      <path d="M8 7.5v9M16 7.5v9" />
    </g>
  ),
  local: (
    <>
      <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
      <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
    </>
  ),
  presets: (
    <>
      <circle cx="12" cy="8.5" r="5" />
      <circle cx="8.5" cy="15" r="5" />
      <circle cx="15.5" cy="15" r="5" />
    </>
  ),
}

const MISC: Record<string, ReactNode> = {
  plus: <path d="M12 5v14M5 12h14" />,
  undo: <path d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />,
  redo: <path d="m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />,
  copy: (
    <>
      <rect x="8" y="8" width="13" height="13" rx="2" />
      <path d="M4 16V5a1 1 0 0 1 1-1h11" />
    </>
  ),
  paste: (
    <>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4V3h6v1" />
    </>
  ),
  keyboard: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
    </>
  ),
  sliders: <path d="M4 7h10M18 7h2M4 17h4M12 17h8M14 4v6M8 14v6" />,
  collage: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M11 3v18M11 12h10" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </>
  ),
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  rotL: <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />,
  rotR: <path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5" />,
  compare: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M12 4v16" />
    </>
  ),
  circle: <circle cx="12" cy="12" r="8" />,
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  shield: (
    <>
      <path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  check: <path d="m5 12 5 5 9-10" />,
  eyedrop: <path d="m14 4 6 6M17 7l-9.5 9.5L4 20l3.5-3.5M12 6l6 6" />,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  sparkle: <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z" />,
  wifiOff: <path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5.2-2.8M19 13a10 10 0 0 0-2.4-1.8M2 8.8a15 15 0 0 1 4.2-2.7M22 8.8A15 15 0 0 0 10.7 5M12 20h.01" />,
  upload: <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />,
}

export function Icon({
  name,
  size = 16,
  stroke = 1.75,
  color = 'currentColor',
}: {
  name: PanelId | keyof typeof MISC
  size?: number
  stroke?: number
  color?: string
}) {
  const body = (PANEL as Record<string, ReactNode>)[name] ?? MISC[name]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {body}
    </svg>
  )
}
