import * as ort from 'onnxruntime-web/wasm'
import { loadModel, post, type AiRequest, type ModelId } from './aiModels'

/*
 * CPU (WASM) worker for the inpainting and segmentation models; see
 * aiModels.ts for what each takes. Upscaling has its own WebGPU worker.
 */

const SEGMENT_SIZE = 1024

// No cross-origin isolation here, so threads aren't available anyway.
ort.env.wasm.numThreads = 1

const sessions: Partial<Record<ModelId, Promise<ort.InferenceSession>>> = {}

function getSession(model: ModelId): Promise<ort.InferenceSession> {
  sessions[model] ??= loadModel(model)
    .then((bytes) => ort.InferenceSession.create(bytes, { executionProviders: ['wasm'] }))
    .then((s) => {
      post({ kind: 'ready', model })
      return s
    })
    .catch((err: unknown) => {
      // Let a later request try again.
      delete sessions[model]
      throw err
    })
  return sessions[model]
}

async function inpaint(
  rgba: Uint8ClampedArray,
  mask: Uint8Array<ArrayBuffer>,
  width: number,
  height: number,
): Promise<Uint8ClampedArray<ArrayBuffer>> {
  const s = await getSession('inpaint')
  const plane = width * height
  const image = new Uint8Array(plane * 3)
  for (let k = 0, i = 0; k < plane; k++, i += 4) {
    image[k] = rgba[i]!
    image[plane + k] = rgba[i + 1]!
    image[plane * 2 + k] = rgba[i + 2]!
  }
  const outputs = await s.run({
    image: new ort.Tensor('uint8', image, [1, 3, height, width]),
    mask: new ort.Tensor('uint8', mask, [1, 1, height, width]),
  })
  const result = outputs.result!.data as Uint8Array
  const out = new Uint8ClampedArray(plane * 4)
  for (let k = 0, i = 0; k < plane; k++, i += 4) {
    out[i] = result[k]!
    out[i + 1] = result[plane + k]!
    out[i + 2] = result[plane * 2 + k]!
    out[i + 3] = 255
  }
  return out
}

async function segment(rgba: Uint8ClampedArray): Promise<Uint8ClampedArray<ArrayBuffer>> {
  const s = await getSession('segment')
  const plane = SEGMENT_SIZE * SEGMENT_SIZE
  let peak = 1
  for (let i = 0; i < rgba.length; i += 4) peak = Math.max(peak, rgba[i]!, rgba[i + 1]!, rgba[i + 2]!)
  const input = new Float32Array(plane * 3)
  for (let k = 0, i = 0; k < plane; k++, i += 4) {
    input[k] = rgba[i]! / peak - 0.5
    input[plane + k] = rgba[i + 1]! / peak - 0.5
    input[plane * 2 + k] = rgba[i + 2]! / peak - 0.5
  }
  const outputs = await s.run({
    [s.inputNames[0]!]: new ort.Tensor('float32', input, [1, 3, SEGMENT_SIZE, SEGMENT_SIZE]),
  })
  const pred = outputs[s.outputNames[0]!]!.data as Float32Array
  let lo = Infinity
  let hi = -Infinity
  for (let k = 0; k < plane; k++) {
    lo = Math.min(lo, pred[k]!)
    hi = Math.max(hi, pred[k]!)
  }
  const range = hi - lo || 1
  const alpha = new Uint8ClampedArray(plane)
  for (let k = 0; k < plane; k++) alpha[k] = ((pred[k]! - lo) / range) * 255
  return alpha
}

self.onmessage = async (e: MessageEvent<AiRequest>) => {
  const request = e.data
  if (request.kind === 'upscale') return
  if (request.kind === 'load') {
    getSession(request.model).catch((err: unknown) =>
      post({ kind: 'error', id: null, model: request.model, message: String(err) }),
    )
    return
  }
  try {
    const data =
      request.kind === 'inpaint'
        ? await inpaint(request.rgba, request.mask, request.width, request.height)
        : await segment(request.rgba)
    post({ kind: 'result', id: request.id, data }, [data.buffer])
  } catch (err) {
    post({
      kind: 'error',
      id: request.id,
      model: request.kind,
      message: err instanceof Error ? err.message : String(err),
    })
  }
}
