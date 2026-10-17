import {
  CURVE_CHANNELS,
  DEFAULT_EDITS,
  cloneEdits,
  isNeutralToneCurve,
  normalizeToneCurve,
  type BasicEditKey,
  type EditParams,
  type GradeZoneId,
  type HslChannel,
  type ToneCurve,
} from '../types/edits'

const HSL_XMP: { channel: HslChannel; hue: string; sat: string; lum: string }[] = [
  { channel: 'reds', hue: 'HueAdjustmentRed', sat: 'SaturationAdjustmentRed', lum: 'LuminanceAdjustmentRed' },
  {
    channel: 'oranges',
    hue: 'HueAdjustmentOrange',
    sat: 'SaturationAdjustmentOrange',
    lum: 'LuminanceAdjustmentOrange',
  },
  {
    channel: 'yellows',
    hue: 'HueAdjustmentYellow',
    sat: 'SaturationAdjustmentYellow',
    lum: 'LuminanceAdjustmentYellow',
  },
  {
    channel: 'greens',
    hue: 'HueAdjustmentGreen',
    sat: 'SaturationAdjustmentGreen',
    lum: 'LuminanceAdjustmentGreen',
  },
  {
    channel: 'aquas',
    hue: 'HueAdjustmentAqua',
    sat: 'SaturationAdjustmentAqua',
    lum: 'LuminanceAdjustmentAqua',
  },
  {
    channel: 'blues',
    hue: 'HueAdjustmentBlue',
    sat: 'SaturationAdjustmentBlue',
    lum: 'LuminanceAdjustmentBlue',
  },
  {
    channel: 'purples',
    hue: 'HueAdjustmentPurple',
    sat: 'SaturationAdjustmentPurple',
    lum: 'LuminanceAdjustmentPurple',
  },
  {
    channel: 'magentas',
    hue: 'HueAdjustmentMagenta',
    sat: 'SaturationAdjustmentMagenta',
    lum: 'LuminanceAdjustmentMagenta',
  },
]

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

function stripTags(value: string): string {
  return decodeXmlEntities(value.replace(/<[^>]+>/g, '').trim())
}

/** Collect crs:/lr: properties from attribute and element forms. */
function collectCrsProps(text: string): Map<string, string> {
  const props = new Map<string, string>()

  const attrRe = /\b(?:crs|lr):([A-Za-z0-9_]+)\s*=\s*"([^"]*)"/g
  for (const match of text.matchAll(attrRe)) {
    const key = match[1]
    const value = match[2]
    if (key && value !== undefined && !props.has(key)) {
      props.set(key, decodeXmlEntities(value))
    }
  }

  const elRe = /<(?:crs|lr):([A-Za-z0-9_]+)\b[^>]*>([\s\S]*?)<\/(?:crs|lr):\1>/g
  for (const match of text.matchAll(elRe)) {
    const key = match[1]
    const raw = match[2]
    if (!key || raw === undefined || props.has(key)) continue
    props.set(key, stripTags(raw))
  }

  return props
}

function parseNumber(raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined
  const cleaned = raw.replace(/^[+]/, '').trim()
  if (!cleaned) return undefined
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : undefined
}

function firstNumber(props: Map<string, string>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const n = parseNumber(props.get(key))
    if (n !== undefined) return n
  }
  return undefined
}

/** Map Kelvin (or relative) white-balance temperature onto −100…100. */
function mapTemperature(value: number): number {
  if (Math.abs(value) <= 200) return value
  // 2000K → −100, 5500K → 0, 9000K → ~100
  return Math.max(-100, Math.min(100, ((value - 5500) / 3500) * 100))
}

function mapTint(value: number): number {
  // Lightroom tint is typically −150…150
  return Math.max(-100, Math.min(100, value))
}

