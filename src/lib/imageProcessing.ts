import type { EditParams } from '../types/edits'

function clamp(value: number, min = 0, max = 255): number {
  return Math.min(max, Math.max(min, value))
}

function luminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
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

    // Saturation + vibrance
    const avg = (r + g + b) / 3
    const maxC = Math.max(r, g, b)
    const minC = Math.min(r, g, b)
    const sat = maxC - minC
    const vibranceFactor = vibrance * (1 - sat / 255)

    r = avg + (r - avg) * (1 + saturation + vibranceFactor)
    g = avg + (g - avg) * (1 + saturation + vibranceFactor)
    b = avg + (b - avg) * (1 + saturation + vibranceFactor)

    data[i] = clamp(r)
    data[i + 1] = clamp(g)
    data[i + 2] = clamp(b)
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

  target.width = w
  target.height = h

  const ctx = target.getContext('2d', { willReadFrequently: true })
  if (!ctx) return

  ctx.drawImage(source, 0, 0, w, h)
  const imageData = ctx.getImageData(0, 0, w, h)
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
