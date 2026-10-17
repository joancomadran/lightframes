import LibRaw from 'libraw-wasm'

/** Common camera RAW extensions supported via embedded JPEG and/or LibRaw WASM. */
export const RAW_EXTENSIONS = [
  '.arw',
  '.cr2',
  '.cr3',
  '.nef',
  '.nrw',
  '.dng',
  '.raf',
  '.orf',
  '.rw2',
  '.pef',
  '.srw',
] as const

export function isRawFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return RAW_EXTENSIONS.some((ext) => name.endsWith(ext))
}

/** Find the largest embedded JPEG preview inside a TIFF-based RAW. */
async function extractLargestEmbeddedJpeg(bytes: Uint8Array): Promise<Blob | null> {
  const candidates: { start: number; end: number; size: number }[] = []

  for (let i = 0; i < bytes.length - 1; i++) {
    if (bytes[i] !== 0xff || bytes[i + 1] !== 0xd8) continue

    let end = -1
    for (let j = i + 2; j < bytes.length - 1; j++) {
      if (bytes[j] === 0xff && bytes[j + 1] === 0xd9) {
        end = j + 2
        break
      }
    }
    if (end < 0) continue

    const size = end - i
    if (size < 50_000) continue
    candidates.push({ start: i, end, size })
  }

  candidates.sort((a, b) => b.size - a.size)

  for (const candidate of candidates.slice(0, 5)) {
    const slice = bytes.slice(candidate.start, candidate.end)
    const blob = new Blob([slice], { type: 'image/jpeg' })
    try {
      const bitmap = await createImageBitmap(blob)
      const wideEnough = bitmap.width >= 800 || bitmap.height >= 800
      bitmap.close()
      if (wideEnough) return blob
    } catch {
      // Not a valid JPEG — try next candidate
    }
  }

  return null
}

function rgbBufferToImageData(
  width: number,
  height: number,
  colors: number,
  bits: number,
  data: Uint8Array | Uint16Array,
): ImageData {
  const out = new ImageData(width, height)
  const pixels = out.data
  const channels = Math.max(1, Math.min(colors, 4))
  const scale = bits > 8 ? 255 / ((1 << bits) - 1) : 1

  for (let i = 0, p = 0; i < width * height; i++, p += 4) {
    const base = i * channels
    const r = data[base] ?? 0
    const g = channels > 1 ? (data[base + 1] ?? 0) : r
    const b = channels > 2 ? (data[base + 2] ?? 0) : r
    pixels[p] = Math.min(255, Math.round(r * scale))
    pixels[p + 1] = Math.min(255, Math.round(g * scale))
    pixels[p + 2] = Math.min(255, Math.round(b * scale))
    pixels[p + 3] = 255
  }

  return out
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to encode decoded RAW as JPEG'))
      },
      'image/jpeg',
      quality,
    )
  })
}

async function bitmapToJpegBlob(
  width: number,
  height: number,
  colors: number,
  bits: number,
  data: Uint8Array | Uint16Array,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not create canvas for RAW decode')
  ctx.putImageData(rgbBufferToImageData(width, height, colors, bits, data), 0, 0)
  return canvasToJpegBlob(canvas)
}

async function decodeWithLibRaw(bytes: Uint8Array, fileName: string): Promise<Blob> {
  const raw = new LibRaw()
  try {
    const copy = bytes.slice()
    await raw.open(copy, {
      useCameraWb: true,
      outputColor: 1,
      outputBps: 8,
      userQual: 3,
      halfSize: true,
    })

    try {
      const image = await raw.imageData()
      if (image?.data && image.width > 0 && image.height > 0) {
        return await bitmapToJpegBlob(
          image.width,
          image.height,
          image.colors,
          image.bits,
          image.data,
        )
      }
    } catch {
      // Fall through to embedded thumbnail from LibRaw
    }

    const thumb = await raw.thumbnailData()
    if (thumb?.data?.length) {
      if (thumb.format === 'jpeg') {
        return new Blob([new Uint8Array(thumb.data)], { type: 'image/jpeg' })
      }
      if (thumb.width > 0 && thumb.height > 0) {
        return await bitmapToJpegBlob(thumb.width, thumb.height, 3, 8, thumb.data)
      }
    }

    throw new Error(`Could not decode RAW file: ${fileName}`)
  } finally {
    raw.dispose()
  }
}

/**
 * Scene-linear RGB decoded from the sensor data: camera white balance, sRGB
 * primaries, no tone curve, sensor clipping at `65535 * scale = 1`.
 */
export type LinearImage = {
  kind: 'linear'
  width: number
  height: number
  /** Interleaved RGB. */
  data: Uint16Array
  scale: number
  /** Size of the full-resolution original when this is a half-size decode. */
  fullWidth?: number
  fullHeight?: number
}

/**
 * Demosaic a RAW with LibRaw into linear 16-bit RGB — the same starting point
 * Lightroom develops from, with highlight headroom the embedded JPEG lacks.
 * `halfSize` skips demosaicing (2×2 binning): fast and plenty for previews.
 */
export async function decodeRawLinear(
  file: Blob,
  opts: { halfSize: boolean },
): Promise<LinearImage> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const raw = new LibRaw()
  try {
    await raw.open(bytes, {
      useCameraWb: true,
      outputColor: 1,
      outputBps: 16,
      gamm: [1, 1],
      noAutoBright: true,
      userQual: 3,
      halfSize: opts.halfSize,
    })
    const image = await raw.imageData()
    if (!image?.data || image.width <= 0 || image.height <= 0 || image.colors < 3) {
      throw new Error('LibRaw returned no RGB image')
    }
    const n = image.width * image.height
    let data: Uint16Array
    if (image.bits === 16 && image.colors === 3 && image.data instanceof Uint16Array) {
      data = image.data
    } else {
      const max = (1 << image.bits) - 1
      data = new Uint16Array(n * 3)
      for (let i = 0; i < n; i++) {
        for (let c = 0; c < 3; c++) {
          data[i * 3 + c] = Math.round(((image.data[i * image.colors + c] ?? 0) / max) * 65535)
        }
      }
    }
    const binning = opts.halfSize ? 2 : 1
    return {
      kind: 'linear',
      width: image.width,
      height: image.height,
      data,
      scale: 1 / 65535,
      fullWidth: image.width * binning,
      fullHeight: image.height * binning,
    }
  } finally {
    raw.dispose()
  }
}

const PREVIEW_CACHE_SIZE = 3
const previewCache = new Map<Blob, Promise<LinearImage>>()

/** Half-size RAW decode for the editor preview; the last few photos stay cached. */
export function loadRawPreview(file: Blob): Promise<LinearImage> {
  const cached = previewCache.get(file)
  if (cached) {
    previewCache.delete(file)
    previewCache.set(file, cached)
    return cached
  }
  const pending = decodeRawLinear(file, { halfSize: true })
  previewCache.set(file, pending)
  pending.catch(() => previewCache.delete(file))
  while (previewCache.size > PREVIEW_CACHE_SIZE) {
    const oldest = previewCache.keys().next().value
    if (oldest === undefined) break
    previewCache.delete(oldest)
  }
  return pending
}

/**
 * Decode a camera RAW into a JPEG blob for thumbnails (and as a fallback when
 * LibRaw cannot develop the file). Prefers the camera's embedded full-size JPEG.
 */
export async function decodeRawToJpegBlob(file: File): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer())

  const embedded = await extractLargestEmbeddedJpeg(bytes)
  if (embedded) return embedded

  return decodeWithLibRaw(bytes, file.name)
}
