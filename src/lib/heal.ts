import type { CropRect, HealSpot, RotateDegrees } from '../types/edits'
import { isFullCrop } from './crop'
import { liquifyFromSource, liquifyToSource, type LiquifyField } from './liquify'

/*
 * Spot removal: the painted area is replaced with pixels
 * from somewhere else in the photo (the spot's source offset).
 *
 *   clone: copy the source pixels as they are, feathered at the edge
 *   heal:  copy them, then add a smooth correction ("membrane") that makes
 *          the copy meet the surrounding colours exactly at the border —
 *          a Laplace fill of (target − source) along the boundary, which is
 *          what Poisson / seamless cloning amounts to.
 *   remove: fill from an inpainting model (MI-GAN, see inpaint.ts). The model
 *          runs asynchronously, once per spot; its output is kept as a patch
 *          and pasted here like any other fill. Until it lands, the spot is skipped.
 *
 * Spots live in source image space (before orientation and crop), so the
 * healing runs on source pixels before any other edit and reframing never
 * moves it.
 */

/** Interleaved pixels to heal in place; channels past the third (alpha) are left alone. */
export type HealImage = {
  data: Uint8ClampedArray | Uint16Array
  /** Size of the buffer. */
  width: number
  height: number
  /** Values per pixel: 4 for canvas RGBA, 3 for linear RGB. */
  stride: number
  max: number
  /** Where the buffer sits in the full image, when it holds only a window of it. */
  left?: number
  top?: number
  fullWidth?: number
  fullHeight?: number
  /** 8-bit sRGB (0–255, fractional) → this buffer's values; inpainting patches are 8-bit. */
  fromSrgb8?: (v: number) => number
}

/** An inpainted region: 8-bit RGBA covering `rect` (0–1 of the source). */
export type InpaintPatch = {
  rect: { x0: number; y0: number; x1: number; y1: number }
  width: number
  height: number
  data: Uint8ClampedArray
}

/** What a patch depends on: the painted area, not its feather or opacity. */
export function patchKey(spot: HealSpot): string {
  return `${spot.id}|${spot.size}|${spot.points.join(',')}`
}

const patches = new Map<string, InpaintPatch>()

export function getPatch(spot: HealSpot): InpaintPatch | null {
  return patches.get(patchKey(spot)) ?? null
}

/** Store a spot's patch, dropping the ones made for earlier versions of it. */
export function setPatch(spot: HealSpot, patch: InpaintPatch): void {
  for (const key of patches.keys()) if (key.startsWith(`${spot.id}|`)) patches.delete(key)
  patches.set(patchKey(spot), patch)
}

type Rect = { x0: number; y0: number; x1: number; y1: number }

/** Distance-based coverage of a stroke: alpha per pixel of `rect` (full-image pixels). */
type SpotMask = Rect & { alpha: Float32Array }

function spotRadius(size: number, fullWidth: number, fullHeight: number): number {
  return Math.max(1, size * Math.max(fullWidth, fullHeight))
}

