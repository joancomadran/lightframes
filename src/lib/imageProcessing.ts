import {
  CURVE_CHANNELS,
  DEFAULT_EDITS,
  HSL_CHANNELS,
  isIdentityCurve,
  isNeutralColorGrading,
  isNeutralHsl,
  isNeutralToneCurve,
  normalizeRotate,
  type BrushAdjustment,
  type ColorGrading,
  type EditParams,
  type ExportFormat,
  type ExportOptions,
  type GradeZone,
  type HealSpot,
  type HslEdits,
  type LinearAdjustment,
  type LocalAdjustment,
  type RadialAdjustment,
  type ToneCurve,
} from '../types/edits'
import { isFullCrop } from './crop'
import { applyLutToImageData } from './cubeLut'
import { applyHeal, healBounds, healKey } from './heal'
import type { LinearImage } from './rawDecode'

/*
 * Develop pipeline, ordered like Lightroom's (Process Version 2012+):
 *
 *   8-bit sRGB → linear light            | RAW: LibRaw scene-linear RGB
 *   white balance (channel gains) → exposure → highlight shoulder (8-bit only)
 *   highlights / shadows (gain driven by a blurred luminance mask)
 *   → sRGB-encoded values                 | RAW: base tone curve (≈ Adobe Color)
 *   contrast (S-curve around mid grey) → whites / blacks
 *   vibrance / saturation → HSL → point curve (cubic spline)
 *   → 8-bit → local adjustments → 3D LUT
 *
 * Exposure and white balance only behave like Lightroom in linear light: on
 * gamma-encoded values +1 EV clips half the image and WB shifts tint the blacks.
 */

const LUMA_R = 0.2126
const LUMA_G = 0.7152
const LUMA_B = 0.0722
/** 18% grey, sRGB-encoded — the pivot Lightroom's contrast turns around. */
const MID_GREY = 0.4613

/** ±100 temperature / tint, in stops of red↔blue and green↔magenta gain. */
const TEMPERATURE_STOPS = 0.4
const TINT_STOPS = 0.3
/** Linear value where the highlight roll-off starts when values exceed white. */
const SHOULDER_KNEE = 0.6
/** Maximum gain (in stops) Shadows / Highlights apply at ±100. */
const SHADOW_STOPS = 1.3
const HIGHLIGHT_STOPS_DOWN = 1.3
const HIGHLIGHT_STOPS_UP = 0.7
/** Contrast ±100 maps to an S-curve slope of 2^±CONTRAST_STOPS at mid grey. */
const CONTRAST_STOPS = 0.6
const WHITES_RANGE = 0.2
const BLACKS_LIFT = 0.15
const BLACKS_CRUSH = 0.12
/** HSL hue ±100 ≈ ±30°; luminance ±100 ≈ ±0.5 stop on the encoded value. */
const HSL_HUE_DEGREES = 0.3
const HSL_LUM_STOPS = 0.5
/** Colour-grading saturation 100 pushes encoded RGB this far toward the hue. */
const GRADE_STRENGTH = 0.2
/** Colour-grading luminance ±100 shifts encoded values by this much. */
const GRADE_LUM_RANGE = 0.18

/** Long edge of the low-res luminance map used for highlights / shadows. */
const MASK_EDGE = 128
const MASK_BLUR_RADIUS = 2
const MASK_BLUR_PASSES = 3
/** How much of the local (blurred) vs per-pixel luminance drives the mask. */
const MASK_LOCAL_MIX = 0.7

const TABLE_STEPS = 1024

/**
 * Default rendering for RAW sources, standing in for Lightroom's Adobe Color
 * profile + default tone curve: log2(scene-linear, sensor clip = 1) → encoded
 * output. Fitted to Sony camera JPEGs, with a slightly gentler toe.
 */
const RAW_BASE_POINTS: [number, number][] = [
  [-12, 0],
  [-9, 0.008],
  [-8, 0.018],
  [-7, 0.03],
  [-6, 0.05],
  [-5, 0.088],
  [-4, 0.155],
  [-3, 0.275],
  [-2.5, 0.36],
  [-2, 0.48],
  [-1.5, 0.64],
  [-1, 0.82],
  [-0.5, 0.94],
  [0, 1],
]
/** Grid size of the 3D table that bakes saturation / vibrance / HSL. */
const COLOR_GRID = 33

function clamp(value: number, min = 0, max = 255): number {
  return Math.min(max, Math.max(min, value))
}

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

function srgbToLinear(v: number): number {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

function linearToSrgb(v: number): number {
  return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
}

const DECODE_LUT = (() => {
  const lut = new Float32Array(256)
  for (let i = 0; i < 256; i++) lut[i] = srgbToLinear(i / 255)
  return lut
})()

const ENCODE_STEPS = 4096
const ENCODE_LUT = (() => {
  const lut = new Float32Array(ENCODE_STEPS + 1)
  for (let i = 0; i <= ENCODE_STEPS; i++) lut[i] = linearToSrgb(i / ENCODE_STEPS)
  return lut
})()

/** Linear → sRGB-encoded, table-driven inside [0, 1]. */
function encodeSrgb(v: number): number {
  if (v <= 0) return 0
  if (v >= 1) return linearToSrgb(v)
  const f = v * ENCODE_STEPS
  const i = f | 0
  const a = ENCODE_LUT[i]!
  return a + (ENCODE_LUT[i + 1]! - a) * (f - i)
}

/** Sample a table spanning [0, 1] with linear interpolation; slope 1 outside. */
function sampleTable(table: Float32Array, v: number): number {
  const last = table.length - 1
  if (v <= 0) return table[0]! + v
  if (v >= 1) return table[last]! + (v - 1)
  const f = v * last
  const i = f | 0
  const a = table[i]!
  return a + (table[i + 1]! - a) * (f - i)
}

function buildTable(fn: (x: number) => number, steps = TABLE_STEPS): Float32Array {
  const table = new Float32Array(steps + 1)
  for (let i = 0; i <= steps; i++) table[i] = fn(i / steps)
  return table
}

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

/** RGB in 0–1 → hue in degrees, saturation and lightness in 0–1. */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6
      break
    case g:
      h = ((b - r) / d + 2) / 6
      break
    default:
      h = ((r - g) / d + 4) / 6
      break
  }
  return { h: h * 360, s, l }
}

function hue2rgb(p: number, q: number, t: number): number {
  let tt = t
  if (tt < 0) tt += 1
  if (tt > 1) tt -= 1
  if (tt < 1 / 6) return p + (q - p) * 6 * tt
  if (tt < 1 / 2) return q
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
  return p
}

/** Inverse of rgbToHsl; returns RGB in 0–1. */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hh = (((h % 360) + 360) % 360) / 360
  if (s === 0) return [l, l, l]
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [hue2rgb(p, q, hh + 1 / 3), hue2rgb(p, q, hh), hue2rgb(p, q, hh - 1 / 3)]
}

/**
 * Per-channel gains for relative temperature / tint (−100…100), like Lightroom
 * on rendered files. Positive tint is magenta, negative is green. Normalised so
 * white balance does not change overall brightness.
 */
function whiteBalanceGains(temperature: number, tint: number): [number, number, number] {
  const t = temperature / 100
  const m = tint / 100
  const r = Math.pow(2, TEMPERATURE_STOPS * t)
  const g = Math.pow(2, -TINT_STOPS * m)
  const b = Math.pow(2, -TEMPERATURE_STOPS * t)
  const norm = LUMA_R * r + LUMA_G * g + LUMA_B * b
  return [r / norm, g / norm, b / norm]
}

/**
 * Roll values above SHOULDER_KNEE off so that `white` lands on 1 instead of
 * clipping (extended Reinhard on the part above the knee). Identity when white ≤ 1.
 */
function shoulder(v: number, white: number): number {
  if (v <= SHOULDER_KNEE) return v
  const span = 1 - SHOULDER_KNEE
  const t = (v - SHOULDER_KNEE) / span
  const w = (white - SHOULDER_KNEE) / span
  return SHOULDER_KNEE + span * ((t * (1 + t / (w * w))) / (1 + t))
}

/** Contrast S-curve around mid grey, then whites / blacks; all on encoded values. */
function buildBasicToneTable(contrast: number, whites: number, blacks: number): Float32Array {
  const gamma = Math.pow(2, CONTRAST_STOPS * contrast)
  return buildTable((x) => {
    let p = x
    if (gamma !== 1) {
      p =
        p < MID_GREY
          ? MID_GREY * Math.pow(p / MID_GREY, gamma)
          : 1 - (1 - MID_GREY) * Math.pow((1 - p) / (1 - MID_GREY), gamma)
    }
    p += whites * WHITES_RANGE * p * p * p
    const shadow = clamp01(1 - p)
    p += blacks * (blacks < 0 ? BLACKS_CRUSH : BLACKS_LIFT) * shadow * shadow * shadow
    return p
  })
}

/** Linear gain for Shadows / Highlights, indexed by the (encoded) local luminance. */
function buildLocalToneGainTable(shadows: number, highlights: number): Float32Array {
  const highlightStops = highlights < 0 ? HIGHLIGHT_STOPS_DOWN : HIGHLIGHT_STOPS_UP
  return buildTable((base) => {
    const stops =
      shadows * SHADOW_STOPS * (1 - smoothstep(0, 0.6, base)) +
      highlights * highlightStops * smoothstep(0.4, 1, base)
    return Math.pow(2, stops)
  }, 256)
}

type LuminanceMask = {
  data: Float32Array
  width: number
  height: number
  sx: number
  sy: number
}

