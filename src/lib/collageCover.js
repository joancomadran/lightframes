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

/** Local draw size inside a rotated context so the axis-aligned cell is fully covered. */
export function cellDrawSize(boxW, boxH, rotate) {
  const r = normalizeCollageRotate(rotate)
  const quarter = r === 90 || r === 270
  return { localW: quarter ? boxH : boxW, localH: quarter ? boxW : boxH }
}

/**
 * Map a device-space point inside a cell to source-image coordinates after rotated cover-fit.
 * @returns {{ x: number, y: number } | null}
 */
export function deviceToSource(deviceX, deviceY, boxW, boxH, framing, imageW, imageH) {
  const rot = normalizeCollageRotate(framing.rotate ?? 0)
  const rad = (rot * Math.PI) / 180
  const { localW, localH } = cellDrawSize(boxW, boxH, rot)
  const win = coverWindow(imageW, imageH, boxW, boxH, framing)
  const lx = deviceX - boxW / 2
  const ly = deviceY - boxH / 2
  const cos = Math.cos(-rad)
  const sin = Math.sin(-rad)
  const rx = lx * cos - ly * sin
  const ry = lx * sin + ly * cos
  let u = (rx + localW / 2) / localW
  let v = (ry + localH / 2) / localH
  if (u < -1e-6 || u > 1 + 1e-6 || v < -1e-6 || v > 1 + 1e-6) return null
  u = Math.min(1, Math.max(0, u))
  v = Math.min(1, Math.max(0, v))
  return { x: win.x + u * win.w, y: win.y + v * win.h }
}

/** Sample points on the cell boundary and centre edges; all must hit the image for full cover. */
export function rotatedCoverSamples(boxW, boxH, framing, imageW, imageH) {
  const pts = [
    [0, 0],
    [boxW - 1, 0],
    [boxW - 1, boxH - 1],
    [0, boxH - 1],
    [Math.floor(boxW / 2), 0],
    [boxW - 1, Math.floor(boxH / 2)],
    [Math.floor(boxW / 2), boxH - 1],
    [0, Math.floor(boxH / 2)],
  ]
  return pts.map(([x, y]) => ({ x, y, src: deviceToSource(x, y, boxW, boxH, framing, imageW, imageH) }))
}

/**
 * Draw a photo with rotated cover-fit into a collage cell (preview + export).
 * @param {CanvasRenderingContext2D} ctx
 * @param {CanvasImageSource} image
 */
export function drawRotatedCoverCell(ctx, image, x0, y0, w, h, framing) {
  const rot = normalizeCollageRotate(framing.rotate ?? 0)
  const win = coverWindow(image.width, image.height, w, h, framing)
  const { localW, localH } = cellDrawSize(w, h, rot)
  ctx.save()
  ctx.beginPath()
  ctx.rect(x0, y0, w, h)
  ctx.clip()
  ctx.translate(x0 + w / 2, y0 + h / 2)
  ctx.rotate((rot * Math.PI) / 180)
  ctx.drawImage(image, win.x, win.y, win.w, win.h, -localW / 2, -localH / 2, localW, localH)
  ctx.restore()
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
