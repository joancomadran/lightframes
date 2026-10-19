import { Easing, interpolate } from 'remotion'

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  outSoft: Easing.bezier(0.22, 1, 0.36, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  inOutStrong: Easing.bezier(0.83, 0, 0.17, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
  linear: (t: number) => t,
}

/** Clamped 0→1 progress of `f` across [a, b]. */
export function prog(f: number, a: number, b: number, e: (t: number) => number = ease.out) {
  return interpolate(f, [a, b], [0, 1], {
    easing: e,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function mix<T extends Record<string, number>>(a: T, b: T, t: number): T {
  const out = {} as Record<string, number>
  for (const k of Object.keys(a)) out[k] = lerp(a[k], b[k], t)
  return out as T
}

export type Key<T> = { f: number; v: T; e?: (t: number) => number }

/** Piecewise keyframes: holds before the first and after the last key. */
export function keys<T extends Record<string, number>>(f: number, ks: Key<T>[]): T {
  if (f <= ks[0].f) return ks[0].v
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i]
    const b = ks[i + 1]
    if (f <= b.f) {
      const t = prog(f, a.f, b.f, b.e ?? ease.inOutStrong)
      return mix(a.v, b.v, t)
    }
  }
  return ks[ks.length - 1].v
}

export function keys1(f: number, ks: Key<number>[]): number {
  return keys(
    f,
    ks.map((k) => ({ ...k, v: { x: k.v } })),
  ).x
}

/** Index of the last threshold that `f` has passed (−1 before the first). */
export function stepAt(f: number, at: number[]) {
  let i = -1
  for (let k = 0; k < at.length; k++) if (f >= at[k]) i = k
  return i
}

/** Deterministic pseudo random in [0, 1). */
export function rand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