function boxBlur(data: Float32Array, width: number, height: number, radius: number): void {
  const tmp = new Float32Array(data.length)
  const taps = radius * 2 + 1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0
      for (let k = -radius; k <= radius; k++) {
        sum += data[y * width + Math.min(width - 1, Math.max(0, x + k))]!
      }
      tmp[y * width + x] = sum / taps
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0
      for (let k = -radius; k <= radius; k++) {
        sum += tmp[Math.min(height - 1, Math.max(0, y + k)) * width + x]!
      }
      data[y * width + x] = sum / taps
    }
  }
}

/**
 * Low-res, blurred map of encoded luminance. Driving Shadows / Highlights from
 * the neighbourhood rather than the pixel keeps local contrast, which is what
 * makes Lightroom's sliders recover detail instead of flattening it.
 */
function buildLuminanceMask(
  width: number,
  height: number,
  encode: (v: number) => number,
  linearLuma: (offset: number) => number,
): LuminanceMask {
  const scale = Math.min(1, MASK_EDGE / Math.max(width, height))
  const mw = Math.max(1, Math.round(width * scale))
  const mh = Math.max(1, Math.round(height * scale))
  const sum = new Float32Array(mw * mh)
  const count = new Uint32Array(mw * mh)
  // A handful of samples per cell is plenty before blurring.
  const step = Math.max(1, Math.floor(1 / scale / 4))

  for (let y = 0; y < height; y += step) {
    const row = Math.min(mh - 1, Math.floor((y * mh) / height)) * mw
    for (let x = 0; x < width; x += step) {
      const cell = row + Math.min(mw - 1, Math.floor((x * mw) / width))
      sum[cell]! += linearLuma((y * width + x) * 4)
      count[cell]!++
    }
  }

  const data = new Float32Array(mw * mh)
  for (let k = 0; k < data.length; k++) {
    data[k] = encode(count[k] ? sum[k]! / count[k]! : 0)
  }
  for (let pass = 0; pass < MASK_BLUR_PASSES; pass++) {
    boxBlur(data, mw, mh, MASK_BLUR_RADIUS)
  }
  return { data, width: mw, height: mh, sx: mw / width, sy: mh / height }
}

/** 0 for skin-like oranges, 1 elsewhere — vibrance leaves skin mostly alone. */
function skinProtection(r: number, g: number, b: number): number {
  const { h } = rgbToHsl(r, g, b)
  return 1 - 0.5 * (1 - smoothstep(0, 35, hueDistance(h, 25)))
}

/**
 * HSL / Color mixer. Every hue sits between two neighbouring bands whose
 * weights sum to 1, so adjacent bands blend smoothly. Near-neutral pixels are
 * left alone, as in Lightroom.
 */
function applyHslEdits(r: number, g: number, b: number, hsl: HslEdits): [number, number, number] {
  const strength = smoothstep(0, 0.12, Math.max(r, g, b) - Math.min(r, g, b))
  if (strength <= 0) return [r, g, b]

  const { h, s, l } = rgbToHsl(r, g, b)
  const count = HSL_CHANNELS.length
  let index = count - 1
  for (let k = 0; k < count; k++) {
    if (h >= HSL_CHANNELS[k]!.center) index = k
  }
  const from = HSL_CHANNELS[index]!
  const to = HSL_CHANNELS[(index + 1) % count]!
  const span = (to.center - from.center + 360) % 360 || 360
  const t = ((h - from.center + 360) % 360) / span
  const wTo = t * t * (3 - 2 * t)
  const wFrom = 1 - wTo
  const a = hsl[from.id]
  const c = hsl[to.id]

  const hueShift = (wFrom * a.hue + wTo * c.hue) * HSL_HUE_DEGREES * strength
  const satShift = ((wFrom * a.saturation + wTo * c.saturation) / 100) * strength
  const lumShift = ((wFrom * a.luminance + wTo * c.luminance) / 100) * strength

  let [nr, ng, nb] = hslToRgb(h + hueShift, clamp01(s * (1 + satShift)), l)
  if (lumShift !== 0) {
    const gain = Math.pow(2, lumShift * HSL_LUM_STOPS)
    nr *= gain
    ng *= gain
    nb *= gain
  }
  return [nr, ng, nb]
}

type GradePrep = {
  tints: [number, number, number][]
  lums: number[]
  pivot: number
  spread: number
}

/** Offset a zone adds to encoded RGB: its hue's colour minus that colour's own luma. */
function zoneTint(zone: GradeZone): [number, number, number] {
  const [r, g, b] = hslToRgb(zone.hue, 1, 0.5)
  const l = LUMA_R * r + LUMA_G * g + LUMA_B * b
  const k = (zone.saturation / 100) * GRADE_STRENGTH
  return [(r - l) * k, (g - l) * k, (b - l) * k]
}

function prepareGrading(grading: ColorGrading): GradePrep | null {
  if (isNeutralColorGrading(grading)) return null
  const zones = [grading.shadows, grading.midtones, grading.highlights, grading.global]
  return {
    tints: zones.map(zoneTint),
    lums: zones.map((z) => (z.luminance / 100) * GRADE_LUM_RANGE),
    // Positive balance hands more of the range to the highlight wheel.
    pivot: 0.5 - (grading.balance / 100) * 0.25,
    spread: 0.2 + (grading.blending / 100) * 0.45,
  }
}

/** Shadows / midtones / highlights weights from luma, then the global wheel on top. */
function applyGrading(r: number, g: number, b: number, prep: GradePrep): [number, number, number] {
  const luma = LUMA_R * r + LUMA_G * g + LUMA_B * b
  const t = luma - prep.pivot
  const mid = Math.max(0, 1 - Math.abs(t) / prep.spread)
  const wm = mid * mid * (3 - 2 * mid)
  // Ease the tint off toward pure black so shadow colour doesn't crush the blacks.
  const floor = 0.3 + 0.7 * smoothstep(0, 0.18, luma)
  const ws = (t < 0 ? 1 - wm : 0) * floor
  const wh = t >= 0 ? 1 - wm : 0
  const weights = [ws, wm * floor, wh, floor]
  let dr = 0
  let dg = 0
  let db = 0
  let dl = 0
  for (let k = 0; k < 4; k++) {
    const w = weights[k]!
    if (w <= 0) continue
    const tint = prep.tints[k]!
    dr += w * tint[0]
    dg += w * tint[1]
    db += w * tint[2]
    dl += w * prep.lums[k]!
  }
  return [r + dr + dl, g + dg + dl, b + db + dl]
}

/** Vibrance / saturation (around luma), HSL, then colour grading, on encoded RGB in 0–1. */
function adjustColor(
  r: number,
  g: number,
  b: number,
  saturation: number,
  vibrance: number,
  hsl: HslEdits | null,
  grading: GradePrep | null,
): [number, number, number] {
  if (saturation !== 0 || vibrance !== 0) {
    const luma = LUMA_R * r + LUMA_G * g + LUMA_B * b
    let amount = saturation
    if (vibrance !== 0) {
      const max = Math.max(r, g, b)
      const sat = max > 0 ? clamp01((max - Math.min(r, g, b)) / max) : 0
      let weight = 1 - sat
      if (vibrance > 0) weight *= skinProtection(r, g, b)
      amount += vibrance * weight
    }
    r = clamp01(luma + (r - luma) * (1 + amount))
    g = clamp01(luma + (g - luma) * (1 + amount))
    b = clamp01(luma + (b - luma) * (1 + amount))
  }
  if (hsl) {
    ;[r, g, b] = applyHslEdits(r, g, b, hsl)
  }
  if (grading) {
    ;[r, g, b] = applyGrading(clamp01(r), clamp01(g), clamp01(b), grading)
  }
  return [clamp01(r), clamp01(g), clamp01(b)]
}

/**
 * The colour stage depends only on the pixel's RGB, so it is baked into a
 * small 3D table and sampled trilinearly instead of running HSL maths per pixel.
 */
function buildColorGrid(
  saturation: number,
  vibrance: number,
  hsl: HslEdits,
  grading: ColorGrading,
): Float32Array {
  const n = COLOR_GRID
  const max = n - 1
  const hslEdits = isNeutralHsl(hsl) ? null : hsl
  const gradePrep = prepareGrading(grading)
  const grid = new Float32Array(n * n * n * 3)
  for (let bi = 0, k = 0; bi < n; bi++) {
    for (let gi = 0; gi < n; gi++) {
      for (let ri = 0; ri < n; ri++, k += 3) {
        const [r, g, b] = adjustColor(
          ri / max,
          gi / max,
          bi / max,
          saturation,
          vibrance,
          hslEdits,
          gradePrep,
        )
        grid[k] = r
        grid[k + 1] = g
        grid[k + 2] = b
      }
    }
  }
  return grid
}

function sampleColorGrid(
  grid: Float32Array,
  r: number,
  g: number,
  b: number,
  out: Float32Array,
): void {
  const n = COLOR_GRID
  const max = n - 1
  const fr = r * max
  const fg = g * max
  const fb = b * max
  const r0 = Math.min(max - 1, fr | 0)
  const g0 = Math.min(max - 1, fg | 0)
  const b0 = Math.min(max - 1, fb | 0)
  const tr = fr - r0
  const tg = fg - g0
  const tb = fb - b0
  const sg = n * 3
  const sb = n * n * 3
  const base = b0 * sb + g0 * sg + r0 * 3
  for (let c = 0; c < 3; c++) {
    const i = base + c
    const c00 = grid[i]! + (grid[i + 3]! - grid[i]!) * tr
    const c10 = grid[i + sg]! + (grid[i + sg + 3]! - grid[i + sg]!) * tr
    const c01 = grid[i + sb]! + (grid[i + sb + 3]! - grid[i + sb]!) * tr
    const c11 = grid[i + sb + sg]! + (grid[i + sb + sg + 3]! - grid[i + sb + sg]!) * tr
    const c0 = c00 + (c10 - c00) * tg
    const c1 = c01 + (c11 - c01) * tg
    out[c] = c0 + (c1 - c0) * tb
  }
}

