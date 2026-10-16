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
import {
  DEFAULT_EDITS,
  cloneEdits,
  type EditParams,
  type PhotoSession,
  type Preset,
} from '../types/edits'

function makePhoto(file: File): PhotoSession {
  const objectUrl = URL.createObjectURL(file)
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
  const [clipboard, setClipboard] = useState<EditParams | null>(null)
  const [status, setStatus] = useState('Open JPEG or PNG files to begin')
  const photosRef = useRef(photos)

  const activePhoto = useMemo(
    () => photos.find((p) => p.id === activeId) ?? null,
    [photos, activeId],
  )

  useEffect(() => {
    photosRef.current = photos
  }, [photos])

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

  const handleOpen = useCallback(async () => {
    const files = await openImages()
    if (files.length === 0) return

    setPhotos((prev) => {
      for (const p of prev) URL.revokeObjectURL(p.objectUrl)
      const next = files.map(makePhoto)
      setActiveId(next[0]?.id ?? null)
      setStatus(`Loaded ${next.length} image${next.length === 1 ? '' : 's'}`)
      return next
    })
  }, [])

  const selectPhoto = useCallback((id: string) => {
    setActiveId(id)
  }, [])

  const updateEdits = useCallback((patch: Partial<EditParams>) => {
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === activeId
          ? { ...photo, edits: { ...photo.edits, ...patch } }
          : photo,
      ),
    )
  }, [activeId])

  const resetEdits = useCallback(() => {
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === activeId ? { ...photo, edits: cloneEdits(DEFAULT_EDITS) } : photo,
      ),
    )
    setStatus('Edits reset')
  }, [activeId])

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
      setStatus(`Saved preset “${preset.name}”`)
    },
    [activeId],
  )

  const applyPreset = useCallback(
    (preset: Preset) => {
      if (!activeId) return
      setPhotos((prev) =>
        prev.map((photo) =>
          photo.id === activeId ? { ...photo, edits: cloneEdits(preset.edits) } : photo,
        ),
      )
      setStatus(`Applied “${preset.name}”`)
    },
    [activeId],
  )

  const deletePreset = useCallback((id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id))
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
      setStatus(`Imported “${preset.name}”`)
    } catch {
      setStatus('Could not import preset JSON')
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
    clipboard,
    status,
    handleOpen,
    selectPhoto,
    updateEdits,
    resetEdits,
    copyEdits,
    pasteEdits,
    savePreset,
    applyPreset,
    deletePreset,
    exportPreset,
    importPreset,
    exportJpeg,
  }
}
