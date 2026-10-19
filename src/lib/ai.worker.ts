import * as ort from 'onnxruntime-web/wasm'

/*
 * On-device models, off the main thread. Each is downloaded once, checked
 * against its SHA-256 and kept in Cache Storage.
 *
 * inpaint — MI-GAN (Picsart AI Research, MIT). The ONNX "pipeline" export
 *   takes the whole image plus a hole mask and does its own crop / resize to
 *   512 / blend, returning an image the size of its input.
 *     image  uint8 [1, 3, H, W]  RGB
 *     mask   uint8 [1, 1, H, W]  255 = keep, 0 = fill
 *     result uint8 [1, 3, H, W]
 *
 * segment — IS-Net general use (DIS, Apache-2.0), int8-quantized, see
 *   public/models/NOTICE.md. Salient-object mask for background removal.
 *     input_image  float32 [1, 3, 1024, 1024]  RGB / max − 0.5
 *     output_image float32 [1, 1, 1024, 1024]  min–max normalized to 0–1 here
 */

export type ModelId = 'inpaint' | 'segment'

const MODELS: Record<ModelId, { url: string; sha256: string }> = {
  inpaint: {
    // Pinned revision.
    url: 'https://huggingface.co/andraniksargsyan/migan/resolve/406830d0fa60666da0071c342ad2fbc8f30c5c64/migan_pipeline_v2.onnx',
    sha256: '6f1f3530a1a2324b19752018ce756088b07973cda8d7d890034ace5c8a48c40b',
  },
  segment: {
    url: new URL('/models/isnet-general-use-int8.onnx', self.location.origin).href,
    sha256: '1143d3d61145ed4cf5c6651bc1388af49bdd9d0f4db3b7d7dbe07170efeaecac',
  },
}

const SEGMENT_SIZE = 1024

const CACHE_NAME = 'lightframes-models'

export type AiRequest =
  | { kind: 'load'; model: ModelId }
  | {
      kind: 'inpaint'
      id: number
      /** Interleaved RGBA, `width`×`height`. */
      rgba: Uint8ClampedArray<ArrayBuffer>
      /** 0 = fill, 255 = keep. */
      mask: Uint8Array<ArrayBuffer>
      width: number
      height: number
    }
  | {
      kind: 'segment'
      id: number
      /** Interleaved RGBA, SEGMENT_SIZE × SEGMENT_SIZE (the photo stretched to a square). */
      rgba: Uint8ClampedArray<ArrayBuffer>
    }

export type AiReply =
  | { kind: 'progress'; model: ModelId; loaded: number; total: number }
  | { kind: 'ready'; model: ModelId }
  /** inpaint: RGBA at the input size; segment: one byte of alpha per pixel. */
  | { kind: 'result'; id: number; data: Uint8ClampedArray<ArrayBuffer> }
  | { kind: 'error'; id: number | null; model: ModelId; message: string }

// No cross-origin isolation here, so threads aren't available anyway.
ort.env.wasm.numThreads = 1

function post(reply: AiReply, transfer: Transferable[] = []) {
  ;(self as unknown as Worker).postMessage(reply, transfer)
}

async function sha256(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** The model bytes: from Cache Storage when we have them, else downloaded (with progress) and cached. */
async function loadModel(model: ModelId): Promise<ArrayBuffer> {
  const { url, sha256: expected } = MODELS[model]
  const cache = await caches.open(CACHE_NAME).catch(() => null)
  const cached = await cache?.match(url)
  if (cached) {
    const bytes = await cached.arrayBuffer()
    if ((await sha256(bytes)) === expected) return bytes
    await cache?.delete(url)
  }

  const response = await fetch(url)
  if (!response.ok || !response.body) throw new Error(`Model download failed (${response.status})`)
  const total = Number(response.headers.get('content-length')) || 0
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    loaded += value.length
    post({ kind: 'progress', model, loaded, total })
  }
  const bytes = new Uint8Array(loaded)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }
  if ((await sha256(bytes.buffer)) !== expected) throw new Error('Model download is corrupted')
  await cache?.put(url, new Response(bytes.slice().buffer)).catch(() => {})
  return bytes.buffer
}

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
