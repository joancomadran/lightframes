import { bumpAiVersion, runModel, SEGMENT_SIZE } from './ai'
import { sourceSquare, type RenderSource } from './imageProcessing'

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
      storeCutout(source, await runModel({ kind: 'segment', rgba }))
      bumpAiVersion()
    })().finally(() => inFlight.delete(id))
    inFlight.set(id, job)
  }
  return job
}
