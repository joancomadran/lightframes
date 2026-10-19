import { RAW_EXTENSIONS } from './rawDecode'

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/x-sony-arw',
  'image/arw',
  'image/x-canon-cr2',
  'image/x-canon-cr3',
  'image/x-nikon-nef',
  'image/x-adobe-dng',
  'image/x-fuji-raf',
  'image/x-olympus-orf',
  'image/x-panasonic-rw2',
])

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', ...RAW_EXTENSIONS] as const

const RAW_ACCEPT = RAW_EXTENSIONS.flatMap((ext) => [ext, ext.toUpperCase()])

export function isSupportedImage(file: File): boolean {
  const name = file.name.toLowerCase()
  if (IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext))) return true
  if (file.type && IMAGE_TYPES.has(file.type.toLowerCase())) return true
  return false
}

type OpenFilePickerWindow = Window & {
  showOpenFilePicker?: (options?: {
    multiple?: boolean
    types?: Array<{
      description?: string
      accept: Record<string, string[]>
    }>
  }) => Promise<Array<{ getFile: () => Promise<File> }>>
  showDirectoryPicker?: () => Promise<{
    values: () => AsyncIterableIterator<{
      kind: string
      getFile: () => Promise<File>
    }>
  }>
}

async function pickWithOpenFilePicker(): Promise<File[] | null> {
  const w = window as OpenFilePickerWindow
  if (typeof w.showOpenFilePicker !== 'function') return null

  try {
    const handles = await w.showOpenFilePicker({
      multiple: true,
      types: [
        {
          description: 'Images',
          accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'application/octet-stream': RAW_ACCEPT,
            'image/x-sony-arw': ['.arw', '.ARW'],
            'image/x-adobe-dng': ['.dng', '.DNG'],
          },
        },
      ],
    })
    const files: File[] = []
    for (const handle of handles) {
      const file = await handle.getFile()
      if (isSupportedImage(file)) files.push(file)
    }
    return files
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return []
    return null
  }
}

export async function pickImageFiles(): Promise<File[]> {
  const fromPicker = await pickWithOpenFilePicker()
  if (fromPicker !== null) return fromPicker

  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = [
      '.jpg',
      '.jpeg',
      '.png',
      ...RAW_ACCEPT,
      'image/jpeg',
      'image/png',
    ].join(',')
    input.multiple = true

    let settled = false
    const finish = (files: File[]) => {
      if (settled) return
      settled = true
      resolve(files)
    }

    input.onchange = () => {
      finish(Array.from(input.files ?? []).filter(isSupportedImage))
    }
    window.addEventListener(
      'focus',
      () => {
        window.setTimeout(() => {
          finish(Array.from(input.files ?? []).filter(isSupportedImage))
        }, 400)
      },
      { once: true },
    )
    input.click()
  })
}

async function pickImageFolder(): Promise<File[] | null> {
  const w = window as OpenFilePickerWindow
  if (typeof w.showDirectoryPicker !== 'function') return null

  try {
    const handle = await w.showDirectoryPicker()
    const files: File[] = []
    for await (const entry of handle.values()) {
      if (entry.kind !== 'file') continue
      const file = await entry.getFile()
      if (isSupportedImage(file)) files.push(file)
    }
    files.sort((a, b) => a.name.localeCompare(b.name))
    return files
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return []
    return null
  }
}

/**
 * Open images via multi-file picker (RAW-friendly).
 * Hold Alt/Option while clicking to open a folder instead.
 */
export async function openImages(opts?: { folder?: boolean }): Promise<File[]> {
  if (opts?.folder) {
    const folderFiles = await pickImageFolder()
    if (folderFiles !== null) return folderFiles
  }
  return pickImageFiles()
}

/** Demo photos served from /public/samples, developed flat from the author's own RAWs. */
const SAMPLE_PHOTOS = ['pagoda.jpg', 'twelve-apostles.jpg', 'opera-night.jpg']

export async function fetchSampleImages(): Promise<File[]> {
  return Promise.all(
    SAMPLE_PHOTOS.map(async (name) => {
      const res = await fetch(`/samples/${name}`)
      if (!res.ok) throw new Error('Could not load sample photos')
      return new File([await res.blob()], name, { type: 'image/jpeg' })
    }),
  )
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Long side of filmstrip thumbnails: sharp at 2× on the strip, a fraction of the photo's memory. */
const THUMB_EDGE = 360

/**
 * A small JPEG thumbnail of an image blob. Showing the full photo in the
 * filmstrip would make the browser keep every one decoded at full size —
 * gigabytes with a few dozen camera files. Null when the browser can't decode it.
 */
export async function makeThumbnail(blob: Blob): Promise<Blob | null> {
  try {
    const probe = await createImageBitmap(blob, { resizeWidth: 64, resizeQuality: 'low' })
    // Fit the long side: a portrait photo gets its height, not its width, set to THUMB_EDGE.
    const portrait = probe.height > probe.width
    probe.close()
    const bitmap = await createImageBitmap(
      blob,
      portrait ? { resizeHeight: THUMB_EDGE, resizeQuality: 'medium' } : { resizeWidth: THUMB_EDGE, resizeQuality: 'medium' },
    )
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0)
    bitmap.close()
    return await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82))
  } catch {
    return null
  }
}