type SplineData = { xs: number[]; ys: number[]; slopes: number[] }

/** Slopes for a C² cubic spline through the points (Adobe DNG SDK solver). */
function solveSpline(points: ToneCurve['points']): SplineData | null {
  const sorted = [...points].sort((a, b) => a.x - b.x)
  const xs: number[] = []
  const ys: number[] = []
  for (const p of sorted) {
    if (xs.length && p.x - xs[xs.length - 1]! < 1e-6) continue
    xs.push(p.x)
    ys.push(p.y)
  }
  const n = xs.length
  if (n < 2) return null

  const s = new Array<number>(n).fill(0)
  let a = xs[1]! - xs[0]!
  let b = (ys[1]! - ys[0]!) / a
  s[0] = b
  for (let j = 2; j < n; j++) {
    const c = xs[j]! - xs[j - 1]!
    const d = (ys[j]! - ys[j - 1]!) / c
    s[j - 1] = (b * c + d * a) / (a + c)
    a = c
    b = d
  }
  s[n - 1] = 2 * b - s[n - 2]!
  s[0] = 2 * s[0]! - s[1]!

  if (n > 2) {
    const e = new Array<number>(n).fill(0)
    const f = new Array<number>(n).fill(0)
    const g = new Array<number>(n).fill(0)
    f[0] = 0.5
    e[n - 1] = 0.5
    g[0] = 0.75 * (s[0]! + s[1]!)
    g[n - 1] = 0.75 * (s[n - 2]! + s[n - 1]!)
    for (let j = 1; j < n - 1; j++) {
      const span = (xs[j + 1]! - xs[j - 1]!) * 2
      e[j] = (xs[j + 1]! - xs[j]!) / span
      f[j] = (xs[j]! - xs[j - 1]!) / span
      g[j] = 1.5 * s[j]!
    }
    for (let j = 1; j < n; j++) {
      const pivot = 1 - f[j - 1]! * e[j]!
      if (j !== n - 1) f[j]! /= pivot
      g[j] = (g[j]! - g[j - 1]! * e[j]!) / pivot
    }
    for (let j = n - 2; j >= 0; j--) {
      g[j] = g[j]! - f[j]! * g[j + 1]!
    }
    for (let j = 0; j < n; j++) s[j] = g[j]!
  }

  return { xs, ys, slopes: s }
}

function evaluateSpline(spline: SplineData, x: number): number {
  const { xs, ys, slopes } = spline
  const n = xs.length
  if (x <= xs[0]!) return ys[0]!
  if (x >= xs[n - 1]!) return ys[n - 1]!
  let j = 1
  while (j < n - 1 && x > xs[j]!) j++
  const h = xs[j]! - xs[j - 1]!
  const t = (x - xs[j - 1]!) / h
  const t2 = t * t
  const t3 = t2 * t
  return (
    (2 * t3 - 3 * t2 + 1) * ys[j - 1]! +
    (t3 - 2 * t2 + t) * h * slopes[j - 1]! +
    (-2 * t3 + 3 * t2) * ys[j]! +
    (t3 - t2) * h * slopes[j]!
  )
}

/** Smooth tone-curve evaluator (0–1 → 0–1), shared by rendering and the curve UI. */
export function evaluateToneCurve(curve: ToneCurve): (x: number) => number {
  const spline = solveSpline(curve.points)
  if (!spline) return (x) => x
  return (x) => clamp01(evaluateSpline(spline, x))
}

/** Sample the tone curve into a 0–1 lookup table. */
export function buildToneCurveLut(curve: ToneCurve, steps = TABLE_STEPS): Float32Array {
  return buildTable(evaluateToneCurve(curve), steps)
}

/** RAW base curve sampled over t = x^(1/4), which spends resolution on the shadows. */
const RAW_BASE_STEPS = 4096
let rawBaseTable: Float32Array | null = null

function rawBaseEncode(v: number): number {
  if (v <= 0) return 0
  if (v >= 1) return 1
  if (!rawBaseTable) {
    const spline = solveSpline(RAW_BASE_POINTS.map(([x, y]) => ({ x, y })))!
    const first = RAW_BASE_POINTS[0]![0]
    rawBaseTable = buildTable((t) => {
      const stops = t > 0 ? 4 * Math.log2(t) : -Infinity
      return stops <= first ? 0 : clamp01(evaluateSpline(spline, stops))
    }, RAW_BASE_STEPS)
  }
  return sampleTable(rawBaseTable, Math.sqrt(Math.sqrt(v)))
}

/** Sliders handled by the develop pass (the rest belong to the detail pass). */
const DEVELOP_KEYS = [
  'exposure',
  'contrast',
  'highlights',
  'shadows',
  'whites',
  'blacks',
  'temperature',
  'tint',
  'vibrance',
  'saturation',
] as const

function isNeutralDevelop(edits: EditParams): boolean {
  return (
    DEVELOP_KEYS.every((key) => edits[key] === 0) &&
    isNeutralHsl(edits.hsl) &&
    isNeutralToneCurve(edits.toneCurve) &&
    isNeutralColorGrading(edits.colorGrading)
  )
}

/** Low-res grid sampled bilinearly in full-image coordinates. */
export type MaskGrid = {
  data: Float32Array
  width: number
  height: number
}

/**
 * What a strip of the image needs to know about the whole image so that
 * processing it alone gives the same pixels as processing everything at once.
 */
export type DevelopContext = {
  /** Image row of the buffer's first row. */
  yOffset: number
  fullWidth: number
  fullHeight: number
  /** Blurred luminance driving Shadows / Highlights (null when both are 0). */
  lumMask: MaskGrid | null
  /** Rasterised brush masks by adjustment id. */
  brushMasks: Record<string, MaskGrid>
}

function sampleGrid(grid: MaskGrid, x: number, y: number, fullWidth: number, fullHeight: number): number {
  const fx = clamp(((x + 0.5) * grid.width) / fullWidth - 0.5, 0, grid.width - 1)
  const fy = clamp(((y + 0.5) * grid.height) / fullHeight - 0.5, 0, grid.height - 1)
  const x0 = fx | 0
  const y0 = fy | 0
  const x1 = Math.min(grid.width - 1, x0 + 1)
  const y1 = Math.min(grid.height - 1, y0 + 1)
  const tx = fx - x0
  const ty = fy - y0
  const { data, width } = grid
  const top = data[y0 * width + x0]! + (data[y0 * width + x1]! - data[y0 * width + x0]!) * tx
  const bottom = data[y1 * width + x0]! + (data[y1 * width + x1]! - data[y1 * width + x0]!) * tx
  return top + (bottom - top) * ty
}

type DevelopSetup = {
  mulR: number
  mulG: number
  mulB: number
  white: number
  useShoulder: boolean
  encode: (v: number) => number
}

function developSetup(edits: EditParams, linear: boolean): DevelopSetup {
  const [wbR, wbG, wbB] = whiteBalanceGains(edits.temperature, edits.tint)
  const exposureMul = Math.pow(2, edits.exposure)
  const mulR = wbR * exposureMul
  const mulG = wbG * exposureMul
  const mulB = wbB * exposureMul
  const white = Math.max(mulR, mulG, mulB)
  // RAW keeps its headroom until the base curve; 8-bit sources need a shoulder.
  return {
    mulR,
    mulG,
    mulB,
    white,
    useShoulder: !linear && white > 1,
    encode: linear ? rawBaseEncode : encodeSrgb,
  }
}

/** Writes white-balanced, exposed linear RGB for the pixel at `offset` into `out`. */
function makeToLinear(
  setup: DevelopSetup,
  data: Uint8ClampedArray,
  linear: LinearImage | undefined,
  out: Float32Array,
): (offset: number) => void {
  const { mulR, mulG, mulB, white, useShoulder } = setup
  const src = linear?.data
  const srcScale = linear?.scale ?? 1
  return (offset) => {
    let r: number
    let g: number
    let b: number
    if (src) {
      const j = (offset >> 2) * 3
      r = src[j]! * srcScale * mulR
      g = src[j + 1]! * srcScale * mulG
      b = src[j + 2]! * srcScale * mulB
    } else {
      r = DECODE_LUT[data[offset]!]! * mulR
      g = DECODE_LUT[data[offset + 1]!]! * mulG
      b = DECODE_LUT[data[offset + 2]!]! * mulB
    }
    if (useShoulder) {
      r = shoulder(r, white)
      g = shoulder(g, white)
      b = shoulder(b, white)
    }
    out[0] = r
    out[1] = g
    out[2] = b
  }
}

/** Shadows / Highlights mask for the whole image (call once, share with every strip). */
export function buildLumMask(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  edits: EditParams,
  linear?: LinearImage,
): MaskGrid | null {
  if (edits.shadows === 0 && edits.highlights === 0) return null
  const setup = developSetup(edits, Boolean(linear))
  const lin = new Float32Array(3)
  const toLinear = makeToLinear(setup, data, linear, lin)
  const mask = buildLuminanceMask(width, height, setup.encode, (offset) => {
    toLinear(offset)
    return LUMA_R * lin[0]! + LUMA_G * lin[1]! + LUMA_B * lin[2]!
  })
  return { data: mask.data, width: mask.width, height: mask.height }
}

