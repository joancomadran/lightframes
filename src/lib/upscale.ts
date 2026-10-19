import { runModel } from './ai'

/*
 * AI upscaling at export: the developed photo goes through Real-ESRGAN ×4
 * (upscale.worker.ts), resampled tile by tile to the factor asked for — a ×4
 * result brought down to ×2 keeps more detail than a plain ×2 resize.
 */

/**
 * Share of a plain smooth resize mixed into the result. The model denoises
 * hard and leaves skin waxy; a little of the original texture fixes that
 * while edges stay sharp.
 */
const TEXTURE_MIX = 0.2

const MAX_OUTPUT_EDGE = 8192
/** Keeps the result's RGBA (plus the canvases around it) within what browsers can hold. */
const MAX_OUTPUT_PIXELS = 40_000_000
/** Below this there is nothing worth the wait. */
const MIN_FACTOR = 1.1

/**
 * The factor really applied to a `width`×`height` photo: the one asked for,
 * capped by the export size (`targetEdge`), 8192 px and 40 MP. 1 when that
 * leaves nothing to gain.
 */
export function upscaleFactor(width: number, height: number, requested: number, targetEdge: number): number {
  if (requested <= 1) return 1
  const byEdge = Math.min(targetEdge, MAX_OUTPUT_EDGE) / Math.max(width, height)
  const byArea = Math.sqrt(MAX_OUTPUT_PIXELS / (width * height))
  const factor = Math.min(requested, byEdge, byArea)
  return factor >= MIN_FACTOR ? factor : 1
}

/** Upscale a canvas by `factor` (≤ 4); transparency is kept by scaling the original alpha up. */
export async function upscaleCanvas(
  canvas: HTMLCanvasElement,
  factor: number,
  onProgress?: (fraction: number) => void,
): Promise<HTMLCanvasElement> {
  const { width, height } = canvas
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Could not read the photo')
  const pixels = ctx.getImageData(0, 0, width, height)
  let transparent = false
  for (let i = 3; i < pixels.data.length; i += 4) {
    if (pixels.data[i]! < 255) {
      transparent = true
      break
    }
  }

  const out = document.createElement('canvas')
  out.width = Math.max(1, Math.round(width * factor))
  out.height = Math.max(1, Math.round(height * factor))
  const rgba = await runModel({ kind: 'upscale', rgba: pixels.data, width, height, factor }, onProgress)
  const outCtx = out.getContext('2d')
  if (!outCtx) throw new Error('Could not create the upscaled image')
  outCtx.putImageData(new ImageData(new Uint8ClampedArray(rgba), out.width, out.height), 0, 0)
  outCtx.imageSmoothingQuality = 'high'
  outCtx.globalAlpha = TEXTURE_MIX
  outCtx.drawImage(canvas, 0, 0, out.width, out.height)
  outCtx.globalAlpha = 1
  if (transparent) {
    // Keep only what was opaque: the original, smoothly scaled up, masks the result.
    outCtx.globalCompositeOperation = 'destination-in'
    outCtx.drawImage(canvas, 0, 0, out.width, out.height)
    outCtx.globalCompositeOperation = 'source-over'
  }
  return out
}
