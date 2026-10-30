import {
  aspectById,
  borderWidth,
  cellRects,
  croppedSize,
  layoutById,
  visibleCells,
  type CollageDoc,
  type CollageRenderPhoto,
  type CollageSlide,
} from './collage'
import { clampCanvasSize } from './canvasLimits.js'

export const COLLAGE_EXPORT_PRESETS = ['1x', '2x', '3x', 'original'] as const
export type CollageExportPreset = (typeof COLLAGE_EXPORT_PRESETS)[number]

export const DEFAULT_COLLAGE_EXPORT: CollageExportSettings = {
  preset: '2x',
  quality: 0.92,
}

export type CollageExportSettings = {
  preset: CollageExportPreset
  /** JPEG quality 0.5–1 */
  quality: number
}

const STORAGE_KEY = 'lightframes:collage-export'

export function loadCollageExportSettings(): CollageExportSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_COLLAGE_EXPORT
    const parsed = JSON.parse(raw) as Partial<CollageExportSettings>
    const preset = COLLAGE_EXPORT_PRESETS.includes(parsed.preset as CollageExportPreset)
      ? (parsed.preset as CollageExportPreset)
      : DEFAULT_COLLAGE_EXPORT.preset
    const quality =
      typeof parsed.quality === 'number' && parsed.quality >= 0.5 && parsed.quality <= 1
        ? parsed.quality
        : DEFAULT_COLLAGE_EXPORT.quality
    return { preset, quality }
  } catch {
    return DEFAULT_COLLAGE_EXPORT
  }
}

export function saveCollageExportSettings(settings: CollageExportSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Ignore quota / private mode.
  }
}

function presetMultiplier(preset: CollageExportPreset): number | null {
  if (preset === '1x') return 1
  if (preset === '2x') return 2
  if (preset === '3x') return 3
  return null
}

async function originalMultiplier(
  doc: CollageDoc,
  slide: CollageSlide,
  getPhoto: (photoId: string) => Promise<CollageRenderPhoto | null>,
): Promise<number> {
  const base = aspectById(doc.aspect)
  const layout = layoutById(slide.layoutId)
  const gap = borderWidth(doc.border, base.width)
  const rects = cellRects(layout, base.width, base.height, gap, doc.border.outer)
  const cells = visibleCells(slide)
  let mult = 1
  for (let i = 0; i < rects.length; i++) {
    const cell = cells[i]
    if (!cell?.photoId) continue
    const item = await getPhoto(cell.photoId)
    if (!item) continue
    const full = croppedSize(item.source, item.photo.edits)
    const r = rects[i]!
    if (r.w <= 0 || r.h <= 0) continue
    mult = Math.max(mult, full.w / (r.w * cell.zoom), full.h / (r.h * cell.zoom))
  }
  return Math.max(1, mult)
}

export type ResolvedCollageSize = ReturnType<typeof clampCanvasSize>

/** Pixel size for one slide export, from preset or full-resolution sources. */
export async function resolveCollageOutputSize(
  doc: CollageDoc,
  slides: CollageSlide[],
  preset: CollageExportPreset,
  getPhoto: (photoId: string) => Promise<CollageRenderPhoto | null>,
): Promise<ResolvedCollageSize> {
  const base = aspectById(doc.aspect)
  const fixed = presetMultiplier(preset)
  let mult = fixed ?? 1
  if (fixed === null) {
    for (const slide of slides) {
      mult = Math.max(mult, await originalMultiplier(doc, slide, getPhoto))
    }
  }
  return clampCanvasSize(base.width * mult, base.height * mult)
}

/** Long edge of the base aspect preset (usually 1080). */
export function collageBaseLongEdge(doc: CollageDoc): number {
  const { width, height } = aspectById(doc.aspect)
  return Math.max(width, height)
}

export function presetLongEdge(doc: CollageDoc, preset: CollageExportPreset): number | null {
  const mult = presetMultiplier(preset)
  if (mult === null) return null
  return Math.round(collageBaseLongEdge(doc) * mult)
}
