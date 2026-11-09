/** @typedef {0 | 90 | 180 | 270} RotateDegrees */

/**
 * @param {number} value
 * @returns {RotateDegrees}
 */
export function normalizeCollageRotate(value) {
  const stepped = Math.round(value / 90) * 90
  const wrapped = ((stepped % 360) + 360) % 360
  if (wrapped === 90 || wrapped === 180 || wrapped === 270) return /** @type {RotateDegrees} */ (wrapped)
  return 0
}

/**
 * @param {number} rotate
 * @param {number} dx screen pixels
 * @param {number} dy screen pixels
 * @returns {[number, number]}
 */
export function screenPanDelta(rotate, dx, dy) {
  const r = normalizeCollageRotate(rotate)
  if (r === 90) return [dy, -dx]
  if (r === 180) return [-dx, -dy]
  if (r === 270) return [-dy, dx]
  return [dx, dy]
}

/**
 * Map a view-aligned crop window back to source-image pixels for `drawImage`.
 * @param {number} imageW
 * @param {number} imageH
 * @param {RotateDegrees} rotate
 * @param {number} lx logical left
 * @param {number} ly logical top
 * @param {number} viewW logical width
 * @param {number} viewH logical height
 */
function logicalToSource(imageW, imageH, rotate, lx, ly, viewW, viewH) {
  if (rotate === 90) {
    return { x: ly, y: imageH - lx - viewW, w: viewH, h: viewW }
  }
  if (rotate === 270) {
    return { x: imageW - ly - viewH, y: lx, w: viewH, h: viewW }
  }
  if (rotate === 180) {
    return { x: imageW - lx - viewW, y: imageH - ly - viewH, w: viewW, h: viewH }
  }
  return { x: lx, y: ly, w: viewW, h: viewH }
}

/**
 * Part of an image (in its pixels) that fills a box: cover-fit, zoom around focal point, optional clockwise rotate.
 * @param {number} imageW
 * @param {number} imageH
 * @param {number} boxW
 * @param {number} boxH
 * @param {{ x: number, y: number, zoom: number, rotate?: number }} framing
 */
export function coverWindow(imageW, imageH, boxW, boxH, framing) {
  const rotate = normalizeCollageRotate(framing.rotate ?? 0)
  const quarter = rotate === 90 || rotate === 270
  const fitW = quarter ? imageH : imageW
  const fitH = quarter ? imageW : imageH
  const scale = Math.max(boxW / fitW, boxH / fitH) * framing.zoom
  const viewW = boxW / scale
  const viewH = boxH / scale
  const lx = (fitW - viewW) * framing.x
  const ly = (fitH - viewH) * framing.y
  const src = logicalToSource(imageW, imageH, rotate, lx, ly, viewW, viewH)
  return { ...src, scale, rotate }
}

/** Visible size of the source image on screen after cover scale. */
export function coverDisplaySize(imageW, imageH, scale) {
  return { w: imageW * scale, h: imageH * scale }
}

/** Overflow past the box in view-aligned axes (for pan clamping). */
export function coverOverflow(imageW, imageH, boxW, boxH, framing) {
  const rotate = normalizeCollageRotate(framing.rotate ?? 0)
  const quarter = rotate === 90 || rotate === 270
  const fitW = quarter ? imageH : imageW
  const fitH = quarter ? imageW : imageH
  const win = coverWindow(imageW, imageH, boxW, boxH, framing)
  return {
    x: Math.max(0, fitW * win.scale - boxW),
    y: Math.max(0, fitH * win.scale - boxH),
    scale: win.scale,
  }
}
