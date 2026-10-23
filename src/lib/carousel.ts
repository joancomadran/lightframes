import {
  COLLAGE_ASPECTS,
  aspectById,
  canvasToBlob,
  coverWindow,
  developForBox,
  type CollageAspectId,
  type CollageRenderPhoto,
} from './collage'
import { uid } from './uid'

/**
 * A photo placed on the carousel strip. Position and size are in slides:
 * `x`/`w` in slide widths (0 … slideCount), `y`/`h` in slide heights (0 … 1),
 * so a frame may straddle the cut between two slides.
 */
export type CarouselFrame = {
  id: string
  photoId: string
  x: number
  y: number
  w: number
  h: number
  /** Framing inside the box: focal point (0–1) and zoom. */
  fx: number
  fy: number
  zoom: number
}

export type CarouselDoc = {
  aspect: CollageAspectId
  slideCount: number
  background: string
  /** Bottom to top. */
  frames: CarouselFrame[]
  /** The carousel's photos, kept when a layout shows only some of them (a panorama shows one). */
  pool: string[]
}

export const MIN_CAROUSEL_SLIDES = 2
export const MAX_CAROUSEL_SLIDES = 10

/** Instagram feed sizes only: a seamless carousel lives in the feed, not in stories. */
const CAROUSEL_ASPECT_IDS: readonly string[] = ['4:5', '1:1', '3:4']
export const CAROUSEL_ASPECTS = COLLAGE_ASPECTS.filter((a) => CAROUSEL_ASPECT_IDS.includes(a.id))

export function createFrame(photoId: string, x: number, y: number, w: number, h: number): CarouselFrame {
  return { id: uid(), photoId, x, y, w, h, fx: 0.5, fy: 0.5, zoom: 1 }
}

export type CarouselTemplateId =
  | 'panorama'
  | 'framed'
  | 'bridges'
  | 'staggered'
  | 'row'
  | 'columns'
  | 'grid'
  | 'hero'
  | 'cover'
  | 'scattered'
  | 'per-slide'

export const CAROUSEL_TEMPLATES: { id: CarouselTemplateId; label: string; hint: string }[] = [
  { id: 'panorama', label: 'Panorama', hint: 'One photo across every slide' },
  { id: 'framed', label: 'Framed', hint: 'A panorama with a margin around it' },
  { id: 'bridges', label: 'Bridges', hint: 'A photo over every cut, high and low' },
  { id: 'staggered', label: 'Staggered', hint: 'Photos zig-zagging across the cuts' },
  { id: 'row', label: 'Row', hint: 'Photos side by side, centred' },
  { id: 'columns', label: 'Columns', hint: 'Full-height strips that ignore the cuts' },
  { id: 'grid', label: 'Grid', hint: 'Two rows running across the strip' },
  { id: 'hero', label: 'Hero', hint: 'One big photo over the first cut, a grid after it' },
  { id: 'cover', label: 'Cover', hint: 'A full first slide, then a row' },
  { id: 'scattered', label: 'Scattered', hint: 'Loose prints, some overlapping the cuts' },
  { id: 'per-slide', label: 'Per slide', hint: 'A full-bleed photo on each slide' },
]

/**
 * A grid of `count` cells filling x0…x1 (slide widths) and the full height, with
 * gutters `gx` that look equally wide across and down (`ratio` = slide width / height).
 * A short last column shares out the height, so there is never an empty hole.
 */
function gridCells(count: number, rows: number, x0: number, x1: number, gx: number, ratio: number) {
  const gy = gx * ratio
  const cols = Math.ceil(count / rows)
  const w = (x1 - x0 - gx * (cols + 1)) / cols
  return Array.from({ length: count }, (_, i) => {
    const col = Math.floor(i / rows)
    const row = i % rows
    const inCol = Math.min(rows, count - col * rows)
    const h = (1 - gy * (inCol + 1)) / inCol
    return { x: x0 + gx + col * (w + gx), y: gy + row * (h + gy), w, h }
  })
}

