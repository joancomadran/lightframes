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

/** Normalized crop in the oriented image (0–1), plus straighten degrees. */
export type CropRect = {
  x: number
  y: number
  width: number
  height: number
  /** Fine rotation in degrees (−45…45), applied before crop. */
  straighten: number
}

export type CurvePoint = { x: number; y: number }

export type CurveChannel = 'red' | 'green' | 'blue'

/** Tone curves in 0–1 space: `points` is the master (RGB) curve; channels are optional. */
export type ToneCurve = {
  points: CurvePoint[]
  red?: CurvePoint[]
  green?: CurvePoint[]
  blue?: CurvePoint[]
}

/** Settings every local mask applies inside its area. */
type LocalAdjustmentBase = {
  id: string
  /** Apply outside the shape instead of inside. */
  invert: boolean
  exposure: number
  contrast: number
  saturation: number
  temperature: number
}

export type RadialAdjustment = LocalAdjustmentBase & {
  type: 'radial'
  /** Center / radii in output image space (0–1). */
  cx: number
  cy: number
  radiusX: number
  radiusY: number
  feather: number
}

/** Graduated filter: full effect at (x1, y1), fading to nothing at (x2, y2). */
export type LinearAdjustment = LocalAdjustmentBase & {
  type: 'linear'
  x1: number
  y1: number
  x2: number
  y2: number
}

export type BrushStroke = {
  /** Flat [x0, y0, x1, y1, …] in output image space (0–1). */
  points: number[]
  /** Radius as a fraction of the image width. */
  size: number
  /** 0 = hard edge, 1 = fully soft. */
  feather: number
  /** Opacity of the stroke (0–1). */
  flow: number
  erase: boolean
}

export type BrushAdjustment = LocalAdjustmentBase & {
  type: 'brush'
  strokes: BrushStroke[]
}

export type LocalAdjustment = RadialAdjustment | LinearAdjustment | BrushAdjustment
export type LocalAdjustmentType = LocalAdjustment['type']

/** Any subset of fields a local mask can carry — used for partial updates. */
export type LocalAdjustmentPatch = Partial<
  Omit<RadialAdjustment, 'id' | 'type'> &
    Omit<LinearAdjustment, 'id' | 'type'> &
    Omit<BrushAdjustment, 'id' | 'type'>
>

export type HealMode = 'heal' | 'clone' | 'remove'

/**
 * Spot removal: pixels painted over are replaced with pixels from elsewhere in the photo.
 * Lives in source image space (before rotation and crop) so reframing doesn't move it.
 */
export type HealSpot = {
  id: string
  /**
   * Heal blends the copied pixels into their surroundings; clone copies them as they are;
   * remove fills the area with an inpainting model (no source: dx / dy are unused).
   */
  mode: HealMode
  /** Flat [x0, y0, x1, y1, …] in source image space (0–1). */
  points: number[]
  /** Radius as a fraction of the source's long edge. */
  size: number
  /** 0 = hard edge, 1 = fully soft. */
  feather: number
  opacity: number
  /** Where the replacement comes from, relative to the painted area (0–1 of width / height). */
  dx: number
  dy: number
}

export type GradeZone = {
  /** 0–360 degrees. */
  hue: number
  /** 0–100. */
  saturation: number
  /** −100…100. */
  luminance: number
}

export type GradeZoneId = 'shadows' | 'midtones' | 'highlights' | 'global'

/** Color grading (split toning) wheels, like Lightroom's Color Grading panel. */
export type ColorGrading = Record<GradeZoneId, GradeZone> & {
  /** 0–100: how much the shadow / highlight ranges overlap. */
  blending: number
  /** −100…100: shifts the split point toward shadows (−) or highlights (+). */
  balance: number
}

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
  texture: number
  clarity: number
  dehaze: number
  /** Post-crop vignette: negative darkens, positive lightens the corners. */
  vignette: number
  vignetteMidpoint: number
  grain: number
  grainSize: number
  sharpening: number
  noiseReduction: number
  colorNoiseReduction: number
  colorGrading: ColorGrading
  /** Image orientation in 90° steps (clockwise). */
  rotate: RotateDegrees
  crop: CropRect
  toneCurve: ToneCurve
  localAdjustments: LocalAdjustment[]
  /** Spot removal, applied to the source pixels before everything else. */
  heal: HealSpot[]
  hsl: HslEdits
  /** Optional look-up table applied after parametric edits (from .cube). */
  lut?: Lut3D
  /** LUT strength 0–1 (used when dialing preset intensity on .cube looks). */
  lutMix?: number
}

