import { bumpAiVersion, runModel, SEGMENT_SIZE } from './ai'
import { boxBlurFast, sourceSquare, type RenderSource } from './imageProcessing'

/*
 * Background removal. IS-Net finds the photo's subject once per photo; the
 * result is an alpha mask over the whole source (stretched to a square, as
 * the model sees it), kept here and mapped through orientation and crop at
 * render time, so any resolution and any framing reuse it.
 */

/** Subject alpha over the source (0–1 in both axes), SEGMENT_SIZE² bytes. */
export type Cutout = Uint8ClampedArray

// The preview and the export decode a photo separately; a shared key lets them share its mask.
const sourceKeys = new WeakMap<object, string>()
const byKey = new Map<string, Cutout>()
const byObject = new WeakMap<object, Cutout>()
const MAX_KEYED = 12

/** Tie a decoded source to its photo, so every decode of that photo shares one mask. */
export function setSourceKey(source: RenderSource, key: string): void {
  sourceKeys.set(source, key)
}

export function getCutout(source: RenderSource): Cutout | null {
  const key = sourceKeys.get(source)
  return (key ? byKey.get(key) : byObject.get(source)) ?? null
}

function storeCutout(source: RenderSource, cutout: Cutout) {
  const key = sourceKeys.get(source)
  if (!key) {
    byObject.set(source, cutout)
    return
  }
  byKey.delete(key)
  byKey.set(key, cutout)
  while (byKey.size > MAX_KEYED) byKey.delete(byKey.keys().next().value!)
}

/** Regions this much smaller than the biggest one are specks, not subject. */
const SPECK_RATIO = 0.03
/** Soft margin kept around the subject (in mask pixels), so hair and fuzzy edges survive. */
const SUBJECT_MARGIN = 12

/**
 * Drop floating specks the model leaves in busy backgrounds (lights, water,
 * foliage): keep the solid regions of subject size, plus a soft margin
 * around them, and clear everything else.
 */
function cleanCutout(alpha: Uint8ClampedArray, n: number): Uint8ClampedArray<ArrayBuffer> {
  const labels = new Int32Array(n * n).fill(-1)
  const sizes: number[] = []
  const stack = new Int32Array(n * n)
  for (let start = 0; start < n * n; start++) {
    if (alpha[start]! < 128 || labels[start] !== -1) continue
    const label = sizes.length
    let top = 0
    let size = 0
    stack[top++] = start
    labels[start] = label
    while (top > 0) {
      const k = stack[--top]!
      size++
      const x = k % n
      const neighbours = [x > 0 ? k - 1 : -1, x < n - 1 ? k + 1 : -1, k - n, k + n]
      for (const j of neighbours) {
        if (j < 0 || j >= n * n || labels[j] !== -1 || alpha[j]! < 128) continue
        labels[j] = label
        stack[top++] = j
      }
    }
    sizes.push(size)
  }
  const out = new Uint8ClampedArray(n * n)
  if (sizes.length === 0) return out
  const biggest = Math.max(...sizes)
  const kept = new Float32Array(n * n)
  for (let k = 0; k < n * n; k++) {
    const label = labels[k]!
    if (label >= 0 && sizes[label]! >= biggest * SPECK_RATIO) kept[k] = 1
  }
  // A blurred, boosted copy of what's kept is a soft "near the subject" zone.
  const zone = boxBlurFast(kept, n, n, SUBJECT_MARGIN, 2)
  for (let k = 0; k < n * n; k++) out[k] = alpha[k]! * Math.min(1, zone[k]! * 3)
  return out
}

const inFlight = new Map<object | string, Promise<void>>()

/** Find the subject of `source` unless it is already known. */
export function ensureCutout(source: RenderSource): Promise<void> {
  if (getCutout(source)) return Promise.resolve()
  const id = sourceKeys.get(source) ?? source
  let job = inFlight.get(id)
  if (!job) {
    job = (async () => {
      const rgba = sourceSquare(source, SEGMENT_SIZE)
      if (!rgba) throw new Error('Could not read the photo')
      storeCutout(source, cleanCutout(await runModel({ kind: 'segment', rgba }), SEGMENT_SIZE))
      bumpAiVersion()
    })().finally(() => inFlight.delete(id))
    inFlight.set(id, job)
  }
  return job
}
