import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { downloadBlob, fetchSampleImages, openImages } from '../lib/files'
import { BUILTIN_PRESETS, isBuiltinPreset } from '../lib/builtinPresets'
import { setSourceKey } from '../lib/cutout'
import { type RenderSource } from '../lib/imageProcessing'
import { exportEditedImage } from '../lib/renderPipeline'
import {
  createPreset,
  downloadAllPresetsJson,
  downloadPresetJson,
  loadPresets,
  readPresetsFromFile,
  savePresets,
} from '../lib/presets'
import { decodeRawLinear, decodeRawToJpegBlob, isRawFile } from '../lib/rawDecode'
import {
  clearSessionSnapshot,
  loadSessionSnapshot,
  photosToPersisted,
  saveSessionSnapshot,
} from '../lib/sessionStore'
import {
  DEFAULT_EDITS,
  DEFAULT_EXPORT_OPTIONS,
  blendEdits,
  cloneEdits,
  createLocalAdjustment,
  mergeEdits,
  normalizeEdits,
  patchLocalAdjustment,
  type EditParams,
  type ExportOptions,
  type LocalAdjustmentPatch,
  type LocalAdjustmentType,
  type PhotoFlag,
  type PhotoSession,
  type Preset,
} from '../types/edits'

export type PanelId = 'adjust' | 'color' | 'effects' | 'curve' | 'crop' | 'heal' | 'local' | 'presets'

/** Panels in tab order; Shift + 1…8 jumps to them. */
export const PANELS: { id: PanelId; label: string }[] = [
  { id: 'adjust', label: 'Adjust' },
  { id: 'color', label: 'Color' },
  { id: 'effects', label: 'Effects' },
  { id: 'curve', label: 'Curve' },
  { id: 'crop', label: 'Crop' },
  { id: 'heal', label: 'Retouch' },
  { id: 'local', label: 'Local' },
  { id: 'presets', label: 'Presets' },
]

/** Which photos the filmstrip shows. */
export type FilmstripFilter = 'all' | 'picks' | 'rejected' | 'unflagged' | `stars-${1 | 2 | 3 | 4 | 5}`

export function matchesFilter(photo: PhotoSession, filter: FilmstripFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'picks') return photo.flag === 'pick'
  if (filter === 'rejected') return photo.flag === 'reject'
  if (filter === 'unflagged') return photo.flag === null
  return photo.rating >= Number(filter.slice(6))
}

type HistoryEntry = {
  photoId: string
  edits: EditParams
}

async function makePhoto(file: File, edits?: EditParams): Promise<PhotoSession> {
  let objectUrl: string
  if (isRawFile(file)) {
    const jpeg = await decodeRawToJpegBlob(file)
    objectUrl = URL.createObjectURL(jpeg)
  } else {
    objectUrl = URL.createObjectURL(file)
  }

  return {
    id: crypto.randomUUID(),
    name: file.name,
    path: file.name,
    objectUrl,
    file,
    edits: cloneEdits(edits ?? DEFAULT_EDITS),
    thumbnailUrl: objectUrl,
    rating: 0,
    flag: null,
  }
}

export type Toast = {
  id: number
  message: string
  tone: 'success' | 'error'
}

const TOAST_DURATION_MS = 3500

async function loadImage(url: string): Promise<HTMLImageElement> {
  const img = new Image()
  img.src = url
  await img.decode()
  return img
}

/** Full-resolution export source: RAWs are developed from the sensor data. */
export async function loadExportSource(photo: PhotoSession): Promise<RenderSource> {
  let source: RenderSource | null = null
  if (isRawFile(photo.file)) {
    try {
      source = await decodeRawLinear(photo.file, { halfSize: false })
    } catch {
      // LibRaw could not develop it — export from the embedded JPEG instead.
    }
  }
  source ??= await loadImage(photo.objectUrl)
  // Reuse the preview's background cutout instead of finding the subject again.
  setSourceKey(source, photo.objectUrl)
  return source
}

function revokeAll(photos: PhotoSession[]) {
  for (const photo of photos) URL.revokeObjectURL(photo.objectUrl)
}