/** Global develop settings (everything but local adjustments, LUT and detail). */
function developImageData(
  imageData: ImageData,
  edits: EditParams,
  linear: LinearImage | undefined,
  ctx: DevelopContext,
): void {
  const { data, width, height } = imageData
  const setup = developSetup(edits, Boolean(linear))
  const { encode } = setup

  const contrast = edits.contrast / 100
  const whites = edits.whites / 100
  const blacks = edits.blacks / 100
  const colorGrid =
    edits.saturation !== 0 ||
    edits.vibrance !== 0 ||
    !isNeutralHsl(edits.hsl) ||
    !isNeutralColorGrading(edits.colorGrading)
      ? buildColorGrid(edits.saturation / 100, edits.vibrance / 100, edits.hsl, edits.colorGrading)
      : null

  const toneTable =
    contrast !== 0 || whites !== 0 || blacks !== 0
      ? buildBasicToneTable(contrast, whites, blacks)
      : null
  const curve = edits.toneCurve
  const curveTable = isIdentityCurve(curve.points) ? null : buildToneCurveLut(curve)
  const channelTables = CURVE_CHANNELS.map((channel) => {
    const points = curve[channel]
    return points && !isIdentityCurve(points) ? buildToneCurveLut({ points }) : null
  })
  const [redTable, greenTable, blueTable] = channelTables

  const lin = new Float32Array(3)
  const toLinear = makeToLinear(setup, data, linear, lin)
  const mask = ctx.lumMask
  const gainTable = mask ? buildLocalToneGainTable(edits.shadows / 100, edits.highlights / 100) : null

  for (let y = 0, i = 0; y < height; y++) {
    const gy = y + ctx.yOffset
    for (let x = 0; x < width; x++, i += 4) {
      toLinear(i)
      let r = lin[0]!
      let g = lin[1]!
      let b = lin[2]!

      if (mask && gainTable) {
        const own = encode(LUMA_R * r + LUMA_G * g + LUMA_B * b)
        const local = sampleGrid(mask, x, gy, ctx.fullWidth, ctx.fullHeight)
        const base = MASK_LOCAL_MIX * local + (1 - MASK_LOCAL_MIX) * own
        const gain = sampleTable(gainTable, clamp01(base))
        r *= gain
        g *= gain
        b *= gain
      }

      r = encode(r)
      g = encode(g)
      b = encode(b)

      if (toneTable) {
        r = sampleTable(toneTable, r)
        g = sampleTable(toneTable, g)
        b = sampleTable(toneTable, b)
      }

      r = clamp01(r)
      g = clamp01(g)
      b = clamp01(b)

      if (colorGrid) {
        sampleColorGrid(colorGrid, r, g, b, lin)
        r = lin[0]!
        g = lin[1]!
        b = lin[2]!
      }

      if (curveTable) {
        r = sampleTable(curveTable, r)
        g = sampleTable(curveTable, g)
        b = sampleTable(curveTable, b)
      }
      if (redTable) r = sampleTable(redTable, r)
      if (greenTable) g = sampleTable(greenTable, g)
      if (blueTable) b = sampleTable(blueTable, b)

      data[i] = r * 255
      data[i + 1] = g * 255
      data[i + 2] = b * 255
    }
  }
}

// ——— Local adjustments ————————————————————————————————————————————————

function radialWeight(x: number, y: number, w: number, h: number, adj: RadialAdjustment): number {
  const dx = ((x + 0.5) / w - adj.cx) / Math.max(0.001, adj.radiusX)
  const dy = ((y + 0.5) / h - adj.cy) / Math.max(0.001, adj.radiusY)
  const d = Math.sqrt(dx * dx + dy * dy)
  if (d >= 1) return 0
  const feather = Math.min(0.95, Math.max(0.01, adj.feather))
  const inner = 1 - feather
  if (d <= inner) return 1
  const t = (d - inner) / feather
  return 1 - t * t * (3 - 2 * t)
}

/** Full effect on the start side of (x1, y1), fading out by (x2, y2); measured in pixels. */
function linearWeight(x: number, y: number, w: number, h: number, adj: LinearAdjustment): number {
  const ax = adj.x1 * w
  const ay = adj.y1 * h
  const vx = adj.x2 * w - ax
  const vy = adj.y2 * h - ay
  const len2 = vx * vx + vy * vy
  if (len2 < 1e-6) return 0
  const t = ((x + 0.5 - ax) * vx + (y + 0.5 - ay) * vy) / len2
  return 1 - smoothstep(0, 1, t)
}

function maskWeight(
  adj: LocalAdjustment,
  x: number,
  y: number,
  w: number,
  h: number,
  brush: MaskGrid | undefined,
): number {
  let weight = 0
  if (adj.type === 'radial') weight = radialWeight(x, y, w, h, adj)
  else if (adj.type === 'linear') weight = linearWeight(x, y, w, h, adj)
  else if (brush) weight = sampleGrid(brush, x, y, w, h)
  return adj.invert ? 1 - weight : weight
}

function applyLocalAdjustments(imageData: ImageData, items: LocalAdjustment[], ctx: DevelopContext): void {
  if (items.length === 0) return
  const { data, width, height } = imageData
  const { fullWidth, fullHeight } = ctx
  for (let y = 0; y < height; y++) {
    const gy = y + ctx.yOffset
    for (let x = 0; x < width; x++) {
      let weight = 0
      let exposure = 0
      let contrast = 0
      let saturation = 0
      let temperature = 0
      for (const adj of items) {
        const w = maskWeight(adj, x, gy, fullWidth, fullHeight, ctx.brushMasks[adj.id])
        if (w <= 0) continue
        weight += w
        exposure += w * adj.exposure
        contrast += w * adj.contrast
        saturation += w * adj.saturation
        temperature += w * adj.temperature
      }
      if (weight <= 0) continue
      exposure /= weight
      contrast /= weight
      saturation /= weight
      temperature /= weight
      const mask = Math.min(1, weight)

      const i = (y * width + x) * 4
      // Exposure and temperature in linear light, like the global sliders.
      const expMul = Math.pow(2, exposure * mask)
      const [wbR, wbG, wbB] =
        temperature !== 0 ? whiteBalanceGains(temperature * mask, 0) : [1, 1, 1]
      let r = encodeSrgb(DECODE_LUT[data[i]!]! * expMul * wbR)
      let g = encodeSrgb(DECODE_LUT[data[i + 1]!]! * expMul * wbG)
      let b = encodeSrgb(DECODE_LUT[data[i + 2]!]! * expMul * wbB)

      const c = (contrast / 100) * mask
      r = (r - MID_GREY) * (1 + c) + MID_GREY
      g = (g - MID_GREY) * (1 + c) + MID_GREY
      b = (b - MID_GREY) * (1 + c) + MID_GREY

      const luma = LUMA_R * r + LUMA_G * g + LUMA_B * b
      const s = (saturation / 100) * mask
      r = luma + (r - luma) * (1 + s)
      g = luma + (g - luma) * (1 + s)
      b = luma + (b - luma) * (1 + s)

      data[i] = clamp01(r) * 255
      data[i + 1] = clamp01(g) * 255
      data[i + 2] = clamp01(b) * 255
    }
  }
}

/** Long edge of the grid brush strokes are rasterised into. */
const BRUSH_GRID_EDGE = 640

export function brushGridSize(fullWidth: number, fullHeight: number): { width: number; height: number } {
  const scale = BRUSH_GRID_EDGE / Math.max(fullWidth, fullHeight, 1)
  return {
    width: Math.max(1, Math.round(fullWidth * scale)),
    height: Math.max(1, Math.round(fullHeight * scale)),
  }
}

function stampStroke(grid: Float32Array, gw: number, gh: number, stroke: BrushAdjustment['strokes'][number]) {
  const radius = Math.max(0.75, stroke.size * gw)
  const inner = 1 - Math.min(0.98, Math.max(0, stroke.feather))
  const spacing = Math.max(0.5, radius * 0.2)
  const pts = stroke.points
  const stamp = (cx: number, cy: number) => {
    const x0 = Math.max(0, Math.floor(cx - radius))
    const x1 = Math.min(gw - 1, Math.ceil(cx + radius))
    const y0 = Math.max(0, Math.floor(cy - radius))
    const y1 = Math.min(gh - 1, Math.ceil(cy + radius))
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / radius
        if (d >= 1) continue
        const v = (d <= inner ? 1 : 1 - smoothstep(inner, 1, d)) * stroke.flow
        const k = y * gw + x
        grid[k] = stroke.erase ? grid[k]! * (1 - v) : Math.max(grid[k]!, v)
      }
    }
  }
  let px = pts[0]! * gw
  let py = pts[1]! * gh
  stamp(px, py)
  for (let i = 2; i + 1 < pts.length; i += 2) {
    const nx = pts[i]! * gw
    const ny = pts[i + 1]! * gh
    const dist = Math.hypot(nx - px, ny - py)
    const steps = Math.max(1, Math.ceil(dist / spacing))
    for (let s = 1; s <= steps; s++) {
      stamp(px + ((nx - px) * s) / steps, py + ((ny - py) * s) / steps)
    }
    px = nx
    py = ny
  }
}

const brushCache = new Map<string, { strokes: BrushAdjustment['strokes']; key: string; base: Float32Array; grid: MaskGrid }>()

/**
 * Rasterise a brush mask. While painting only the last stroke changes, so the
 * grid of all earlier strokes is cached and reused.
 */