/** Pixel bounds of a stroke grown by `pad`, clipped to the image. */
function strokeRect(points: number[], pad: number, fullWidth: number, fullHeight: number): Rect | null {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (let i = 0; i < points.length; i += 2) {
    const x = points[i]! * fullWidth
    const y = points[i + 1]! * fullHeight
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  const rect = {
    x0: Math.max(0, Math.floor(minX - pad)),
    y0: Math.max(0, Math.floor(minY - pad)),
    x1: Math.min(fullWidth, Math.ceil(maxX + pad)),
    y1: Math.min(fullHeight, Math.ceil(maxY + pad)),
  }
  return rect.x1 > rect.x0 && rect.y1 > rect.y0 ? rect : null
}

function rasterizeStroke(
  points: number[],
  radius: number,
  feather: number,
  fullWidth: number,
  fullHeight: number,
): SpotMask | null {
  const rect = strokeRect(points, radius + 1, fullWidth, fullHeight)
  if (!rect) return null
  const w = rect.x1 - rect.x0
  const h = rect.y1 - rect.y0
  const dist = new Float32Array(w * h).fill(Infinity)
  const count = points.length / 2
  for (let s = 0; s < Math.max(1, count - 1); s++) {
    const ax = points[s * 2]! * fullWidth
    const ay = points[s * 2 + 1]! * fullHeight
    const bx = count > 1 ? points[s * 2 + 2]! * fullWidth : ax
    const by = count > 1 ? points[s * 2 + 3]! * fullHeight : ay
    const abx = bx - ax
    const aby = by - ay
    const len2 = abx * abx + aby * aby
    const sx0 = Math.max(rect.x0, Math.floor(Math.min(ax, bx) - radius - 1))
    const sx1 = Math.min(rect.x1, Math.ceil(Math.max(ax, bx) + radius + 1))
    const sy0 = Math.max(rect.y0, Math.floor(Math.min(ay, by) - radius - 1))
    const sy1 = Math.min(rect.y1, Math.ceil(Math.max(ay, by) + radius + 1))
    for (let y = sy0; y < sy1; y++) {
      const py = y + 0.5
      for (let x = sx0; x < sx1; x++) {
        const px = x + 0.5
        const t = len2 > 0 ? Math.min(1, Math.max(0, ((px - ax) * abx + (py - ay) * aby) / len2)) : 0
        const d = Math.hypot(px - ax - abx * t, py - ay - aby * t)
        const k = (y - rect.y0) * w + (x - rect.x0)
        if (d < dist[k]!) dist[k] = d
      }
    }
  }
  const hard = radius * (1 - feather)
  const soft = Math.max(1, radius - hard)
  const alpha = new Float32Array(w * h)
  for (let k = 0; k < alpha.length; k++) {
    const t = Math.min(1, Math.max(0, (radius + 0.5 - dist[k]!) / soft))
    alpha[k] = t * t * (3 - 2 * t)
  }
  return { ...rect, alpha }
}

// Membrane cells: outside the region, fixed boundary value, or solved for.
const NONE = 0
const KNOWN = 1
const UNKNOWN = 2

const COARSEST = 24
const COARSE_ITERATIONS = 200
const FINE_ITERATIONS = 24
const SOR = 1.6

/** Gauss–Seidel with over-relaxation; neighbours outside the region are skipped (free edge). */
function relax(state: Uint8Array, values: Float32Array, w: number, h: number, iterations: number): void {
  for (let it = 0; it < iterations; it++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x
        if (state[i] !== UNKNOWN) continue
        let r = 0
        let g = 0
        let b = 0
        let n = 0
        const add = (j: number) => {
          if (state[j] === NONE) return
          r += values[j * 3]!
          g += values[j * 3 + 1]!
          b += values[j * 3 + 2]!
          n++
        }
        if (x > 0) add(i - 1)
        if (x < w - 1) add(i + 1)
        if (y > 0) add(i - w)
        if (y < h - 1) add(i + w)
        if (n === 0) continue
        const o = i * 3
        values[o] = values[o]! + SOR * (r / n - values[o]!)
        values[o + 1] = values[o + 1]! + SOR * (g / n - values[o + 1]!)
        values[o + 2] = values[o + 2]! + SOR * (b / n - values[o + 2]!)
      }
    }
  }
}

/**
 * Smooth (harmonic) fill of the Unknown cells from the Known ones, coarse to
 * fine: each level starts from the half-size solution, so a few sweeps suffice.
 */
