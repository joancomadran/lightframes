import React from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { ease, prog } from '../anim'
import { C, F } from '../theme'

/** A line of display type; wrap words in <Hi> to paint them accent. */
export function Hi({ children }: { children: ReactNode }) {
  return <span style={{ color: C.accent }}>{children}</span>
}

/**
 * Kinetic headline: a kicker with a growing rule, then each line rises out of
 * a mask. `f` is frames since the caption started; it leaves over the last 16.
 */
export function Caption({
  f,
  dur,
  kicker,
  lines,
  size = 92,
  style,
  align = 'left',
  sub,
}: {
  f: number
  dur: number
  kicker?: string
  lines: ReactNode[]
  size?: number
  style?: CSSProperties
  align?: 'left' | 'center'
  sub?: ReactNode
}) {
  if (f < 0 || f > dur) return null
  const out = prog(f, dur - 16, dur, ease.in)
  const rule = prog(f, 0, 18, ease.out)
  return (
    <div style={{ position: 'absolute', textAlign: align, ...style }}>
      {kicker && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: align === 'center' ? 'center' : 'flex-start',
            gap: 14,
            marginBottom: 18,
            fontFamily: F.ui,
            fontWeight: 600,
            fontSize: 19,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: C.accent,
            opacity: 1 - out,
          }}
        >
          <span style={{ width: 46 * rule, height: 2, background: C.accent, boxShadow: '0 0 12px rgba(200,245,96,0.7)' }} />
          <span style={{ opacity: prog(f, 4, 18), transform: `translateX(${(1 - prog(f, 4, 22)) * -16}px)` }}>{kicker}</span>
        </div>
      )}
      {lines.map((line, i) => {
        const inT = prog(f, 5 + i * 5, 29 + i * 5, ease.out)
        const outT = prog(f, dur - 18 + i * 3, dur - 4 + i * 3, ease.in)
        return (
          <div key={i} style={{ overflow: 'hidden', paddingBottom: size * 0.08, marginBottom: -size * 0.08 }}>
            <div
              style={{
                fontFamily: F.display,
                fontWeight: 700,
                fontSize: size,
                lineHeight: 1.0,
                letterSpacing: '-0.035em',
                color: C.text,
                transform: `translateY(${(1 - inT) * 105 - outT * 105}%) rotate(${(1 - inT) * 3}deg)`,
                transformOrigin: 'left bottom',
                filter: `blur(${(1 - inT) * 6 + outT * 6}px)`,
                whiteSpace: 'nowrap',
              }}
            >
              {line}
            </div>
          </div>
        )
      })}
      {sub && (
        <div
          style={{
            marginTop: 22,
            fontFamily: F.ui,
            fontSize: 26,
            fontWeight: 500,
            color: C.muted,
            opacity: prog(f, 16, 36) * (1 - out),
            transform: `translateY(${(1 - prog(f, 16, 40)) * 14}px)`,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  )
}

/** Soft pill chip used beside captions. */
export function Chip({ children, t, accent }: { children: ReactNode; t: number; accent?: boolean }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 22px',
        borderRadius: 999,
        border: `1.5px solid ${accent ? C.accent : C.lineStrong}`,
        background: accent ? C.accent : 'rgba(23,30,26,0.82)',
        color: accent ? C.accentInk : C.text,
        fontFamily: F.ui,
        fontWeight: 600,
        fontSize: 22,
        opacity: t,
        transform: `translateY(${(1 - t) * 24}px) scale(${0.9 + 0.1 * t})`,
        backdropFilter: 'blur(10px)',
      }}
    >
      {children}
    </div>
  )
}
