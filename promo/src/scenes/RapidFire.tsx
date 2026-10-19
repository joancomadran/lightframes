import React from 'react'
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion'
import { ease, prog, rand } from '../anim'
import { RAPID_STEP, RAPID_WORDS } from '../cues'
import { Flash } from '../fx/Finish'
import { C, F, img, PHOTOS, PRESETS } from '../theme'

type Look = 'photo' | 'accent' | 'void'
const LOOKS: Look[] = ['photo', 'void', 'accent', 'photo', 'void', 'photo', 'accent', 'void', 'photo', 'void', 'accent', 'photo', 'void', 'photo', 'accent', 'void']

/** Sixteen feature cards, one per eighth note. */
export function RapidFire() {
  const f = useCurrentFrame()
  const i = Math.min(RAPID_WORDS.length - 1, Math.floor(f / RAPID_STEP))
  const t = f - i * RAPID_STEP
  const look = LOOKS[i]
  const ph = PHOTOS[i % 3].id
  const src = i % 2 ? img.hero(ph) : img.preset(ph, PRESETS[i % PRESETS.length].id)
  const k = prog(t, 0, RAPID_STEP, ease.outSoft)
  const last = i === RAPID_WORDS.length - 1
  const size = last ? 300 : RAPID_WORDS[i].length > 12 ? 168 : 200
  const dir = rand(i) > 0.5 ? 1 : -1
  return (
    <AbsoluteFill style={{ background: look === 'accent' ? C.accent : C.void, overflow: 'hidden' }}>
      {look === 'photo' && (
        <AbsoluteFill style={{ transform: `scale(${1.18 - 0.08 * k}) translateX(${dir * k * 30}px)` }}>
          <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.62) saturate(1.1)' }} />
        </AbsoluteFill>
      )}
      {look === 'void' && (
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(200,245,96,0.12), transparent 70%)' }} />
      )}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            fontFamily: F.display,
            fontWeight: 800,
            fontSize: size,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            color: look === 'accent' ? C.accentInk : last ? C.accent : C.text,
            transform: `scale(${1.12 - 0.12 * prog(t, 0, 8, ease.out)}) translateX(${dir * (1 - prog(t, 0, 8, ease.out)) * 40}px)`,
            textShadow: look === 'photo' ? '0 10px 60px rgba(0,0,0,0.5)' : look === 'void' && last ? '0 0 80px rgba(200,245,96,0.45)' : undefined,
          }}
        >
          {RAPID_WORDS[i]}
        </div>
      </AbsoluteFill>
      {/* Counter + progress ticks */}
      <div
        style={{
          position: 'absolute',
          left: 110,
          bottom: 90,
          fontFamily: F.ui,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: '0.2em',
          color: look === 'accent' ? C.accentInk : C.accent,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {String(i + 1).padStart(2, '0')} / {RAPID_WORDS.length}
      </div>
      <div style={{ position: 'absolute', right: 110, bottom: 98, display: 'flex', gap: 6 }}>
        {RAPID_WORDS.map((_, j) => (
          <div key={j} style={{ width: 22, height: 4, borderRadius: 4, background: look === 'accent' ? C.accentInk : C.accent, opacity: j <= i ? 1 : 0.22 }} />
        ))}
      </div>
      <Flash t={t} strength={look === 'accent' ? 0 : 0.12} len={6} />
    </AbsoluteFill>
  )
}
