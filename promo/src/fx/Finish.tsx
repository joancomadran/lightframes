import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'

/** Film grain + vignette laid over the whole cut. */
export function Finish() {
  const f = useCurrentFrame()
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.42) 100%)' }} />
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.075, mixBlendMode: 'overlay' }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 12} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  )
}

/** A quick white-green flash for cuts on the beat. `t` is frames since the hit. */
export function Flash({ t, strength = 0.7, len = 14 }: { t: number; strength?: number; len?: number }) {
  if (t < 0 || t > len) return null
  const o = strength * Math.pow(1 - t / len, 2.2)
  return <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 50%, rgba(240,255,210,1), rgba(200,245,96,0.6))', opacity: o, mixBlendMode: 'screen', pointerEvents: 'none' }} />
}

/** Animated backdrop: the app's void with two slow accent glows. */
export function Void({ f, intensity = 1 }: { f: number; intensity?: number }) {
  const a = Math.sin(f / 90) * 8
  const b = Math.cos(f / 110) * 10
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 70% 55% at ${68 + a}% ${-8 + b * 0.4}%, rgba(200,245,96,${0.09 * intensity}), transparent 60%), radial-gradient(ellipse 55% 45% at ${4 - a * 0.5}% ${100 - b * 0.3}%, rgba(70,110,90,${0.22 * intensity}), transparent 55%), #0c100e`,
      }}
    />
  )
}
