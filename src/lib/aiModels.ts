/*
 * What the AI workers share: the model registry, the message protocol and
 * the verified, cached model download. No onnxruntime import here, so the
 * main thread can use the types without pulling the runtime in.
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
 *
 * upscale — Real-ESRGAN general x4v3 (BSD-3-Clause), Qualcomm AI Hub's ONNX
 *   export. Fixed 128×128 input tiles, ×4 output, 0–1 RGB.
 *     image          float32 [1, 3, 128, 128]
 *     upscaled_image float32 [1, 3, 512, 512]
 */

export type ModelId = 'inpaint' | 'segment' | 'upscale'

export const MODELS: Record<ModelId, { url: string; sha256: string }> = {
  inpaint: {
    // Pinned revision.
    url: 'https://huggingface.co/andraniksargsyan/migan/resolve/406830d0fa60666da0071c342ad2fbc8f30c5c64/migan_pipeline_v2.onnx',
    sha256: '6f1f3530a1a2324b19752018ce756088b07973cda8d7d890034ace5c8a48c40b',
  },
  segment: {
    url: '/models/isnet-general-use-int8.onnx',
    sha256: '1143d3d61145ed4cf5c6651bc1388af49bdd9d0f4db3b7d7dbe07170efeaecac',
  },
  upscale: {
    url: '/models/realesr-general-x4v3.onnx',
    sha256: 'c6f13f8866203bc2aae3977eae6bce546b861e9e14e39682c03b17c9d6698c48',
  },
}

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
  | {
      kind: 'upscale'
      id: number
      /** Interleaved RGBA, `width`×`height`; alpha is ignored. */
      rgba: Uint8ClampedArray<ArrayBuffer>
      width: number
      height: number
      /** Final enlargement, up to 4 (the model's own scale). */
      factor: number
    }

export type AiReply =
  | { kind: 'progress'; model: ModelId; loaded: number; total: number }
  | { kind: 'ready'; model: ModelId }
  /** How far a long job has got (upscale tiles). */
  | { kind: 'step'; id: number; done: number; total: number }
  /** inpaint: RGBA at the input size; segment: one byte of alpha per pixel; upscale: RGBA at `factor`. */
  | { kind: 'result'; id: number; data: Uint8ClampedArray<ArrayBuffer> }
  | { kind: 'error'; id: number | null; model: ModelId; message: string }

const CACHE_NAME = 'lightframes-models'

export function post(reply: AiReply, transfer: Transferable[] = []) {
  ;(self as unknown as Worker).postMessage(reply, transfer)
}

async function sha256(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** The model bytes: from Cache Storage when we have them, else downloaded (with progress) and cached. */
export async function loadModel(model: ModelId): Promise<ArrayBuffer> {
  const { sha256: expected } = MODELS[model]
  const url = new URL(MODELS[model].url, self.location.origin).href
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
