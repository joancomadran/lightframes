import { useCallback, useEffect, useRef, useState } from 'react'
import type { CollageRenderPhoto } from '../lib/collage'
import { downloadBlob } from '../lib/files'
import { zipFiles } from '../lib/zip'

/** Slides download as themselves when there's one, as one ZIP when there are several. */
async function downloadFiles(files: File[]): Promise<void> {
  if (files.length === 1) {
    downloadBlob(files[0]!, files[0]!.name)
    return
  }
  const zip = await zipFiles(files.map((file) => ({ name: file.name, data: file })))
  downloadBlob(zip, `lightframes-slides-${new Date().toISOString().slice(0, 10)}.zip`)
}
import { prepareBase, type RenderSource } from '../lib/imageProcessing'
import { isRawFile, loadRawPreview } from '../lib/rawDecode'
import { developBase } from '../lib/renderPipeline'
import type { EditParams, PhotoSession } from '../types/edits'
import { loadExportSource } from './useEditorSession'

/** What the toolbar can ask of a studio. */
export type StudioApi = {
  exportSlides: () => void
}

export type StudioFormat = 'collage' | 'carousel'

export type Notify = (message: string, tone?: 'success' | 'error') => void

/** Long edge of the developed photos the studios show. */
const PREVIEW_EDGE = 1600
export const PHOTO_MIME = 'application/x-lightframes-photo'
export const SWATCH_COLORS = ['#ffffff', '#000000', '#f3ede2', '#1e2822']

export type Preview = { edits: EditParams; url: string; w: number; h: number }

async function loadImage(url: string): Promise<HTMLImageElement> {
  const img = new Image()
  img.src = url
  await img.decode()
  return img
}

async function loadPreviewSource(photo: PhotoSession): Promise<RenderSource> {
  if (isRawFile(photo.file)) {
    try {
      return await loadRawPreview(photo.file)
    } catch {
      // Fall back to the embedded JPEG, like the editor preview.
    }
  }
  return loadImage(photo.objectUrl)
}

/** Each photo in use, developed with its edits at preview size; redone when its edits change. */
export function useDevelopedPreviews(photos: PhotoSession[], ids: string[]): Map<string, Preview> {
  const [previews, setPreviews] = useState<Map<string, Preview>>(() => new Map())
  const previewsRef = useRef(previews)
  const idsKey = [...new Set(ids)].join('|')

  useEffect(() => {
    let cancelled = false
    const wanted = idsKey ? idsKey.split('|') : []
    void (async () => {
      for (const id of wanted) {
        const photo = photos.find((p) => p.id === id)
        const cached = previewsRef.current.get(id)
        if (!photo || cached?.edits === photo.edits) continue
        try {
          const source = await loadPreviewSource(photo)
          if (cancelled) return
          const base = prepareBase(source, photo.edits, PREVIEW_EDGE)
          if (!base) continue
          const developed = await developBase(base, photo.edits)
          if (cancelled) return
          const canvas = document.createElement('canvas')
          canvas.width = developed.width
          canvas.height = developed.height
          canvas.getContext('2d')?.putImageData(developed, 0, 0)
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
          if (!blob) continue
          const url = URL.createObjectURL(blob)
          if (cancelled) {
            URL.revokeObjectURL(url)
            return
          }
          const prev = previewsRef.current.get(id)
          if (prev) URL.revokeObjectURL(prev.url)
          const next = new Map(previewsRef.current)
          next.set(id, { edits: photo.edits, url, w: developed.width, h: developed.height })
          previewsRef.current = next
          setPreviews(next)
        } catch {
          // Leave the thumbnail in place.
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [photos, idsKey])

  useEffect(
    () => () => {
      for (const preview of previewsRef.current.values()) URL.revokeObjectURL(preview.url)
    },
    [],
  )

  return previews
}

/** Full-size sources for an export; only the latest photo is kept, since RAWs are large. */
export function createExportLoader(photoById: Map<string, PhotoSession>) {
  let last: { id: string; pending: Promise<CollageRenderPhoto | null> } | null = null
  return (id: string): Promise<CollageRenderPhoto | null> => {
    if (last?.id === id) return last.pending
    const photo = photoById.get(id)
    const pending = photo
      ? loadExportSource(photo)
          .then((source) => ({ photo, source }))
          .catch(() => null)
      : Promise.resolve(null)
    last = { id, pending }
    return pending
  }
}

function canShareFiles(files: File[]): boolean {
  try {
    return typeof navigator.canShare === 'function' && navigator.canShare({ files })
  } catch {
    return false
  }
}

/**
 * Runs an export and hands the files over: downloads on desktop; on phones the
 * share sheet (straight into Instagram), which needs a fresh tap once rendering is done.
 */
export function useSlideExport(onNotify: Notify, coarsePointer: boolean) {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [ready, setReady] = useState<File[] | null>(null)
  const busyRef = useRef(false)

  const run = useCallback(
    async (
      render: (onProgress: (done: number, total: number) => void) => Promise<File[]>,
      options?: { onSuccess?: (files: File[]) => void },
    ) => {
      if (busyRef.current) return
      busyRef.current = true
      setReady(null)
      setProgress({ done: 0, total: 1 })
      try {
        const files = await render((done, total) => setProgress({ done, total }))
        if (coarsePointer && canShareFiles(files)) {
          setReady(files)
        } else {
          await downloadFiles(files)
          if (options?.onSuccess) options.onSuccess(files)
          else onNotify(files.length > 1 ? `Exported ${files.length} slides as a ZIP` : 'Exported 1 image')
        }
      } catch {
        onNotify('Export failed', 'error')
      } finally {
        busyRef.current = false
        setProgress(null)
      }
    },
    [onNotify, coarsePointer],
  )

  const share = async () => {
    if (!ready) return
    try {
      await navigator.share({ files: ready })
      setReady(null)
    } catch (err) {
      if ((err as DOMException).name !== 'AbortError') onNotify('Could not open the share sheet', 'error')
    }
  }

  const save = async () => {
    if (!ready) return
    await downloadFiles(ready)
    setReady(null)
  }

  return { progress, ready, run, share, save }
}

export function slideFileName(prefix: string, index: number, total: number): string {
  return total > 1 ? `${prefix}-${String(index + 1).padStart(2, '0')}.jpg` : `${prefix}.jpg`
}
