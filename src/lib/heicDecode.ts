import { clampCanvasSize } from './canvasLimits.js'

/**
 * HEIC/HEIF → JPEG for the editor.
 *
 * Safari (and any browser with a system HEIC decoder) is tried first so the
 * photo keeps the OS decoder's full resolution, orientation, and color. Chrome
 * and Firefox fall through to `heic-to` (libheif + libde265, LGPL-3.0), loaded
 * with a dynamic import only after native decode fails. That package decodes
 * inside a worker, frees each libheif image and context when the file is done,
 * and shrinks the canvas it encoded from. The worker stays alive afterwards so
 * a batch does not compile the decoder again.
 */

const HEIC_EXTENSIONS = ['.heic', '.heif'] as const

const HEIC_MIME_TYPES = new Set([
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
])

/** High enough that a later JPEG/WebP export is not starting from a soft preview. */
const HEIC_JPEG_QUALITY = 0.95

let nativeHeicUnsupported = false
let heicToLoader: Promise<typeof import('heic-to/next').heicTo> | null = null

export function isHeicFile(file: { name: string; type?: string }): boolean {
  const name = file.name.toLowerCase()
  if (HEIC_EXTENSIONS.some((ext) => name.endsWith(ext))) return true
  const type = (file.type ?? '').toLowerCase().split(';', 1)[0]?.trim() ?? ''
  return HEIC_MIME_TYPES.has(type)
}

export function heicDecodeError(fileName: string): Error {
  return new Error(`Could not decode HEIC file "${fileName}". It may be corrupted.`)
}

function fileLabel(file: Blob): string {
  if ('name' in file && typeof file.name === 'string' && file.name) return file.name
  return 'image.heic'
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', HEIC_JPEG_QUALITY)
  })
}

/** Full-size JPEG when this browser can decode HEIC itself. Null otherwise. */
export async function tryNativeHeicDecode(file: Blob): Promise<Blob | null> {
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return null
  let bitmap: ImageBitmap | null = null
  let canvas: HTMLCanvasElement | null = null
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    if (bitmap.width < 1 || bitmap.height < 1) return null
    const size = clampCanvasSize(bitmap.width, bitmap.height)
    canvas = document.createElement('canvas')
    canvas.width = size.width
    canvas.height = size.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(bitmap, 0, 0, size.width, size.height)
    const blob = await canvasToJpeg(canvas)
    if (!blob || blob.size === 0) return null
    return blob
  } catch {
    return null
  } finally {
    bitmap?.close()
    if (canvas) {
      canvas.width = 1
      canvas.height = 1
    }
  }
}

async function loadHeicTo(): Promise<typeof import('heic-to/next').heicTo> {
  if (!heicToLoader) {
    heicToLoader = import('heic-to/next')
      .then((mod) => mod.heicTo)
      .catch((error: unknown) => {
        heicToLoader = null
        throw error
      })
  }
  return heicToLoader
}

async function decodeHeicWithWasm(file: Blob): Promise<Blob> {
  const heicTo = await loadHeicTo()
  return heicTo({
    blob: file,
    type: 'image/jpeg',
    quality: HEIC_JPEG_QUALITY,
  })
}

export type HeicDecodeDeps = {
  tryNative?: (file: Blob) => Promise<Blob | null>
  decodeWithWasm?: (file: Blob) => Promise<Blob>
}

export async function decodeHeicToJpegBlob(file: Blob, deps: HeicDecodeDeps = {}): Promise<Blob> {
  const label = fileLabel(file)
  const tryNative = deps.tryNative ?? (nativeHeicUnsupported ? async () => null : tryNativeHeicDecode)
  let native: Blob | null = null
  try {
    native = await tryNative(file)
  } catch {
    native = null
  }
  if (native && native.size > 0) return native

  const decodeWithWasm = deps.decodeWithWasm ?? decodeHeicWithWasm
  try {
    const decoded = await decodeWithWasm(file)
    if (!(decoded instanceof Blob) || decoded.size === 0) throw heicDecodeError(label)
    if (!deps.tryNative && !deps.decodeWithWasm) nativeHeicUnsupported = true
    return decoded
  } catch (error) {
    if (error instanceof Error && error.message === heicDecodeError(label).message) throw error
    throw heicDecodeError(label)
  }
}