export type BasicEditKey = Exclude<
  keyof EditParams,
  | 'hsl'
  | 'lut'
  | 'lutMix'
  | 'rotate'
  | 'crop'
  | 'toneCurve'
  | 'localAdjustments'
  | 'heal'
  | 'colorGrading'
>

export type Preset = {
  id: string
  name: string
  edits: EditParams
  createdAt: string
}

export type PhotoFlag = 'pick' | 'reject'

export type PhotoSession = {
  id: string
  name: string
  path: string
  objectUrl: string
  file: File
  edits: EditParams
  thumbnailUrl: string
  /** 0–5 stars. */
  rating: number
  flag: PhotoFlag | null
}

export type ExportFormat = 'jpeg' | 'png' | 'webp'

export type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'

export type Watermark = {
  enabled: boolean
  text: string
  position: WatermarkPosition
  /** 0–1. */
  opacity: number
  /** Text height as a fraction of the image's short edge. */
  size: number
}

/** Exact output canvas; the photo is scaled to fit and letterboxed. */
export type ExportFrame = {
  width: number
  height: number
  background: string
}

export type ExportOptions = {
  format: ExportFormat
  quality: number
  maxEdge: number
  /** When set, output is exactly this size (fit + pad); `maxEdge` is ignored. */
  frame: ExportFrame | null
  watermark: Watermark
  /** `{name}` is replaced with the source basename. */
  filenamePattern: string
}

