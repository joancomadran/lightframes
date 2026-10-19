import * as ort from 'onnxruntime-web/webgpu'
import { loadModel, post, type AiRequest } from './aiModels'

/*
 * Real-ESRGAN ×4 upscaling (see aiModels.ts), on the GPU through WebGPU when
 * the browser has it, else on the CPU. Its own worker because the WebGPU
 * build of the runtime is twice the size of the CPU one: only people who
 * upscale download it.
 *
 * The model takes fixed 128×128 tiles. Tiles overlap by PAD pixels and only
 * their middle is kept, so tile edges (where the network sees less context)
 * never show as seams. Each tile's ×4 result is resampled straight to the
 * factor asked for, so memory only ever holds the final image.
 */

const TILE = 128
const PAD = 8
const SCALE = 4

ort.env.wasm.numThreads = 1

let session: Promise<ort.InferenceSession> | null = null

async function createSession(bytes: ArrayBuffer): Promise<ort.InferenceSession> {
  if ('gpu' in navigator) {
    try {
      return await ort.InferenceSession.create(bytes, { executionProviders: ['webgpu'] })
    } catch {
      // No usable adapter: fall through to the CPU.
    }
  }
  return ort.InferenceSession.create(bytes, { executionProviders: ['wasm'] })
}

function getSession(): Promise<ort.InferenceSession> {
  session ??= loadModel('upscale')
    .then(createSession)
    .then((s) => {
      post({ kind: 'ready', model: 'upscale' })
      return s
    })
    .catch((err: unknown) => {
      session = null
      throw err
    })
  return session
}

/** Tile origins along one axis: every TILE − 2·PAD, with the last tile flush to the end. */
function tileStarts(length: number): number[] {
  if (length <= TILE) return [0]
  const starts: number[] = []
  for (let pos = 0; pos + TILE < length; pos += TILE - 2 * PAD) starts.push(pos)
  starts.push(length - TILE)
  return starts
}

/** Bilinear sample of one channel plane of a tile result (size × size), clamped at its edges. */
function sample(plane: Float32Array, offset: number, size: number, x: number, y: number): number {
  const fx = Math.min(size - 1, Math.max(0, x))
  const fy = Math.min(size - 1, Math.max(0, y))
  const x0 = Math.floor(fx)
  const y0 = Math.floor(fy)
  const x1 = Math.min(size - 1, x0 + 1)
  const y1 = Math.min(size - 1, y0 + 1)
  const tx = fx - x0
  const ty = fy - y0
  const top = plane[offset + y0 * size + x0]! + (plane[offset + y0 * size + x1]! - plane[offset + y0 * size + x0]!) * tx
  const bottom =
    plane[offset + y1 * size + x0]! + (plane[offset + y1 * size + x1]! - plane[offset + y1 * size + x0]!) * tx
  return top + (bottom - top) * ty
}

async function upscale(
  id: number,
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  factor: number,
): Promise<Uint8ClampedArray<ArrayBuffer>> {
  const s = await getSession()
  const ow = Math.max(1, Math.round(width * factor))
  const oh = Math.max(1, Math.round(height * factor))
  const out = new Uint8ClampedArray(ow * oh * 4)
  const xs = tileStarts(width)
  const ys = tileStarts(height)
  const total = xs.length * ys.length
  const plane = TILE * TILE
  const input = new Float32Array(plane * 3)
  const big = TILE * SCALE
  const bigPlane = big * big
  // Below ×4 each output pixel covers several model pixels: average a few samples across it.
  const subs = Math.min(3, Math.max(1, Math.ceil(SCALE / factor - 0.25)))
  let done = 0

  for (const [yi, ty] of ys.entries()) {
    for (const [xi, tx] of xs.entries()) {
      // Edge pixels repeat where the photo is smaller than a tile.
      for (let y = 0; y < TILE; y++) {
        const sy = Math.min(height - 1, ty + y)
        for (let x = 0; x < TILE; x++) {
          const i = (sy * width + Math.min(width - 1, tx + x)) * 4
          const k = y * TILE + x
          input[k] = rgba[i]! / 255
          input[plane + k] = rgba[i + 1]! / 255
          input[plane * 2 + k] = rgba[i + 2]! / 255
        }
      }
      const outputs = await s.run({ image: new ort.Tensor('float32', input, [1, 3, TILE, TILE]) })
      const result = outputs.upscaled_image!.data as Float32Array

      // This tile owns the output pixels whose centres fall in its middle (input coordinates);
      // the first / last tile on each axis also owns the outer edge.
      const cx0 = xi === 0 ? 0 : tx + PAD
      const cx1 = xi === xs.length - 1 ? width : tx + TILE - PAD
      const cy0 = yi === 0 ? 0 : ty + PAD
      const cy1 = yi === ys.length - 1 ? height : ty + TILE - PAD
      const X0 = Math.max(0, Math.ceil(cx0 * factor - 0.5))
      const X1 = Math.min(ow, Math.ceil(cx1 * factor - 0.5))
      const Y0 = Math.max(0, Math.ceil(cy0 * factor - 0.5))
      const Y1 = Math.min(oh, Math.ceil(cy1 * factor - 0.5))
      for (let Y = Y0; Y < Y1; Y++) {
        for (let X = X0; X < X1; X++) {
          let r = 0
          let g = 0
          let b = 0
          for (let sy = 0; sy < subs; sy++) {
            // Model-pixel position of this sub-sample within the tile's ×4 result.
            const qy = ((Y + (sy + 0.5) / subs) / factor - ty) * SCALE - 0.5
            for (let sx = 0; sx < subs; sx++) {
              const qx = ((X + (sx + 0.5) / subs) / factor - tx) * SCALE - 0.5
              r += sample(result, 0, big, qx, qy)
              g += sample(result, bigPlane, big, qx, qy)
              b += sample(result, bigPlane * 2, big, qx, qy)
            }
          }
          const n = subs * subs
          const o = (Y * ow + X) * 4
          out[o] = (r / n) * 255
          out[o + 1] = (g / n) * 255
          out[o + 2] = (b / n) * 255
          out[o + 3] = 255
        }
      }
      post({ kind: 'step', id, done: ++done, total })
    }
  }
  return out
}

self.onmessage = async (e: MessageEvent<AiRequest>) => {
  const request = e.data
  if (request.kind === 'load') {
    getSession().catch((err: unknown) => post({ kind: 'error', id: null, model: 'upscale', message: String(err) }))
    return
  }
  if (request.kind !== 'upscale') return
  try {
    const data = await upscale(request.id, request.rgba, request.width, request.height, request.factor)
    post({ kind: 'result', id: request.id, data }, [data.buffer])
  } catch (err) {
    post({ kind: 'error', id: request.id, model: 'upscale', message: err instanceof Error ? err.message : String(err) })
  }
}
