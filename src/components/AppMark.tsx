import { useEffect, useId, useRef, useState } from 'react'

/**
 * Small looping version of the app icon for in-progress work: a bright
 * segment chases around the frame while the diagonal draws and erases.
 */
export function AppLoader() {
  return (
    <span className="app-loader" aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#141a16" />
        <path d="M15 15 49 49" stroke="#c8f560" strokeOpacity="0.2" strokeWidth="10" />
        <path
          className="app-loader__cross"
          d="M46 18 18 46"
          stroke="#c8f560"
          strokeWidth="5"
          pathLength={1}
        />
        <rect
          x="13.6"
          y="13.6"
          width="36.8"
          height="36.8"
          rx="3"
          stroke="#c8f560"
          strokeOpacity="0.25"
          strokeWidth="3.2"
        />
        <rect
          className="app-loader__frame"
          x="13.6"
          y="13.6"
          width="36.8"
          height="36.8"
          rx="3"
          stroke="#c8f560"
          strokeWidth="3.2"
          strokeLinecap="round"
          pathLength={1}
        />
      </svg>
    </span>
  )
}

/** Roughly the intro's length; hovering during it doesn't restart it. */
const INTRO_MS = 1800

/**
 * The app icon (same artwork as favicon.svg) with a one-time draw-in intro:
 * tile, frame, soft diagonal, bright diagonal, then a sheen and a slow glow.
 * Hovering with a mouse replays it.
 */
export function AppMark({ size }: { size?: number }) {
  const id = useId()
  const clip = `${id}-clip`
  const tile = `${id}-tile`
  const sheen = `${id}-sheen`
  const [run, setRun] = useState(0)
  const startedRef = useRef(0)

  useEffect(() => {
    startedRef.current = performance.now()
  }, [run])

  return (
    <span
      className="app-mark"
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return
        if (performance.now() - startedRef.current < INTRO_MS) return
        setRun((n) => n + 1)
      }}
    >
      {/* Remounting the body (not the hover target) restarts every animation. */}
      <span key={run} className="app-mark__body">
        <svg viewBox="0 0 64 64" fill="none">
          <defs>
            <clipPath id={clip}>
              <rect x="18" y="18" width="28" height="28" />
            </clipPath>
            <clipPath id={tile}>
              <rect width="64" height="64" rx="14" />
            </clipPath>
            <linearGradient id={sheen} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.14" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect className="app-mark__tile" width="64" height="64" rx="14" fill="#141a16" />
          <g clipPath={`url(#${clip})`}>
            <path
              className="app-mark__soft"
              d="M15 15 49 49"
              stroke="#c8f560"
              strokeOpacity="0.35"
              strokeWidth="10"
            />
            <path
              className="app-mark__cross"
              d="M49 15 15 49"
              stroke="#c8f560"
              strokeWidth="5"
              pathLength={1}
            />
          </g>
          <rect
            className="app-mark__frame"
            x="13.6"
            y="13.6"
            width="36.8"
            height="36.8"
            rx="3"
            stroke="#c8f560"
            strokeWidth="3.2"
            pathLength={1}
          />
          <g clipPath={`url(#${tile})`}>
            <rect className="app-mark__sheen" x="-40" y="-20" width="28" height="104" fill={`url(#${sheen})`} />
          </g>
        </svg>
      </span>
    </span>
  )
}
