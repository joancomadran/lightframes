import type { EditParams, PhotoSession } from '../types/edits'
import { prepareBase, type RenderSource } from './imageProcessing'
import { developBase } from './renderPipeline'
import { uid } from './uid'

/** A cell of a layout, in fractions of the slide (x, y, width, height). */
export type CellRect = [number, number, number, number]

export type CollageLayout = {
  id: string
  label: string
  cells: CellRect[]
}

const T = 1 / 3

/** `cols` × `rows` equal cells inside x, y, w, h, in reading order (the order photos fill them). */
function grid(cols: number, rows: number, x = 0, y = 0, w = 1, h = 1): CellRect[] {
  const cells: CellRect[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) cells.push([x + (c * w) / cols, y + (r * h) / rows, w / cols, h / rows])
  }
  return cells
}

/** `count` equal columns (or rows) inside a band. */
const cols = (count: number, y = 0, h = 1, x = 0, w = 1) => grid(count, 1, x, y, w, h)
const rows = (count: number, x = 0, w = 1, y = 0, h = 1) => grid(1, count, x, y, w, h)

/** Layout templates grouped by how many photos they hold. */
export const COLLAGE_LAYOUTS: Record<number, CollageLayout[]> = {
  1: [{ id: 'single', label: 'Single', cells: [[0, 0, 1, 1]] }],
  2: [
    { id: 'cols-2', label: 'Side by side', cells: cols(2) },
    { id: 'rows-2', label: 'Stacked', cells: rows(2) },
    { id: 'left-wide-2', label: 'Wide left', cells: [[0, 0, 2 * T, 1], [2 * T, 0, T, 1]] },
    { id: 'top-tall-2', label: 'Tall top', cells: [[0, 0, 1, 2 * T], [0, 2 * T, 1, T]] },
  ],
  3: [
    { id: 'left-big-2', label: 'Big left', cells: [[0, 0, 0.5, 1], ...rows(2, 0.5, 0.5)] },
    { id: 'right-big-2', label: 'Big right', cells: [...rows(2, 0, 0.5), [0.5, 0, 0.5, 1]] },
    { id: 'top-big-2', label: 'Big top', cells: [[0, 0, 1, 0.5], ...cols(2, 0.5, 0.5)] },
    { id: 'bottom-big-2', label: 'Big bottom', cells: [...cols(2, 0, 0.5), [0, 0.5, 1, 0.5]] },
    { id: 'cols-3', label: 'Three columns', cells: cols(3) },
    { id: 'rows-3', label: 'Three rows', cells: rows(3) },
    { id: 'center-wide-3', label: 'Wide middle', cells: [[0, 0, 0.25, 1], [0.25, 0, 0.5, 1], [0.75, 0, 0.25, 1]] },
  ],
  4: [
    { id: 'grid-2x2', label: 'Grid', cells: grid(2, 2) },
    { id: 'left-big-3', label: 'Big left', cells: [[0, 0, 2 * T, 1], ...rows(3, 2 * T, T)] },
    { id: 'right-big-3', label: 'Big right', cells: [...rows(3, 0, T), [T, 0, 2 * T, 1]] },
    { id: 'top-big-3', label: 'Big top', cells: [[0, 0, 1, 2 * T], ...cols(3, 2 * T, T)] },
    { id: 'bottom-big-3', label: 'Big bottom', cells: [...cols(3, 0, T), [0, T, 1, 2 * T]] },
    { id: 'cols-4', label: 'Four columns', cells: cols(4) },
    { id: 'rows-4', label: 'Four rows', cells: rows(4) },
    {
      id: 'mosaic-4',
      label: 'Mosaic',
      cells: [[0, 0, 0.6, 0.6], [0.6, 0, 0.4, 0.6], [0, 0.6, 0.4, 0.4], [0.4, 0.6, 0.6, 0.4]],
    },
  ],
  5: [
    { id: 'top-2-bottom-3', label: 'Two over three', cells: [...cols(2, 0, 0.5), ...cols(3, 0.5, 0.5)] },
    { id: 'top-3-bottom-2', label: 'Three over two', cells: [...cols(3, 0, 0.5), ...cols(2, 0.5, 0.5)] },
    { id: 'left-big-4', label: 'Big left', cells: [[0, 0, 0.5, 1], ...grid(2, 2, 0.5, 0, 0.5, 1)] },
    { id: 'top-big-4', label: 'Big top', cells: [[0, 0, 1, 0.5], ...grid(2, 2, 0, 0.5, 1, 0.5)] },
    { id: 'center-big-4', label: 'Big middle', cells: [...cols(2, 0, 0.25), [0, 0.25, 1, 0.5], ...cols(2, 0.75, 0.25)] },
    { id: 'cols-2-3', label: 'Two and three', cells: [...rows(2, 0, 0.5), ...rows(3, 0.5, 0.5)] },
    {
      // Four frames turning around a centre square.
      id: 'pinwheel-5',
      label: 'Pinwheel',
      cells: [[0, 0, 2 * T, T], [2 * T, 0, T, 2 * T], [T, 2 * T, 2 * T, T], [0, T, T, 2 * T], [T, T, T, T]],
    },
  ],
  6: [
    { id: 'grid-2x3', label: 'Two columns', cells: grid(2, 3) },
    { id: 'grid-3x2', label: 'Three columns', cells: grid(3, 2) },
    {
      id: 'big-corner-5',
      label: 'Big corner',
      cells: [[0, 0, 2 * T, 2 * T], ...rows(2, 2 * T, T, 0, 2 * T), ...cols(3, 2 * T, T)],
    },
    { id: 'two-one-three', label: 'Two, one, three', cells: [...cols(2, 0, T), [0, T, 1, T], ...cols(3, 2 * T, T)] },
    { id: 'left-big-5', label: 'Big left', cells: [[0, 0, 0.5, 1], ...rows(5, 0.5, 0.5)] },
  ],
  7: [
    { id: 'left-big-6', label: 'Big left', cells: [[0, 0, 0.5, 1], ...grid(2, 3, 0.5, 0, 0.5, 1)] },
    { id: 'top-big-6', label: 'Big top', cells: [[0, 0, 1, 0.4], ...grid(3, 2, 0, 0.4, 1, 0.6)] },
    { id: 'three-one-three', label: 'Three, one, three', cells: [...cols(3, 0, 0.3), [0, 0.3, 1, 0.4], ...cols(3, 0.7, 0.3)] },
  ],
  8: [
    { id: 'grid-2x4', label: 'Two columns', cells: grid(2, 4) },
    { id: 'grid-4x2', label: 'Four columns', cells: grid(4, 2) },
    { id: 'two-four-two', label: 'Two, four, two', cells: [...cols(2, 0, 0.3), ...cols(4, 0.3, 0.4), ...cols(2, 0.7, 0.3)] },
  ],
  9: [
    { id: 'grid-3x3', label: 'Grid', cells: grid(3, 3) },
    { id: 'big-center-8', label: 'Big middle', cells: [...cols(4, 0, 0.25), [0, 0.25, 1, 0.5], ...cols(4, 0.75, 0.25)] },
  ],
}

