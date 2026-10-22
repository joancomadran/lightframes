import type { LiquifyStroke } from '../types/edits'

/*
 * Liquify: push, bloat, pinch and twirl the photo with a brush.
 *
 * Strokes are replayed into a displacement field: a mesh over the photo
 * (GRID nodes along the long edge) where each node says where its pixel is
 * read from. A brush stamp resamples the field under the brush rather than
 * adding to it, so stamps compose: pushing an area that was already pushed
 * moves the warped pixels, not the original ones. The photo is then
 * resampled through the field (bilinear in both), at whatever size.
 *
 * Stroke points are where the brush was on the photo as it looked then,
 * which is the space the field is built in, so replaying them in order
 * rebuilds it exactly. While a stroke is being painted, the field from the
 * previous render is extended with the new points instead of rebuilt.
 */

const GRID = 512
/** Stamps along a segment are at most this fraction of the radius apart. */
const SPACING = 0.2
/** Per recorded point at full strength, for the modes that act while the brush is held. */
const BLOAT_RATE = 0.04
const TWIRL_RATE = 0.08
const RESTORE_RATE = 0.15

type Rect = { x0: number; y0: number; x1: number; y1: number }

export type LiquifyField = {
  /** Grid units across the photo's width and height (the long side is GRID). */
  ax: number
  ay: number
  /** Nodes per row and per column. */
  w: number
  h: number
  /** (dx, dy) per node, in grid units: the pixel at a node is read from node + (dx, dy). */
  data: Float32Array
  /** Nodes any stamp has touched (inclusive), or null while nothing has moved. */
  touched: Rect | null
}

function gridSize(width: number, height: number) {
  const long = Math.max(1, width, height)
  return { ax: (GRID * width) / long, ay: (GRID * height) / long }
}

function createField(width: number, height: number): LiquifyField {
  const { ax, ay } = gridSize(width, height)
  const w = Math.ceil(ax) + 1
  const h = Math.ceil(ay) + 1
  return { ax, ay, w, h, data: new Float32Array(w * h * 2), touched: null }
}

/** Bilinear (dx, dy) of a two-channel grid at (x, y), clamped to it; written to `at`. */
const at = { x: 0, y: 0 }
function bilerp(data: Float32Array, w: number, h: number, x: number, y: number): void {
  const fx = x < 0 ? 0 : x > w - 1 ? w - 1 : x
  const fy = y < 0 ? 0 : y > h - 1 ? h - 1 : y
  const x0 = Math.floor(fx)
  const y0 = Math.floor(fy)
  const x1 = x0 < w - 1 ? x0 + 1 : x0
  const y1 = y0 < h - 1 ? y0 + 1 : y0
  const tx = fx - x0
  const ty = fy - y0
  const a = (y0 * w + x0) * 2
  const b = (y0 * w + x1) * 2
  const c = (y1 * w + x0) * 2
  const d = (y1 * w + x1) * 2
  const topX = data[a]! + (data[b]! - data[a]!) * tx
  const topY = data[a + 1]! + (data[b + 1]! - data[a + 1]!) * tx
  const bottomX = data[c]! + (data[d]! - data[c]!) * tx
  const bottomY = data[c + 1]! + (data[d + 1]! - data[c + 1]!) * tx
  at.x = topX + (bottomX - topX) * ty
  at.y = topY + (bottomY - topY) * ty
}

function touch(f: LiquifyField, x0: number, y0: number, x1: number, y1: number): void {
  const t = f.touched
  f.touched = t
    ? { x0: Math.min(t.x0, x0), y0: Math.min(t.y0, y0), x1: Math.max(t.x1, x1), y1: Math.max(t.y1, y1) }
    : { x0, y0, x1, y1 }
}

/** Nodes within `r` of (cx, cy), or null when the brush is off the mesh. */
function brushNodes(f: LiquifyField, cx: number, cy: number, r: number): Rect | null {
  const x0 = Math.max(0, Math.ceil(cx - r))
  const y0 = Math.max(0, Math.ceil(cy - r))
  const x1 = Math.min(f.w - 1, Math.floor(cx + r))
  const y1 = Math.min(f.h - 1, Math.floor(cy + r))
  return x0 <= x1 && y0 <= y1 ? { x0, y0, x1, y1 } : null
}

/**
 * One brush stamp at (cx, cy), radius `r` (grid units). Under the brush, with
 * weight w falling smoothly from 1 at the centre to 0 at the edge, the photo
 * moves by `w·v`, scales about the centre by `1 + w·grow` and turns clockwise
 * by `w·turn` radians.
 */