/** Lay the given photos out on a strip of `slideCount` slides (`ratio` = slide width / height). */
export function templateFrames(
  id: CarouselTemplateId,
  photoIds: string[],
  slideCount: number,
  ratio: number,
): CarouselFrame[] {
  const n = slideCount
  const m = photoIds.length
  if (m === 0) return []
  const place = (cells: { x: number; y: number; w: number; h: number }[], ids = photoIds) =>
    cells.map((c, i) => createFrame(ids[i]!, c.x, c.y, c.w, c.h))

  switch (id) {
    case 'panorama':
      return [createFrame(photoIds[0]!, 0, 0, n, 1)]
    case 'framed': {
      const gx = 0.06
      return [createFrame(photoIds[0]!, gx, gx * ratio, n - 2 * gx, 1 - 2 * gx * ratio)]
    }
    case 'per-slide':
      return photoIds.slice(0, n).map((photoId, k) => createFrame(photoId, k, 0, 1, 1))
    case 'bridges':
      // One photo across every cut, alternating high and low.
      return photoIds.slice(0, n - 1).map((photoId, i) => {
        const w = 0.92
        const h = 0.72
        return createFrame(photoId, i + 1 - w / 2, i % 2 === 0 ? 0.08 : 0.2, w, h)
      })
    case 'staggered': {
      // Evenly spaced from margin to margin, alternating top and bottom; neighbours may overlap.
      const c = Math.min(m, n * 2)
      const w = Math.min(0.8, (n * 1.25) / c)
      const h = 0.56
      const margin = 0.08
      const step = c > 1 ? (n - 2 * margin - w) / (c - 1) : 0
      return photoIds.slice(0, c).map((photoId, i) => {
        const x = c > 1 ? margin + i * step : (n - w) / 2
        return createFrame(photoId, x, i % 2 === 0 ? 0.06 : 1 - h - 0.06, w, h)
      })
    }
    case 'row': {
      const c = Math.min(m, n * 2)
      const gap = 0.06
      const w = (n - gap * (c + 1)) / c
      // Portrait-ish frames (4:5) unless that would not fit the height.
      const h = Math.min(0.84, w * 1.25 * ratio)
      return photoIds.slice(0, c).map((photoId, i) => createFrame(photoId, gap + i * (w + gap), (1 - h) / 2, w, h))
    }
    case 'columns': {
      // A count that doesn't match the slides puts cuts inside photos, which is the point.
      const c = Math.min(m, n * 2)
      return place(gridCells(c, 1, 0, n, 0.03, ratio))
    }
    case 'grid': {
      const c = Math.min(m, n * 4)
      return place(gridCells(c, c > 1 ? 2 : 1, 0, n, 0.04, ratio))
    }
    case 'hero': {
      const heroW = Math.min(1.5, n - 0.5)
      const hero = createFrame(photoIds[0]!, 0, 0, heroW, 1)
      const rest = photoIds.slice(1, 1 + Math.max(0, Math.floor((n - heroW) * 4)))
      if (rest.length === 0) return [hero]
      return [hero, ...place(gridCells(rest.length, rest.length > 1 ? 2 : 1, heroW, n, 0.05, ratio), rest)]
    }
    case 'cover': {
      const cover = createFrame(photoIds[0]!, 0, 0, 1, 1)
      const rest = photoIds.slice(1, 1 + (n - 1) * 2)
      if (rest.length === 0) return [cover]
      const gap = 0.06
      const w = (n - 1 - gap * (rest.length + 1)) / rest.length
      const h = Math.min(0.8, w * 1.25 * ratio)
      return [cover, ...rest.map((photoId, i) => createFrame(photoId, 1 + gap + i * (w + gap), (1 - h) / 2, w, h))]
    }
    case 'scattered': {
      // Prints of a few sizes at fixed offsets, so the layout is the same every time.
      const c = Math.min(m, n * 2)
      const sizes = [0.8, 0.66, 0.74, 0.62]
      const offsets = [-0.12, 0.1, -0.03, 0.14]
      return photoIds.slice(0, c).map((photoId, i) => {
        const w = sizes[i % sizes.length]! * Math.min(1, (n * 1.4) / c)
        const h = Math.min(0.76, w * 1.2 * ratio)
        const cx = ((i + 0.5) * n) / c
        const y = Math.min(1 - h - 0.04, Math.max(0.04, 0.5 - h / 2 + offsets[i % offsets.length]!))
        const x = Math.min(n - w - 0.05, Math.max(0.05, cx - w / 2))
        return createFrame(photoId, x, y, w, h)
      })
    }
  }
}