export const MAX_COLLAGE_PHOTOS = 9
/** Instagram carousels take up to 20 slides. */
export const MAX_SLIDES = 20

const LAYOUT_BY_ID = new Map(Object.values(COLLAGE_LAYOUTS).flat().map((l) => [l.id, l]))

export function layoutById(id: string): CollageLayout {
  return LAYOUT_BY_ID.get(id) ?? COLLAGE_LAYOUTS[1]![0]!
}

/** Output sizes, tallest to widest; every slide of a post shares one. */
export const COLLAGE_ASPECTS = [
  { id: '9:16', label: '9:16', hint: 'Story', width: 1080, height: 1920 },
  { id: '3:4', label: '3:4', hint: 'Tall', width: 1080, height: 1440 },
  { id: '4:5', label: '4:5', hint: 'Portrait', width: 1080, height: 1350 },
  { id: '1:1', label: '1:1', hint: 'Square', width: 1080, height: 1080 },
  { id: '4:3', label: '4:3', hint: 'Classic', width: 1440, height: 1080 },
  { id: '3:2', label: '3:2', hint: 'Photo', width: 1620, height: 1080 },
  { id: '16:9', label: '16:9', hint: 'Widescreen', width: 1920, height: 1080 },
  { id: '1.91:1', label: '1.91:1', hint: 'Landscape', width: 1080, height: 566 },
] as const

