import { ASPECT_PRESETS, type CropRect } from '../types/edits'

export type Size = { w: number; h: number }

/** Locked pixel aspect (w / h) for a preset, or null when free / unknown. */
export function aspectRatioFor(id: string, flipped: boolean, frameSize: Size | null): number | null {
  const preset = ASPECT_PRESETS.find((p) => p.id === id)
  const base =
    id === 'original' ? (frameSize && frameSize.h > 0 ? frameSize.w / frameSize.h : null) : preset?.ratio
  if (base == null) return null
  return flipped ? 1 / base : base
}

/** True when the crop keeps the whole frame unrotated, so rendering can skip it. */
export function isFullCrop(crop: CropRect): boolean {
  return (
    crop.x <= 0.0001 &&
    crop.y <= 0.0001 &&
    crop.width >= 0.999 &&
    crop.height >= 0.999 &&
    Math.abs(crop.straighten) < 0.01
  )
}
