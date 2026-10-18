import * as ort from 'onnxruntime-web/wasm'

/*
 * Runs MI-GAN (Picsart AI Research, MIT) off the main thread. The ONNX
 * "pipeline" export takes the whole image plus a hole mask and does its own
 * crop / resize to 512 / blend, returning an image the size of its input.
 *
 *   image  uint8 [1, 3, H, W]  RGB
 *   mask   uint8 [1, 1, H, W]  255 = keep, 0 = fill
 *   result uint8 [1, 3, H, W]
 */

// Pinned revision, checked against its SHA-256 before use.
const MODEL_URL =
  'https://huggingface.co/andraniksargsyan/migan/resolve/406830d0fa60666da0071c342ad2fbc8f30c5c64/migan_pipeline_v2.onnx'
const MODEL_SHA256 = '6f1f3530a1a2324b19752018ce756088b07973cda8d7d890034ace5c8a48c40b'
const CACHE_NAME = 'lightframes-models'

export type InpaintRequest = {
  id: number
  /** Interleaved RGBA, `width`×`height`. */
  rgba: Uint8ClampedArray<ArrayBuffer>
  /** 0 = fill, 255 = keep. */
  mask: Uint8Array<ArrayBuffer>
  width: number
  height: number
}

export type InpaintReply =
  | { kind: 'progress'; loaded: number; total: number }
  | { kind: 'ready' }
  | { kind: 'result'; id: number; rgba: Uint8ClampedArray<ArrayBuffer> }
  | { kind: 'error'; id: number | null; message: string }

// No cross-origin isolation here, so threads aren't available anyway.
ort.env.wasm.numThreads = 1

function post(reply: InpaintReply, transfer: Transferable[] = []) {
  ;(self as unknown as Worker).postMessage(reply, transfer)
}

async function sha256(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** The model bytes: from Cache Storage when we have them, else downloaded (with progress) and cached. */
async function loadModel(): Promise<ArrayBuffer> {
  const cache = await caches.open(CACHE_NAME).catch(() => null)
  const cached = await cache?.match(MODEL_URL)
  if (cached) {
    const bytes = await cached.arrayBuffer()
    if ((await sha256(bytes)) === MODEL_SHA256) return bytes
    await cache?.delete(MODEL_URL)
  }

  const response = await fetch(MODEL_URL)
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
    post({ kind: 'progress', loaded, total })
  }
  const bytes = new Uint8Array(loaded)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }
  if ((await sha256(bytes.buffer)) !== MODEL_SHA256) throw new Error('Model download is corrupted')
  await cache?.put(MODEL_URL, new Response(bytes.slice().buffer)).catch(() => {})
  return bytes.buffer
}

let session: Promise<ort.InferenceSession> | null = null

function getSession(): Promise<ort.InferenceSession> {
  session ??= loadModel()
    .then((bytes) => ort.InferenceSession.create(bytes, { executionProviders: ['wasm'] }))
    .then((s) => {
      post({ kind: 'ready' })
      return s
    })
    .catch((err: unknown) => {
      // Let a later request try again.
      session = null
      throw err
    })
  return session
}

self.onmessage = async (e: MessageEvent<InpaintRequest | 'load'>) => {
  if (e.data === 'load') {
    getSession().catch((err: unknown) => post({ kind: 'error', id: null, message: String(err) }))
    return
  }
  const { id, rgba, mask, width, height } = e.data
  try {
    const s = await getSession()
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
    post({ kind: 'result', id, rgba: out }, [out.buffer])
  } catch (err) {
    post({ kind: 'error', id, message: err instanceof Error ? err.message : String(err) })
  }
}
