export type HslChannel =
  | 'reds'
  | 'oranges'
  | 'yellows'
  | 'greens'
  | 'aquas'
  | 'blues'
  | 'purples'
  | 'magentas'

export type HslBand = {
  hue: number
  saturation: number
  luminance: number
}

export type HslEdits = Record<HslChannel, HslBand>

/** 3D LUT from a .cube preset (IRIDAS / Adobe order: R varies fastest). */
export type Lut3D = {
  size: number
  title?: string
  /** Flat RGB triplets, length `size³ × 3`. */
  data: number[]
}

/** Clockwise degrees applied when rendering / exporting. */
export type RotateDegrees = 0 | 90 | 180 | 270

export type EditParams = {
  exposure: number
  contrast: number
  highlights: number
  shadows: number
  whites: number
  blacks: number
  temperature: number
  tint: number
  vibrance: number
  saturation: number
  /** Image orientation in 90° steps (clockwise). */
  rotate: RotateDegrees
  hsl: HslEdits
  /** Optional look-up table applied after parametric edits (from .cube). */
  lut?: Lut3D
  /** LUT strength 0–1 (used when dialing preset intensity on .cube looks). */
  lutMix?: number
}

export type BasicEditKey = Exclude<keyof EditParams, 'hsl' | 'lut' | 'lutMix' | 'rotate'>

export type Preset = {
  id: string
  name: string
  edits: EditParams
  createdAt: string
}

export type PhotoSession = {
  id: string
  name: string
  path: string
  objectUrl: string
  file: File
  edits: EditParams
  thumbnailUrl: string
}

export const HSL_CHANNELS: {
  id: HslChannel
  label: string
  /** Approximate hue center in degrees (0–360). */
  center: number
  swatch: string
}[] = [
  { id: 'reds', label: 'Reds', center: 0, swatch: '#e25555' },
  { id: 'oranges', label: 'Oranges', center: 30, swatch: '#f08a3a' },
  { id: 'yellows', label: 'Yellows', center: 60, swatch: '#e6c84a' },
  { id: 'greens', label: 'Greens', center: 120, swatch: '#4caf6a' },
  { id: 'aquas', label: 'Aquas', center: 180, swatch: '#3db8b0' },
  { id: 'blues', label: 'Blues', center: 225, swatch: '#4a7fd4' },
  { id: 'purples', label: 'Purples', center: 270, swatch: '#8b6ad9' },
  { id: 'magentas', label: 'Magentas', center: 315, swatch: '#d45aa8' },
]

const NEUTRAL_BAND: HslBand = { hue: 0, saturation: 0, luminance: 0 }

export function createDefaultHsl(): HslEdits {
  return {
    reds: { ...NEUTRAL_BAND },
    oranges: { ...NEUTRAL_BAND },
    yellows: { ...NEUTRAL_BAND },
    greens: { ...NEUTRAL_BAND },
    aquas: { ...NEUTRAL_BAND },
    blues: { ...NEUTRAL_BAND },
    purples: { ...NEUTRAL_BAND },
    magentas: { ...NEUTRAL_BAND },
  }
}

export const DEFAULT_EDITS: EditParams = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 0,
  tint: 0,
  vibrance: 0,
  saturation: 0,
  rotate: 0,
  hsl: createDefaultHsl(),
}

export function normalizeRotate(value: number): RotateDegrees {
  const stepped = Math.round(value / 90) * 90
  const wrapped = ((stepped % 360) + 360) % 360
  if (wrapped === 90 || wrapped === 180 || wrapped === 270) return wrapped
  return 0
}

/** Step rotation by ±90° (positive = clockwise). */
export function stepRotate(current: number, delta: 90 | -90): RotateDegrees {
  return normalizeRotate(current + delta)
}

export const EDIT_SLIDERS: {
  key: BasicEditKey
  label: string
  min: number
  max: number
  step: number
}[] = [
  { key: 'exposure', label: 'Exposure', min: -2, max: 2, step: 0.01 },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1 },
  { key: 'highlights', label: 'Highlights', min: -100, max: 100, step: 1 },
  { key: 'shadows', label: 'Shadows', min: -100, max: 100, step: 1 },
  { key: 'whites', label: 'Whites', min: -100, max: 100, step: 1 },
  { key: 'blacks', label: 'Blacks', min: -100, max: 100, step: 1 },
  { key: 'temperature', label: 'Temperature', min: -100, max: 100, step: 1 },
  { key: 'tint', label: 'Tint', min: -100, max: 100, step: 1 },
  { key: 'vibrance', label: 'Vibrance', min: -100, max: 100, step: 1 },
  { key: 'saturation', label: 'Saturation', min: -100, max: 100, step: 1 },
]

export function cloneHsl(hsl: HslEdits): HslEdits {
  return {
    reds: { ...hsl.reds },
    oranges: { ...hsl.oranges },
    yellows: { ...hsl.yellows },
    greens: { ...hsl.greens },
    aquas: { ...hsl.aquas },
    blues: { ...hsl.blues },
    purples: { ...hsl.purples },
    magentas: { ...hsl.magentas },
  }
}

export function cloneLut(lut: Lut3D): Lut3D {
  return {
    size: lut.size,
    title: lut.title,
    data: lut.data.slice(),
  }
}

export function cloneEdits(edits: EditParams): EditParams {
  const next: EditParams = {
    ...edits,
    hsl: cloneHsl(edits.hsl),
  }
  if (edits.lut) next.lut = cloneLut(edits.lut)
  else delete next.lut
  if (typeof edits.lutMix === 'number') next.lutMix = edits.lutMix
  else delete next.lutMix
  return next
}

