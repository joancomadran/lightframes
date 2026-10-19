import type { HealSpot } from '../types/edits'
import { bumpAiVersion, runModel } from './ai'
import { getPatch, holeMask, patchKey, setPatch } from './heal'
import { sourceDimensions, sourceRegion, type RenderSource } from './imageProcessing'

/*
 * "Remove" spots: an inpainting model (MI-GAN) fills the painted area. The
 * model is downloaded once (~28 MB, cached) and runs in ai.worker.ts. Each spot
 * is generated once from a crop around it, at most PATCH_EDGE on its long
 * side (the model works at 512 anyway), and kept as a patch that heal.ts
 * pastes at whatever resolution the photo renders.
 */

const PATCH_EDGE = 1024

/** Crop around the spot with room for context: the model needs to see what surrounds the hole. */
function contextRect(spot: HealSpot, width: number, height: number) {
  const radius = spot.size * Math.max(width, height)
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (let i = 0; i < spot.points.length; i += 2) {
    x0 = Math.min(x0, spot.points[i]! * width - radius)
    x1 = Math.max(x1, spot.points[i]! * width + radius)
    y0 = Math.min(y0, spot.points[i + 1]! * height - radius)
    y1 = Math.max(y1, spot.points[i + 1]! * height + radius)
  }
  const pad = Math.max(x1 - x0, y1 - y0) * 0.75 + 16
  return {
    x0: Math.max(0, (x0 - pad) / width),
    y0: Math.max(0, (y0 - pad) / height),
    x1: Math.min(1, (x1 + pad) / width),
    y1: Math.min(1, (y1 + pad) / height),
  }
}

async function generate(source: RenderSource, spots: HealSpot[], index: number): Promise<void> {
  const spot = spots[index]!
  const { width, height } = sourceDimensions(source)
  // Earlier spots are applied first, so later removals build on them.
  const region = sourceRegion(source, spots.slice(0, index), contextRect(spot, width, height), PATCH_EDGE)
  if (!region) throw new Error('Could not read the photo')
  const mask = holeMask(spot, region.rect, region.width, region.height, width, height)
  const rgba = await runModel({ kind: 'inpaint', rgba: region.data, mask, width: region.width, height: region.height })
  setPatch(spot, { rect: region.rect, width: region.width, height: region.height, data: rgba })
  bumpAiVersion()
}

const inFlight = new Map<string, Promise<void>>()
let queue: Promise<unknown> = Promise.resolve()

/** Generate every missing "remove" patch, one at a time, in spot order. */
export function ensurePatches(source: RenderSource, spots: HealSpot[]): Promise<void> {
  const jobs: Promise<void>[] = []
  spots.forEach((spot, index) => {
    if (spot.mode !== 'remove' || getPatch(spot)) return
    const key = patchKey(spot)
    let job = inFlight.get(key)
    if (!job) {
      job = queue
        .catch(() => {})
        .then(() => {
          if (getPatch(spot)) return
          return generate(source, spots, index)
        })
        .finally(() => inFlight.delete(key))
      inFlight.set(key, job)
      queue = job
    }
    jobs.push(job)
  })
  return Promise.all(jobs).then(() => {})
}
