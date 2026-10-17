import {
  DEFAULT_EDITS,
  cloneEdits,
  type EditParams,
  type HslChannel,
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

  const temperature = firstNumber(props, 'Temperature', 'Temperature2012')
  if (temperature !== undefined) {
    edits.temperature = mapTemperature(temperature)
    touched = true
  }

  const tint = firstNumber(props, 'Tint', 'Tint2012')
  if (tint !== undefined) {
    edits.tint = mapTint(tint)
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
