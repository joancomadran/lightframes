import {
  DEFAULT_EDITS,
  cloneEdits,
  normalizeEdits,
  type EditParams,
  type Preset,
} from '../types/edits'
import { isCubeText, parseCubeLut } from './cubeLut'
import { extractXmpPresetName, isXmpText, parseXmpToEdits } from './xmpPreset'

const STORAGE_KEY = 'lightframes.presets.v1'

function isPreset(value: unknown): value is Preset {
  if (!value || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.createdAt === 'string' &&
    normalizeEdits(obj.edits) !== null
  )
}

function withNormalizedEdits(preset: Preset): Preset {
  const edits = normalizeEdits(preset.edits) ?? cloneEdits(DEFAULT_EDITS)
  return { ...preset, edits }
}

export function loadPresetsFromStorage(): Preset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isPreset).map(withNormalizedEdits)
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
    edits: cloneEdits(edits),
    createdAt: new Date().toISOString(),
  }
}

export function presetToJson(preset: Preset): string {
  return JSON.stringify(preset, null, 2)
}

export function parsePresetJson(text: string): Preset {
  const parsed: unknown = JSON.parse(text)
  if (isPreset(parsed)) {
    return withNormalizedEdits(parsed)
  }
  // Allow a bare { name, edits } or { edits } export
  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>
    const fromEdits = normalizeEdits(obj.edits)
    if (fromEdits) {
      return createPreset(
        typeof obj.name === 'string' ? obj.name : 'Imported preset',
        fromEdits,
      )
    }
    const bare = normalizeEdits(obj)
    if (bare) {
      return createPreset('Imported preset', bare)
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

function extensionOf(name: string): string {
  const m = name.match(/\.([^.]+)$/)
  return m?.[1]?.toLowerCase() ?? ''
}

function baseName(name: string, fallback: string): string {
  const base = name.replace(/\.[^.]+$/, '').trim()
  return base || fallback
}

function presetFromXmp(text: string, fallbackName: string): Preset {
  return createPreset(extractXmpPresetName(text) ?? fallbackName, parseXmpToEdits(text))
}

function presetFromCube(text: string, fallbackName: string): Preset {
  const lut = parseCubeLut(text)
  const edits = cloneEdits(DEFAULT_EDITS)
  edits.lut = lut
  return createPreset(lut.title?.trim() || fallbackName, edits)
}

export async function readPresetFromFile(file: File): Promise<Preset> {
  const text = await file.text()
  const ext = extensionOf(file.name)

  if (ext === 'xmp') return presetFromXmp(text, baseName(file.name, 'Imported XMP'))
  if (ext === 'cube') return presetFromCube(text, baseName(file.name, 'Imported CUBE'))

  // Sniff when extension is missing or generic
  if (isXmpText(text)) return presetFromXmp(text, baseName(file.name, 'Imported XMP'))
  if (isCubeText(text)) return presetFromCube(text, baseName(file.name, 'Imported CUBE'))

  return parsePresetJson(text)
}