export function createCarouselDoc(photoIds: string[], aspect: CollageAspectId): CarouselDoc {
  const feedAspect = CAROUSEL_ASPECTS.some((a) => a.id === aspect) ? aspect : '4:5'
  const { width, height } = aspectById(feedAspect)
  const single = photoIds.length <= 1
  const slideCount = single
    ? 3
    : Math.min(MAX_CAROUSEL_SLIDES, Math.max(MIN_CAROUSEL_SLIDES, photoIds.length + 1))
  return {
    aspect: feedAspect,
    slideCount,
    background: '#ffffff',
    frames: templateFrames(single ? 'panorama' : 'bridges', photoIds, slideCount, width / height),
    pool: photoIds,
  }
}

/** Photos for a layout: those on the strip in reading order (left to right), then the rest of the pool. */
export function carouselPhotos(doc: CarouselDoc): string[] {
  const sorted = [...doc.frames].sort((a, b) => a.x + a.w / 2 - (b.x + b.w / 2))
  return [...new Set([...sorted.map((f) => f.photoId), ...doc.pool])]
}

export type CarouselRenderOptions = {
  doc: CarouselDoc
  getPhoto: (photoId: string) => Promise<CollageRenderPhoto | null>
  /** Called after each photo is developed and after each slide is encoded. */
  onProgress?: (step: number, total: number) => void
  mime?: string
  quality?: number
}

/** Render the strip and cut it into one image per slide, at Instagram's full size. */
export async function renderCarousel({
  doc,
  getPhoto,
  onProgress,
  mime = 'image/jpeg',
  quality = 0.92,
}: CarouselRenderOptions): Promise<Blob[]> {
  const { width, height } = aspectById(doc.aspect)
  const total = doc.frames.length + doc.slideCount
  let step = 0

  // Develop every photo once at the size its frame needs; the slides then just crop from these.
  // Grouped by photo so a loader that keeps only the latest full-size source decodes each one once.
  const tiles = new Map<string, HTMLCanvasElement>()
  const byPhoto = [...doc.frames].sort((a, b) => a.photoId.localeCompare(b.photoId))
  for (const frame of byPhoto) {
    const item = await getPhoto(frame.photoId)
    const tile = item ? await developForBox(item, frame.w * width, frame.h * height, frame.zoom) : null
    if (tile) tiles.set(frame.id, tile)
    onProgress?.(++step, total)
  }

  const blobs: Blob[] = []
  for (let k = 0; k < doc.slideCount; k++) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not create carousel canvas')
    ctx.fillStyle = doc.background
    ctx.fillRect(0, 0, width, height)
    ctx.imageSmoothingQuality = 'high'
    for (const frame of doc.frames) {
      const tile = tiles.get(frame.id)
      if (!tile) continue
      // Same strip geometry on every slide, shifted by whole slide widths, so the cuts line up exactly.
      const x = (frame.x - k) * width
      const w = frame.w * width
      if (x + w <= 0 || x >= width) continue
      const y = frame.y * height
      const h = frame.h * height
      const win = coverWindow(tile.width, tile.height, w, h, { x: frame.fx, y: frame.fy, zoom: frame.zoom })
      ctx.drawImage(tile, win.x, win.y, win.w, win.h, x, y, w, h)
    }
    blobs.push(await canvasToBlob(canvas, mime, quality))
    onProgress?.(++step, total)
  }
  return blobs
}