function stamp(
  f: LiquifyField,
  cx: number,
  cy: number,
  r: number,
  vx: number,
  vy: number,
  grow: number,
  turn: number,
): void {
  const nodes = brushNodes(f, cx, cy, r)
  if (!nodes) return
  // Every node reads the field as it was before this stamp: copy the part it can reach.
  const reach = Math.ceil(Math.hypot(vx, vy) + r * (Math.abs(grow) + Math.abs(turn))) + 2
  const sx0 = Math.max(0, nodes.x0 - reach)
  const sy0 = Math.max(0, nodes.y0 - reach)
  const sx1 = Math.min(f.w - 1, nodes.x1 + reach)
  const sy1 = Math.min(f.h - 1, nodes.y1 + reach)
  const sw = sx1 - sx0 + 1
  const sh = sy1 - sy0 + 1
  const before = new Float32Array(sw * sh * 2)
  for (let y = sy0; y <= sy1; y++) {
    before.set(f.data.subarray((y * f.w + sx0) * 2, (y * f.w + sx1 + 1) * 2), (y - sy0) * sw * 2)
  }

  const r2 = r * r
  for (let y = nodes.y0; y <= nodes.y1; y++) {
    const dy = y - cy
    for (let x = nodes.x0; x <= nodes.x1; x++) {
      const dx = x - cx
      const d2 = dx * dx + dy * dy
      if (d2 >= r2) continue
      const t = 1 - d2 / r2
      const w = t * t
      // Where this node's pixel comes from now: the inverse of the motion, about the centre.
      let qx = dx
      let qy = dy
      if (turn !== 0) {
        const cos = Math.cos(-turn * w)
        const sin = Math.sin(-turn * w)
        qx = cos * dx - sin * dy
        qy = sin * dx + cos * dy
      }
      const scale = 1 / (1 + grow * w)
      qx = cx + qx * scale - w * vx
      qy = cy + qy * scale - w * vy
      bilerp(before, sw, sh, qx - sx0, qy - sy0)
      const o = (y * f.w + x) * 2
      f.data[o] = qx - x + at.x
      f.data[o + 1] = qy - y + at.y
    }
  }
  touch(f, nodes.x0, nodes.y0, nodes.x1, nodes.y1)
}

/** Ease the field under the brush back towards no displacement. */
function restore(f: LiquifyField, cx: number, cy: number, r: number, amount: number): void {
  const nodes = brushNodes(f, cx, cy, r)
  if (!nodes) return
  const r2 = r * r
  for (let y = nodes.y0; y <= nodes.y1; y++) {
    for (let x = nodes.x0; x <= nodes.x1; x++) {
      const d2 = (x - cx) ** 2 + (y - cy) ** 2
      if (d2 >= r2) continue
      const t = 1 - d2 / r2
      const keep = 1 - amount * t * t
      const o = (y * f.w + x) * 2
      f.data[o] = f.data[o]! * keep
      f.data[o + 1] = f.data[o + 1]! * keep
    }
  }
}

/** Apply point `i` of a stroke: the segment from the previous point, in stamps no more than SPACING radii apart. */
function applyPoint(f: LiquifyField, stroke: LiquifyStroke, i: number): void {
  const { points, mode, strength } = stroke
  const r = Math.max(1, stroke.size * GRID)
  const x = points[i * 2]! * f.ax
  const y = points[i * 2 + 1]! * f.ay
  const px = i > 0 ? points[i * 2 - 2]! * f.ax : x
  const py = i > 0 ? points[i * 2 - 1]! * f.ay : y
  const n = Math.max(1, Math.ceil(Math.hypot(x - px, y - py) / (r * SPACING)))
  if (mode === 'push') {
    // Pushing needs motion: a point only says where the brush went from the previous one.
    if (i === 0) return
    const vx = ((x - px) / n) * strength
    const vy = ((y - py) / n) * strength
    for (let k = 1; k <= n; k++) stamp(f, px + ((x - px) * k) / n, py + ((y - py) * k) / n, r, vx, vy, 0, 0)
    return
  }
  // The other modes act once per point, shared out along the segment so moving doesn't add up.
  const amount = strength / n
  for (let k = 1; k <= n; k++) {
    const cx = px + ((x - px) * k) / n
    const cy = py + ((y - py) * k) / n
    if (mode === 'bloat') stamp(f, cx, cy, r, 0, 0, BLOAT_RATE * amount, 0)
    else if (mode === 'pinch') stamp(f, cx, cy, r, 0, 0, -BLOAT_RATE * amount, 0)
    else if (mode === 'twirl') stamp(f, cx, cy, r, 0, 0, 0, TWIRL_RATE * amount)
    else if (mode === 'twirlLeft') stamp(f, cx, cy, r, 0, 0, 0, -TWIRL_RATE * amount)
    else restore(f, cx, cy, r, Math.min(1, RESTORE_RATE * amount))
  }
}