function solveMembrane(state: Uint8Array, values: Float32Array, w: number, h: number): void {
  if (Math.max(w, h) <= COARSEST) {
    let r = 0
    let g = 0
    let b = 0
    let n = 0
    for (let i = 0; i < state.length; i++) {
      if (state[i] !== KNOWN) continue
      r += values[i * 3]!
      g += values[i * 3 + 1]!
      b += values[i * 3 + 2]!
      n++
    }
    if (n === 0) return
    for (let i = 0; i < state.length; i++) {
      if (state[i] !== UNKNOWN) continue
      values[i * 3] = r / n
      values[i * 3 + 1] = g / n
      values[i * 3 + 2] = b / n
    }
    relax(state, values, w, h, COARSE_ITERATIONS)
    return
  }

  const cw = Math.ceil(w / 2)
  const ch = Math.ceil(h / 2)
  const cState = new Uint8Array(cw * ch)
  const cValues = new Float32Array(cw * ch * 3)
  const counts = new Float32Array(cw * ch)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      const c = (y >> 1) * cw + (x >> 1)
      if (state[i] === UNKNOWN) cState[c] = UNKNOWN
      else if (state[i] === KNOWN) {
        if (cState[c] === NONE) cState[c] = KNOWN
        cValues[c * 3] = cValues[c * 3]! + values[i * 3]!
        cValues[c * 3 + 1] = cValues[c * 3 + 1]! + values[i * 3 + 1]!
        cValues[c * 3 + 2] = cValues[c * 3 + 2]! + values[i * 3 + 2]!
        counts[c] = counts[c]! + 1
      }
    }
  }
  for (let c = 0; c < counts.length; c++) {
    const n = counts[c]!
    if (n > 1) {
      cValues[c * 3] = cValues[c * 3]! / n
      cValues[c * 3 + 1] = cValues[c * 3 + 1]! / n
      cValues[c * 3 + 2] = cValues[c * 3 + 2]! / n
    }
  }
  solveMembrane(cState, cValues, cw, ch)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      if (state[i] !== UNKNOWN) continue
      const c = (y >> 1) * cw + (x >> 1)
      values[i * 3] = cValues[c * 3]!
      values[i * 3 + 1] = cValues[c * 3 + 1]!
      values[i * 3 + 2] = cValues[c * 3 + 2]!
    }
  }
  relax(state, values, w, h, FINE_ITERATIONS)
}

function fullSize(img: HealImage) {
  return {
    left: img.left ?? 0,
    top: img.top ?? 0,
    fullWidth: img.fullWidth ?? img.width,
    fullHeight: img.fullHeight ?? img.height,
  }
}

