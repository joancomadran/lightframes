/** Browser canvas caps (Safari ~16k edge, ~268M px area). */
export const MAX_CANVAS_EDGE = 16384
export const MAX_CANVAS_AREA = 268_435_456

/**
 * @param {number} width
 * @param {number} height
 */
export function clampCanvasSize(width, height) {
  let w = Math.max(1, Math.round(width))
  let h = Math.max(1, Math.round(height))
  const requestedWidth = w
  const requestedHeight = h
  let clamped = false

  if (w > MAX_CANVAS_EDGE) {
    h = Math.max(1, Math.round(h * (MAX_CANVAS_EDGE / w)))
    w = MAX_CANVAS_EDGE
    clamped = true
  }
  if (h > MAX_CANVAS_EDGE) {
    w = Math.max(1, Math.round(w * (MAX_CANVAS_EDGE / h)))
    h = MAX_CANVAS_EDGE
    clamped = true
  }
  if (w * h > MAX_CANVAS_AREA) {
    const scale = Math.sqrt(MAX_CANVAS_AREA / (w * h))
    w = Math.max(1, Math.floor(w * scale))
    h = Math.max(1, Math.floor(h * scale))
    clamped = true
  }

  return { width: w, height: h, clamped, requestedWidth, requestedHeight }
}