export function rasterizeBrush(adj: BrushAdjustment, fullWidth: number, fullHeight: number): MaskGrid {
  const { width, height } = brushGridSize(fullWidth, fullHeight)
  const key = `${width}x${height}`
  const strokes = adj.strokes
  const cached = brushCache.get(adj.id)
  if (cached && cached.key === key && cached.strokes === strokes) return cached.grid

  const n = strokes.length
  let base: Float32Array
  const prefixMatches =
    cached &&
    cached.key === key &&
    cached.strokes.length >= n - 1 &&
    strokes.slice(0, n - 1).every((stroke, i) => stroke === cached.strokes[i])
  if (prefixMatches && cached.strokes.length === n - 1) {
    // One new stroke on top of the cached result.
    base = cached.grid.data
  } else if (prefixMatches && cached.strokes.length === n) {
    base = cached.base
  } else {
    base = new Float32Array(width * height)
    for (let i = 0; i < n - 1; i++) stampStroke(base, width, height, strokes[i]!)
  }
  const data = base.slice()
  if (n > 0) stampStroke(data, width, height, strokes[n - 1]!)
  const grid = { data, width, height }
  brushCache.set(adj.id, { strokes, key, base, grid })
  return grid
}

export function buildBrushMasks(
  items: LocalAdjustment[],
  fullWidth: number,
  fullHeight: number,
): Record<string, MaskGrid> {
  const out: Record<string, MaskGrid> = {}
  for (const adj of items) {
    if (adj.type === 'brush') out[adj.id] = rasterizeBrush(adj, fullWidth, fullHeight)
  }
  return out
}

/** Weights of one mask over a small grid, for the on-image mask overlay. */
export function computeMaskPreview(
  adj: LocalAdjustment,
  width: number,
  height: number,
  fullWidth: number,
  fullHeight: number,
): Float32Array {
  const brush = adj.type === 'brush' ? rasterizeBrush(adj, fullWidth, fullHeight) : undefined
  const out = new Float32Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const fx = ((x + 0.5) / width) * fullWidth - 0.5
      const fy = ((y + 0.5) / height) * fullHeight - 0.5
      out[y * width + x] = maskWeight(adj, fx, fy, fullWidth, fullHeight, brush)
    }
  }
  return out
}

/**
 * Develop pass for a whole image or one horizontal strip of it: global
 * develop, local adjustments, then the LUT. With `linear`, pixels come from
 * that RAW buffer (same dimensions) and ImageData only receives the result.
 */
export function applyEditsToImageData(
  imageData: ImageData,
  edits: EditParams,
  linear?: LinearImage,
  context?: DevelopContext,
): void {
  const ctx: DevelopContext = context ?? {
    yOffset: 0,
    fullWidth: imageData.width,
    fullHeight: imageData.height,
    lumMask: buildLumMask(imageData.data, imageData.width, imageData.height, edits, linear),
    brushMasks: buildBrushMasks(edits.localAdjustments, imageData.width, imageData.height),
  }
  if (linear || !isNeutralDevelop(edits)) developImageData(imageData, edits, linear, ctx)
  applyLocalAdjustments(imageData, edits.localAdjustments, ctx)

  if (edits.lut) {
    applyLutToImageData(imageData, edits.lut, edits.lutMix ?? 1)
  }
}

// ——— Detail & effects ————————————————————————————————————————————————————
//
// Texture, clarity, dehaze, sharpening, noise reduction, vignette and grain
// look at neighbourhoods or at the whole frame, so they run as a second pass
// on the developed image. Radii scale with the image so the preview matches
// the export.

const DETAIL_KEYS = [
  'texture',
  'clarity',
  'dehaze',
  'vignette',
  'grain',
  'sharpening',
  'noiseReduction',
  'colorNoiseReduction',
] as const

export function needsDetailPass(edits: EditParams): boolean {
  return DETAIL_KEYS.some((key) => edits[key] !== 0)
}

/** Long edge of the low-res maps clarity and dehaze compare against. */
const DETAIL_MAP_EDGE = 256

export type DetailMaps = {
  /** Blurred luma: clarity boosts what differs from it. */
  clarity: MaskGrid | null
  /** Smoothed dark channel: an estimate of how much haze covers each area. */
  haze: MaskGrid | null
  /** Colour of the haze (atmospheric light), encoded RGB. */
  airlight: [number, number, number]
}

function textureRadius(longEdge: number): number {
  return Math.max(1, Math.round(longEdge * 0.0035))
}

function chromaRadius(longEdge: number): number {
  return Math.max(1, Math.round(longEdge * 0.0025))
}

/** Rows above / below a strip needed so neighbourhood filters see real pixels. */
export function detailMargin(edits: EditParams, fullWidth: number, fullHeight: number): number {
  const longEdge = Math.max(fullWidth, fullHeight)
  let margin = 0
  if (edits.texture !== 0) margin = Math.max(margin, textureRadius(longEdge) * 2)
  if (edits.colorNoiseReduction !== 0) margin = Math.max(margin, chromaRadius(longEdge) * 2)
  if (edits.noiseReduction !== 0) margin = Math.max(margin, 2)
  if (edits.sharpening !== 0) margin = Math.max(margin, 1)
  return margin + 2
}

/** Area-average downscale of the developed image into the clarity / haze maps. */
export function buildDetailMaps(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  edits: EditParams,
): DetailMaps {
  const maps: DetailMaps = { clarity: null, haze: null, airlight: [1, 1, 1] }
  if (edits.clarity === 0 && edits.dehaze === 0) return maps
  const scale = Math.min(1, DETAIL_MAP_EDGE / Math.max(width, height))
  const gw = Math.max(1, Math.round(width * scale))
  const gh = Math.max(1, Math.round(height * scale))
  const luma = new Float32Array(gw * gh)
  const dark = new Float32Array(gw * gh).fill(1)
  const rgb = new Float32Array(gw * gh * 3)
  const count = new Uint32Array(gw * gh)
  const step = Math.max(1, Math.floor(1 / scale / 3))
  for (let y = 0; y < height; y += step) {
    const row = Math.min(gh - 1, Math.floor((y * gh) / height)) * gw
    for (let x = 0; x < width; x += step) {
      const cell = row + Math.min(gw - 1, Math.floor((x * gw) / width))
      const i = (y * width + x) * 4
      const r = data[i]! / 255
      const g = data[i + 1]! / 255
      const b = data[i + 2]! / 255
      luma[cell]! += LUMA_R * r + LUMA_G * g + LUMA_B * b
      dark[cell] = Math.min(dark[cell]!, r, g, b)
      rgb[cell * 3]! += r
      rgb[cell * 3 + 1]! += g
      rgb[cell * 3 + 2]! += b
      count[cell]!++
    }
  }
  for (let k = 0; k < luma.length; k++) {
    const n = count[k] || 1
    luma[k]! /= n
    rgb[k * 3]! /= n
    rgb[k * 3 + 1]! /= n
    rgb[k * 3 + 2]! /= n
    if (!count[k]) dark[k] = 0
  }

  if (edits.clarity !== 0) {
    const blurred = luma.slice()
    for (let pass = 0; pass < 3; pass++) boxBlur(blurred, gw, gh, 2)
    maps.clarity = { data: blurred, width: gw, height: gh }
  }

  if (edits.dehaze !== 0) {
    // Airlight: the average colour of the haziest 0.5% of the frame.
    const order = Array.from(dark.keys()).sort((a, b) => dark[b]! - dark[a]!)
    const take = Math.max(1, Math.round(order.length * 0.005))
    const air: [number, number, number] = [0, 0, 0]
    for (let k = 0; k < take; k++) {
      const c = order[k]!
      air[0] += rgb[c * 3]!
      air[1] += rgb[c * 3 + 1]!
      air[2] += rgb[c * 3 + 2]!
    }
    maps.airlight = [
      Math.max(0.3, air[0] / take),
      Math.max(0.3, air[1] / take),
      Math.max(0.3, air[2] / take),
    ]
    const haze = dark.slice()
    for (let pass = 0; pass < 2; pass++) boxBlur(haze, gw, gh, 1)
    maps.haze = { data: haze, width: gw, height: gh }
  }
  return maps
}

/** O(n) box blur with clamped edges, separable; returns a new buffer. */
function boxBlurFast(src: Float32Array, width: number, height: number, radius: number, passes: number): Float32Array {
  const a = src.slice()
  const b = new Float32Array(src.length)
  const taps = radius * 2 + 1
  for (let pass = 0; pass < passes; pass++) {
    for (let y = 0; y < height; y++) {
      const row = y * width
      let sum = 0
      for (let k = -radius; k <= radius; k++) sum += a[row + clamp(k, 0, width - 1)]!
      for (let x = 0; x < width; x++) {
        b[row + x] = sum / taps
        sum += a[row + Math.min(width - 1, x + radius + 1)]! - a[row + Math.max(0, x - radius)]!
      }
    }
    for (let x = 0; x < width; x++) {
      let sum = 0
      for (let k = -radius; k <= radius; k++) sum += b[clamp(k, 0, height - 1) * width + x]!
      for (let y = 0; y < height; y++) {
        a[y * width + x] = sum / taps
        sum += b[Math.min(height - 1, y + radius + 1) * width + x]! - b[Math.max(0, y - radius) * width + x]!
      }
    }
  }
  return a
}

function hashNoise(ix: number, iy: number): number {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return ((h >>> 0) / 4294967295) * 2 - 1
}

/** Smooth value noise in [−1, 1], anchored to image coordinates. */
function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)
  const a = hashNoise(ix, iy)
  const b = hashNoise(ix + 1, iy)
  const c = hashNoise(ix, iy + 1)
  const d = hashNoise(ix + 1, iy + 1)
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy
}

export type DetailRegion = {
  /** Image row of the buffer's first row. */
  yOffset: number
  fullWidth: number
  fullHeight: number
}