function applySpot(img: HealImage, spot: HealSpot): void {
  const { data, stride, max } = img
  const { left, top, fullWidth, fullHeight } = fullSize(img)
  const mask = rasterizeStroke(
    spot.points,
    spotRadius(spot.size, fullWidth, fullHeight),
    spot.feather,
    fullWidth,
    fullHeight,
  )
  if (!mask) return
  if (spot.mode === 'remove') {
    applyPatch(img, spot, mask)
    return
  }
  const ox = Math.round(spot.dx * fullWidth)
  const oy = Math.round(spot.dy * fullHeight)
  if (ox === 0 && oy === 0) return

  // The mask plus a one-pixel ring (the membrane's boundary), clipped to the buffer.
  const x0 = Math.max(left, mask.x0 - 1)
  const y0 = Math.max(top, mask.y0 - 1)
  const x1 = Math.min(left + img.width, mask.x1 + 1)
  const y1 = Math.min(top + img.height, mask.y1 + 1)
  const w = x1 - x0
  const h = y1 - y0
  if (w <= 0 || h <= 0) return
  const mw = mask.x1 - mask.x0
  const alphaAt = (x: number, y: number) =>
    x < mask.x0 || y < mask.y0 || x >= mask.x1 || y >= mask.y1 ? 0 : mask.alpha[(y - mask.y0) * mw + (x - mask.x0)]!

  // Read every source pixel before writing: the source may overlap the area being healed.
  const source = new Float32Array(w * h * 3)
  for (let y = 0; y < h; y++) {
    const sy = Math.min(top + img.height - 1, Math.max(top, y0 + y + oy)) - top
    for (let x = 0; x < w; x++) {
      const sx = Math.min(left + img.width - 1, Math.max(left, x0 + x + ox)) - left
      const s = (sy * img.width + sx) * stride
      const o = (y * w + x) * 3
      source[o] = data[s]!
      source[o + 1] = data[s + 1]!
      source[o + 2] = data[s + 2]!
    }
  }

  let correction: Float32Array | null = null
  if (spot.mode === 'heal') {
    const state = new Uint8Array(w * h)
    correction = new Float32Array(w * h * 3)
    const inside = (x: number, y: number) => alphaAt(x0 + x, y0 + y) > 0
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x
        if (inside(x, y)) {
          state[i] = UNKNOWN
          continue
        }
        const edge =
          (x > 0 && inside(x - 1, y)) ||
          (x < w - 1 && inside(x + 1, y)) ||
          (y > 0 && inside(x, y - 1)) ||
          (y < h - 1 && inside(x, y + 1))
        if (!edge) continue
        state[i] = KNOWN
        const t = ((y0 + y - top) * img.width + (x0 + x - left)) * stride
        correction[i * 3] = data[t]! - source[i * 3]!
        correction[i * 3 + 1] = data[t + 1]! - source[i * 3 + 1]!
        correction[i * 3 + 2] = data[t + 2]! - source[i * 3 + 2]!
      }
    }
    solveMembrane(state, correction, w, h)
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = alphaAt(x0 + x, y0 + y) * spot.opacity
      if (a <= 0) continue
      const i = y * w + x
      const t = ((y0 + y - top) * img.width + (x0 + x - left)) * stride
      for (let c = 0; c < 3; c++) {
        const fill = source[i * 3 + c]! + (correction ? correction[i * 3 + c]! : 0)
        const v = data[t + c]! + (fill - data[t + c]!) * a
        data[t + c] = v < 0 ? 0 : v > max ? max : v
      }
    }
  }
}

/** Paste a spot's inpainted patch (bilinear) inside its feathered mask. */
function applyPatch(img: HealImage, spot: HealSpot, mask: SpotMask): void {
  const patch = getPatch(spot)
  if (!patch) return
  const { data, stride, max } = img
  const { left, top, fullWidth, fullHeight } = fullSize(img)
  const convert = img.fromSrgb8 ?? ((v: number) => (v * max) / 255)
  const { rect, width: pw, height: ph } = patch
  const px = pw / ((rect.x1 - rect.x0) * fullWidth)
  const py = ph / ((rect.y1 - rect.y0) * fullHeight)
  const mw = mask.x1 - mask.x0
  const x0 = Math.max(left, mask.x0)
  const y0 = Math.max(top, mask.y0)
  const x1 = Math.min(left + img.width, mask.x1)
  const y1 = Math.min(top + img.height, mask.y1)
  for (let y = y0; y < y1; y++) {
    const fy = Math.min(ph - 1, Math.max(0, (y + 0.5 - rect.y0 * fullHeight) * py - 0.5))
    const ty = Math.floor(fy)
    const by = Math.min(ph - 1, ty + 1)
    const wy = fy - ty
    for (let x = x0; x < x1; x++) {
      const a = mask.alpha[(y - mask.y0) * mw + (x - mask.x0)]! * spot.opacity
      if (a <= 0) continue
      const fx = Math.min(pw - 1, Math.max(0, (x + 0.5 - rect.x0 * fullWidth) * px - 0.5))
      const lx = Math.floor(fx)
      const rx = Math.min(pw - 1, lx + 1)
      const wx = fx - lx
      const t = ((y - top) * img.width + (x - left)) * stride
      for (let c = 0; c < 3; c++) {
        const tl = patch.data[(ty * pw + lx) * 4 + c]!
        const tr = patch.data[(ty * pw + rx) * 4 + c]!
        const bl = patch.data[(by * pw + lx) * 4 + c]!
        const br = patch.data[(by * pw + rx) * 4 + c]!
        const top8 = tl + (tr - tl) * wx
        const fill = convert(top8 + (bl + (br - bl) * wx - top8) * wy)
        const v = data[t + c]! + (fill - data[t + c]!) * a
        data[t + c] = v < 0 ? 0 : v > max ? max : v
      }
    }
  }
}

