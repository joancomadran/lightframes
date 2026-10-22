import type { ReactNode } from 'react'
import type { PanelId } from '../hooks/useEditorSession'

/** Line icons for the editor's panel tabs, drawn on a 24px grid. */
const PATHS: Record<PanelId, ReactNode> = {
  // Light: exposure, contrast, tone.
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
      <path d="M11 11h.01M13 13h.01M13 11h.01M11 13h.01" />
    </g>
  ),
  // A wavy grid: the mesh liquify bends.
  liquify: (
    <>
      <path d="M3 6c3-2 6 2 9 0s6-2 9 0" />
      <path d="M3 12c3-2 6 2 9 0s6-2 9 0" />
      <path d="M3 18c3-2 6 2 9 0s6-2 9 0" />
      <path d="M8 4c-1.5 5 1.5 11 0 16M16 4c1.5 5-1.5 11 0 16" />
    </>
  ),
  local: (
    <>
      <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
      <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
    </>
  ),
  // Overlapping filters.
  presets: (
    <>
      <circle cx="12" cy="8.5" r="5" />
      <circle cx="8.5" cy="15" r="5" />
      <circle cx="15.5" cy="15" r="5" />
    </>
  ),
}

export function PanelIcon({ id, size = 16 }: { id: PanelId; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[id]}
    </svg>
  )
}