/** Detail & effects pass, in place, on a developed RGBA buffer (whole image or strip with margins). */
export function applyDetail(
  data: Uint8ClampedArray,
  width: number,
  rows: number,
  edits: EditParams,
  region: DetailRegion,
  maps: DetailMaps,
): void {
  if (!needsDetailPass(edits)) return
  const n = width * rows
  const { fullWidth, fullHeight, yOffset } = region
  const longEdge = Math.max(fullWidth, fullHeight)
  const R = new Float32Array(n)
  const G = new Float32Array(n)
  const B = new Float32Array(n)
  const L = new Float32Array(n)
  for (let k = 0, i = 0; k < n; k++, i += 4) {
    R[k] = data[i]! / 255
    G[k] = data[i + 1]! / 255
    B[k] = data[i + 2]! / 255
    L[k] = LUMA_R * R[k]! + LUMA_G * G[k]! + LUMA_B * B[k]!
  }
  const addLuma = (k: number, d: number) => {
    R[k]! += d
    G[k]! += d
    B[k]! += d
    L[k]! += d
  }

  // Luminance noise: pull toward a small blur where the image is flat.
  if (edits.noiseReduction > 0) {
    const blur = boxBlurFast(L, width, rows, 1, 2)
    const amount = edits.noiseReduction / 100
    const sigma2 = 2 * 0.04 * 0.04
    for (let k = 0; k < n; k++) {
      const d = blur[k]! - L[k]!
      addLuma(k, d * amount * Math.exp(-(d * d) / sigma2))
    }
  }

  // Colour noise: blur the chroma, keep luma.
  if (edits.colorNoiseReduction > 0) {
    const radius = chromaRadius(longEdge)
    const cr = new Float32Array(n)
    const cg = new Float32Array(n)
    const cb = new Float32Array(n)
    for (let k = 0; k < n; k++) {
      cr[k] = R[k]! - L[k]!
      cg[k] = G[k]! - L[k]!
      cb[k] = B[k]! - L[k]!
    }
    const br = boxBlurFast(cr, width, rows, radius, 2)
    const bg = boxBlurFast(cg, width, rows, radius, 2)
    const bb = boxBlurFast(cb, width, rows, radius, 2)
    const amount = edits.colorNoiseReduction / 100
    for (let k = 0; k < n; k++) {
      R[k] = L[k]! + cr[k]! + (br[k]! - cr[k]!) * amount
      G[k] = L[k]! + cg[k]! + (bg[k]! - cg[k]!) * amount
      B[k] = L[k]! + cb[k]! + (bb[k]! - cb[k]!) * amount
    }
  }

  // Dehaze: invert a simple haze model (I = J·t + A·(1 − t)); negative adds haze.
  if (edits.dehaze !== 0 && maps.haze) {
    const amount = edits.dehaze / 100
    const [ar, ag, ab] = maps.airlight
    const airLuma = LUMA_R * ar + LUMA_G * ag + LUMA_B * ab
    for (let y = 0, k = 0; y < rows; y++) {
      const gy = y + yOffset
      for (let x = 0; x < width; x++, k++) {
        if (amount > 0) {
          const hazeLevel = sampleGrid(maps.haze, x, gy, fullWidth, fullHeight) / airLuma
          const t = Math.max(0.3, 1 - 0.85 * amount * clamp01(hazeLevel))
          R[k] = (R[k]! - ar) / t + ar
          G[k] = (G[k]! - ag) / t + ag
          B[k] = (B[k]! - ab) / t + ab
        } else {
          const mix = -amount * 0.55
          R[k] = R[k]! + (ar - R[k]!) * mix
          G[k] = G[k]! + (ag - G[k]!) * mix
          B[k] = B[k]! + (ab - B[k]!) * mix
        }
        L[k] = LUMA_R * R[k]! + LUMA_G * G[k]! + LUMA_B * B[k]!
      }
    }
  }

  // Texture: medium-frequency detail.
  if (edits.texture !== 0) {
    const base = boxBlurFast(L, width, rows, textureRadius(longEdge), 2)
    const amount = edits.texture / 100
    for (let k = 0; k < n; k++) addLuma(k, (L[k]! - base[k]!) * amount)
  }

  // Clarity: large-scale local contrast, strongest in the midtones.
  if (edits.clarity !== 0 && maps.clarity) {
    const amount = (edits.clarity / 100) * 0.8
    for (let y = 0, k = 0; y < rows; y++) {
      const gy = y + yOffset
      for (let x = 0; x < width; x++, k++) {
        const l = L[k]!
        const base = sampleGrid(maps.clarity, x, gy, fullWidth, fullHeight)
        const mid = clamp01(1 - (2 * l - 1) * (2 * l - 1))
        addLuma(k, (l - base) * amount * mid)
      }
    }
  }

  // Sharpening: small-radius unsharp mask on luma, ignoring tiny (noisy) differences.
  if (edits.sharpening > 0) {
    const blur = boxBlurFast(L, width, rows, 1, 1)
    const amount = (edits.sharpening / 100) * 1.2
    for (let k = 0; k < n; k++) {
      const d = L[k]! - blur[k]!
      const sd = Math.sign(d) * Math.max(0, Math.abs(d) - 0.003)
      addLuma(k, sd * amount)
    }
  }

  // Post-crop vignette.
  if (edits.vignette !== 0) {
    const amount = edits.vignette / 100
    const start = 0.15 + 0.6 * (edits.vignetteMidpoint / 100)
    const end = start + 0.75
    for (let y = 0, k = 0; y < rows; y++) {
      const dy = (((y + yOffset + 0.5) / fullHeight) * 2 - 1) ** 2
      for (let x = 0; x < width; x++, k++) {
        const dx = (((x + 0.5) / fullWidth) * 2 - 1) ** 2
        const f = smoothstep(start, end, Math.sqrt((dx + dy) / 2) * 1.25)
        if (f <= 0) continue
        if (amount < 0) {
          const mul = 1 + amount * f * 0.9
          R[k]! *= mul
          G[k]! *= mul
          B[k]! *= mul
        } else {
          const lift = amount * f * 0.8
          R[k]! += (1 - R[k]!) * lift
          G[k]! += (1 - G[k]!) * lift
          B[k]! += (1 - B[k]!) * lift
        }
      }
    }
  }

  // Film grain: two octaves of luma noise, weaker in deep shadows and highlights.
  if (edits.grain > 0) {
    const cell = longEdge * (0.0006 + (edits.grainSize / 100) * 0.0035)
    const amp = (edits.grain / 100) * 0.16
    for (let y = 0, k = 0; y < rows; y++) {
      const gy = (y + yOffset) / cell
      for (let x = 0; x < width; x++, k++) {
        const gx = x / cell
        const noise = 0.7 * valueNoise(gx, gy) + 0.3 * valueNoise(gx * 2.1 + 17.3, gy * 2.1 + 5.1)
        const l = clamp01(LUMA_R * R[k]! + LUMA_G * G[k]! + LUMA_B * B[k]!)
        const d = noise * amp * (0.35 + 2.6 * l * (1 - l))
        R[k]! += d
        G[k]! += d
        B[k]! += d
      }
    }
  }

  for (let k = 0, i = 0; k < n; k++, i += 4) {
    data[i] = clamp01(R[k]!) * 255
    data[i + 1] = clamp01(G[k]!) * 255
    data[i + 2] = clamp01(B[k]!) * 255
  }
}

/** Develop + detail on one full buffer, synchronously (no workers). */
export function processImageSync(imageData: ImageData, edits: EditParams, linear?: LinearImage): void {
  applyEditsToImageData(imageData, edits, linear)
  if (!needsDetailPass(edits)) return
  const { data, width, height } = imageData
  const maps = buildDetailMaps(data, width, height, edits)
  applyDetail(data, width, height, edits, { yOffset: 0, fullWidth: width, fullHeight: height }, maps)
}

// ——— Auto tone & white balance ———————————————————————————————————————————

/**
 * Temperature / tint (−100…100) that make linear RGB `rgb` neutral grey, given
 * the gain model in whiteBalanceGains (red and blue gains multiply to 1).
 */
export function whiteBalanceForNeutral(rgb: [number, number, number]): {
  temperature: number
  tint: number
} {
  const [r, g, b] = rgb.map((v) => Math.max(1e-5, v)) as [number, number, number]
  const t = Math.log2(b / r) / (2 * TEMPERATURE_STOPS)
  const m = -Math.log2(Math.sqrt(r * b) / g) / TINT_STOPS
  return {
    temperature: Math.round(clamp(t * 100, -100, 100)),
    tint: Math.round(clamp(m * 100, -100, 100)),
  }
}

/** Pixels the auto tools look at: the geometry-transformed source before any edits. */
export type BaseSample = {
  data: Uint8ClampedArray
  width: number
  height: number
  linear: LinearImage | null
}

function readLinear(base: BaseSample, offset: number, out: Float32Array): void {
  if (base.linear) {
    const j = (offset >> 2) * 3
    out[0] = base.linear.data[j]! * base.linear.scale
    out[1] = base.linear.data[j + 1]! * base.linear.scale
    out[2] = base.linear.data[j + 2]! * base.linear.scale
  } else {
    out[0] = DECODE_LUT[base.data[offset]!]!
    out[1] = DECODE_LUT[base.data[offset + 1]!]!
    out[2] = DECODE_LUT[base.data[offset + 2]!]!
  }
}

