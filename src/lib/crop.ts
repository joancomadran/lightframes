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

/** Uncropped frame: the straightened bounding box, plus the oriented image inside it. */
export type FrameSize = Size & { image: Size }

/** Bounding box of an image of the given size rotated by `deg` degrees. */
export function rotatedBounds(image: Size, deg: number): Size {
  const rad = (deg * Math.PI) / 180
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))
  return { w: image.w * cos + image.h * sin, h: image.w * sin + image.h * cos }
}

// Keeps the crop a hair inside the rotated edge so its antialiased pixels never show.
const EDGE_INSET = 0.998

/**
 * Pull a crop inside the straightened image, so no corner of the frame shows
 * the empty background: shrink it about its centre (keeping its pixel aspect),
 * then slide it the least distance that fits. `image` is the oriented size.
 */
export function fitCropInImage(crop: CropRect, image: Size): CropRect {
  if (Math.abs(crop.straighten) < 0.01 || image.w <= 0 || image.h <= 0) return crop
  const rad = (crop.straighten * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const k = Math.abs(cos)
  const s = Math.abs(sin)
  const frame = rotatedBounds(image, crop.straighten)
  const a = (image.w / 2) * EDGE_INSET
  const b = (image.h / 2) * EDGE_INSET

  // Crop half-size and centre in frame pixels, origin at the rotation centre.
  let hw = (crop.width * frame.w) / 2
  let hh = (crop.height * frame.h) / 2
  const cx = (crop.x + crop.width / 2 - 0.5) * frame.w
  const cy = (crop.y + crop.height / 2 - 0.5) * frame.h

  // The box's reach along the image's own axes must stay within its half-size.
  const fit = Math.min(1, a / (k * hw + s * hh), b / (s * hw + k * hh))
  hw *= fit
  hh *= fit
  const maxU = Math.max(0, a - (k * hw + s * hh))
  const maxV = Math.max(0, b - (s * hw + k * hh))
  const u = Math.min(maxU, Math.max(-maxU, cx * cos + cy * sin))
  const v = Math.min(maxV, Math.max(-maxV, -cx * sin + cy * cos))
  const nx = u * cos - v * sin
  const ny = u * sin + v * cos

  const width = (2 * hw) / frame.w
  const height = (2 * hh) / frame.h
  return { ...crop, x: 0.5 + nx / frame.w - width / 2, y: 0.5 + ny / frame.h - height / 2, width, height }
}

/** True when the crop shows no empty background past the straightened image. */
export function cropFitsImage(crop: CropRect, image: Size): boolean {
  const fitted = fitCropInImage(crop, image)
  return (
    Math.abs(fitted.x - crop.x) < 1e-6 &&
    Math.abs(fitted.y - crop.y) < 1e-6 &&
    Math.abs(fitted.width - crop.width) < 1e-6 &&
    Math.abs(fitted.height - crop.height) < 1e-6
  )
}

/**
 * Carry a crop to a new straighten angle: keep its size and offset from the
 * centre in pixels, then pull it back inside the image.
 */
export function restraightenCrop(crop: CropRect, straighten: number, image: Size): CropRect {
  const from = rotatedBounds(image, crop.straighten)
  const to = rotatedBounds(image, straighten)
  const width = Math.min(1, (crop.width * from.w) / to.w)
  const height = Math.min(1, (crop.height * from.h) / to.h)
  const cx = 0.5 + ((crop.x + crop.width / 2 - 0.5) * from.w) / to.w
  const cy = 0.5 + ((crop.y + crop.height / 2 - 0.5) * from.h) / to.h
  return fitCropInImage({ x: cx - width / 2, y: cy - height / 2, width, height, straighten }, image)
}