export type CollageAspectId = (typeof COLLAGE_ASPECTS)[number]['id']

export function aspectById(id: CollageAspectId) {
  return COLLAGE_ASPECTS.find((a) => a.id === id) ?? COLLAGE_ASPECTS[0]
}

export type CollageCell = {
  photoId: string | null
  /** Focal point, 0–1: which part of the overflow stays in view. */
  x: number
  y: number
  /** 1 = just covers the cell. */
  zoom: number
}

export type CollageSlide = {
  id: string
  layoutId: string
  /** May hold more cells than the layout shows, so switching layouts back keeps the photos. */
  cells: CollageCell[]
}

export type CollageBorder = {
  enabled: boolean
  /** Gap width as a fraction of the slide width. */
  size: number
  color: string
  /** Also frame the outside edge, not just the lines between photos. */
  outer: boolean
}

export type CollageDoc = {
  aspect: CollageAspectId
  border: CollageBorder
  slides: CollageSlide[]
}

export const MIN_ZOOM = 1
export const MAX_ZOOM = 4

export function emptyCell(photoId: string | null = null): CollageCell {
  return { photoId, x: 0.5, y: 0.5, zoom: 1 }
}

export function createSlide(layoutId: string, photoIds: string[] = []): CollageSlide {
  const count = layoutById(layoutId).cells.length
  return {
    id: uid(),
    layoutId,
    cells: Array.from({ length: count }, (_, i) => emptyCell(photoIds[i] ?? null)),
  }
}

/** Slides pre-filled with the given photos: one slide up to six, then grids of four. */
export function createCollageDoc(photoIds: string[]): CollageDoc {
  const ids = photoIds.slice(0, MAX_SLIDES * 4)
  const slides: CollageSlide[] = []
  if (ids.length <= MAX_COLLAGE_PHOTOS) {
    const count = Math.max(1, ids.length)
    slides.push(createSlide(COLLAGE_LAYOUTS[count]![0]!.id, ids))
  } else {
    for (let i = 0; i < ids.length; i += 4) {
      const chunk = ids.slice(i, i + 4)
      slides.push(createSlide(COLLAGE_LAYOUTS[chunk.length]![0]!.id, chunk))
    }
  }
  return {
    aspect: '4:5',
    border: { enabled: true, size: 0.015, color: '#ffffff', outer: true },
    slides,
  }
}

/** The cells a slide shows, padded with empty ones when the layout grew. */
export function visibleCells(slide: CollageSlide): CollageCell[] {
  const count = layoutById(slide.layoutId).cells.length
  return Array.from({ length: count }, (_, i) => slide.cells[i] ?? emptyCell())
}

export type PixelRect = { x: number; y: number; w: number; h: number }

export function borderWidth(border: CollageBorder, width: number): number {
  return border.enabled ? border.size * width : 0
}

/** Pixel rectangles of a layout's cells, with `gap` between them (and around them when `outer`). */
export function cellRects(layout: CollageLayout, width: number, height: number, gap: number, outer: boolean): PixelRect[] {
  const origin = outer ? gap / 2 : -gap / 2
  const spanW = width - 2 * origin
  const spanH = height - 2 * origin
  return layout.cells.map(([cx, cy, cw, ch]) => ({
    x: origin + cx * spanW + gap / 2,
    y: origin + cy * spanH + gap / 2,
    w: Math.max(1, cw * spanW - gap),
    h: Math.max(1, ch * spanH - gap),
  }))
}

/** Which part of a photo stays in view: focal point (0–1) and zoom (1 = just covers the box). */
export type Framing = { x: number; y: number; zoom: number }

