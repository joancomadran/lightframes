import { cellDrawSize } from './collageCover.js'
import { paintCollageCell } from './collageExportPaint.js'

/**
 * Develop size for a carousel frame so a quarter-turn still covers the box.
 * @param {{ w: number, h: number, rotate?: number }} frame
 * @param {number} slideW
 * @param {number} slideH
 */
export function carouselFrameDrawSize(frame, slideW, slideH) {
  return cellDrawSize(frame.w * slideW, frame.h * slideH, frame.rotate ?? 0)
}

/**
 * Paint one carousel slide. Frames use the same rotated cover as collage cells.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width slide width in px
 * @param {number} height slide height in px
 * @param {Array<{ id: string, x: number, y: number, w: number, h: number, fx: number, fy: number, zoom: number, rotate?: number }>} frames
 * @param {number} slideIndex
 * @param {(frame: { id: string, x: number, y: number, w: number, h: number, fx: number, fy: number, zoom: number, rotate?: number }) => CanvasImageSource | null} tileForFrame
 */
export function paintCarouselSlide(ctx, width, height, frames, slideIndex, tileForFrame) {
  for (const frame of frames) {
    const tile = tileForFrame(frame)
    if (!tile) continue
    const x = (frame.x - slideIndex) * width
    const w = frame.w * width
    if (x + w <= 0 || x >= width) continue
    const y = frame.y * height
    const h = frame.h * height
    paintCollageCell(ctx, tile, x, y, w, h, {
      x: frame.fx,
      y: frame.fy,
      zoom: frame.zoom,
      rotate: frame.rotate ?? 0,
    })
  }
}
