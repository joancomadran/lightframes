import React from 'react'
import { ease, keys, prog, type Key } from '../anim'
import { C } from '../theme'

export type CursorKey = Key<{ x: number; y: number }>

/**
 * A pointer that glides between keyframes (editor coordinates) and clicks at
 * the given frames: a press squash plus an accent ripple.
 */
export function Cursor({ f, path, clicks, opacity = 1 }: { f: number; path: CursorKey[]; clicks: number[]; opacity?: number }) {
  const { x, y } = keys(f, path)
  let press = 0
  let ripple = -1
  for (const c of clicks) {
    if (f >= c - 4 && f < c + 8) press = Math.max(press, f < c ? prog(f, c - 4, c) : 1 - prog(f, c, c + 8))
    if (f >= c && f < c + 24) ripple = (f - c) / 24
  }
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, opacity, pointerEvents: 'none', zIndex: 50 }}>
      {ripple >= 0 && (
        <div
          style={{
            position: 'absolute',
            left: -24,
            top: -24,
            width: 48,
            height: 48,
            borderRadius: 99,
            border: `2px solid ${C.accent}`,
            opacity: 1 - ease.out(ripple),
            transform: `scale(${0.3 + ease.out(ripple) * 1.1})`,
          }}
        />
      )}
      <svg
        width={26}
        height={26}
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          left: -3,
          top: -2,
          transform: `scale(${1 - press * 0.16})`,
          transformOrigin: '3px 2px',
          filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.55))',
        }}
      >
        <path d="M4 2.5 4 19.2 8.6 15l2.9 6.5 3-1.3-2.9-6.4 6.3-.3z" fill="#fff" stroke="#111" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
