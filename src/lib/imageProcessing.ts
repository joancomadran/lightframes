import {
  HSL_CHANNELS,
  isNeutralHsl,
  normalizeRotate,
  type EditParams,
  type HslEdits,
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
  const hh = ((h % 360) + 360) % 360 / 360
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
  // Near-gray pixels barely respond (avoids noise in neutrals)
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

  // Normalize overlapping weights
  hueShift /= weightSum
  satMul /= weightSum
  lumMul /= weightSum

  const nextH = h + hueShift * 0.6 // ±60° at full throw
  const nextS = Math.min(1, Math.max(0, s * (1 + satMul / 100)))
  const nextL = Math.min(1, Math.max(0, l * (1 + lumMul / 100)))
  const rgb = hslToRgb(nextH, nextS, nextL)
  return [rgb.r, rgb.g, rgb.b]
}

/** Apply non-destructive EditParams to ImageData in place. */
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

    // Exposure
    r *= exposureMul
    g *= exposureMul
    b *= exposureMul

    // Contrast around mid-gray
    r = (r - 128) * (1 + contrast) + 128
    g = (g - 128) * (1 + contrast) + 128
    b = (b - 128) * (1 + contrast) + 128

    let lum = luminance(r, g, b) / 255

    // Highlights / shadows (tone curves approx)
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

    // Whites / blacks
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

    // Temperature (warm/cool) + tint (green/magenta)
    r += temperature * 30
    b -= temperature * 30
    g += tint * 25
    r -= tint * 12
    b -= tint * 12

    // Global saturation + vibrance
    const avg = (r + g + b) / 3
    const maxC = Math.max(r, g, b)
    const minC = Math.min(r, g, b)
    const sat = maxC - minC
    const vibranceFactor = vibrance * (1 - sat / 255)

    r = avg + (r - avg) * (1 + saturation + vibranceFactor)
    g = avg + (g - avg) * (1 + saturation + vibranceFactor)
    b = avg + (b - avg) * (1 + saturation + vibranceFactor)

    // Per-channel HSL (after global color so bands read the graded image)
    if (hslActive) {
      ;[r, g, b] = applyHslEdits(r, g, b, edits.hsl)
    }

    data[i] = clamp(r)
    data[i + 1] = clamp(g)
    data[i + 2] = clamp(b)
  }

  if (edits.lut) {
    applyLutToImageData(imageData, edits.lut, edits.lutMix ?? 1)
  }
}

export function renderEditedImage(
  source: HTMLImageElement | ImageBitmap,
  edits: EditParams,
  target: HTMLCanvasElement,
  maxEdge = 2400,
): void {
  const srcW = source.width
  const srcH = source.height
  const scale = Math.min(1, maxEdge / Math.max(srcW, srcH))
  const w = Math.max(1, Math.round(srcW * scale))
  const h = Math.max(1, Math.round(srcH * scale))
  const rotate = normalizeRotate(edits.rotate ?? 0)
  const swapped = rotate === 90 || rotate === 270

  target.width = swapped ? h : w
  target.height = swapped ? w : h

  const ctx = target.getContext('2d', { willReadFrequently: true })
  if (!ctx) return

  ctx.save()
  if (rotate === 90) {
    ctx.translate(target.width, 0)
    ctx.rotate(Math.PI / 2)
  } else if (rotate === 180) {
    ctx.translate(target.width, target.height)
    ctx.rotate(Math.PI)
  } else if (rotate === 270) {
    ctx.translate(0, target.height)
    ctx.rotate(-Math.PI / 2)
  }
  ctx.drawImage(source, 0, 0, w, h)
  ctx.restore()

  const imageData = ctx.getImageData(0, 0, target.width, target.height)
  applyEditsToImageData(imageData, edits)
  ctx.putImageData(imageData, 0, 0)
}

export async function exportEditedJpeg(
  source: HTMLImageElement | ImageBitmap,
  edits: EditParams,
  quality = 0.92,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  renderEditedImage(source, edits, canvas, 8192)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to encode JPEG'))
      },
      'image/jpeg',
      quality,
    )
  })
}
