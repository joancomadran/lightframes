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
}

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
}

export const EDIT_SLIDERS: {
  key: keyof EditParams
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

export function cloneEdits(edits: EditParams): EditParams {
  return { ...edits }
}

export function isNeutralEdits(edits: EditParams): boolean {
  return (Object.keys(DEFAULT_EDITS) as (keyof EditParams)[]).every(
    (key) => edits[key] === DEFAULT_EDITS[key],
  )
}
