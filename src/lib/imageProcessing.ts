import {
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

function clamp(value: number, min = 0, max = 255): number {
  return Math.min(max, Math.max(min, value))
}

function luminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

/** Soft weight peaking at the channel center; half-width ≈ 30°. */
function channelWeight(hue: number, center: number): number {
  const width = 35
  const d = hueDistance(hue, center)
  if (d >= width) return 0
  const t = 1 - d / width
  return t * t * (3 - 2 * t)
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
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

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const hh = (((h % 360) + 360) % 360) / 360
  if (s === 0) {
    const v = l * 255
    return { r: v, g: v, b: v }
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return {
    r: hue2rgb(p, q, hh + 1 / 3) * 255,
    g: hue2rgb(p, q, hh) * 255,
    b: hue2rgb(p, q, hh - 1 / 3) * 255,
  }
}

function applyHslEdits(r: number, g: number, b: number, hsl: HslEdits): [number, number, number] {
  const { h, s, l } = rgbToHsl(r, g, b)
  if (s < 0.02) return [r, g, b]

  let hueShift = 0
  let satMul = 0
  let lumMul = 0
  let weightSum = 0

  for (const channel of HSL_CHANNELS) {
    const w = channelWeight(h, channel.center)
    if (w <= 0) continue
    const band = hsl[channel.id]
    hueShift += w * band.hue
    satMul += w * band.saturation
    lumMul += w * band.luminance
    weightSum += w
  }

  if (weightSum <= 0) return [r, g, b]

  hueShift /= weightSum
  satMul /= weightSum
  lumMul /= weightSum

  const nextH = h + hueShift * 0.6
  const nextS = Math.min(1, Math.max(0, s * (1 + satMul / 100)))
  const nextL = Math.min(1, Math.max(0, l * (1 + lumMul / 100)))
  const rgb = hslToRgb(nextH, nextS, nextL)
  return [rgb.r, rgb.g, rgb.b]
}

/** Build a 256-entry LUT from a piecewise-linear tone curve. */
export function buildToneCurveLut(curve: ToneCurve): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(256)
  const points = [...curve.points].sort((a, b) => a.x - b.x)
  if (points.length < 2) {
    for (let i = 0; i < 256; i++) lut[i] = i
    return lut
  }

  for (let i = 0; i < 256; i++) {
    const x = i / 255
    let y = x
    if (x <= points[0]!.x) {
      y = points[0]!.y
    } else if (x >= points[points.length - 1]!.x) {
      y = points[points.length - 1]!.y
    } else {
      for (let p = 0; p < points.length - 1; p++) {
        const a = points[p]!
        const b = points[p + 1]!
        if (x >= a.x && x <= b.x) {
          const t = b.x === a.x ? 0 : (x - a.x) / (b.x - a.x)
          y = a.y + (b.y - a.y) * t
          break
        }
      }
    }
    lut[i] = Math.round(Math.min(1, Math.max(0, y)) * 255)
  }
  return lut
}

function applyToneCurve(imageData: ImageData, curve: ToneCurve): void {
  if (isNeutralToneCurve(curve)) return
  const lut = buildToneCurveLut(curve)
  const { data } = imageData
  for (let i = 0; i < data.length; i += 4) {
    data[i] = lut[data[i]!]!
    data[i + 1] = lut[data[i + 1]!]!
    data[i + 2] = lut[data[i + 2]!]!
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
      let r = data[i]!
      let g = data[i + 1]!
      let b = data[i + 2]!

      const expMul = Math.pow(2, exposure * mask)
      r *= expMul
      g *= expMul
      b *= expMul

      const c = (contrast / 100) * mask
      r = (r - 128) * (1 + c) + 128
      g = (g - 128) * (1 + c) + 128
      b = (b - 128) * (1 + c) + 128

      const avg = (r + g + b) / 3
      const s = (saturation / 100) * mask
      r = avg + (r - avg) * (1 + s)
      g = avg + (g - avg) * (1 + s)
      b = avg + (b - avg) * (1 + s)

      data[i] = clamp(r)
      data[i + 1] = clamp(g)
      data[i + 2] = clamp(b)
    }
  }
}

/** Apply non-destructive EditParams to ImageData in place (color only). */
export function applyEditsToImageData(imageData: ImageData, edits: EditParams): void {
  const { data } = imageData
  const exposureMul = Math.pow(2, edits.exposure)
  const contrast = edits.contrast / 100
  const highlights = edits.highlights / 100
  const shadows = edits.shadows / 100
  const whites = edits.whites / 100
  const blacks = edits.blacks / 100
  const temperature = edits.temperature / 100
  const tint = edits.tint / 100
  const vibrance = edits.vibrance / 100
  const saturation = edits.saturation / 100
  const hslActive = !isNeutralHsl(edits.hsl)

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i]!
    let g = data[i + 1]!
    let b = data[i + 2]!

    r *= exposureMul
    g *= exposureMul
    b *= exposureMul

    r = (r - 128) * (1 + contrast) + 128
    g = (g - 128) * (1 + contrast) + 128
    b = (b - 128) * (1 + contrast) + 128

    let lum = luminance(r, g, b) / 255

    if (lum > 0.5) {
      const t = (lum - 0.5) * 2
      const amount = highlights * t
      r += amount * 80
      g += amount * 80
      b += amount * 80
    } else {
      const t = (0.5 - lum) * 2
      const amount = shadows * t
      r += amount * 80
      g += amount * 80
      b += amount * 80
    }

    lum = luminance(r, g, b) / 255

    if (lum > 0.7) {
      const t = (lum - 0.7) / 0.3
      const amount = whites * t
      r += amount * 60
      g += amount * 60
      b += amount * 60
    }
    if (lum < 0.3) {
      const t = (0.3 - lum) / 0.3
      const amount = blacks * t
      r += amount * 60
      g += amount * 60
      b += amount * 60
    }

    r += temperature * 30
    b -= temperature * 30
    g += tint * 25
    r -= tint * 12
    b -= tint * 12

    const avg = (r + g + b) / 3
    const maxC = Math.max(r, g, b)
    const minC = Math.min(r, g, b)
    const sat = maxC - minC
    const vibranceFactor = vibrance * (1 - sat / 255)

    r = avg + (r - avg) * (1 + saturation + vibranceFactor)
    g = avg + (g - avg) * (1 + saturation + vibranceFactor)
    b = avg + (b - avg) * (1 + saturation + vibranceFactor)

    if (hslActive) {
      ;[r, g, b] = applyHslEdits(r, g, b, edits.hsl)
    }

    data[i] = clamp(r)
    data[i + 1] = clamp(g)
    data[i + 2] = clamp(b)
  }

  applyToneCurve(imageData, edits.toneCurve)
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
  source: HTMLImageElement | ImageBitmap,
  edits: EditParams,
  target: HTMLCanvasElement,
  options: RenderOptions | number = {},
): ImageData | null {
  const opts: RenderOptions = typeof options === 'number' ? { maxEdge: options } : options
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
  source: HTMLImageElement | ImageBitmap,
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