/* ——— Building the field, extending the last one while a stroke grows ——— */

type Entry = {
  field: LiquifyField
  /** Each stroke replayed so far and how many of its points. */
  applied: { stroke: LiquifyStroke; count: number }[]
}

const MAX_ENTRIES = 4
/** Most recently used last. */
const entries: Entry[] = []

/** Whether `entry` is an earlier state of `strokes`: same strokes, only the last one shorter, or fewer of them. */
function leadsTo(entry: Entry, strokes: LiquifyStroke[]): boolean {
  const { applied } = entry
  if (applied.length > strokes.length) return false
  for (let i = 0; i < applied.length; i++) {
    const done = applied[i]!
    const next = strokes[i]!
    const count = Math.floor(next.points.length / 2)
    if (
      done.stroke.mode !== next.mode ||
      done.stroke.size !== next.size ||
      done.stroke.strength !== next.strength ||
      count < done.count ||
      (count > done.count && i < applied.length - 1)
    ) {
      return false
    }
    if (done.stroke.points === next.points) continue
    for (let k = 0; k < done.count * 2; k++) if (done.stroke.points[k] !== next.points[k]) return false
  }
  return true
}

function catchUp(entry: Entry, strokes: LiquifyStroke[]): void {
  strokes.forEach((stroke, i) => {
    const count = Math.floor(stroke.points.length / 2)
    for (let k = entry.applied[i]?.count ?? 0; k < count; k++) applyPoint(entry.field, stroke, k)
    entry.applied[i] = { stroke, count }
  })
}

/**
 * The displacement field for `strokes` over a `width`×`height` photo (only
 * its shape matters), or null when there are none. The field may be updated
 * in place by a later call that extends the same strokes.
 */
export function liquifyField(strokes: LiquifyStroke[], width: number, height: number): LiquifyField | null {
  if (strokes.length === 0) return null
  const { ax, ay } = gridSize(width, height)
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i]!
    // A RAW's preview and full decode can differ by a pixel: same field.
    if (Math.abs(entry.field.ax - ax) > 0.5 || Math.abs(entry.field.ay - ay) > 0.5) continue
    if (!leadsTo(entry, strokes)) continue
    entries.splice(i, 1)
    // A new stroke starts: keep the field as it was before it, so undoing it doesn't replay everything.
    if (strokes.length > entry.applied.length && entry.applied.length > 0) {
      entries.push({
        field: { ...entry.field, data: entry.field.data.slice(), touched: entry.field.touched && { ...entry.field.touched } },
        applied: [...entry.applied],
      })
    }
    catchUp(entry, strokes)
    entries.push(entry)
    if (entries.length > MAX_ENTRIES) entries.shift()
    return entry.field
  }
  const entry: Entry = { field: createField(width, height), applied: [] }
  catchUp(entry, strokes)
  entries.push(entry)
  if (entries.length > MAX_ENTRIES) entries.shift()
  return entry.field
}

/** Stable cache key for a list of strokes. */
export function liquifyKey(strokes: LiquifyStroke[]): string {
  return strokes.length === 0 ? '' : JSON.stringify(strokes)
}

/* ——— Resampling pixels through the field ——— */

/** Interleaved pixels to warp; every channel moves, alpha included. */
export type WarpImage<T extends Uint8ClampedArray | Uint16Array = Uint8ClampedArray | Uint16Array> = {
  data: T
  /** Size of the buffer. */
  width: number
  height: number
  stride: number
  /** Where the buffer sits in the full image, when it holds only a window of it. */
  left?: number
  top?: number
  fullWidth?: number
  fullHeight?: number
}

/**
 * Pixels of a `width`×`height` image the field moves, and the window they are
 * read from: what callers need to touch only part of a large image.
 */
