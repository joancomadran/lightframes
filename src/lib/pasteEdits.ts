import { cloneEdits, type EditParams } from '../types/edits'

export type PasteGroupId =
  | 'light'
  | 'whiteBalance'
  | 'presence'
  | 'toneCurve'
  | 'hsl'
  | 'colorGrading'
  | 'detail'
  | 'effects'
  | 'look'
  | 'masks'
  | 'crop'
  | 'heal'
  | 'liquify'
  | 'background'

export type PasteGroup = {
  id: PasteGroupId
  label: string
  keys: (keyof EditParams)[]
  /** Off by default: these depend on the framing or content of the photo they were made on. */
  local?: boolean
}

export const PASTE_GROUPS: PasteGroup[] = [
  { id: 'light', label: 'Light', keys: ['exposure', 'contrast', 'highlights', 'shadows', 'whites', 'blacks'] },
  { id: 'whiteBalance', label: 'White balance', keys: ['temperature', 'tint'] },
  { id: 'presence', label: 'Presence', keys: ['texture', 'clarity', 'dehaze', 'vibrance', 'saturation'] },
  { id: 'toneCurve', label: 'Tone curve', keys: ['toneCurve'] },
  { id: 'hsl', label: 'HSL', keys: ['hsl'] },
  { id: 'colorGrading', label: 'Color grading', keys: ['colorGrading'] },
  { id: 'detail', label: 'Detail', keys: ['sharpening', 'noiseReduction', 'colorNoiseReduction'] },
  { id: 'effects', label: 'Vignette & grain', keys: ['vignette', 'vignetteMidpoint', 'grain', 'grainSize'] },
  { id: 'look', label: 'Look (LUT)', keys: ['lut', 'lutMix'] },
  { id: 'masks', label: 'Masks', keys: ['localAdjustments'], local: true },
  { id: 'crop', label: 'Crop & rotate', keys: ['crop', 'rotate'], local: true },
  { id: 'heal', label: 'Spot removal', keys: ['heal'], local: true },
  { id: 'liquify', label: 'Liquify', keys: ['liquify'], local: true },
  { id: 'background', label: 'Background', keys: ['background'], local: true },
]

export const DEFAULT_PASTE_GROUPS: PasteGroupId[] = PASTE_GROUPS.filter((g) => !g.local).map((g) => g.id)

const STORAGE_KEY = 'lightframes:paste-groups'

export function loadPasteGroups(): PasteGroupId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PASTE_GROUPS
    const ids = JSON.parse(raw)
    if (!Array.isArray(ids)) return DEFAULT_PASTE_GROUPS
    return PASTE_GROUPS.filter((g) => ids.includes(g.id)).map((g) => g.id)
  } catch {
    return DEFAULT_PASTE_GROUPS
  }
}

export function savePasteGroups(ids: PasteGroupId[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Storage unavailable — keep the choice for this session only.
  }
}

function assign<K extends keyof EditParams>(to: EditParams, from: EditParams, key: K) {
  if (from[key] === undefined) delete to[key]
  else to[key] = from[key]
}

/** `target` with the chosen groups taken from `source`; everything else stays as it was. */
export function pasteGroups(target: EditParams, source: EditParams, groups: PasteGroupId[]): EditParams {
  const from = cloneEdits(source)
  const next = cloneEdits(target)
  for (const group of PASTE_GROUPS) {
    if (!groups.includes(group.id)) continue
    for (const key of group.keys) assign(next, from, key)
  }
  return next
}