export const DEFAULT_WATERMARK: Watermark = {
  enabled: false,
  text: '© ',
  position: 'bottom-right',
  opacity: 0.7,
  size: 0.035,
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'jpeg',
  quality: 0.92,
  maxEdge: 8192,
  frame: null,
  watermark: DEFAULT_WATERMARK,
  filenamePattern: '{name}-edited',
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

export function createDefaultCrop(): CropRect {
  return { x: 0, y: 0, width: 1, height: 1, straighten: 0 }
}

const NEUTRAL_ZONE: GradeZone = { hue: 0, saturation: 0, luminance: 0 }

export const GRADE_ZONES: { id: GradeZoneId; label: string }[] = [
  { id: 'shadows', label: 'Shadows' },
  { id: 'midtones', label: 'Midtones' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'global', label: 'Global' },
]

export function createDefaultColorGrading(): ColorGrading {
  return {
    shadows: { ...NEUTRAL_ZONE },
    midtones: { ...NEUTRAL_ZONE },
    highlights: { ...NEUTRAL_ZONE },
    global: { ...NEUTRAL_ZONE },
    blending: 50,
    balance: 0,
  }
}

export function createDefaultToneCurve(): ToneCurve {
  return {
    points: [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ],
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
  texture: 0,
  clarity: 0,
  dehaze: 0,
  vignette: 0,
  vignetteMidpoint: 50,
  grain: 0,
  grainSize: 25,
  sharpening: 0,
  noiseReduction: 0,
  colorNoiseReduction: 0,
  colorGrading: createDefaultColorGrading(),
  rotate: 0,
  crop: createDefaultCrop(),
  toneCurve: createDefaultToneCurve(),
  localAdjustments: [],
  heal: [],
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
  { key: 'texture', label: 'Texture', min: -100, max: 100, step: 1 },
  { key: 'clarity', label: 'Clarity', min: -100, max: 100, step: 1 },
  { key: 'dehaze', label: 'Dehaze', min: -100, max: 100, step: 1 },
  { key: 'vignette', label: 'Amount', min: -100, max: 100, step: 1 },
  { key: 'vignetteMidpoint', label: 'Midpoint', min: 0, max: 100, step: 1 },
  { key: 'grain', label: 'Amount', min: 0, max: 100, step: 1 },
  { key: 'grainSize', label: 'Size', min: 0, max: 100, step: 1 },
  { key: 'sharpening', label: 'Sharpening', min: 0, max: 150, step: 1 },
  { key: 'noiseReduction', label: 'Luminance NR', min: 0, max: 100, step: 1 },
  { key: 'colorNoiseReduction', label: 'Color NR', min: 0, max: 100, step: 1 },
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

export function cloneCrop(crop: CropRect): CropRect {
  return { ...crop }
}

export const CURVE_CHANNELS: CurveChannel[] = ['red', 'green', 'blue']

export function cloneToneCurve(curve: ToneCurve): ToneCurve {
  const next: ToneCurve = { points: curve.points.map((p) => ({ ...p })) }
  for (const channel of CURVE_CHANNELS) {
    const points = curve[channel]
    if (points) next[channel] = points.map((p) => ({ ...p }))
  }
  return next
}

export function cloneColorGrading(grading: ColorGrading): ColorGrading {
  return {
    shadows: { ...grading.shadows },
    midtones: { ...grading.midtones },
    highlights: { ...grading.highlights },
    global: { ...grading.global },
    blending: grading.blending,
    balance: grading.balance,
  }
}

/** Shallow per-item copy; brush strokes are treated as immutable and shared. */
export function cloneLocalAdjustments(items: LocalAdjustment[]): LocalAdjustment[] {
  return items.map((item) => ({ ...item }))
}

export function cloneEdits(edits: EditParams): EditParams {
  const next: EditParams = {
    ...edits,
    // Edits saved by older versions lack newer sliders: fill them with defaults.
    ...Object.fromEntries(
      EDIT_SLIDERS.filter((s) => !Number.isFinite(edits[s.key])).map((s) => [s.key, DEFAULT_EDITS[s.key]]),
    ),
    hsl: cloneHsl(edits.hsl),
    crop: cloneCrop(edits.crop ?? createDefaultCrop()),
    toneCurve: cloneToneCurve(edits.toneCurve ?? createDefaultToneCurve()),
    localAdjustments: cloneLocalAdjustments(edits.localAdjustments ?? []),
    // Spot paths are treated as immutable and shared, like brush strokes.
    heal: (edits.heal ?? []).map((spot) => ({ ...spot })),
    colorGrading: cloneColorGrading(edits.colorGrading ?? createDefaultColorGrading()),
  }
  if (edits.lut) next.lut = cloneLut(edits.lut)
  else delete next.lut
  if (typeof edits.lutMix === 'number') next.lutMix = edits.lutMix
  else delete next.lutMix
  return next
}

export function mergeEdits(base: EditParams, patch: Partial<EditParams>): EditParams {
  const {
    hsl: hslPatch,
    lut: lutPatch,
    lutMix: lutMixPatch,
    crop: cropPatch,
    toneCurve: curvePatch,
    localAdjustments: localPatch,
    heal: healPatch,
    colorGrading: gradingPatch,
    ...rest
  } = patch
  const next = cloneEdits({ ...base, ...rest })
  if (healPatch) next.heal = healPatch.map((spot) => ({ ...spot }))
  if (hslPatch) {
    for (const channel of HSL_CHANNELS) {
      const bandPatch = hslPatch[channel.id]
      if (bandPatch) {
        next.hsl[channel.id] = { ...next.hsl[channel.id], ...bandPatch }
      }
    }
  }
  if (cropPatch) next.crop = { ...next.crop, ...cropPatch }
  if (curvePatch) next.toneCurve = cloneToneCurve(curvePatch)
  if (localPatch) next.localAdjustments = cloneLocalAdjustments(localPatch)
  if (gradingPatch) {
    const grading = next.colorGrading
    for (const zone of GRADE_ZONES) {
      const zonePatch = gradingPatch[zone.id]
      if (zonePatch) grading[zone.id] = { ...grading[zone.id], ...zonePatch }
    }
    if (typeof gradingPatch.blending === 'number') grading.blending = gradingPatch.blending
    if (typeof gradingPatch.balance === 'number') grading.balance = gradingPatch.balance
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

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

export function normalizeCrop(value: unknown): CropRect {
  const fallback = createDefaultCrop()
  if (!value || typeof value !== 'object') return fallback
  const obj = value as Record<string, unknown>
  const width = typeof obj.width === 'number' ? clamp01(obj.width) : 1
  const height = typeof obj.height === 'number' ? clamp01(obj.height) : 1
  const x = typeof obj.x === 'number' ? clamp01(obj.x) : 0
  const y = typeof obj.y === 'number' ? clamp01(obj.y) : 0
  const straighten =
    typeof obj.straighten === 'number' && Number.isFinite(obj.straighten)
      ? Math.min(45, Math.max(-45, obj.straighten))
      : 0
  return {
    x: Math.min(x, 1 - width),
    y: Math.min(y, 1 - height),
    width: Math.max(0.05, width),
    height: Math.max(0.05, height),
    straighten,
  }
}

function normalizeCurvePoints(value: unknown): CurvePoint[] | null {
  if (!Array.isArray(value) || value.length < 2) return null
  const points: CurvePoint[] = []
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue
    const p = raw as Record<string, unknown>
    if (typeof p.x !== 'number' || typeof p.y !== 'number') continue
    points.push({ x: clamp01(p.x), y: clamp01(p.y) })
  }
  if (points.length < 2) return null
  points.sort((a, b) => a.x - b.x)
  points[0] = { x: 0, y: points[0]!.y }
  points[points.length - 1] = { x: 1, y: points[points.length - 1]!.y }
  return points
}

export function normalizeToneCurve(value: unknown): ToneCurve {
  const fallback = createDefaultToneCurve()
  if (!value || typeof value !== 'object') return fallback
  const obj = value as Record<string, unknown>
  const next: ToneCurve = { points: normalizeCurvePoints(obj.points) ?? fallback.points }
  for (const channel of CURVE_CHANNELS) {
    const points = normalizeCurvePoints(obj[channel])
    if (points && !isIdentityCurve(points)) next[channel] = points
  }
  return next
}

function normalizeZone(value: unknown): GradeZone {
  if (!value || typeof value !== 'object') return { ...NEUTRAL_ZONE }
  const obj = value as Record<string, unknown>
  const num = (v: unknown, min: number, max: number) =>
    typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : 0
  return {
    hue: (((typeof obj.hue === 'number' ? obj.hue : 0) % 360) + 360) % 360,
    saturation: num(obj.saturation, 0, 100),
    luminance: num(obj.luminance, -100, 100),
  }
}

export function normalizeColorGrading(value: unknown): ColorGrading {
  const next = createDefaultColorGrading()
  if (!value || typeof value !== 'object') return next
  const obj = value as Record<string, unknown>
  for (const zone of GRADE_ZONES) next[zone.id] = normalizeZone(obj[zone.id])
  if (typeof obj.blending === 'number') next.blending = Math.min(100, Math.max(0, obj.blending))
  if (typeof obj.balance === 'number') next.balance = Math.min(100, Math.max(-100, obj.balance))
  return next
}

const LOCAL_DEFAULTS = {
  invert: false,
  exposure: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
}

export function createRadialAdjustment(
  patch?: Partial<Omit<RadialAdjustment, 'id' | 'type'>>,
): RadialAdjustment {
  return {
    id: crypto.randomUUID(),
    type: 'radial',
    ...LOCAL_DEFAULTS,
    cx: 0.5,
    cy: 0.5,
    radiusX: 0.35,
    radiusY: 0.35,
    feather: 0.35,
    ...patch,
  }
}

export function createLinearAdjustment(
  patch?: Partial<Omit<LinearAdjustment, 'id' | 'type'>>,
): LinearAdjustment {
  return {
    id: crypto.randomUUID(),
    type: 'linear',
    ...LOCAL_DEFAULTS,
    x1: 0.5,
    y1: 0.15,
    x2: 0.5,
    y2: 0.55,
    ...patch,
  }
}

export function createBrushAdjustment(
  patch?: Partial<Omit<BrushAdjustment, 'id' | 'type'>>,
): BrushAdjustment {
  return {
    id: crypto.randomUUID(),
    type: 'brush',
    ...LOCAL_DEFAULTS,
    strokes: [],
    ...patch,
  }
}

export function createLocalAdjustment(type: LocalAdjustmentType): LocalAdjustment {
  if (type === 'linear') return createLinearAdjustment()
  if (type === 'brush') return createBrushAdjustment()
  return createRadialAdjustment()
}

/** Apply a partial update without letting it change the mask's type or id. */
export function patchLocalAdjustment(
  item: LocalAdjustment,
  patch: LocalAdjustmentPatch,
): LocalAdjustment {
  return { ...item, ...patch, id: item.id, type: item.type } as LocalAdjustment
}

/**
 * Blend parametric edits from `from` → `to` by amount `t` (0–1).
 * Used for preset intensity. Rotation/crop snap at 50%; LUT mix scales with `t`.
 */
export function blendEdits(from: EditParams, to: EditParams, t: number): EditParams {
  const amount = Math.min(1, Math.max(0, t))
  const next = cloneEdits(DEFAULT_EDITS)

  for (const slider of EDIT_SLIDERS) {
    next[slider.key] = lerp(from[slider.key], to[slider.key], amount)
  }

  next.rotate = amount >= 0.5 ? to.rotate : from.rotate
  next.crop = amount >= 0.5 ? cloneCrop(to.crop) : cloneCrop(from.crop)
  next.toneCurve =
    amount >= 0.5 ? cloneToneCurve(to.toneCurve) : cloneToneCurve(from.toneCurve)
  next.localAdjustments =
    amount >= 0.5
      ? cloneLocalAdjustments(to.localAdjustments)
      : cloneLocalAdjustments(from.localAdjustments)

  for (const zone of GRADE_ZONES) {
    const a = from.colorGrading[zone.id]
    const b = to.colorGrading[zone.id]
    // Hue only means something with saturation: take it from whichever side has colour.
    const hue = b.saturation > 0 || a.saturation === 0 ? b.hue : a.hue
    next.colorGrading[zone.id] = {
      hue,
      saturation: lerp(a.saturation, b.saturation, amount),
      luminance: lerp(a.luminance, b.luminance, amount),
    }
  }
  next.colorGrading.blending = lerp(from.colorGrading.blending, to.colorGrading.blending, amount)
  next.colorGrading.balance = lerp(from.colorGrading.balance, to.colorGrading.balance, amount)

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

export function isNeutralCrop(crop: CropRect): boolean {
  return (
    crop.x === 0 &&
    crop.y === 0 &&
    crop.width === 1 &&
    crop.height === 1 &&
    crop.straighten === 0
  )
}

export function isIdentityCurve(points: CurvePoint[]): boolean {
  if (points.length !== 2) return false
  const [a, b] = points
  return Boolean(a && b && a.x === 0 && a.y === 0 && b.x === 1 && b.y === 1)
}

export function isNeutralToneCurve(curve: ToneCurve): boolean {
  return (
    isIdentityCurve(curve.points) &&
    CURVE_CHANNELS.every((channel) => !curve[channel] || isIdentityCurve(curve[channel]!))
  )
}

export function isNeutralColorGrading(grading: ColorGrading): boolean {
  return GRADE_ZONES.every((zone) => {
    const z = grading[zone.id]
    return z.saturation === 0 && z.luminance === 0
  })
}

export function isNeutralEdits(edits: EditParams): boolean {
  const basicOk = EDIT_SLIDERS.every((slider) => edits[slider.key] === DEFAULT_EDITS[slider.key])
  return (
    basicOk &&
    edits.rotate === 0 &&
    isNeutralHsl(edits.hsl) &&
    isNeutralCrop(edits.crop) &&
    isNeutralToneCurve(edits.toneCurve) &&
    isNeutralColorGrading(edits.colorGrading) &&
    edits.localAdjustments.length === 0 &&
    edits.heal.length === 0 &&
    !edits.lut
  )
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

function normalizeStroke(value: unknown): BrushStroke | null {
  if (!value || typeof value !== 'object') return null
  const obj = value as Record<string, unknown>
  if (!Array.isArray(obj.points)) return null
  const points = obj.points.filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
  if (points.length < 2) return null
  return {
    points: points.length % 2 === 0 ? points : points.slice(0, -1),
    size: typeof obj.size === 'number' ? Math.min(0.5, Math.max(0.002, obj.size)) : 0.05,
    feather: typeof obj.feather === 'number' ? clamp01(obj.feather) : 0.5,
    flow: typeof obj.flow === 'number' ? clamp01(obj.flow) : 1,
    erase: obj.erase === true,
  }
}

function normalizeLocalAdjustments(value: unknown): LocalAdjustment[] {
  if (!Array.isArray(value)) return []
  const out: LocalAdjustment[] = []
  const num = (v: unknown, fallback: number) =>
    typeof v === 'number' && Number.isFinite(v) ? v : fallback
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue
    const obj = raw as Record<string, unknown>
    const base = {
      id: typeof obj.id === 'string' ? obj.id : crypto.randomUUID(),
      invert: obj.invert === true,
      exposure: num(obj.exposure, 0),
      contrast: num(obj.contrast, 0),
      saturation: num(obj.saturation, 0),
      temperature: num(obj.temperature, 0),
    }
    if (obj.type === 'radial') {
      out.push({
        ...base,
        type: 'radial',
        cx: clamp01(num(obj.cx, 0.5)),
        cy: clamp01(num(obj.cy, 0.5)),
        radiusX: Math.max(0.02, Math.min(1.5, num(obj.radiusX, 0.35))),
        radiusY: Math.max(0.02, Math.min(1.5, num(obj.radiusY, 0.35))),
        feather: clamp01(num(obj.feather, 0.35)),
      })
    } else if (obj.type === 'linear') {
      out.push({
        ...base,
        type: 'linear',
        x1: num(obj.x1, 0.5),
        y1: num(obj.y1, 0.15),
        x2: num(obj.x2, 0.5),
        y2: num(obj.y2, 0.55),
      })
    } else if (obj.type === 'brush') {
      const strokes = Array.isArray(obj.strokes)
        ? obj.strokes.map(normalizeStroke).filter((st): st is BrushStroke => st !== null)
        : []
      out.push({ ...base, type: 'brush', strokes })
    }
  }
  return out
}

function normalizeHeal(value: unknown): HealSpot[] {
  if (!Array.isArray(value)) return []
  const out: HealSpot[] = []
  const num = (v: unknown, fallback: number) =>
    typeof v === 'number' && Number.isFinite(v) ? v : fallback
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue
    const obj = raw as Record<string, unknown>
    if (!Array.isArray(obj.points)) continue
    const points = obj.points.filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
    if (points.length < 2) continue
    out.push({
      id: typeof obj.id === 'string' ? obj.id : crypto.randomUUID(),
      mode: obj.mode === 'clone' || obj.mode === 'remove' ? obj.mode : 'heal',
      points: points.length % 2 === 0 ? points : points.slice(0, -1),
      size: Math.min(0.25, Math.max(0.001, num(obj.size, 0.02))),
      feather: clamp01(num(obj.feather, 0.3)),
      opacity: clamp01(num(obj.opacity, 1)),
      dx: Math.min(1, Math.max(-1, num(obj.dx, 0.05))),
      dy: Math.min(1, Math.max(-1, num(obj.dy, 0))),
    })
  }
  return out
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

  if (obj.crop !== undefined) next.crop = normalizeCrop(obj.crop)
  if (obj.toneCurve !== undefined) next.toneCurve = normalizeToneCurve(obj.toneCurve)
  if (obj.colorGrading !== undefined) next.colorGrading = normalizeColorGrading(obj.colorGrading)
  if (obj.localAdjustments !== undefined) {
    next.localAdjustments = normalizeLocalAdjustments(obj.localAdjustments)
  }
  if (obj.heal !== undefined) next.heal = normalizeHeal(obj.heal)

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

  const hasBasic = EDIT_SLIDERS.some((slider) => typeof obj[slider.key] === 'number')
  const hasHsl = Boolean(hslRaw && typeof hslRaw === 'object')
  const hasLut = Boolean(lut)
  const hasRotate = typeof obj.rotate === 'number' && Number.isFinite(obj.rotate)
  const hasCrop = obj.crop !== undefined
  const hasCurve = obj.toneCurve !== undefined
  const hasLocal = Array.isArray(obj.localAdjustments) && obj.localAdjustments.length > 0
  const hasGrading = obj.colorGrading !== undefined
  if (
    !hasBasic &&
    !hasHsl &&
    !hasLut &&
    !hasRotate &&
    !hasCrop &&
    !hasCurve &&
    !hasLocal &&
    !hasGrading
  ) {
    return null
  }
  return next
}

export const ASPECT_PRESETS: { id: string; label: string; ratio: number | null }[] = [
  { id: 'free', label: 'Free', ratio: null },
  { id: 'original', label: 'Original', ratio: null },
  { id: '1:1', label: '1:1', ratio: 1 },
  { id: '4:5', label: '4:5', ratio: 4 / 5 },
  { id: '3:2', label: '3:2', ratio: 3 / 2 },
  { id: '16:9', label: '16:9', ratio: 16 / 9 },
]