/**
 * The area to remove as a hole mask over `rect` (0–1 of the source) sampled
 * at `width`×`height`: 0 = fill this, 255 = keep. Grown by `grow` pixels so
 * the model also replaces the soft fringe of what is being removed.
 */
export function holeMask(
  spot: Pick<HealSpot, 'points' | 'size'>,
  rect: InpaintPatch['rect'],
  width: number,
  height: number,
  sourceWidth: number,
  sourceHeight: number,
  grow = 3,
): Uint8Array<ArrayBuffer> {
  // Radius in patch pixels: source pixels times the patch's scale.
  const fullWidth = width / (rect.x1 - rect.x0)
  const radius = spot.size * Math.max(sourceWidth, sourceHeight) * (fullWidth / sourceWidth) + grow
  const local = spot.points.map((v, i) =>
    i % 2 === 0 ? (v - rect.x0) / (rect.x1 - rect.x0) : (v - rect.y0) / (rect.y1 - rect.y0),
  )
  const mask = rasterizeStroke(local, radius, 0, width, height)
  const out = new Uint8Array(width * height).fill(255)
  if (!mask) return out
  const mw = mask.x1 - mask.x0
  for (let y = mask.y0; y < mask.y1; y++) {
    for (let x = mask.x0; x < mask.x1; x++) {
      if (mask.alpha[(y - mask.y0) * mw + (x - mask.x0)]! > 0) out[y * width + x] = 0
    }
  }
  return out
}

/** Heal every spot in order (later spots see earlier fixes), in place. */
export function applyHeal(img: HealImage, spots: HealSpot[]): void {
  for (const spot of spots) applySpot(img, spot)
}

/** Pixel area the spots read and write, so callers can touch only that window of a large image. */
export function healBounds(spots: HealSpot[], fullWidth: number, fullHeight: number): Rect | null {
  let out: Rect | null = null
  for (const spot of spots) {
    const pad = spotRadius(spot.size, fullWidth, fullHeight) + 2
    const target = strokeRect(spot.points, pad, fullWidth, fullHeight)
    const shifted = spot.points.map((v, i) => v + (i % 2 === 0 ? spot.dx : spot.dy))
    const source = strokeRect(shifted, pad, fullWidth, fullHeight)
    for (const r of [target, source]) {
      if (!r) continue
      out = out
        ? { x0: Math.min(out.x0, r.x0), y0: Math.min(out.y0, r.y0), x1: Math.max(out.x1, r.x1), y1: Math.max(out.y1, r.y1) }
        : r
    }
  }
  return out
}

/** Stable cache key for a list of spots, including which inpainting patches have landed. */
export function healKey(spots: HealSpot[]): string {
  if (spots.length === 0) return ''
  const ready = spots.map((s) => (s.mode === 'remove' && getPatch(s) ? 1 : 0)).join('')
  return `${JSON.stringify(spots)}|${ready}`
}

/* ——— Picking a source automatically ——— */

const MAX_SAMPLES = 3000
const SEARCH_DISTANCES = [0.7, 1, 1.4, 2, 2.8]
const SEARCH_ANGLES = 16

type Sample = { x: number; y: number }

function collect(mask: SpotMask, keep: (a: number, x: number, y: number) => boolean): Sample[] {
  const w = mask.x1 - mask.x0
  const all: Sample[] = []
  for (let y = mask.y0; y < mask.y1; y++) {
    for (let x = mask.x0; x < mask.x1; x++) {
      if (keep(mask.alpha[(y - mask.y0) * w + (x - mask.x0)]!, x, y)) all.push({ x, y })
    }
  }
  if (all.length <= MAX_SAMPLES) return all
  const step = all.length / MAX_SAMPLES
  return Array.from({ length: MAX_SAMPLES }, (_, i) => all[Math.floor(i * step)]!)
}