export function liquifyArea(field: LiquifyField, width: number, height: number): { moved: Rect; read: Rect } | null {
  const t = field.touched
  if (!t) return null
  const px = width / field.ax
  const py = height / field.ay
  let reachX = 0
  let reachY = 0
  for (let y = t.y0; y <= t.y1; y++) {
    for (let x = t.x0; x <= t.x1; x++) {
      const o = (y * field.w + x) * 2
      reachX = Math.max(reachX, Math.abs(field.data[o]!))
      reachY = Math.max(reachY, Math.abs(field.data[o + 1]!))
    }
  }
  if (reachX === 0 && reachY === 0) return null
  // Interpolation spreads a touched node's displacement up to one cell beyond it.
  const moved = {
    x0: Math.max(0, Math.floor((t.x0 - 1) * px)),
    y0: Math.max(0, Math.floor((t.y0 - 1) * py)),
    x1: Math.min(width, Math.ceil((t.x1 + 1) * px)),
    y1: Math.min(height, Math.ceil((t.y1 + 1) * py)),
  }
  const read = {
    x0: Math.max(0, Math.floor(moved.x0 - reachX * px) - 1),
    y0: Math.max(0, Math.floor(moved.y0 - reachY * py) - 1),
    x1: Math.min(width, Math.ceil(moved.x1 + reachX * px) + 1),
    y1: Math.min(height, Math.ceil(moved.y1 + reachY * py) + 1),
  }
  return { moved, read }
}

/** A warped copy of `img`: pixels inside `rect` (full-image pixels) resampled through the field, the rest as they were. */
export function warpPixels<T extends Uint8ClampedArray | Uint16Array>(
  img: WarpImage<T>,
  field: LiquifyField,
  rect: Rect,
): T {
  const { data, width, height, stride } = img
  const left = img.left ?? 0
  const top = img.top ?? 0
  const fullWidth = img.fullWidth ?? width
  const fullHeight = img.fullHeight ?? height
  const out = data.slice() as T
  // Clamped arrays round on their own; the others truncate.
  const round = data instanceof Uint8ClampedArray ? 0 : 0.5
  const gx = field.ax / fullWidth
  const gy = field.ay / fullHeight
  const x0 = Math.max(rect.x0, left)
  const y0 = Math.max(rect.y0, top)
  const x1 = Math.min(rect.x1, left + width)
  const y1 = Math.min(rect.y1, top + height)
  const maxX = width - 1
  const maxY = height - 1
  for (let y = y0; y < y1; y++) {
    const fy = (y + 0.5) * gy
    for (let x = x0; x < x1; x++) {
      bilerp(field.data, field.w, field.h, (x + 0.5) * gx, fy)
      if (at.x === 0 && at.y === 0) continue
      const sx = Math.min(maxX, Math.max(0, x - left + at.x / gx))
      const sy = Math.min(maxY, Math.max(0, y - top + at.y / gy))
      const ix = Math.floor(sx)
      const iy = Math.floor(sy)
      const jx = ix < maxX ? ix + 1 : ix
      const jy = iy < maxY ? iy + 1 : iy
      const tx = sx - ix
      const ty = sy - iy
      const a = (iy * width + ix) * stride
      const b = (iy * width + jx) * stride
      const c = (jy * width + ix) * stride
      const d = (jy * width + jx) * stride
      const o = ((y - top) * width + (x - left)) * stride
      for (let ch = 0; ch < stride; ch++) {
        const upper = data[a + ch]! + (data[b + ch]! - data[a + ch]!) * tx
        const lower = data[c + ch]! + (data[d + ch]! - data[c + ch]!) * tx
        out[o + ch] = upper + (lower - upper) * ty + round
      }
    }
  }
  return out
}

/* ——— Points: liquified photo ↔ source ——— */

/** The source point (0–1) that the liquified photo shows at (x, y) (0–1). */
export function liquifyToSource(field: LiquifyField, x: number, y: number): { x: number; y: number } {
  bilerp(field.data, field.w, field.h, x * field.ax, y * field.ay)
  return { x: x + at.x / field.ax, y: y + at.y / field.ay }
}

/** Where the liquified photo shows the source point (x, y): liquifyToSource undone by fixed-point iteration. */
export function liquifyFromSource(field: LiquifyField, x: number, y: number): { x: number; y: number } {
  let px = x
  let py = y
  for (let i = 0; i < 12; i++) {
    bilerp(field.data, field.w, field.h, px * field.ax, py * field.ay)
    px = x - at.x / field.ax
    py = y - at.y / field.ay
  }
  return { x: px, y: py }
}
