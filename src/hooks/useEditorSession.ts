import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { downloadBlob, openImages } from '../lib/files'
import { exportEditedJpeg } from '../lib/imageProcessing'
import {
  createPreset,
  downloadPresetJson,
  loadPresetsFromStorage,
  readPresetFromFile,
  savePresetsToStorage,
} from '../lib/presets'
import { decodeRawToJpegBlob, isRawFile } from '../lib/rawDecode'
import {
  DEFAULT_EDITS,
  blendEdits,
  cloneEdits,
  mergeEdits,
  type EditParams,
  type PhotoSession,
  type Preset,
} from '../types/edits'

async function makePhoto(file: File): Promise<PhotoSession> {
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
    edits: cloneEdits(DEFAULT_EDITS),
    thumbnailUrl: objectUrl,
  }
}

export function useEditorSession() {
  const [photos, setPhotos] = useState<PhotoSession[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [presets, setPresets] = useState<Preset[]>(() => loadPresetsFromStorage())
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [presetIntensity, setPresetIntensityState] = useState(100)
  const [clipboard, setClipboard] = useState<EditParams | null>(null)
  const [status, setStatus] = useState('Open JPEG, PNG, or ARW files to begin')
  const photosRef = useRef(photos)
  const presetsRef = useRef(presets)
  const intensityRef = useRef(presetIntensity)

  const activePhoto = useMemo(
    () => photos.find((p) => p.id === activeId) ?? null,
    [photos, activeId],
  )

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
    savePresetsToStorage(presets)
  }, [presets])

  useEffect(() => {
    return () => {
      for (const photo of photosRef.current) {
        URL.revokeObjectURL(photo.objectUrl)
      }
    }
  }, [])

  const handleOpen = useCallback(async (opts?: { folder?: boolean }) => {
    const files = await openImages(opts)
    if (files.length === 0) return

    const rawCount = files.filter(isRawFile).length
    setStatus(
      rawCount > 0
        ? `Opening ${rawCount} ARW file${rawCount === 1 ? '' : 's'}…`
        : 'Loading images…',
    )

    const next: PhotoSession[] = []
    try {
      for (const file of files) {
        next.push(await makePhoto(file))
      }
      setPhotos((prev) => {
        for (const p of prev) URL.revokeObjectURL(p.objectUrl)
        return next
      })
      setActiveId(next[0]?.id ?? null)
      setStatus(`Loaded ${next.length} image${next.length === 1 ? '' : 's'}`)
    } catch (err) {
      for (const photo of next) URL.revokeObjectURL(photo.objectUrl)
      const message = err instanceof Error ? err.message : 'Failed to open images'
      setStatus(message)
    }
  }, [])

  const selectPhoto = useCallback((id: string) => {
    setActiveId(id)
  }, [])

  const updateEdits = useCallback((patch: Partial<EditParams>) => {
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === activeId ? { ...photo, edits: mergeEdits(photo.edits, patch) } : photo,
      ),
    )
  }, [activeId])

  const resetEdits = useCallback(() => {
    setPhotos((prev) =>
      prev.map((photo) => {
        if (photo.id !== activeId) return photo
        const next = cloneEdits(DEFAULT_EDITS)
        next.rotate = photo.edits.rotate
        return { ...photo, edits: next }
      }),
    )
    setSelectedPresetId(null)
    setStatus('Edits reset')
  }, [activeId])

  const applyPresetAtIntensity = useCallback(
    (preset: Preset, intensity: number) => {
      if (!activeId) return
      const amount = Math.min(100, Math.max(0, intensity)) / 100
      const current = photosRef.current.find((p) => p.id === activeId)
      const blended = blendEdits(DEFAULT_EDITS, preset.edits, amount)
      // Keep canvas orientation independent of develop presets
      blended.rotate = current?.edits.rotate ?? 0
      setPhotos((prev) =>
        prev.map((photo) =>
          photo.id === activeId ? { ...photo, edits: blended } : photo,
        ),
      )
    },
    [activeId],
  )

  const copyEdits = useCallback(() => {
    const photo = photosRef.current.find((p) => p.id === activeId)
    if (!photo) return
    setClipboard(cloneEdits(photo.edits))
    setStatus(`Copied edits from ${photo.name}`)
  }, [activeId])

  const pasteEdits = useCallback(() => {
    if (!clipboard || !activeId) return
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === activeId ? { ...photo, edits: cloneEdits(clipboard) } : photo,
      ),
    )
    setStatus('Pasted edits')
  }, [clipboard, activeId])

  const savePreset = useCallback(
    (name: string) => {
      const photo = photosRef.current.find((p) => p.id === activeId)
      if (!photo) return
      const preset = createPreset(name, photo.edits)
      setPresets((prev) => [preset, ...prev])
      setSelectedPresetId(preset.id)
      setPresetIntensityState(100)
      setStatus(`Saved custom preset “${preset.name}”`)
    },
    [activeId],
  )

  const updateSelectedPreset = useCallback(() => {
    if (!selectedPresetId || !activeId) return
    const photo = photosRef.current.find((p) => p.id === activeId)
    if (!photo) return
    let updatedName = ''
    setPresets((prev) =>
      prev.map((preset) => {
        if (preset.id !== selectedPresetId) return preset
        updatedName = preset.name
        return {
          ...preset,
          edits: cloneEdits(photo.edits),
        }
      }),
    )
    setPresetIntensityState(100)
    setStatus(updatedName ? `Updated “${updatedName}” with current edits` : 'Preset updated')
  }, [selectedPresetId, activeId])

  const applyPreset = useCallback(
    (preset: Preset) => {
      if (!activeId) return
      setSelectedPresetId(preset.id)
      applyPresetAtIntensity(preset, intensityRef.current)
      setStatus(`Applied “${preset.name}” at ${intensityRef.current}%`)
    },
    [activeId, applyPresetAtIntensity],
  )

  const setPresetIntensity = useCallback(
    (intensity: number) => {
      const next = Math.min(100, Math.max(0, Math.round(intensity)))
      setPresetIntensityState(next)
      const preset = presetsRef.current.find((p) => p.id === selectedPresetId)
      if (!preset || !activeId) return
      applyPresetAtIntensity(preset, next)
      setStatus(`“${preset.name}” intensity ${next}%`)
    },
    [selectedPresetId, activeId, applyPresetAtIntensity],
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

  const importPreset = useCallback(async (file: File) => {
    try {
      const preset = await readPresetFromFile(file)
      setPresets((prev) => [preset, ...prev])
      setSelectedPresetId(preset.id)
      setStatus(`Imported “${preset.name}”`)
    } catch {
      setStatus('Could not import preset (JSON, XMP, or CUBE)')
    }
  }, [])

  const exportJpeg = useCallback(async () => {
    const photo = photosRef.current.find((p) => p.id === activeId)
    if (!photo) return
    setStatus('Exporting…')
    try {
      const img = new Image()
      img.src = photo.objectUrl
      await img.decode()
      const blob = await exportEditedJpeg(img, photo.edits)
      const base = photo.name.replace(/\.[^.]+$/, '') || 'lightframes'
      downloadBlob(blob, `${base}-edited.jpg`)
      setStatus(`Exported ${base}-edited.jpg`)
    } catch {
      setStatus('Export failed')
    }
  }, [activeId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        copyEdits()
      }
      if (mod && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        pasteEdits()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [copyEdits, pasteEdits])

  return {
    photos,
    activePhoto,
    activeId,
    presets,
    selectedPresetId,
    presetIntensity,
    clipboard,
    status,
    handleOpen,
    selectPhoto,
    updateEdits,
    resetEdits,
    copyEdits,
    pasteEdits,
    savePreset,
    updateSelectedPreset,
    applyPreset,
    setPresetIntensity,
    deletePreset,
    exportPreset,
    importPreset,
    exportJpeg,
  }
}
