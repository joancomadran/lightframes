import { DEFAULT_EDITS, type EditParams, type Preset } from '../types/edits'

const STORAGE_KEY = 'lightframes.presets.v1'

function isEditParams(value: unknown): value is EditParams {
  if (!value || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return (Object.keys(DEFAULT_EDITS) as (keyof EditParams)[]).every(
    (key) => typeof obj[key] === 'number',
  )
}

function isPreset(value: unknown): value is Preset {
  if (!value || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.createdAt === 'string' &&
    isEditParams(obj.edits)
  )
}

export function loadPresetsFromStorage(): Preset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isPreset)
  } catch {
    return []
  }
}

export function savePresetsToStorage(presets: Preset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
}

export function createPreset(name: string, edits: EditParams): Preset {
  return {
    id: crypto.randomUUID(),
    name: name.trim() || 'Untitled preset',
    edits: { ...edits },
    createdAt: new Date().toISOString(),
  }
}

export function presetToJson(preset: Preset): string {
  return JSON.stringify(preset, null, 2)
}

export function parsePresetJson(text: string): Preset {
  const parsed: unknown = JSON.parse(text)
  if (isPreset(parsed)) {
    return {
      ...parsed,
      edits: { ...DEFAULT_EDITS, ...parsed.edits },
    }
  }
  // Allow a bare { name, edits } or { edits } export
  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>
    if (isEditParams(obj.edits)) {
      return createPreset(
        typeof obj.name === 'string' ? obj.name : 'Imported preset',
        { ...DEFAULT_EDITS, ...obj.edits },
      )
    }
    if (isEditParams(obj)) {
      return createPreset('Imported preset', { ...DEFAULT_EDITS, ...obj })
    }
  }
  throw new Error('Invalid preset JSON')
}

export function downloadPresetJson(preset: Preset): void {
  const blob = new Blob([presetToJson(preset)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${preset.name.replace(/[^\w.-]+/g, '_').toLowerCase() || 'preset'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function readPresetFromFile(file: File): Promise<Preset> {
  const text = await file.text()
  return parsePresetJson(text)
}