/** `ToneCurvePV2012` is a sequence of "x, y" pairs in 0–255. */
function parseToneCurve(raw: string | undefined): ToneCurve | null {
  if (!raw) return null
  const points = [...raw.matchAll(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/g)].map((m) => ({
    x: Number(m[1]) / 255,
    y: Number(m[2]) / 255,
  }))
  const curve = normalizeToneCurve({ points })
  return isNeutralToneCurve(curve) ? null : curve
}

export function extractXmpPresetName(text: string): string | null {
  const props = collectCrsProps(text)
  const fromProp = props.get('Name') ?? props.get('PresetName') ?? props.get('LookName')
  if (fromProp?.trim()) return fromProp.trim()

  const alt = text.match(
    /<(?:crs|lr):(?:Name|PresetName)\b[^>]*>[\s\S]*?<rdf:li\b[^>]*>([^<]+)<\/rdf:li>/i,
  )
  if (alt?.[1]?.trim()) return decodeXmlEntities(alt[1].trim())

  return null
}

export function parseXmpToEdits(text: string): EditParams {
  const props = collectCrsProps(text)
  if (props.size === 0) {
    throw new Error('No Camera Raw settings found in XMP')
  }

  const edits = cloneEdits(DEFAULT_EDITS)
  let touched = false

  const exposure = firstNumber(props, 'Exposure2012', 'Exposure')
  if (exposure !== undefined) {
    edits.exposure = exposure
    touched = true
  }

  const contrast = firstNumber(props, 'Contrast2012', 'Contrast')
  if (contrast !== undefined) {
    edits.contrast = contrast
    touched = true
  }

  const highlights = firstNumber(props, 'Highlights2012', 'Highlights')
  if (highlights !== undefined) {
    edits.highlights = highlights
    touched = true
  }

  const shadows = firstNumber(props, 'Shadows2012', 'Shadows')
  if (shadows !== undefined) {
    edits.shadows = shadows
    touched = true
  }

  const whites = firstNumber(props, 'Whites2012', 'Whites')
  if (whites !== undefined) {
    edits.whites = whites
    touched = true
  }

  const blacks = firstNumber(props, 'Blacks2012', 'Blacks')
  if (blacks !== undefined) {
    edits.blacks = blacks
    touched = true
  }

  // Lightroom stores relative WB for JPEG/TIFF as Incremental*; absolute
  // Kelvin (raw presets) can only be approximated without the as-shot WB.
  const incrementalTemperature = firstNumber(props, 'IncrementalTemperature')
  const temperature = firstNumber(props, 'Temperature', 'Temperature2012')
  if (incrementalTemperature !== undefined) {
    edits.temperature = Math.max(-100, Math.min(100, incrementalTemperature))
    touched = true
  } else if (temperature !== undefined) {
    edits.temperature = mapTemperature(temperature)
    touched = true
  }

  const tint = firstNumber(props, 'IncrementalTint', 'Tint', 'Tint2012')
  if (tint !== undefined) {
    edits.tint = mapTint(tint)
    touched = true
  }

  const toneCurve = parseToneCurve(props.get('ToneCurvePV2012'))
  if (toneCurve) {
    edits.toneCurve = toneCurve
    touched = true
  }

  const vibrance = firstNumber(props, 'Vibrance')
  if (vibrance !== undefined) {
    edits.vibrance = vibrance
    touched = true
  }

  const saturation = firstNumber(props, 'Saturation')
  if (saturation !== undefined) {
    edits.saturation = saturation
    touched = true
  }

  for (const band of HSL_XMP) {
    const hue = firstNumber(props, band.hue)
    const sat = firstNumber(props, band.sat)
    const lum = firstNumber(props, band.lum)
    if (hue === undefined && sat === undefined && lum === undefined) continue
    edits.hsl[band.channel] = {
      hue: hue ?? 0,
      saturation: sat ?? 0,
      luminance: lum ?? 0,
    }
    touched = true
  }

  // Presence, effects and detail map 1:1 onto our sliders (same ranges).
  const direct: [BasicEditKey, string[], number, number][] = [
    ['texture', ['Texture'], -100, 100],
    ['clarity', ['Clarity2012', 'Clarity'], -100, 100],
    ['dehaze', ['Dehaze'], -100, 100],
    ['vignette', ['PostCropVignetteAmount'], -100, 100],
    ['vignetteMidpoint', ['PostCropVignetteMidpoint'], 0, 100],
    ['grain', ['GrainAmount'], 0, 100],
    ['grainSize', ['GrainSize'], 0, 100],
    ['sharpening', ['Sharpness'], 0, 150],
    ['noiseReduction', ['LuminanceSmoothing'], 0, 100],
    ['colorNoiseReduction', ['ColorNoiseReduction'], 0, 100],
  ]
  for (const [key, names, min, max] of direct) {
    const value = firstNumber(props, ...names)
    if (value === undefined) continue
    edits[key] = Math.max(min, Math.min(max, value))
    touched = true
  }

  for (const channel of CURVE_CHANNELS) {
    const suffix = channel[0]!.toUpperCase() + channel.slice(1)
    const curve = parseToneCurve(props.get(`ToneCurvePV2012${suffix}`))
    if (curve) {
      edits.toneCurve = { ...edits.toneCurve, [channel]: curve.points }
      touched = true
    }
  }

  // Color Grading (Lightroom 10+), falling back to the older Split Toning.
  const zones: [GradeZoneId, string, string, string][] = [
    ['shadows', 'ColorGradeShadowHue', 'ColorGradeShadowSat', 'ColorGradeShadowLum'],
    ['midtones', 'ColorGradeMidtoneHue', 'ColorGradeMidtoneSat', 'ColorGradeMidtoneLum'],
    ['highlights', 'ColorGradeHighlightHue', 'ColorGradeHighlightSat', 'ColorGradeHighlightLum'],
    ['global', 'ColorGradeGlobalHue', 'ColorGradeGlobalSat', 'ColorGradeGlobalLum'],
  ]
  for (const [zone, hueKey, satKey, lumKey] of zones) {
    const hue = firstNumber(props, hueKey)
    const sat = firstNumber(props, satKey)
    const lum = firstNumber(props, lumKey)
    if (hue === undefined && sat === undefined && lum === undefined) continue
    edits.colorGrading[zone] = { hue: hue ?? 0, saturation: sat ?? 0, luminance: lum ?? 0 }
    touched = true
  }
  const hasColorGrade = zones.some(([, hueKey, satKey]) => props.has(hueKey) || props.has(satKey))
  if (!hasColorGrade) {
    const shadowHue = firstNumber(props, 'SplitToningShadowHue')
    const shadowSat = firstNumber(props, 'SplitToningShadowSaturation')
    const highHue = firstNumber(props, 'SplitToningHighlightHue')
    const highSat = firstNumber(props, 'SplitToningHighlightSaturation')
    if (shadowSat) {
      edits.colorGrading.shadows = { hue: shadowHue ?? 0, saturation: shadowSat, luminance: 0 }
      touched = true
    }
    if (highSat) {
      edits.colorGrading.highlights = { hue: highHue ?? 0, saturation: highSat, luminance: 0 }
      touched = true
    }
  }
  const blending = firstNumber(props, 'ColorGradeBlending')
  if (blending !== undefined) edits.colorGrading.blending = blending
  const balance = firstNumber(props, 'SplitToningBalance')
  if (balance !== undefined) edits.colorGrading.balance = balance

  if (!touched) {
    throw new Error('XMP has no mappable develop settings')
  }

  return edits
}

export function isXmpText(text: string): boolean {
  const head = text.slice(0, 2048)
  return (
    /<x:xmpmeta\b/i.test(head) ||
    /xmlns:crs=/i.test(head) ||
    /<(?:crs|lr):[A-Za-z]/i.test(head)
  )
}
