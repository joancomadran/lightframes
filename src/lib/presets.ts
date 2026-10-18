import {
  DEFAULT_EDITS,
  cloneEdits,
  normalizeEdits,
  type EditParams,
  type Preset,
} from '../types/edits'
import { isCubeText, parseCubeLut } from './cubeLut'
import { extractXmpPresetName, isXmpText, parseXmpToEdits } from './xmpPreset'

/** Original localStorage location; kept as a backup copy, never cleared. */
const LEGACY_STORAGE_KEY = 'lightframes.presets.v1'
const DB_NAME = 'lightframes-presets'
const DB_VERSION = 1
const STORE = 'presets'
const KEY = 'all'

type StoredPresets = {
  presets: unknown[]
  updatedAt: string
}

/**
 * Stored entries that no longer validate. They are written back untouched on
 * every save so a schema change can never silently delete a user's preset.
 */
let unreadableEntries: unknown[] = []

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

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
  })
}

async function readDb(): Promise<StoredPresets | null> {
  const db = await openDb()
  try {
    return await new Promise<StoredPresets | null>((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY)
      req.onsuccess = () => resolve((req.result as StoredPresets | undefined) ?? null)
      req.onerror = () => reject(req.error ?? new Error('IndexedDB read failed'))
    })
  } finally {
    db.close()
  }
}

async function writeDb(value: StoredPresets): Promise<void> {
  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(value, KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('IndexedDB write failed'))
    })
  } finally {
    db.close()
  }
}

function readLegacyStorage(): unknown[] {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function splitEntries(entries: unknown[]): Preset[] {
  const presets: Preset[] = []
  unreadableEntries = []
  for (const entry of entries) {
    if (isPreset(entry)) presets.push(withNormalizedEdits(entry))
    else unreadableEntries.push(entry)
  }
  return presets
}

/**
 * Load custom presets from IndexedDB. The first run migrates the old
 * localStorage copy (which is left in place as a backup). Also asks the
 * browser to keep this origin's storage out of automatic eviction.
 */
export async function loadPresets(): Promise<Preset[]> {
  void navigator.storage?.persist?.().catch(() => undefined)

  let stored: StoredPresets | null = null
  try {
    stored = await readDb()
  } catch {
    // IndexedDB unavailable (private mode, blocked) — fall back to the backup.
    return splitEntries(readLegacyStorage())
  }
  if (stored && Array.isArray(stored.presets)) return splitEntries(stored.presets)

  const legacy = readLegacyStorage()
  if (legacy.length > 0) {
    try {
      await writeDb({ presets: legacy, updatedAt: new Date().toISOString() })
    } catch {
      // Migration retried on the next save; localStorage still holds them.
    }
  }
  return splitEntries(legacy)
}

/**
 * Persist presets to IndexedDB (no practical size limit, so LUT presets fit)
 * and mirror them to localStorage as a best-effort backup.
 */
export async function savePresets(presets: Preset[]): Promise<void> {
  const entries: unknown[] = [...presets, ...unreadableEntries]
  await writeDb({ presets: entries, updatedAt: new Date().toISOString() })
  try {
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Over the localStorage quota (large LUTs) — IndexedDB already has them.
  }
}

/** Download every custom preset as one JSON file (importable again). */
export function downloadAllPresetsJson(presets: Preset[]): void {
  const blob = new Blob([JSON.stringify(presets, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lightframes-presets-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function createPreset(name: string, edits: EditParams): Preset {
  return {
    id: crypto.randomUUID(),
    name: name.trim() || 'Untitled preset',
    // Spots only make sense on the photo they were painted on.
    edits: { ...cloneEdits(edits), heal: [] },
    createdAt: new Date().toISOString(),
  }
}

export function presetToJson(preset: Preset): string {
  return JSON.stringify(preset, null, 2)
}

function presetFromJsonValue(parsed: unknown): Preset {
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

/** A single preset export, or a full backup (array of presets). */
export function parsePresetJson(text: string): Preset[] {
  const parsed: unknown = JSON.parse(text)
  if (Array.isArray(parsed)) {
    const presets = parsed.filter(isPreset).map(withNormalizedEdits)
    if (presets.length === 0) throw new Error('No presets in JSON backup')
    return presets
  }
  return [presetFromJsonValue(parsed)]
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

export async function readPresetsFromFile(file: File): Promise<Preset[]> {
  const text = await file.text()
  const ext = extensionOf(file.name)

  if (ext === 'xmp') return [presetFromXmp(text, baseName(file.name, 'Imported XMP'))]
  if (ext === 'cube') return [presetFromCube(text, baseName(file.name, 'Imported CUBE'))]

  // Sniff when extension is missing or generic
  if (isXmpText(text)) return [presetFromXmp(text, baseName(file.name, 'Imported XMP'))]
  if (isCubeText(text)) return [presetFromCube(text, baseName(file.name, 'Imported CUBE'))]

  return parsePresetJson(text)
}