export function mergeEdits(base: EditParams, patch: Partial<EditParams>): EditParams {
  const { hsl: hslPatch, lut: lutPatch, lutMix: lutMixPatch, ...rest } = patch
  const next = cloneEdits({ ...base, ...rest })
  if (hslPatch) {
    for (const channel of HSL_CHANNELS) {
      const bandPatch = hslPatch[channel.id]
      if (bandPatch) {
        next.hsl[channel.id] = { ...next.hsl[channel.id], ...bandPatch }
      }
    }
  }
  if (lutPatch !== undefined) {
    if (lutPatch) next.lut = cloneLut(lutPatch)
    else delete next.lut
  }
  if (lutMixPatch !== undefined) {
    if (typeof lutMixPatch === 'number') next.lutMix = lutMixPatch
    else delete next.lutMix
  }
  return next
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Blend parametric edits from `from` → `to` by amount `t` (0–1).
 * Used for preset intensity. Rotation snaps at 50%; LUT mix scales with `t`.
 */
export function blendEdits(from: EditParams, to: EditParams, t: number): EditParams {
  const amount = Math.min(1, Math.max(0, t))
  const next = cloneEdits(DEFAULT_EDITS)

  for (const slider of EDIT_SLIDERS) {
    next[slider.key] = lerp(from[slider.key], to[slider.key], amount)
  }

  next.rotate = amount >= 0.5 ? to.rotate : from.rotate

  for (const channel of HSL_CHANNELS) {
    const a = from.hsl[channel.id]
    const b = to.hsl[channel.id]
    next.hsl[channel.id] = {
      hue: lerp(a.hue, b.hue, amount),
      saturation: lerp(a.saturation, b.saturation, amount),
      luminance: lerp(a.luminance, b.luminance, amount),
    }
  }

  if (to.lut && amount > 0) {
    next.lut = cloneLut(to.lut)
    next.lutMix = amount * (to.lutMix ?? 1)
  } else if (from.lut && amount < 1) {
    next.lut = cloneLut(from.lut)
    next.lutMix = (1 - amount) * (from.lutMix ?? 1)
  } else {
    delete next.lut
    delete next.lutMix
  }

  return next
}

export function isNeutralHsl(hsl: HslEdits): boolean {
  return HSL_CHANNELS.every((channel) => {
    const band = hsl[channel.id]
    return band.hue === 0 && band.saturation === 0 && band.luminance === 0
  })
}

export function isNeutralEdits(edits: EditParams): boolean {
  const basicOk = EDIT_SLIDERS.every((slider) => edits[slider.key] === DEFAULT_EDITS[slider.key])
  return basicOk && edits.rotate === 0 && isNeutralHsl(edits.hsl) && !edits.lut
}

export function normalizeLut(value: unknown): Lut3D | null {
  if (!value || typeof value !== 'object') return null
  const obj = value as Record<string, unknown>
  const size = obj.size
  const data = obj.data
  if (typeof size !== 'number' || !Number.isInteger(size) || size < 2 || size > 128) {
    return null
  }
  if (!Array.isArray(data) || data.length !== size * size * size * 3) return null
  if (!data.every((n) => typeof n === 'number' && Number.isFinite(n))) return null
  return {
    size,
    title: typeof obj.title === 'string' ? obj.title : undefined,
    data: data as number[],
  }
}

/** Normalize possibly-partial preset/import data into a full EditParams. */
export function normalizeEdits(value: unknown): EditParams | null {
  if (!value || typeof value !== 'object') return null
  const obj = value as Record<string, unknown>
  const next = cloneEdits(DEFAULT_EDITS)

  for (const slider of EDIT_SLIDERS) {
    const v = obj[slider.key]
    if (typeof v === 'number' && Number.isFinite(v)) {
      next[slider.key] = v
    }
  }

  if (typeof obj.rotate === 'number' && Number.isFinite(obj.rotate)) {
    next.rotate = normalizeRotate(obj.rotate)
  }

  const hslRaw = obj.hsl
  if (hslRaw && typeof hslRaw === 'object') {
    const hslObj = hslRaw as Record<string, unknown>
    for (const channel of HSL_CHANNELS) {
      const bandRaw = hslObj[channel.id]
      if (!bandRaw || typeof bandRaw !== 'object') continue
      const band = bandRaw as Record<string, unknown>
      next.hsl[channel.id] = {
        hue: typeof band.hue === 'number' ? band.hue : 0,
        saturation: typeof band.saturation === 'number' ? band.saturation : 0,
        luminance: typeof band.luminance === 'number' ? band.luminance : 0,
      }
    }
  }

  const lut = normalizeLut(obj.lut)
  if (lut) next.lut = lut

  if (typeof obj.lutMix === 'number' && Number.isFinite(obj.lutMix)) {
    next.lutMix = Math.min(1, Math.max(0, obj.lutMix))
  }

  // Require at least the classic basic keys so bare junk objects don't pass
  const hasBasic = EDIT_SLIDERS.some((slider) => typeof obj[slider.key] === 'number')
  const hasHsl = Boolean(hslRaw && typeof hslRaw === 'object')
  const hasLut = Boolean(lut)
  const hasRotate = typeof obj.rotate === 'number' && Number.isFinite(obj.rotate)
  if (!hasBasic && !hasHsl && !hasLut && !hasRotate) return null
  return next
}