/**
 * Candidate source offsets for a painted area, best first. A candidate scores
 * well when the pixels around where it would land match the pixels around the
 * painted area, and its texture (gradient strength) matches theirs too, so a
 * fix in plain sky doesn't pull in an edge.
 */
export function rankHealSources(
  img: HealImage,
  spot: Pick<HealSpot, 'points' | 'size'>,
): { dx: number; dy: number }[] {
  const { width, height, stride, data, max } = img
  const radius = spotRadius(spot.size, width, height)
  const ringWidth = Math.max(2, radius * 0.6)
  const inner = rasterizeStroke(spot.points, radius, 0, width, height)
  const outer = rasterizeStroke(spot.points, radius + ringWidth, 0, width, height)
  if (!inner || !outer) return []
  const ow = outer.x1 - outer.x0
  const insideInner = (x: number, y: number) =>
    x >= inner.x0 && y >= inner.y0 && x < inner.x1 && y < inner.y1 &&
    inner.alpha[(y - inner.y0) * (inner.x1 - inner.x0) + (x - inner.x0)]! > 0
  const insideOuter = (x: number, y: number) =>
    x >= outer.x0 && y >= outer.y0 && x < outer.x1 && y < outer.y1 &&
    outer.alpha[(y - outer.y0) * ow + (x - outer.x0)]! > 0

  const ring = collect(outer, (a, x, y) => a > 0 && !insideInner(x, y))
  const core = collect(inner, (a) => a > 0)
  if (ring.length === 0 || core.length === 0) return []

  const scale = 255 / max
  const at = (x: number, y: number, c: number) => data[(y * width + x) * stride + c]! * scale
  const luma = (x: number, y: number) => 0.3 * at(x, y, 0) + 0.59 * at(x, y, 1) + 0.11 * at(x, y, 2)
  const gradient = (x: number, y: number) => {
    const xl = Math.max(0, x - 1)
    const xr = Math.min(width - 1, x + 1)
    const yt = Math.max(0, y - 1)
    const yb = Math.min(height - 1, y + 1)
    return Math.abs(luma(xr, y) - luma(xl, y)) + Math.abs(luma(x, yb) - luma(x, yt))
  }
  let ringTexture = 0
  for (const p of ring) ringTexture += gradient(p.x, p.y)
  ringTexture /= ring.length

  const span = Math.max(outer.x1 - outer.x0, outer.y1 - outer.y0)
  const scored: { ox: number; oy: number; score: number }[] = []
  SEARCH_DISTANCES.forEach((factor, rank) => {
    for (let k = 0; k < SEARCH_ANGLES; k++) {
      const angle = (k / SEARCH_ANGLES) * Math.PI * 2 + rank * 0.4
      const ox = Math.round(Math.cos(angle) * span * factor)
      const oy = Math.round(Math.sin(angle) * span * factor)
      if (outer.x0 + ox < 0 || outer.y0 + oy < 0 || outer.x1 + ox > width || outer.y1 + oy > height) continue
      // The copy must not come from the area being removed (or its edge).
      if (core.some((p) => insideOuter(p.x + ox, p.y + oy))) continue
      let ssd = 0
      for (const p of ring) {
        for (let c = 0; c < 3; c++) {
          const d = at(p.x, p.y, c) - at(p.x + ox, p.y + oy, c)
          ssd += d * d
        }
      }
      let texture = 0
      for (const p of core) texture += gradient(p.x + ox, p.y + oy)
      texture /= core.length
      const score = (ssd / ring.length + (texture - ringTexture) ** 2) * (1 + 0.15 * rank)
      scored.push({ ox, oy, score })
    }
  })
  scored.sort((a, b) => a.score - b.score)
  return scored.map((s) => ({ dx: s.ox / width, dy: s.oy / height }))
}

/* ——— Source image space ↔ what the editor shows ——— */