/** Average linear RGB in a (2r+1)² box around (x, y) of the base image. */
export function sampleBaseLinear(base: BaseSample, x: number, y: number, r = 2): [number, number, number] {
  const out = new Float32Array(3)
  const sum: [number, number, number] = [0, 0, 0]
  let count = 0
  for (let yy = Math.max(0, y - r); yy <= Math.min(base.height - 1, y + r); yy++) {
    for (let xx = Math.max(0, x - r); xx <= Math.min(base.width - 1, x + r); xx++) {
      readLinear(base, (yy * base.width + xx) * 4, out)
      sum[0] += out[0]!
      sum[1] += out[1]!
      sum[2] += out[2]!
      count++
    }
  }
  return count ? [sum[0] / count, sum[1] / count, sum[2] / count] : [1, 1, 1]
}

function forEachSample(base: BaseSample, fn: (r: number, g: number, b: number) => void): void {
  const out = new Float32Array(3)
  const total = base.width * base.height
  const step = Math.max(1, Math.floor(Math.sqrt(total / 120000)))
  for (let y = 0; y < base.height; y += step) {
    for (let x = 0; x < base.width; x += step) {
      const offset = (y * base.width + x) * 4
      if (base.data[offset + 3] === 0) continue
      readLinear(base, offset, out)
      fn(out[0]!, out[1]!, out[2]!)
    }
  }
}

/** Grey-world white balance, ignoring near-black and clipped pixels. */
export function computeAutoWhiteBalance(base: BaseSample): { temperature: number; tint: number } {
  const sum: [number, number, number] = [0, 0, 0]
  forEachSample(base, (r, g, b) => {
    const max = Math.max(r, g, b)
    if (max < 0.01 || max > 0.95) return
    sum[0] += r
    sum[1] += g
    sum[2] += b
  })
  if (sum[0] + sum[1] + sum[2] <= 0) return { temperature: 0, tint: 0 }
  return whiteBalanceForNeutral(sum)
}

function percentile(sorted: Float32Array, p: number): number {
  if (sorted.length === 0) return 0
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))))]!
}

/**
 * Auto tone from the histogram: exposure to bring the median to mid grey,
 * then whites / blacks to set the end points and highlights / shadows to
 * recover the extremes. Keeps the current white balance.
 */
export function computeAutoTone(
  base: BaseSample,
  edits: EditParams,
): Pick<EditParams, 'exposure' | 'contrast' | 'highlights' | 'shadows' | 'whites' | 'blacks'> {
  const encode = base.linear ? rawBaseEncode : encodeSrgb
  const [wbR, wbG, wbB] = whiteBalanceGains(edits.temperature, edits.tint)
  const lumas: number[] = []
  forEachSample(base, (r, g, b) => {
    lumas.push(LUMA_R * r * wbR + LUMA_G * g * wbG + LUMA_B * b * wbB)
  })
  const linear = Float32Array.from(lumas).sort()
  const neutral = { exposure: 0, contrast: 0, highlights: 0, shadows: 0, whites: 0, blacks: 0 }
  if (linear.length === 0) return neutral

  // Exposure: bisect so the median lands on mid grey once encoded.
  const median = Math.max(1e-5, percentile(linear, 0.5))
  const target = 0.46
  let lo = -2
  let hi = 2
  for (let k = 0; k < 24; k++) {
    const mid = (lo + hi) / 2
    if (encode(median * Math.pow(2, mid)) < target) lo = mid
    else hi = mid
  }
  const exposure = Math.round(((lo + hi) / 2) * 100) / 100
  const gain = Math.pow(2, exposure)
  const encoded = linear.map((v) => clamp01(encode(v * gain)))

  const pHi = percentile(encoded, 0.995)
  const pLo = percentile(encoded, 0.005)
  const p25 = percentile(encoded, 0.25)
  const p75 = percentile(encoded, 0.75)
  let above = 0
  let below = 0
  for (const v of encoded) {
    if (v > 0.9) above++
    if (v < 0.12) below++
  }
  const count = encoded.length

  const whites = clamp((0.97 - pHi) / (WHITES_RANGE * Math.max(0.2, pHi ** 3)), -60, 60)
  const blackRange = pLo > 0.02 ? BLACKS_CRUSH : BLACKS_LIFT
  const blacks = clamp((0.02 - pLo) / (blackRange * Math.max(0.3, (1 - pLo) ** 3)), -60, 60)
  const contrast = clamp((0.32 - (p75 - p25)) * 120, -25, 25)
  const highlights = -clamp((above / count) * 400, 0, 70)
  const shadows = clamp((below / count) * 300, 0, 60)

  return {
    exposure,
    contrast: Math.round(contrast),
    highlights: Math.round(highlights),
    shadows: Math.round(shadows),
    whites: Math.round(whites),
    blacks: Math.round(blacks),
  }
}

/** What the editor renders from: a decoded browser image or RAW linear data. */
export type RenderSource = HTMLImageElement | ImageBitmap | LinearImage

function isLinearImage(source: RenderSource): source is LinearImage {
  return (source as LinearImage).kind === 'linear'
}

const scaledLinearCache = new WeakMap<LinearImage, Map<string, LinearImage>>()

/** Area-average downscale so the long edge fits `maxEdge`; cached per size. */
function scaleLinear(src: LinearImage, maxEdge: number): LinearImage {
  const scale = Math.min(1, maxEdge / Math.max(src.width, src.height))
  if (scale >= 1) return src
  const w = Math.max(1, Math.round(src.width * scale))
  const h = Math.max(1, Math.round(src.height * scale))
  let bySize = scaledLinearCache.get(src)
  if (!bySize) {
    bySize = new Map()
    scaledLinearCache.set(src, bySize)
  }
  const key = `${w}x${h}`
  const cached = bySize.get(key)
  if (cached) return cached

  const { data, width: sw, height: sh } = src
  const xs = new Int32Array(w + 1)
  const ys = new Int32Array(h + 1)
  for (let x = 0; x <= w; x++) xs[x] = Math.min(sw, Math.floor((x * sw) / w))
  for (let y = 0; y <= h; y++) ys[y] = Math.min(sh, Math.floor((y * sh) / h))

  const out = new Uint16Array(w * h * 3)
  for (let y = 0; y < h; y++) {
    const y0 = ys[y]!
    const y1 = Math.max(y0 + 1, ys[y + 1]!)
    for (let x = 0; x < w; x++) {
      const x0 = xs[x]!
      const x1 = Math.max(x0 + 1, xs[x + 1]!)
      let r = 0
      let g = 0
      let b = 0
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0, j = (yy * sw + x0) * 3; xx < x1; xx++, j += 3) {
          r += data[j]!
          g += data[j + 1]!
          b += data[j + 2]!
        }
      }
      const n = (y1 - y0) * (x1 - x0)
      const k = (y * w + x) * 3
      out[k] = r / n
      out[k + 1] = g / n
      out[k + 2] = b / n
    }
  }
  const scaled: LinearImage = { kind: 'linear', width: w, height: h, data: out, scale: src.scale }
  bySize.set(key, scaled)
  return scaled
}

/**
 * Orientation, straighten and crop for linear data, mirroring the canvas
 * path in renderEditedImage (same rounding, same coordinate conventions).
 * `alpha` marks pixels outside the image after straightening.
 */
function transformLinear(
  src: LinearImage,
  edits: EditParams,
): { image: LinearImage; alpha: Uint8Array | null } {
  const rotate = normalizeRotate(edits.rotate ?? 0)
  const crop = edits.crop
  const cropped = Boolean(crop && !isFullCrop(crop))
  if (rotate === 0 && !cropped) return { image: src, alpha: null }

  const sw = src.width
  const sh = src.height
  const swapped = rotate === 90 || rotate === 270
  const ow = swapped ? sh : sw
  const oh = swapped ? sw : sh

  let theta = 0
  let rotW = ow
  let rotH = oh
  let offX = 0
  let offY = 0
  let outW = ow
  let outH = oh
  if (cropped) {
    theta = (crop.straighten * Math.PI) / 180
    const c = Math.abs(Math.cos(theta))
    const s = Math.abs(Math.sin(theta))
    rotW = Math.max(1, Math.round(ow * c + oh * s))
    rotH = Math.max(1, Math.round(ow * s + oh * c))
    offX = crop.x * rotW
    offY = crop.y * rotH
    outW = Math.max(1, Math.round(crop.width * rotW))
    outH = Math.max(1, Math.round(crop.height * rotH))
  }

  const cos = Math.cos(theta)
  const sin = Math.sin(theta)
  const { data } = src
  const out = new Uint16Array(outW * outH * 3)
  const alpha = theta !== 0 ? new Uint8Array(outW * outH) : null

  for (let v = 0, k = 0; v < outH; v++) {
    const dy = offY + v + 0.5 - rotH / 2
    for (let u = 0; u < outW; u++, k++) {
      const dx = offX + u + 0.5 - rotW / 2
      // Undo straighten, then the 90° orientation step.
      const ox = dx * cos + dy * sin + ow / 2
      const oy = -dx * sin + dy * cos + oh / 2
      let sx = ox
      let sy = oy
      if (rotate === 90) {
        sx = oy
        sy = ow - ox
      } else if (rotate === 180) {
        sx = ow - ox
        sy = oh - oy
      } else if (rotate === 270) {
        sx = oh - oy
        sy = ox
      }
      if (sx < 0 || sy < 0 || sx > sw || sy > sh) continue
      if (alpha) alpha[k] = 255

      // Bilinear on pixel centres.
      const fx = Math.min(sw - 1, Math.max(0, sx - 0.5))
      const fy = Math.min(sh - 1, Math.max(0, sy - 0.5))
      const x0 = Math.floor(fx)
      const y0 = Math.floor(fy)
      const x1 = Math.min(sw - 1, x0 + 1)
      const y1 = Math.min(sh - 1, y0 + 1)
      const tx = fx - x0
      const ty = fy - y0
      const a = (y0 * sw + x0) * 3
      const b = (y0 * sw + x1) * 3
      const c = (y1 * sw + x0) * 3
      const d = (y1 * sw + x1) * 3
      for (let ch = 0; ch < 3; ch++) {
        const top = data[a + ch]! + (data[b + ch]! - data[a + ch]!) * tx
        const bottom = data[c + ch]! + (data[d + ch]! - data[c + ch]!) * tx
        out[k * 3 + ch] = top + (bottom - top) * ty
      }
    }
  }

  return {
    image: { kind: 'linear', width: outW, height: outH, data: out, scale: src.scale },
    alpha,
  }
}

