import { DEFAULT_EDITS, type EditParams, type ExportOptions } from '../types/edits'
import { poolSize, runInPool } from './developPool'
import { ensurePatches } from './inpaint'
import {
  MIME_BY_FORMAT,
  buildBrushMasks,
  buildDetailMaps,
  buildExportFilename,
  buildLumMask,
  detailMargin,
  needsDetailPass,
  prepareBase,
  processImageSync,
  type BaseImage,
  type RenderSource,
} from './imageProcessing'

/** Rows per strip never go below this, so tiny previews don't pay for messaging. */
const MIN_STRIP_ROWS = 48

function splitRows(height: number, parts: number): [number, number][] {
  const count = Math.max(1, Math.min(parts, Math.ceil(height / MIN_STRIP_ROWS)))
  const size = Math.ceil(height / count)
  const strips: [number, number][] = []
  for (let y = 0; y < height; y += size) strips.push([y, Math.min(height, y + size)])
  return strips
}

async function developParallel(
  base: BaseImage,
  edits: EditParams,
  workers: number,
): Promise<Uint8ClampedArray<ArrayBuffer>> {
  const { width, height, linear } = base
  const ctxShared = {
    fullWidth: width,
    fullHeight: height,
    lumMask: buildLumMask(base.data, width, height, edits, linear ?? undefined),
    brushMasks: buildBrushMasks(edits.localAdjustments, width, height),
  }
  const out = new Uint8ClampedArray(width * height * 4)
  await Promise.all(
    splitRows(height, workers * 2).map(async ([y0, y1]) => {
      const data = base.data.slice(y0 * width * 4, y1 * width * 4)
      const linearSlice = linear ? linear.data.slice(y0 * width * 3, y1 * width * 3) : null
      const result = await runInPool(
        {
          kind: 'develop',
          data,
          width,
          rows: y1 - y0,
          edits,
          linear: linearSlice && linear ? { data: linearSlice, scale: linear.scale } : null,
          ctx: { ...ctxShared, yOffset: y0 },
        },
        linearSlice ? [data.buffer, linearSlice.buffer] : [data.buffer],
      )
      out.set(result, y0 * width * 4)
    }),
  )
  return out
}

async function detailParallel(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  edits: EditParams,
  workers: number,
): Promise<void> {
  const maps = buildDetailMaps(data, width, height, edits)
  const margin = detailMargin(edits, width, height)
  // Take every strip (with its margins) before writing any result back.
  const jobs = splitRows(height, workers * 2).map(([y0, y1]) => {
    const s0 = Math.max(0, y0 - margin)
    const s1 = Math.min(height, y1 + margin)
    const chunk = data.slice(s0 * width * 4, s1 * width * 4)
    return {
      y0,
      promise: runInPool(
        {
          kind: 'detail',
          data: chunk,
          width,
          rows: s1 - s0,
          edits,
          region: { yOffset: s0, fullWidth: width, fullHeight: height },
          maps,
          coreStart: y0 - s0,
          coreEnd: y1 - s0,
        },
        [chunk.buffer],
      ),
    }
  })
  const results = await Promise.all(jobs.map((job) => job.promise))
  results.forEach((result, i) => data.set(result, jobs[i]!.y0 * width * 4))
}

function developSync(base: BaseImage, edits: EditParams): ImageData {
  const imageData = new ImageData(base.data.slice(), base.width, base.height)
  processImageSync(imageData, edits, base.linear ?? undefined)
  return imageData
}

/**
 * Develop a prepared base image with every edit, in parallel on the worker
 * pool when available. With `bypass`, returns the unedited rendering (RAW
 * files still get their base tone curve).
 */
export async function developBase(
  base: BaseImage,
  edits: EditParams,
  opts: { bypass?: boolean } = {},
): Promise<ImageData> {
  const effective = opts.bypass ? (base.linear ? DEFAULT_EDITS : null) : edits
  if (!effective) return new ImageData(base.data.slice(), base.width, base.height)
  const workers = poolSize()
  if (workers === 0) return developSync(base, effective)
  try {
    const developed = await developParallel(base, effective, workers)
    if (needsDetailPass(effective)) {
      await detailParallel(developed, base.width, base.height, effective, workers)
    }
    return new ImageData(developed, base.width, base.height)
  } catch {
    return developSync(base, effective)
  }
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  options: ExportOptions,
  area: { x: number; y: number; w: number; h: number },
): void {
  const mark = options.watermark
  const text = mark.text.trim()
  if (!mark.enabled || !text) return
  const size = Math.max(10, Math.round(mark.size * Math.min(area.w, area.h)))
  const pad = Math.round(size * 0.9)
  ctx.save()
  ctx.font = `600 ${size}px "Figtree", "Segoe UI", system-ui, sans-serif`
  ctx.globalAlpha = Math.min(1, Math.max(0, mark.opacity))
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
  ctx.shadowBlur = size * 0.25
  const right = mark.position.endsWith('right')
  const bottom = mark.position.startsWith('bottom')
  if (mark.position === 'center') {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, area.x + area.w / 2, area.y + area.h / 2)
  } else {
    ctx.textAlign = right ? 'right' : 'left'
    ctx.textBaseline = bottom ? 'bottom' : 'top'
    ctx.fillText(text, right ? area.x + area.w - pad : area.x + pad, bottom ? area.y + area.h - pad : area.y + pad)
  }
  ctx.restore()
}

export async function exportEditedImage(
  source: RenderSource,
  edits: EditParams,
  options: ExportOptions,
  baseName = 'export',
): Promise<{ blob: Blob; filename: string }> {
  const frame = options.frame
  const maxEdge = frame ? Math.max(frame.width, frame.height) : options.maxEdge
  // "Remove" spots need their inpainted patches before the pixels can be prepared.
  await ensurePatches(source, edits.heal)
  const base = prepareBase(source, edits, maxEdge)
  if (!base) throw new Error('Could not prepare image')
  const developed = await developBase(base, edits)

  const photo = document.createElement('canvas')
  photo.width = developed.width
  photo.height = developed.height
  photo.getContext('2d')?.putImageData(developed, 0, 0)

  let canvas = photo
  let area = { x: 0, y: 0, w: photo.width, h: photo.height }
  if (frame) {
    canvas = document.createElement('canvas')
    canvas.width = frame.width
    canvas.height = frame.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not create export canvas')
    ctx.fillStyle = frame.background
    ctx.fillRect(0, 0, frame.width, frame.height)
    const scale = Math.min(frame.width / photo.width, frame.height / photo.height)
    const w = Math.round(photo.width * scale)
    const h = Math.round(photo.height * scale)
    area = { x: Math.round((frame.width - w) / 2), y: Math.round((frame.height - h) / 2), w, h }
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(photo, area.x, area.y, w, h)
  }
  const ctx = canvas.getContext('2d')
  if (ctx) drawWatermark(ctx, options, area)

  const mime = MIME_BY_FORMAT[options.format]
  const quality = options.format === 'png' ? undefined : Math.min(1, Math.max(0.1, options.quality))
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result)
        else reject(new Error(`Failed to encode ${options.format}`))
      },
      mime,
      quality,
    )
  })
  return { blob, filename: buildExportFilename(baseName, options) }
}
