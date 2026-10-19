export type HistogramBins = {
  r: Uint32Array
  g: Uint32Array
  b: Uint32Array
  lum: Uint32Array
}

export type ClippingStats = {
  shadowPixels: number
  highlightPixels: number
  totalPixels: number
}

export function createEmptyHistogram(): HistogramBins {
  return {
    r: new Uint32Array(256),
    g: new Uint32Array(256),
    b: new Uint32Array(256),
    lum: new Uint32Array(256),
  }
}

export function computeHistogram(imageData: ImageData): {
  bins: HistogramBins
  clipping: ClippingStats
} {
  const bins = createEmptyHistogram()
  const { data } = imageData
  let shadowPixels = 0
  let highlightPixels = 0
  let totalPixels = 0

  for (let i = 0; i < data.length; i += 4) {
    // Transparent pixels (removed background, straighten corners) aren't part of the picture.
    if (data[i + 3] === 0) continue
    totalPixels++
    const r = data[i]!
    const g = data[i + 1]!
    const b = data[i + 2]!
    bins.r[r]!++
    bins.g[g]!++
    bins.b[b]!++
    const lum = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b)
    bins.lum[lum]!++
    if (r <= 2 || g <= 2 || b <= 2) shadowPixels++
    if (r >= 253 || g >= 253 || b >= 253) highlightPixels++
  }

  return {
    bins,
    clipping: { shadowPixels, highlightPixels, totalPixels },
  }
}

/** Paint RGB + luminance histogram into a canvas. */
export function drawHistogram(
  canvas: HTMLCanvasElement,
  bins: HistogramBins,
  width = 260,
  height = 72,
): void {
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = 'rgba(12, 16, 14, 0.65)'
  ctx.fillRect(0, 0, width, height)

  let max = 1
  for (let i = 0; i < 256; i++) {
    max = Math.max(max, bins.r[i]!, bins.g[i]!, bins.b[i]!, bins.lum[i]!)
  }

  const drawChannel = (channel: Uint32Array, color: string) => {
    ctx.beginPath()
    ctx.moveTo(0, height)
    for (let i = 0; i < 256; i++) {
      const x = (i / 255) * (width - 1)
      const y = height - (channel[i]! / max) * (height - 2)
      ctx.lineTo(x, y)
    }
    ctx.lineTo(width, height)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
  }

  drawChannel(bins.lum, 'rgba(232, 239, 228, 0.22)')
  drawChannel(bins.r, 'rgba(226, 85, 85, 0.35)')
  drawChannel(bins.g, 'rgba(76, 175, 106, 0.35)')
  drawChannel(bins.b, 'rgba(74, 127, 212, 0.35)')
}

/** Overlay shadow (blue) / highlight (red) clipping on a canvas matching imageData. */
export function drawClippingOverlay(
  canvas: HTMLCanvasElement,
  imageData: ImageData,
): void {
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const overlay = ctx.createImageData(imageData.width, imageData.height)
  const src = imageData.data
  const dst = overlay.data
  for (let i = 0; i < src.length; i += 4) {
    const r = src[i]!
    const g = src[i + 1]!
    const b = src[i + 2]!
    if (r >= 253 || g >= 253 || b >= 253) {
      dst[i] = 255
      dst[i + 1] = 40
      dst[i + 2] = 40
      dst[i + 3] = 160
    } else if (r <= 2 || g <= 2 || b <= 2) {
      dst[i] = 40
      dst[i + 1] = 120
      dst[i + 2] = 255
      dst[i + 3] = 160
    }
  }
  ctx.putImageData(overlay, 0, 0)
}