/** Healed copies only stay cached at preview sizes; exports are one-off and large. */
const HEAL_CACHE_PIXELS = 2400 * 2400

const healCache = new WeakMap<object, Map<string, { key: string; image: HTMLCanvasElement | LinearImage }>>()

function cachedHeal<T extends HTMLCanvasElement | LinearImage>(
  owner: object,
  width: number,
  height: number,
  spots: HealSpot[],
  build: () => T | null,
): T | null {
  const size = `${width}x${height}`
  const key = healKey(spots)
  const cached = healCache.get(owner)?.get(size)
  if (cached?.key === key) return cached.image as T
  const image = build()
  if (image && width * height <= HEAL_CACHE_PIXELS) {
    let bySize = healCache.get(owner)
    if (!bySize) {
      bySize = new Map()
      healCache.set(owner, bySize)
    }
    bySize.set(size, { key, image })
  }
  return image
}

/** Linear source with spot removal applied (a copy; the decoded original stays untouched). */
function healLinear(src: LinearImage, spots: HealSpot[]): LinearImage {
  if (spots.length === 0) return src
  return (
    cachedHeal(src, src.width, src.height, spots, () => {
      const data = src.data.slice()
      applyHeal({ data, width: src.width, height: src.height, stride: 3, max: 65535 }, spots)
      return { ...src, data }
    }) ?? src
  )
}

/** The source drawn at `w`×`h` with spot removal applied; only the touched window is read back. */
function healCanvas(source: HTMLImageElement | ImageBitmap, w: number, h: number, spots: HealSpot[]) {
  return cachedHeal(source, w, h, spots, () => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null
    ctx.drawImage(source, 0, 0, w, h)
    const area = healBounds(spots, w, h)
    if (!area) return canvas
    const pixels = ctx.getImageData(area.x0, area.y0, area.x1 - area.x0, area.y1 - area.y0)
    applyHeal(
      {
        data: pixels.data,
        width: pixels.width,
        height: pixels.height,
        stride: 4,
        max: 255,
        left: area.x0,
        top: area.y0,
        fullWidth: w,
        fullHeight: h,
      },
      spots,
    )
    ctx.putImageData(pixels, area.x0, area.y0)
    return canvas
  })
}

/**
 * Small 8-bit RGBA copy of the source (spot removal applied) in source image
 * space — what the automatic source search compares.
 */
export function healSearchImage(
  source: RenderSource,
  spots: HealSpot[],
  maxEdge = 640,
): { data: Uint8ClampedArray; width: number; height: number; stride: number; max: number } | null {
  if (isLinearImage(source)) {
    const image = healLinear(scaleLinear(source, maxEdge), spots)
    const data = new Uint8ClampedArray(image.width * image.height * 4)
    for (let k = 0, j = 0, i = 0; k < image.width * image.height; k++, j += 3, i += 4) {
      data[i] = encodeSrgb(image.data[j]! * image.scale) * 255
      data[i + 1] = encodeSrgb(image.data[j + 1]! * image.scale) * 255
      data[i + 2] = encodeSrgb(image.data[j + 2]! * image.scale) * 255
      data[i + 3] = 255
    }
    return { data, width: image.width, height: image.height, stride: 4, max: 255 }
  }
  const scale = Math.min(1, maxEdge / Math.max(source.width, source.height))
  const w = Math.max(1, Math.round(source.width * scale))
  const h = Math.max(1, Math.round(source.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(spots.length > 0 ? (healCanvas(source, w, h, spots) ?? source) : source, 0, 0, w, h)
  return { data: ctx.getImageData(0, 0, w, h).data, width: w, height: h, stride: 4, max: 255 }
}

/** Geometry-transformed pixels (orientation, straighten, crop, preview scale) the develop passes start from. */
export type BaseImage = BaseSample

/** Orientation, straighten, crop and downscale — everything but the colour work. */
export function prepareBase(source: RenderSource, edits: EditParams, maxEdge = 2400): BaseImage | null {
  if (isLinearImage(source)) {
    const { image, alpha } = transformLinear(healLinear(scaleLinear(source, maxEdge), edits.heal ?? []), edits)
    const data = new Uint8ClampedArray(image.width * image.height * 4)
    for (let k = 0, i = 3; k < image.width * image.height; k++, i += 4) {
      data[i] = alpha ? alpha[k]! : 255
    }
    return { data, width: image.width, height: image.height, linear: image }
  }

  const srcW = source.width
  const srcH = source.height
  const scale = Math.min(1, maxEdge / Math.max(srcW, srcH))
  const w = Math.max(1, Math.round(srcW * scale))
  const h = Math.max(1, Math.round(srcH * scale))
  const rotate = normalizeRotate(edits.rotate ?? 0)
  const swapped = rotate === 90 || rotate === 270
  const crop = edits.crop
  const straightenRad = ((crop?.straighten ?? 0) * Math.PI) / 180

  const orientedW = swapped ? h : w
  const orientedH = swapped ? w : h

  const scratch = document.createElement('canvas')
  scratch.width = orientedW
  scratch.height = orientedH
  const sctx = scratch.getContext('2d', { willReadFrequently: true })
  if (!sctx) return null

  sctx.save()
  if (rotate === 90) {
    sctx.translate(orientedW, 0)
    sctx.rotate(Math.PI / 2)
  } else if (rotate === 180) {
    sctx.translate(orientedW, orientedH)
    sctx.rotate(Math.PI)
  } else if (rotate === 270) {
    sctx.translate(0, orientedH)
    sctx.rotate(-Math.PI / 2)
  }
  const spots = edits.heal ?? []
  sctx.drawImage(spots.length > 0 ? (healCanvas(source, w, h, spots) ?? source) : source, 0, 0, w, h)
  sctx.restore()

  let work = scratch
  if (crop && !isFullCrop(crop)) {
    const cos = Math.cos(straightenRad)
    const sin = Math.sin(straightenRad)
    const rotW = Math.abs(orientedW * cos) + Math.abs(orientedH * sin)
    const rotH = Math.abs(orientedW * sin) + Math.abs(orientedH * cos)
    const rotated = document.createElement('canvas')
    rotated.width = Math.max(1, Math.round(rotW))
    rotated.height = Math.max(1, Math.round(rotH))
    const rctx = rotated.getContext('2d', { willReadFrequently: true })
    if (!rctx) return null
    rctx.translate(rotated.width / 2, rotated.height / 2)
    rctx.rotate(straightenRad)
    rctx.drawImage(scratch, -orientedW / 2, -orientedH / 2)

    const cx = crop.x * rotated.width
    const cy = crop.y * rotated.height
    const cw = Math.max(1, Math.round(crop.width * rotated.width))
    const ch = Math.max(1, Math.round(crop.height * rotated.height))
    const cropped = document.createElement('canvas')
    cropped.width = cw
    cropped.height = ch
    const cctx = cropped.getContext('2d', { willReadFrequently: true })
    if (!cctx) return null
    cctx.drawImage(rotated, cx, cy, cw, ch, 0, 0, cw, ch)
    work = cropped
  }

  const wctx = work.getContext('2d', { willReadFrequently: true })
  if (!wctx) return null
  const pixels = wctx.getImageData(0, 0, work.width, work.height)
  return { data: pixels.data, width: work.width, height: work.height, linear: null }
}

export type RenderOptions = {
  maxEdge?: number
  /** Skip the user's edits (for before/after compare). */
  bypassColor?: boolean
}

/**
 * Synchronous render on the main thread. The editor uses the worker pool in
 * renderPipeline; this stays as the fallback when workers are unavailable.
 */
export function renderEditedImage(
  source: RenderSource,
  edits: EditParams,
  target: HTMLCanvasElement,
  options: RenderOptions | number = {},
): ImageData | null {
  const opts: RenderOptions = typeof options === 'number' ? { maxEdge: options } : options
  const base = prepareBase(source, edits, opts.maxEdge ?? 2400)
  if (!base) return null
  target.width = base.width
  target.height = base.height
  const ctx = target.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  const imageData = new ImageData(base.data.slice(), base.width, base.height)
  // "Before" still shows the base RAW rendering, just without the user's edits.
  if (base.linear) processImageSync(imageData, opts.bypassColor ? DEFAULT_EDITS : edits, base.linear)
  else if (!opts.bypassColor) processImageSync(imageData, edits)
  ctx.putImageData(imageData, 0, 0)
  return imageData
}

export const MIME_BY_FORMAT: Record<ExportFormat, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

export function buildExportFilename(baseName: string, options: ExportOptions): string {
  const stem = baseName.replace(/\.[^.]+$/, '') || 'lightframes'
  const pattern = options.filenamePattern || '{name}-edited'
  const name = pattern.replaceAll('{name}', stem)
  const ext = options.format === 'jpeg' ? 'jpg' : options.format
  return name.toLowerCase().endsWith(`.${ext}`) ? name : `${name}.${ext}`
}