/** Full-size source dimensions plus the orientation and crop that frame it. */
export type HealGeometry = {
  width: number
  height: number
  rotate: RotateDegrees
  crop: CropRect
  /** Liquify between the source and the framing, for overlays drawn over the liquified photo. */
  liquify?: LiquifyField | null
}

type Frame = {
  ow: number
  oh: number
  cropped: boolean
  cos: number
  sin: number
  rotW: number
  rotH: number
  outX: number
  outY: number
  outW: number
  outH: number
}

function frameOf(geo: HealGeometry): Frame {
  const swapped = geo.rotate === 90 || geo.rotate === 270
  const ow = swapped ? geo.height : geo.width
  const oh = swapped ? geo.width : geo.height
  const cropped = !isFullCrop(geo.crop)
  const theta = cropped ? (geo.crop.straighten * Math.PI) / 180 : 0
  const cos = Math.cos(theta)
  const sin = Math.sin(theta)
  const rotW = ow * Math.abs(cos) + oh * Math.abs(sin)
  const rotH = ow * Math.abs(sin) + oh * Math.abs(cos)
  return cropped
    ? {
        ow,
        oh,
        cropped,
        cos,
        sin,
        rotW,
        rotH,
        outX: geo.crop.x * rotW,
        outY: geo.crop.y * rotH,
        outW: geo.crop.width * rotW,
        outH: geo.crop.height * rotH,
      }
    : { ow, oh, cropped, cos, sin, rotW: ow, rotH: oh, outX: 0, outY: 0, outW: ow, outH: oh }
}

/** Size of the framed (rotated, cropped) image in source pixels. */
export function framedSize(geo: HealGeometry): { w: number; h: number } {
  const f = frameOf(geo)
  return { w: f.outW, h: f.outH }
}

/** Source (0–1) → framed image (0–1). Mirrors prepareBase's orientation, straighten and crop. */
export function sourceToFrame(geo: HealGeometry, x: number, y: number): { x: number; y: number } {
  const shown = geo.liquify ? liquifyFromSource(geo.liquify, x, y) : { x, y }
  const f = frameOf(geo)
  const sx = shown.x * geo.width
  const sy = shown.y * geo.height
  let ox = sx
  let oy = sy
  if (geo.rotate === 90) {
    ox = geo.height - sy
    oy = sx
  } else if (geo.rotate === 180) {
    ox = geo.width - sx
    oy = geo.height - sy
  } else if (geo.rotate === 270) {
    ox = sy
    oy = geo.width - sx
  }
  let px = ox
  let py = oy
  if (f.cropped) {
    const cx = ox - f.ow / 2
    const cy = oy - f.oh / 2
    px = cx * f.cos - cy * f.sin + f.rotW / 2
    py = cx * f.sin + cy * f.cos + f.rotH / 2
  }
  return { x: (px - f.outX) / f.outW, y: (py - f.outY) / f.outH }
}

/** Framed image (0–1) → source (0–1). */
export function frameToSource(geo: HealGeometry, u: number, v: number): { x: number; y: number } {
  const f = frameOf(geo)
  const px = f.outX + u * f.outW
  const py = f.outY + v * f.outH
  let ox = px
  let oy = py
  if (f.cropped) {
    const dx = px - f.rotW / 2
    const dy = py - f.rotH / 2
    ox = dx * f.cos + dy * f.sin + f.ow / 2
    oy = -dx * f.sin + dy * f.cos + f.oh / 2
  }
  let sx = ox
  let sy = oy
  if (geo.rotate === 90) {
    sx = oy
    sy = f.ow - ox
  } else if (geo.rotate === 180) {
    sx = f.ow - ox
    sy = f.oh - oy
  } else if (geo.rotate === 270) {
    sx = f.oh - oy
    sy = ox
  }
  const p = { x: sx / geo.width, y: sy / geo.height }
  return geo.liquify ? liquifyToSource(geo.liquify, p.x, p.y) : p
}