/** Part of an image (in its pixels) that fills a box: cover-fit, then zoom around the focal point. */
export function coverWindow(imageW: number, imageH: number, boxW: number, boxH: number, framing: Framing) {
  const scale = Math.max(boxW / imageW, boxH / imageH) * framing.zoom
  const w = boxW / scale
  const h = boxH / scale
  return { x: (imageW - w) * framing.x, y: (imageH - h) * framing.y, w, h, scale }
}

/** Size of the photo after rotate, straighten and crop, at full resolution. */
function croppedSize(source: RenderSource, edits: EditParams): { w: number; h: number; long: number } {
  const srcW = 'kind' in source ? (source.fullWidth ?? source.width) : source.width
  const srcH = 'kind' in source ? (source.fullHeight ?? source.height) : source.height
  const quarter = edits.rotate === 90 || edits.rotate === 270
  const ow = quarter ? srcH : srcW
  const oh = quarter ? srcW : srcH
  const crop = edits.crop
  const rad = (crop.straighten * Math.PI) / 180
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))
  const rw = ow * cos + oh * sin
  const rh = ow * sin + oh * cos
  return { w: rw * crop.width, h: rh * crop.height, long: Math.max(source.width, source.height) }
}

export type CollageRenderPhoto = { photo: PhotoSession; source: RenderSource }

/** Develop a photo with its edits at the resolution a `w`×`h` px box needs once cover-fit and zoomed. */
export async function developForBox(
  { photo, source }: CollageRenderPhoto,
  w: number,
  h: number,
  zoom: number,
): Promise<HTMLCanvasElement | null> {
  const full = croppedSize(source, photo.edits)
  const need = Math.max((w * zoom) / full.w, (h * zoom) / full.h)
  const maxEdge = Math.max(64, Math.ceil(full.long * Math.min(1, need * 1.05)))
  const base = prepareBase(source, photo.edits, maxEdge)
  if (!base) return null
  const developed = await developBase(base, photo.edits)
  const tile = document.createElement('canvas')
  tile.width = developed.width
  tile.height = developed.height
  tile.getContext('2d')?.putImageData(developed, 0, 0)
  return tile
}

export type CollageRenderOptions = {
  doc: CollageDoc
  slide: CollageSlide
  getPhoto: (photoId: string) => Promise<CollageRenderPhoto | null>
  mime?: string
  quality?: number
}

/** Render one slide at the aspect's full Instagram size. */
export async function renderCollageSlide({
  doc,
  slide,
  getPhoto,
  mime = 'image/jpeg',
  quality = 0.92,
}: CollageRenderOptions): Promise<Blob> {
  const { width, height } = aspectById(doc.aspect)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not create collage canvas')
  ctx.fillStyle = doc.border.enabled ? doc.border.color : '#000000'
  ctx.fillRect(0, 0, width, height)
  ctx.imageSmoothingQuality = 'high'

  const layout = layoutById(slide.layoutId)
  const rects = cellRects(layout, width, height, borderWidth(doc.border, width), doc.border.outer)
  const cells = visibleCells(slide)

  for (let i = 0; i < rects.length; i++) {
    const cell = cells[i]!
    // Snap to whole pixels so neighbouring photos never leave a hairline seam.
    const r = rects[i]!
    const x0 = Math.round(r.x)
    const y0 = Math.round(r.y)
    const w = Math.round(r.x + r.w) - x0
    const h = Math.round(r.y + r.h) - y0
    const item = cell.photoId ? await getPhoto(cell.photoId) : null
    if (!item) continue
    const tile = await developForBox(item, w, h, cell.zoom)
    if (!tile) continue

    const win = coverWindow(tile.width, tile.height, w, h, cell)
    ctx.drawImage(tile, win.x, win.y, win.w, win.h, x0, y0, w, h)
  }

  return canvasToBlob(canvas, mime, quality)
}

export function canvasToBlob(canvas: HTMLCanvasElement, mime = 'image/jpeg', quality = 0.92): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Encoding failed'))), mime, quality)
  })
}
