import {
  DEFAULT_EDITS,
  EDIT_SLIDERS,
  HSL_CHANNELS,
  isNeutralHsl,
  isNeutralToneCurve,
  normalizeRotate,
  type CropRect,
  type EditParams,
  type ExportFormat,
  type ExportOptions,
  type HslEdits,
  type RadialAdjustment,
  type ToneCurve,
} from '../types/edits'
import { applyLutToImageData } from './cubeLut'
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

function sampleMask(mask: LuminanceMask, x: number, y: number): number {
  const fx = clamp((x + 0.5) * mask.sx - 0.5, 0, mask.width - 1)
  const fy = clamp((y + 0.5) * mask.sy - 0.5, 0, mask.height - 1)
  const x0 = fx | 0
  const y0 = fy | 0
  const x1 = Math.min(mask.width - 1, x0 + 1)
  const y1 = Math.min(mask.height - 1, y0 + 1)
  const tx = fx - x0
  const ty = fy - y0
  const { data, width } = mask
  const top = data[y0 * width + x0]! + (data[y0 * width + x1]! - data[y0 * width + x0]!) * tx
  const bottom = data[y1 * width + x0]! + (data[y1 * width + x1]! - data[y1 * width + x0]!) * tx
  return top + (bottom - top) * ty
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

/** Vibrance / saturation (around luma), then HSL, on encoded RGB in 0–1. */
function adjustColor(
  r: number,
  g: number,
  b: number,
  saturation: number,
  vibrance: number,
  hsl: HslEdits | null,
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
  return [clamp01(r), clamp01(g), clamp01(b)]
}

/**
 * The colour stage depends only on the pixel's RGB, so it is baked into a
 * small 3D table and sampled trilinearly instead of running HSL maths per pixel.
 */
function buildColorGrid(saturation: number, vibrance: number, hsl: HslEdits): Float32Array {
  const n = COLOR_GRID
  const max = n - 1
  const hslEdits = isNeutralHsl(hsl) ? null : hsl
  const grid = new Float32Array(n * n * n * 3)
  for (let bi = 0, k = 0; bi < n; bi++) {
    for (let gi = 0; gi < n; gi++) {
      for (let ri = 0; ri < n; ri++, k += 3) {
        const [r, g, b] = adjustColor(ri / max, gi / max, bi / max, saturation, vibrance, hslEdits)
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

function isNeutralDevelop(edits: EditParams): boolean {
  return (
    EDIT_SLIDERS.every((slider) => edits[slider.key] === 0) &&
    isNeutralHsl(edits.hsl) &&
    isNeutralToneCurve(edits.toneCurve)
  )
}

/** Global develop settings (everything but local adjustments and LUT). */
function developImageData(imageData: ImageData, edits: EditParams, linear?: LinearImage): void {
  const { data, width, height } = imageData
  const encode = linear ? rawBaseEncode : encodeSrgb

  const [wbR, wbG, wbB] = whiteBalanceGains(edits.temperature, edits.tint)
  const exposureMul = Math.pow(2, edits.exposure)
  const mulR = wbR * exposureMul
  const mulG = wbG * exposureMul
  const mulB = wbB * exposureMul
  const white = Math.max(mulR, mulG, mulB)
  // RAW keeps its headroom until the base curve; 8-bit sources need a shoulder.
  const useShoulder = !linear && white > 1

  const shadows = edits.shadows / 100
  const highlights = edits.highlights / 100
  const contrast = edits.contrast / 100
  const whites = edits.whites / 100
  const blacks = edits.blacks / 100
  const colorGrid =
    edits.saturation !== 0 || edits.vibrance !== 0 || !isNeutralHsl(edits.hsl)
      ? buildColorGrid(edits.saturation / 100, edits.vibrance / 100, edits.hsl)
      : null

  const toneTable =
    contrast !== 0 || whites !== 0 || blacks !== 0
      ? buildBasicToneTable(contrast, whites, blacks)
      : null
  const curveTable = isNeutralToneCurve(edits.toneCurve)
    ? null
    : buildToneCurveLut(edits.toneCurve)

  const lin = new Float32Array(3)
  const src = linear?.data
  const srcScale = linear?.scale ?? 1
  const toLinear = (offset: number) => {
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
    lin[0] = r
    lin[1] = g
    lin[2] = b
  }

  let mask: LuminanceMask | null = null
  let gainTable: Float32Array | null = null
  if (shadows !== 0 || highlights !== 0) {
    mask = buildLuminanceMask(width, height, encode, (offset) => {
      toLinear(offset)
      return LUMA_R * lin[0]! + LUMA_G * lin[1]! + LUMA_B * lin[2]!
    })
    gainTable = buildLocalToneGainTable(shadows, highlights)
  }

  for (let y = 0, i = 0; y < height; y++) {
    for (let x = 0; x < width; x++, i += 4) {
      toLinear(i)
      let r = lin[0]!
      let g = lin[1]!
      let b = lin[2]!

      if (mask && gainTable) {
        const own = encode(LUMA_R * r + LUMA_G * g + LUMA_B * b)
        const base = MASK_LOCAL_MIX * sampleMask(mask, x, y) + (1 - MASK_LOCAL_MIX) * own
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

      data[i] = r * 255
      data[i + 1] = g * 255
      data[i + 2] = b * 255
    }
  }
}

function radialWeight(
  x: number,
  y: number,
  w: number,
  h: number,
  adj: RadialAdjustment,
): number {
  const dx = (x / w - adj.cx) / Math.max(0.001, adj.radiusX)
  const dy = (y / h - adj.cy) / Math.max(0.001, adj.radiusY)
  const d = Math.sqrt(dx * dx + dy * dy)
  if (d >= 1) return 0
  const feather = Math.min(0.95, Math.max(0.01, adj.feather))
  const inner = 1 - feather
  if (d <= inner) return 1
  const t = (d - inner) / feather
  return 1 - t * t * (3 - 2 * t)
}

function applyLocalAdjustments(imageData: ImageData, items: RadialAdjustment[]): void {
  if (items.length === 0) return
  const { data, width, height } = imageData
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let weight = 0
      let exposure = 0
      let contrast = 0
      let saturation = 0
      for (const adj of items) {
        const w = radialWeight(x, y, width, height, adj)
        if (w <= 0) continue
        weight += w
        exposure += w * adj.exposure
        contrast += w * adj.contrast
        saturation += w * adj.saturation
      }
      if (weight <= 0) continue
      exposure /= weight
      contrast /= weight
      saturation /= weight
      const mask = Math.min(1, weight)

      const i = (y * width + x) * 4
      // Exposure in linear light, like the global slider.
      const expMul = Math.pow(2, exposure * mask)
      let r = encodeSrgb(DECODE_LUT[data[i]!]! * expMul)
      let g = encodeSrgb(DECODE_LUT[data[i + 1]!]! * expMul)
      let b = encodeSrgb(DECODE_LUT[data[i + 2]!]! * expMul)

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

/**
 * Apply non-destructive EditParams to ImageData in place (color only). With
 * `linear`, pixels are developed from that RAW buffer (same dimensions) and
 * ImageData only receives the result.
 */
export function applyEditsToImageData(
  imageData: ImageData,
  edits: EditParams,
  linear?: LinearImage,
): void {
  if (linear || !isNeutralDevelop(edits)) developImageData(imageData, edits, linear)
  applyLocalAdjustments(imageData, edits.localAdjustments)

  if (edits.lut) {
    applyLutToImageData(imageData, edits.lut, edits.lutMix ?? 1)
  }
}

function isFullCrop(crop: CropRect): boolean {
  return (
    crop.x <= 0.0001 &&
    crop.y <= 0.0001 &&
    crop.width >= 0.999 &&
    crop.height >= 0.999 &&
    Math.abs(crop.straighten) < 0.01
  )
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

function renderLinearImage(
  source: LinearImage,
  edits: EditParams,
  target: HTMLCanvasElement,
  opts: RenderOptions,
): ImageData | null {
  const { image, alpha } = transformLinear(scaleLinear(source, opts.maxEdge ?? 2400), edits)
  target.width = image.width
  target.height = image.height
  const ctx = target.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  const imageData = ctx.createImageData(image.width, image.height)
  const px = imageData.data
  for (let k = 0, i = 3; k < image.width * image.height; k++, i += 4) {
    px[i] = alpha ? alpha[k]! : 255
  }
  // "Before" still shows the base RAW rendering, just without the user's edits.
  applyEditsToImageData(imageData, opts.bypassColor ? DEFAULT_EDITS : edits, image)
  ctx.putImageData(imageData, 0, 0)
  return imageData
}

export type RenderOptions = {
  maxEdge?: number
  /** Skip color grading (for before/after compare). */
  bypassColor?: boolean
}

/**
 * Draw source with orientation, straighten, crop, then optional color edits.
 * Returns the ImageData used for the final canvas (for histogram / clipping).
 */
export function renderEditedImage(
  source: RenderSource,
  edits: EditParams,
  target: HTMLCanvasElement,
  options: RenderOptions | number = {},
): ImageData | null {
  const opts: RenderOptions = typeof options === 'number' ? { maxEdge: options } : options
  if (isLinearImage(source)) return renderLinearImage(source, edits, target, opts)
  const maxEdge = opts.maxEdge ?? 2400
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
  sctx.drawImage(source, 0, 0, w, h)
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

  target.width = work.width
  target.height = work.height
  const ctx = target.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(work, 0, 0)

  const imageData = ctx.getImageData(0, 0, target.width, target.height)
  if (!opts.bypassColor) {
    applyEditsToImageData(imageData, edits)
  }
  ctx.putImageData(imageData, 0, 0)
  return imageData
}

const MIME_BY_FORMAT: Record<ExportFormat, string> = {
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

export async function exportEditedImage(
  source: RenderSource,
  edits: EditParams,
  options: ExportOptions,
): Promise<{ blob: Blob; filename: string }> {
  const canvas = document.createElement('canvas')
  renderEditedImage(source, edits, canvas, { maxEdge: options.maxEdge })
  const mime = MIME_BY_FORMAT[options.format]
  const quality =
    options.format === 'png' ? undefined : Math.min(1, Math.max(0.1, options.quality))
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result)
        else reject(new Error(`Failed to encode ${options.format}`))
      },
      mime,
      quality,
    )
  })
  return { blob, filename: buildExportFilename('export', options) }
}

/** @deprecated Prefer exportEditedImage with ExportOptions. */
export async function exportEditedJpeg(
  source: HTMLImageElement | ImageBitmap,
  edits: EditParams,
  quality = 0.92,
): Promise<Blob> {
  const { blob } = await exportEditedImage(source, edits, {
    format: 'jpeg',
    quality,
    maxEdge: 8192,
    filenamePattern: '{name}-edited',
  })
  return blob
}
