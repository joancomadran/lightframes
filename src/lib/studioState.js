import { normalizeCollageRotate } from './collageCover.js'

/**
 * Collage and carousel layout stored with the local editor session.
 * This object is JSON kept in IndexedDB on the device. It is not sent anywhere.
 */

/**
 * @param {unknown} value
 * @param {number} fallback
 */
function finite(value, fallback) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

/**
 * @param {unknown} value
 * @param {string} fallback
 */
function text(value, fallback) {
  return typeof value === 'string' && value ? value : fallback
}

/**
 * @param {unknown} cell
 */
function packCell(cell) {
  if (!cell || typeof cell !== 'object') {
    return { photoId: null, x: 0.5, y: 0.5, zoom: 1, rotate: 0 }
  }
  const item = /** @type {Record<string, unknown>} */ (cell)
  return {
    photoId: typeof item.photoId === 'string' ? item.photoId : null,
    x: finite(item.x, 0.5),
    y: finite(item.y, 0.5),
    zoom: finite(item.zoom, 1),
    rotate: normalizeCollageRotate(finite(item.rotate, 0)),
  }
}

/**
 * @param {unknown} raw
 */
function packCollage(raw) {
  if (!raw || typeof raw !== 'object') return null
  const doc = /** @type {Record<string, unknown>} */ (raw)
  if (!Array.isArray(doc.slides)) return null
  const border = doc.border && typeof doc.border === 'object' ? /** @type {Record<string, unknown>} */ (doc.border) : {}
  return {
    aspect: text(doc.aspect, '4:5'),
    border: {
      enabled: Boolean(border.enabled),
      size: finite(border.size, 0.015),
      color: text(border.color, '#ffffff'),
      outer: Boolean(border.outer),
    },
    slides: doc.slides.map((slide, index) => {
      const item = slide && typeof slide === 'object' ? /** @type {Record<string, unknown>} */ (slide) : {}
      return {
        id: text(item.id, `slide-${index}`),
        layoutId: text(item.layoutId, 'single'),
        cells: Array.isArray(item.cells) ? item.cells.map(packCell) : [],
      }
    }),
  }
}

/**
 * @param {unknown} frame
 * @param {number} index
 */
function packFrame(frame, index) {
  const item = frame && typeof frame === 'object' ? /** @type {Record<string, unknown>} */ (frame) : {}
  return {
    id: text(item.id, `frame-${index}`),
    photoId: text(item.photoId, ''),
    x: finite(item.x, 0),
    y: finite(item.y, 0),
    w: finite(item.w, 1),
    h: finite(item.h, 1),
    fx: finite(item.fx, 0.5),
    fy: finite(item.fy, 0.5),
    zoom: finite(item.zoom, 1),
    rotate: normalizeCollageRotate(finite(item.rotate, 0)),
  }
}

/**
 * @param {unknown} raw
 */
function packCarousel(raw) {
  if (!raw || typeof raw !== 'object') return null
  const doc = /** @type {Record<string, unknown>} */ (raw)
  if (!Array.isArray(doc.frames)) return null
  return {
    aspect: text(doc.aspect, '4:5'),
    slideCount: Math.round(finite(doc.slideCount, 2)),
    background: text(doc.background, '#ffffff'),
    frames: doc.frames.map(packFrame),
    pool: Array.isArray(doc.pool) ? doc.pool.filter((id) => typeof id === 'string') : [],
  }
}

/**
 * @param {unknown} raw
 */
export function packStudioState(raw) {
  const state = raw && typeof raw === 'object' ? /** @type {Record<string, unknown>} */ (raw) : {}
  return {
    format: state.format === 'carousel' ? 'carousel' : 'collage',
    collage: packCollage(state.collage),
    carousel: packCarousel(state.carousel),
  }
}

/**
 * Restore a studio snapshot. Anything that is not a layout object is ignored.
 * @param {unknown} raw
 */
export function unpackStudioState(raw) {
  if (!raw || typeof raw !== 'object') return null
  return packStudioState(raw)
}
