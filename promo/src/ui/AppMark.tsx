import React from 'react'
import { prog, ease } from '../anim'
import { C } from '../theme'

/**
 * The app icon (favicon.svg artwork). `t` is frames since the draw-in began;
 * pass a large number for the finished mark.
 */
export function AppMark({ size, t = 999, glow = 0 }: { size: number; t?: number; glow?: number }) {
  const tile = prog(t, 0, 16, ease.out)
  const frame = prog(t, 4, 30, ease.inOut)
  const soft = prog(t, 18, 34, ease.out)
  const cross = prog(t, 22, 38, ease.inOut)
  const sheen = prog(t, 34, 64, ease.inOut)
  const id = `m${size}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      style={{
        display: 'block',
        flexShrink: 0,
        overflow: 'visible',
        filter: glow > 0 ? `drop-shadow(0 0 ${glow * 28}px rgba(200,245,96,${glow * 0.55}))` : undefined,
      }}
    >
      <defs>
        <clipPath id={`${id}-c`}>
          <rect x="18" y="18" width="28" height="28" />
        </clipPath>
        <clipPath id={`${id}-t`}>
          <rect width="64" height="64" rx="14" />
        </clipPath>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g style={{ transform: `scale(${0.6 + 0.4 * tile})`, transformOrigin: '32px 32px', opacity: tile }}>
        <rect width="64" height="64" rx="14" fill={C.tile} stroke="rgba(200,245,96,0.14)" strokeWidth="0.6" />
      </g>
      <g clipPath={`url(#${id}-c)`}>
        <path
          d="M15 15 49 49"
          stroke={C.accent}
          strokeOpacity={0.35 * soft}
          strokeWidth="10"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - soft}
        />
        <path
          d="M49 15 15 49"
          stroke={C.accent}
          strokeWidth="5"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - cross}
        />
      </g>
      <rect
        x="13.6"
        y="13.6"
        width="36.8"
        height="36.8"
        rx="3"
        stroke={C.accent}
        strokeWidth="3.2"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - frame}
      />
      <g clipPath={`url(#${id}-t)`}>
        <rect x={-40 + sheen * 130} y="-20" width="28" height="104" fill={`url(#${id}-s)`} transform="rotate(12 32 32)" />
      </g>
    </svg>
  )
}