export function useEditorSession({ keyboard = true }: { keyboard?: boolean } = {}) {
  // Other modes (the collage studio) turn the editor's shortcuts off.
  const keyboardRef = useRef(keyboard)
  useEffect(() => {
    keyboardRef.current = keyboard
  })
  const [photos, setPhotos] = useState<PhotoSession[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [presets, setPresets] = useState<Preset[]>([])
  const [presetsLoaded, setPresetsLoaded] = useState(false)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [presetIntensity, setPresetIntensityState] = useState(100)
  /** Per-photo edits from before the current preset was applied, restored on remove. */
  const presetBaseRef = useRef(new Map<string, EditParams>())
  const [clipboard, setClipboard] = useState<EditParams | null>(null)
  const [status, setStatus] = useState('Open JPEG, PNG, or RAW files to begin')
  const [compareMode, setCompareMode] = useState(false)
  const [splitMode, setSplitMode] = useState(false)
  // The split slider over the image is the main before/after view; it replaces a whole-image "Before".
  const toggleSplit = useCallback(() => {
    setCompareMode(false)
    setSplitMode((v) => !v)
  }, [])
  const [showClipping, setShowClipping] = useState(false)
  const [cropMode, setCropMode] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS)
  const [panelFocus, setPanelFocus] = useState<PanelId>('adjust')
  const [filmstripFilter, setFilmstripFilter] = useState<FilmstripFilter>('all')
  const [filmstripVisible, setFilmstripVisible] = useState(true)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const photosRef = useRef(photos)
  const presetsRef = useRef(presets)
  const intensityRef = useRef(presetIntensity)
  const activeIdRef = useRef(activeId)
  const selectedIdsRef = useRef(selectedIds)
  const pastRef = useRef<HistoryEntry[]>([])
  const futureRef = useRef<HistoryEntry[]>([])
  const historyAnchorRef = useRef<EditParams | null>(null)
  const persistTimerRef = useRef(0)
  const toastTimerRef = useRef(0)

  const activePhoto = useMemo(
    () => photos.find((p) => p.id === activeId) ?? null,
    [photos, activeId],
  )

  const dismissToast = useCallback(() => {
    window.clearTimeout(toastTimerRef.current)
    setToast(null)
  }, [])

  const showToast = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    window.clearTimeout(toastTimerRef.current)
    setToast({ id: Date.now(), message, tone })
    toastTimerRef.current = window.setTimeout(() => setToast(null), TOAST_DURATION_MS)
  }, [])

  const syncHistoryFlags = useCallback(() => {
    setCanUndo(pastRef.current.length > 0)
    setCanRedo(futureRef.current.length > 0)
  }, [])

  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  useEffect(() => {
    presetsRef.current = presets
  }, [presets])

  useEffect(() => {
    intensityRef.current = presetIntensity
  }, [presetIntensity])

  useEffect(() => {
    activeIdRef.current = activeId
  }, [activeId])

  useEffect(() => {
    selectedIdsRef.current = selectedIds
  }, [selectedIds])

  // Load presets once. Until this finishes nothing is written back, so an
  // empty initial state can never overwrite the stored presets.
  useEffect(() => {
    let cancelled = false
    loadPresets()
      .then((loaded) => {
        if (cancelled) return
        setPresets((prev) => {
          const ids = new Set(prev.map((p) => p.id))
          return [...prev, ...loaded.filter((p) => !ids.has(p.id))]
        })
        setPresetsLoaded(true)
      })
      .catch(() => {
        if (!cancelled) setStatus('Could not load custom presets — nothing was overwritten')
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!presetsLoaded) return
    savePresets(presets).catch(() => {
      setStatus('Could not save presets — export a backup from the Presets panel')
    })
  }, [presets, presetsLoaded])

  useEffect(() => {
    return () => {
      revokeAll(photosRef.current)
      window.clearTimeout(persistTimerRef.current)
      window.clearTimeout(toastTimerRef.current)
    }
  }, [])

  // Restore session from IndexedDB once on mount
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const snap = await loadSessionSnapshot()
        if (!snap || cancelled || snap.photos.length === 0) {
          setSessionReady(true)
          return
        }
        setStatus(`Restoring ${snap.photos.length} image${snap.photos.length === 1 ? '' : 's'}…`)
        const next: PhotoSession[] = []
        for (const item of snap.photos) {
          const file =
            item.file instanceof File
              ? item.file
              : new File([item.file], item.fileName || item.name, {
                  type: item.fileType || 'application/octet-stream',
                })
          const photo = await makePhoto(file, normalizeEdits(item.edits) ?? undefined)
          photo.id = item.id
          photo.rating = item.rating ?? 0
          photo.flag = item.flag ?? null
          next.push(photo)
        }
        if (cancelled) {
          revokeAll(next)
          return
        }
        setPhotos(next)
        setActiveId(snap.activeId && next.some((p) => p.id === snap.activeId) ? snap.activeId : next[0]?.id ?? null)
        setSelectedIds(
          snap.selectedIds.filter((id) => next.some((p) => p.id === id)),
        )
        setStatus(`Restored ${next.length} image${next.length === 1 ? '' : 's'}`)
      } catch {
        if (!cancelled) setStatus('Could not restore previous session')
      } finally {
        if (!cancelled) setSessionReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Persist session (debounced)
  useEffect(() => {
    if (!sessionReady) return
    window.clearTimeout(persistTimerRef.current)
    persistTimerRef.current = window.setTimeout(() => {
      if (photos.length === 0) {
        void clearSessionSnapshot()
        return
      }
      void saveSessionSnapshot({
        photos: photosToPersisted(photos),
        activeId,
        selectedIds,
        updatedAt: new Date().toISOString(),
      })
    }, 600)
  }, [photos, activeId, selectedIds, sessionReady])

  const pushHistory = useCallback(
    (photoId: string, edits: EditParams) => {
      pastRef.current.push({ photoId, edits: cloneEdits(edits) })
      if (pastRef.current.length > 100) pastRef.current.shift()
      futureRef.current = []
      syncHistoryFlags()
    },
    [syncHistoryFlags],
  )

  const beginEdit = useCallback(() => {
    const photo = photosRef.current.find((p) => p.id === activeIdRef.current)
    if (!photo) return
    historyAnchorRef.current = cloneEdits(photo.edits)
  }, [])

  const commitEdit = useCallback(() => {
    const photo = photosRef.current.find((p) => p.id === activeIdRef.current)
    const anchor = historyAnchorRef.current
    historyAnchorRef.current = null
    if (!photo || !anchor) return
    if (JSON.stringify(anchor) === JSON.stringify(photo.edits)) return
    pushHistory(photo.id, anchor)
  }, [pushHistory])

  const applyEditsToPhoto = useCallback((photoId: string, edits: EditParams) => {
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === photoId ? { ...photo, edits: cloneEdits(edits) } : photo)),
    )
  }, [])

  const updateEdits = useCallback(
    (patch: Partial<EditParams>, opts?: { commit?: boolean }) => {
      const id = activeIdRef.current
      if (!id) return
      if (opts?.commit) {
        const photo = photosRef.current.find((p) => p.id === id)
        if (photo) pushHistory(id, photo.edits)
      } else if (!historyAnchorRef.current) {
        beginEdit()
      }
      setPhotos((prev) =>
        prev.map((photo) =>
          photo.id === id ? { ...photo, edits: mergeEdits(photo.edits, patch) } : photo,
        ),
      )
    },
    [beginEdit, pushHistory],
  )

  const undo = useCallback(() => {
    const entry = pastRef.current.pop()
    if (!entry) return
    const current = photosRef.current.find((p) => p.id === entry.photoId)
    if (current) {
      futureRef.current.push({ photoId: entry.photoId, edits: cloneEdits(current.edits) })
    }
    applyEditsToPhoto(entry.photoId, entry.edits)
    setActiveId(entry.photoId)
    setStatus('Undo')
    syncHistoryFlags()
  }, [applyEditsToPhoto, syncHistoryFlags])

  const redo = useCallback(() => {
    const entry = futureRef.current.pop()
    if (!entry) return
    const current = photosRef.current.find((p) => p.id === entry.photoId)
    if (current) {
      pastRef.current.push({ photoId: entry.photoId, edits: cloneEdits(current.edits) })
    }
    applyEditsToPhoto(entry.photoId, entry.edits)
    setActiveId(entry.photoId)
    setStatus('Redo')
    syncHistoryFlags()
  }, [applyEditsToPhoto, syncHistoryFlags])

  const loadFiles = useCallback(async (files: File[], edits?: EditParams): Promise<PhotoSession[]> => {
    const rawCount = files.filter(isRawFile).length
    setStatus(
      rawCount > 0
        ? `Opening ${rawCount} RAW file${rawCount === 1 ? '' : 's'}…`
        : 'Loading images…',
    )

    const next: PhotoSession[] = []
    try {
      for (const file of files) {
        next.push(await makePhoto(file, edits))
      }
      const append = photosRef.current.length > 0
      setPhotos((prev) => (append ? [...prev, ...next] : next))
      if (!append) {
        pastRef.current = []
        futureRef.current = []
        syncHistoryFlags()
      }
      const focusId = next[0]?.id ?? null
      setActiveId(focusId)
      setSelectedIds(focusId ? [focusId] : [])
      setStatus(
        append
          ? `Added ${next.length} image${next.length === 1 ? '' : 's'}`
          : `Loaded ${next.length} image${next.length === 1 ? '' : 's'}`,
      )
      return next
    } catch (err) {
      revokeAll(next)
      const message = err instanceof Error ? err.message : 'Failed to open images'
      setStatus(message)
      return []
    }
  }, [syncHistoryFlags])

  const handleOpen = useCallback(async (opts?: { folder?: boolean }): Promise<PhotoSession[]> => {
    const files = await openImages(opts)
    if (files.length === 0) return []
    return loadFiles(files)
  }, [loadFiles])

  /** First-visit demo: sample photos opened unedited, like a fresh RAW import. */
  const openSamples = useCallback(async () => {
    setStatus('Loading sample photos…')
    let files: File[]
    try {
      files = await fetchSampleImages()
    } catch {
      showToast('Could not load sample photos', 'error')
      setStatus('Open JPEG, PNG, or RAW files to begin')
      return
    }
    const loaded = await loadFiles(files)
    if (loaded.length === 0) return
    showToast('Sample photos straight from RAW — try a preset or the sliders')
  }, [loadFiles, showToast])

  /** Drop every open photo and its history; presets and the clipboard stay. */
  const clearWorkspace = useCallback(() => {
    const count = photosRef.current.length
    revokeAll(photosRef.current)
    setPhotos([])
    setActiveId(null)
    setSelectedIds([])
    pastRef.current = []
    futureRef.current = []
    syncHistoryFlags()
    presetBaseRef.current.clear()
    setSelectedPresetId(null)
    setPresetIntensityState(100)
    setStatus(`Cleared ${count} photo${count === 1 ? '' : 's'} from the workspace`)
  }, [syncHistoryFlags])

  const selectPhoto = useCallback((id: string, opts?: { additive?: boolean; range?: boolean }) => {
    if (opts?.additive) {
      setSelectedIds((prev) => {
        if (prev.includes(id)) {
          const next = prev.filter((x) => x !== id)
          if (id === activeIdRef.current) {
            setActiveId(next[next.length - 1] ?? null)
          }
          return next.length > 0 ? next : [id]
        }
        // Keep the current primary/active photo when expanding the selection
        if (!activeIdRef.current) setActiveId(id)
        return prev.length > 0 ? [...prev, id] : [id]
      })
      return
    }
    if (opts?.range && selectedIdsRef.current.length > 0) {
      const order = photosRef.current.map((p) => p.id)
      const anchor = activeIdRef.current ?? selectedIdsRef.current[0]!
      const a = order.indexOf(anchor)
      const b = order.indexOf(id)
      if (a >= 0 && b >= 0) {
        const [lo, hi] = a < b ? [a, b] : [b, a]
        setSelectedIds(order.slice(lo, hi + 1))
        setActiveId(anchor)
        return
      }
    }
    setActiveId(id)
    setSelectedIds([id])
  }, [])

  const selectAll = useCallback(() => {
    const ids = photosRef.current.map((p) => p.id)
    setSelectedIds(ids)
    setStatus(`Selected ${ids.length}`)
  }, [])

  const resetEdits = useCallback(() => {
    const id = activeIdRef.current
    if (!id) return
    const photo = photosRef.current.find((p) => p.id === id)
    if (!photo) return
    pushHistory(id, photo.edits)
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        return {
          ...p,
          edits: {
            ...cloneEdits(DEFAULT_EDITS),
            rotate: p.edits.rotate,
            crop: cloneEdits(p.edits).crop,
            heal: cloneEdits(p.edits).heal,
            background: { ...p.edits.background },
          },
        }
      }),
    )
    setSelectedPresetId(null)
    setStatus('Edits reset')
  }, [pushHistory])

  const applyPresetAtIntensity = useCallback(
    (preset: Preset, intensity: number, targetIds?: string[]) => {
      const ids = targetIds ?? (activeIdRef.current ? [activeIdRef.current] : [])
      if (ids.length === 0) return
      const amount = Math.min(100, Math.max(0, intensity)) / 100
      setPhotos((prev) =>
        prev.map((photo) => {
          if (!ids.includes(photo.id)) return photo
          const blended = blendEdits(DEFAULT_EDITS, preset.edits, amount)
          blended.rotate = photo.edits.rotate
          blended.crop = cloneEdits(photo.edits).crop
          blended.heal = cloneEdits(photo.edits).heal
          blended.background = { ...photo.edits.background }
          return { ...photo, edits: blended }
        }),
      )
    },
    [],
  )

  const copyEdits = useCallback(() => {
    const photo = photosRef.current.find((p) => p.id === activeIdRef.current)
    if (!photo) return
    setClipboard(cloneEdits(photo.edits))
    setStatus(`Copied edits from ${photo.name}`)
  }, [])

  const pasteEdits = useCallback(() => {
    if (!clipboard) return
    const targets =
      selectedIdsRef.current.length > 0
        ? selectedIdsRef.current
        : activeIdRef.current
          ? [activeIdRef.current]
          : []
    if (targets.length === 0) return
    for (const id of targets) {
      const photo = photosRef.current.find((p) => p.id === id)
      if (photo) pushHistory(id, photo.edits)
    }
    setPhotos((prev) =>
      prev.map((photo) =>
        // Spot removal belongs to the photo it was painted on.
        targets.includes(photo.id) ? { ...photo, edits: { ...cloneEdits(clipboard), heal: photo.edits.heal } } : photo,
      ),
    )
    setStatus(`Pasted edits to ${targets.length} photo${targets.length === 1 ? '' : 's'}`)
  }, [clipboard, pushHistory])

  const syncSelected = useCallback(() => {
    const source = photosRef.current.find((p) => p.id === activeIdRef.current)
    if (!source) return
    const targets = selectedIdsRef.current.filter((id) => id !== source.id)
    if (targets.length === 0) {
      setStatus('Select other photos to sync')
      return
    }
    for (const id of targets) {
      const photo = photosRef.current.find((p) => p.id === id)
      if (photo) pushHistory(id, photo.edits)
    }
    const edits = cloneEdits(source.edits)
    setPhotos((prev) =>
      prev.map((photo) => {
        if (!targets.includes(photo.id)) return photo
        const next = cloneEdits(edits)
        next.rotate = photo.edits.rotate
        next.crop = cloneEdits(photo.edits).crop
        next.heal = cloneEdits(photo.edits).heal
        return { ...photo, edits: next }
      }),
    )
    setStatus(`Synced edits to ${targets.length} photo${targets.length === 1 ? '' : 's'}`)
  }, [pushHistory])

  const savePreset = useCallback((name: string) => {
    const photo = photosRef.current.find((p) => p.id === activeIdRef.current)
    if (!photo) return
    const preset = createPreset(name, photo.edits)
    setPresets((prev) => [preset, ...prev])
    // The saved preset is the photo's own look, so there is nothing to revert to
    presetBaseRef.current.clear()
    setSelectedPresetId(preset.id)
    setPresetIntensityState(100)
    setStatus(`Saved custom preset “${preset.name}”`)
  }, [])

  const updateSelectedPreset = useCallback(() => {
    if (!selectedPresetId || isBuiltinPreset(selectedPresetId) || !activeIdRef.current) return
    const photo = photosRef.current.find((p) => p.id === activeIdRef.current)
    if (!photo) return
    let updatedName = ''
    setPresets((prev) =>
      prev.map((preset) => {
        if (preset.id !== selectedPresetId) return preset
        updatedName = preset.name
        return { ...preset, edits: { ...cloneEdits(photo.edits), heal: [], background: { ...DEFAULT_EDITS.background } } }
      }),
    )
    setPresetIntensityState(100)
    setStatus(updatedName ? `Updated “${updatedName}” with current edits` : 'Preset updated')
  }, [selectedPresetId])

  const applyPreset = useCallback(
    (preset: Preset) => {
      const targets =
        selectedIdsRef.current.length > 0
          ? selectedIdsRef.current
          : activeIdRef.current
            ? [activeIdRef.current]
            : []
      for (const id of targets) {
        const photo = photosRef.current.find((p) => p.id === id)
        if (!photo) continue
        pushHistory(id, photo.edits)
        // Switching presets keeps the original base, not the previous preset's look
        if (!presetBaseRef.current.has(id)) presetBaseRef.current.set(id, cloneEdits(photo.edits))
      }
      setSelectedPresetId(preset.id)
      applyPresetAtIntensity(preset, intensityRef.current, targets)
      setStatus(`Applied “${preset.name}” to ${targets.length}`)
    },
    [applyPresetAtIntensity, pushHistory],
  )

  const removePreset = useCallback(() => {
    const preset = [...BUILTIN_PRESETS, ...presetsRef.current].find(
      (p) => p.id === selectedPresetId,
    )
    const targets =
      selectedIdsRef.current.length > 0
        ? selectedIdsRef.current
        : activeIdRef.current
          ? [activeIdRef.current]
          : []
    const restore = new Map<string, EditParams>()
    for (const id of targets) {
      const base = presetBaseRef.current.get(id)
      const photo = photosRef.current.find((p) => p.id === id)
      if (!base || !photo) continue
      pushHistory(id, photo.edits)
      restore.set(id, base)
      presetBaseRef.current.delete(id)
    }
    if (restore.size > 0) {
      setPhotos((prev) =>
        prev.map((photo) => {
          const base = restore.get(photo.id)
          if (!base) return photo
          const next = cloneEdits(base)
          next.rotate = photo.edits.rotate
          next.crop = cloneEdits(photo.edits).crop
          return { ...photo, edits: next }
        }),
      )
    }
    setSelectedPresetId(null)
    setPresetIntensityState(100)
    setStatus(preset ? `Removed “${preset.name}”` : 'Preset removed')
  }, [selectedPresetId, pushHistory])

  const setPresetIntensity = useCallback(
    (intensity: number) => {
      const next = Math.min(100, Math.max(0, Math.round(intensity)))
      setPresetIntensityState(next)
      const preset = [...BUILTIN_PRESETS, ...presetsRef.current].find(
        (p) => p.id === selectedPresetId,
      )
      if (!preset) return
      const targets =
        selectedIdsRef.current.length > 0
          ? selectedIdsRef.current
          : activeIdRef.current
            ? [activeIdRef.current]
            : []
      applyPresetAtIntensity(preset, next, targets)
      setStatus(`“${preset.name}” intensity ${next}%`)
    },
    [selectedPresetId, applyPresetAtIntensity],
  )

  const deletePreset = useCallback((id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id))
    setSelectedPresetId((prev) => (prev === id ? null : prev))
    setStatus('Preset removed')
  }, [])

  const exportPreset = useCallback((preset: Preset) => {
    downloadPresetJson(preset)
    setStatus(`Exported “${preset.name}.json”`)
  }, [])

  const exportAllPresets = useCallback(() => {
    const all = presetsRef.current
    if (all.length === 0) return
    downloadAllPresetsJson(all)
    setStatus(`Exported backup of ${all.length} preset${all.length === 1 ? '' : 's'}`)
  }, [])

  const importPreset = useCallback(async (file: File) => {
    try {
      const imported = await readPresetsFromFile(file)
      const existing = new Set(presetsRef.current.map((p) => p.id))
      const fresh = imported.filter((p) => !existing.has(p.id))
      setPresets((prev) => [...fresh, ...prev])
      if (imported.length === 1) {
        setSelectedPresetId(imported[0]!.id)
        setStatus(`Imported “${imported[0]!.name}”`)
      } else {
        setStatus(`Imported ${fresh.length} of ${imported.length} presets (rest already present)`)
      }
    } catch {
      setStatus('Could not import preset (JSON, XMP, or CUBE)')
    }
  }, [])

  const runExport = useCallback(
    async (options: ExportOptions) => {
      const targets =
        selectedIdsRef.current.length > 0
          ? selectedIdsRef.current
          : activeIdRef.current
            ? [activeIdRef.current]
            : []
      if (targets.length === 0) return
      setExportOptions(options)
      setExportOpen(false)
      setStatus(targets.length > 1 ? `Exporting ${targets.length}…` : 'Exporting…')
      try {
        // The export may change the extension (a transparent cutout saves as PNG): report what was written.
        let lastFilename = ''
        let skipped = 0
        for (const id of targets) {
          const photo = photosRef.current.find((p) => p.id === id)
          if (!photo) continue
          if (isRawFile(photo.file)) setStatus(`Developing ${photo.name}…`)
          const source = await loadExportSource(photo)
          const { blob, filename, upscaleSkipped } = await exportEditedImage(source, photo.edits, options, photo.name, (f) =>
            setStatus(`Upscaling ${photo.name}… ${Math.round(f * 100)}%`),
          )
          downloadBlob(blob, filename)
          lastFilename = filename
          if (upscaleSkipped) skipped++
        }
        const exported = targets.length === 1 ? `Exported ${lastFilename}` : `Exported ${targets.length} files`
        const message =
          skipped === 0
            ? exported
            : `${exported} — not upscaled: ${skipped === targets.length ? 'already' : `${skipped} were already`} at the size limit`
        setStatus(message)
        showToast(message)
      } catch {
        setStatus('Export failed')
        showToast('Export failed', 'error')
      }
    },
    [showToast],
  )

  const addLocal = useCallback(
    (type: LocalAdjustmentType, preset?: LocalAdjustmentPatch & { name?: string }) => {
      const id = activeIdRef.current
      if (!id) return
      const photo = photosRef.current.find((p) => p.id === id)
      if (!photo) return
      pushHistory(id, photo.edits)
      const created = createLocalAdjustment(type)
      const mask = preset ? { ...patchLocalAdjustment(created, preset), name: preset.name } : created
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                edits: {
                  ...cloneEdits(p.edits),
                  localAdjustments: [...p.edits.localAdjustments, mask],
                },
              }
            : p,
        ),
      )
      setPanelFocus('local')
      setStatus(`Added ${preset?.name?.toLowerCase() ?? type} mask`)
    },
    [pushHistory],
  )

  const updateLocal = useCallback(
    (maskId: string, patch: LocalAdjustmentPatch) => {
      const id = activeIdRef.current
      if (!id) return
      if (!historyAnchorRef.current) beginEdit()
      setPhotos((prev) =>
        prev.map((photo) => {
          if (photo.id !== id) return photo
          return {
            ...photo,
            edits: {
              ...cloneEdits(photo.edits),
              localAdjustments: photo.edits.localAdjustments.map((item) =>
                item.id === maskId ? patchLocalAdjustment(item, patch) : item,
              ),
            },
          }
        }),
      )
    },
    [beginEdit],
  )

  const removeLocal = useCallback(
    (maskId: string) => {
      const photo = photosRef.current.find((p) => p.id === activeIdRef.current)
      if (!photo) return
      pushHistory(photo.id, photo.edits)
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photo.id
            ? {
                ...p,
                edits: {
                  ...cloneEdits(p.edits),
                  localAdjustments: p.edits.localAdjustments.filter((item) => item.id !== maskId),
                },
              }
            : p,
        ),
      )
    },
    [pushHistory],
  )

  /** Rating / flag go to the whole selection, like Lightroom. */
  const ratingTargets = () =>
    selectedIdsRef.current.length > 0
      ? selectedIdsRef.current
      : activeIdRef.current
        ? [activeIdRef.current]
        : []

  const setRating = useCallback((rating: number) => {
    const targets = ratingTargets()
    if (targets.length === 0) return
    const value = Math.min(5, Math.max(0, Math.round(rating)))
    setPhotos((prev) => prev.map((p) => (targets.includes(p.id) ? { ...p, rating: value } : p)))
    setStatus(value === 0 ? 'Rating cleared' : `Rated ${'★'.repeat(value)}`)
  }, [])

  const setFlag = useCallback((flag: PhotoFlag | null) => {
    const targets = ratingTargets()
    if (targets.length === 0) return
    setPhotos((prev) => prev.map((p) => (targets.includes(p.id) ? { ...p, flag } : p)))
    setStatus(flag === 'pick' ? 'Flagged as pick' : flag === 'reject' ? 'Flagged as rejected' : 'Flag removed')
  }, [])

  const filterRef = useRef(filmstripFilter)
  useEffect(() => {
    filterRef.current = filmstripFilter
  }, [filmstripFilter])

  const visiblePhotos = useMemo(
    () => photos.filter((photo) => matchesFilter(photo, filmstripFilter)),
    [photos, filmstripFilter],
  )

  const stepFilmstrip = useCallback((delta: -1 | 1) => {
    const order = photosRef.current.filter((p) => matchesFilter(p, filterRef.current))
    if (order.length === 0) return
    const idx = order.findIndex((p) => p.id === activeIdRef.current)
    const next = order[Math.min(order.length - 1, Math.max(0, (idx < 0 ? 0 : idx) + delta))]
    if (!next) return
    setActiveId(next.id)
    setSelectedIds([next.id])
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!keyboardRef.current) return
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }
      const mod = e.metaKey || e.ctrlKey
      const key = e.key.toLowerCase()

      if (mod && key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      if ((mod && key === 'z' && e.shiftKey) || (mod && key === 'y')) {
        e.preventDefault()
        redo()
        return
      }
      if (mod && key === 'c') {
        e.preventDefault()
        copyEdits()
        return
      }
      if (mod && key === 'v') {
        e.preventDefault()
        pasteEdits()
        return
      }
      if (mod && key === 'a') {
        e.preventDefault()
        selectAll()
        return
      }
      if (mod && key === 'e') {
        e.preventDefault()
        setExportOpen(true)
        return
      }
      if (mod && key === 's') {
        e.preventDefault()
        syncSelected()
        return
      }

      if (key === '\\' || key === '|') {
        e.preventDefault()
        setCompareMode((v) => !v)
        return
      }
      if (key === 'r') {
        e.preventDefault()
        setCropMode((v) => !v)
        setPanelFocus('crop')
        return
      }
      if (key === 'g') {
        e.preventDefault()
        setFilmstripVisible((v) => !v)
        return
      }
      if (key === 'j') {
        e.preventDefault()
        setShowClipping((v) => !v)
        return
      }
      // Shift + 1…8 picks a panel (e.code: Shift changes e.key on most layouts).
      const digit = /^Digit([0-9])$/.exec(e.code)?.[1]
      if (e.shiftKey && !mod && digit) {
        const panel = PANELS[Number(digit) - 1]
        if (panel) {
          e.preventDefault()
          setPanelFocus(panel.id)
          if (panel.id === 'crop') setCropMode(true)
        }
        return
      }
      if (!mod && !e.altKey && digit && Number(digit) <= 5) {
        setRating(Number(digit))
        return
      }
      if (!mod && key === 'p') {
        setFlag('pick')
        return
      }
      if (!mod && key === 'x') {
        setFlag('reject')
        return
      }
      if (!mod && key === 'u') {
        setFlag(null)
        return
      }
      if (!mod && key === 'm') {
        e.preventDefault()
        addLocal(e.shiftKey ? 'radial' : 'linear')
        return
      }
      if (!mod && key === 'k') {
        e.preventDefault()
        addLocal(e.shiftKey ? 'subject' : 'brush')
        return
      }
      if (!mod && key === 'q') {
        e.preventDefault()
        setPanelFocus('heal')
        return
      }
      if (key === '[' || key === 'arrowup') {
        e.preventDefault()
        stepFilmstrip(-1)
        return
      }
      if (key === ']' || key === 'arrowdown') {
        e.preventDefault()
        stepFilmstrip(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, copyEdits, pasteEdits, selectAll, syncSelected, stepFilmstrip, setRating, setFlag, addLocal])

  return {
    photos,
    activePhoto,
    activeId,
    selectedIds,
    presets,
    selectedPresetId,
    presetIntensity,
    clipboard,
    status,
    compareMode,
    splitMode,
    showClipping,
    cropMode,
    exportOpen,
    exportOptions,
    panelFocus,
    filmstripVisible,
    canUndo,
    canRedo,
    toast,
    dismissToast,
    showToast,
    handleOpen,
    openSamples,
    clearWorkspace,
    selectPhoto,
    selectAll,
    updateEdits,
    beginEdit,
    commitEdit,
    resetEdits,
    undo,
    redo,
    copyEdits,
    pasteEdits,
    syncSelected,
    savePreset,
    updateSelectedPreset,
    applyPreset,
    removePreset,
    setPresetIntensity,
    deletePreset,
    exportPreset,
    exportAllPresets,
    importPreset,
    setCompareMode,
    toggleSplit,
    setShowClipping,
    setCropMode,
    setExportOpen,
    setExportOptions,
    runExport,
    setPanelFocus,
    setFilmstripVisible,
    addLocal,
    updateLocal,
    removeLocal,
    setRating,
    setFlag,
    filmstripFilter,
    setFilmstripFilter,
    visiblePhotos,
  }
}
