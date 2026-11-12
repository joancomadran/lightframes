/**
 * Honest marketing stills for the home page and the tool pages.
 *
 * Every pixel comes from a file in public/samples/ and from code that already
 * ships with the editor. Nothing is painted by hand.
 *
 *   develop-*.{webp,avif}
 *     public/samples/twelve-apostles.jpg, plain, and the same pixels after
 *     processImageSync (src/lib/imageProcessing.ts) with the slider values
 *     promo/scripts/capture-hero.mjs uses for this photo:
 *       exposure 0.85, contrast 26, highlights -65, shadows 85, whites 25,
 *       blacks -20, temperature 22, vibrance 55, saturation 8, clarity 32,
 *       dehaze 30.
 *     The file is the flat JPEG the editor ships. The camera RAW it was
 *     developed from is not in the repo, so this is not a sensor decode.
 *
 *   cutout-*.{webp,avif}
 *     public/samples/pagoda.jpg. The subject mask is IS-Net general use,
 *     public/models/isnet-general-use-int8.onnx, run the way ai.worker.ts
 *     runs it (1024², RGB/peak − 0.5, min–max to 0–1). Specks are dropped
 *     with cleanCutout from src/lib/cutout.ts. The after image keeps the
 *     photo's colour and uses the mask as alpha (transparent background).
 *     The square input is drawImage()'d with @napi-rs/canvas, same call the
 *     browser uses, not a hand-drawn matte.
 *
 *   remove-*.{webp,avif}
 *     A crop of pagoda.jpg. The person standing on open gravel is one Heal spot
 *     (src/lib/heal.ts): it copies gravel from up and to the left and blends it
 *     into the surroundings. The centre was read off a 2× crop of this file.
 *     The second person stands against the eaves; a gravel source leaves a dark
 *     patch there, so the still does not claim to remove them. MI-GAN on these
 *     figures filled the hole with foliage, so the still uses Heal.
 *
 *   upscale-*.{webp,avif}
 *     A roof crop of pagoda.jpg scaled down so the long edge is 256 px.
 *     Before: that small crop enlarged 2× with lanczos (a smooth resize).
 *     After: Real-ESRGAN general x4v3 (public/models/realesr-general-x4v3.onnx)
 *     tiled the way src/lib/upscale.worker.ts tiles, asked for 2×, then mixed
 *     with 20% of the smooth resize — TEXTURE_MIX in src/lib/upscale.ts.
 *
 *   carousel-source and carousel-1..3
 *     twelve-apostles.jpg in the Panorama layout: one frame across 3 slides,
 *     aspect 4:5, cover-fit, painted by paintCarouselSlide (src/lib/carouselPaint.js).
 *     Slides are 540×675, half of the 1080×1350 export, so the crop matches export.
 *
 * Run from the repo root:
 *   node --experimental-strip-types --import ./scripts/register-ts.mjs scripts/build-result-stills.mjs
 * Pass --only develop|cutout|remove|upscale|carousel to regenerate one set.
 */
import { mkdir, readFile } from 'node:fs/promises'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import * as ort from 'onnxruntime-web'
import sharp from 'sharp'
import { cleanCutout } from '../src/lib/cutout.ts'
import { applyHeal } from '../src/lib/heal.ts'
import { paintCarouselSlide } from '../src/lib/carouselPaint.js'
import { processImageSync } from '../src/lib/imageProcessing.ts'
import { cloneEdits, DEFAULT_EDITS } from '../src/types/edits.ts'

const OUT = new URL('../public/site/results/', import.meta.url)
const PAGODA = new URL('../public/samples/pagoda.jpg', import.meta.url)
const APOSTLES = new URL('../public/samples/twelve-apostles.jpg', import.meta.url)
const SEGMENT = new URL('../public/models/isnet-general-use-int8.onnx', import.meta.url)
const UPSCALE = new URL('../public/models/realesr-general-x4v3.onnx', import.meta.url)
ort.env.wasm.numThreads = 1
ort.env.wasm.wasmPaths = new URL('../node_modules/onnxruntime-web/dist/', import.meta.url).href

const manifest = {}

async function session(url) {
  const bytes = await readFile(url)
  return ort.InferenceSession.create(bytes, { executionProviders: ['wasm'] })
}

async function writeStill(name, rgba, width, height) {
  const input = Buffer.from(rgba.buffer, rgba.byteOffset, rgba.byteLength)
  const base = new URL(name, OUT)
  await sharp(input, { raw: { width, height, channels: 4 } })
    .webp({ quality: 78, alphaQuality: 90, effort: 4 })
    .toFile(`${base.pathname}.webp`)
  await sharp(input, { raw: { width, height, channels: 4 } })
    .avif({ quality: 50, effort: 4 })
    .toFile(`${base.pathname}.avif`)
  manifest[name] = { width, height }
  console.log('wrote', name, width, height)
}

async function resizeRgba(rgba, width, height, toW, toH) {
  const out = await sharp(Buffer.from(rgba.buffer, rgba.byteOffset, rgba.byteLength), {
    raw: { width, height, channels: 4 },
  })
    .resize(toW, toH, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer()
  return new Uint8ClampedArray(out.buffer, out.byteOffset, out.byteLength)
}

async function develop() {
  const image = await loadImage(APOSTLES)
  const canvas = createCanvas(image.width, image.height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0)
  const before = ctx.getImageData(0, 0, image.width, image.height)
  const edits = cloneEdits(DEFAULT_EDITS)
  Object.assign(edits, {
    exposure: 0.85,
    contrast: 26,
    highlights: -65,
    shadows: 85,
    whites: 25,
    blacks: -20,
    temperature: 22,
    vibrance: 55,
    saturation: 8,
    clarity: 32,
    dehaze: 30,
  })
  const after = new (before.constructor)(new Uint8ClampedArray(before.data), before.width, before.height)
  after.data.set(before.data)
  processImageSync(after, edits)
  const w = 1200
  const h = Math.round((image.height * w) / image.width)
  await writeStill('develop-before', await resizeRgba(before.data, before.width, before.height, w, h), w, h)
  await writeStill('develop-after', await resizeRgba(after.data, after.width, after.height, w, h), w, h)
}

function sampleMask(mask, n, x, y, imgW, imgH) {
  const fx = Math.min(n - 1, Math.max(0, ((x + 0.5) * n) / imgW - 0.5))
  const fy = Math.min(n - 1, Math.max(0, ((y + 0.5) * n) / imgH - 0.5))
  const x0 = Math.floor(fx)
  const y0 = Math.floor(fy)
  const x1 = Math.min(n - 1, x0 + 1)
  const y1 = Math.min(n - 1, y0 + 1)
  const tx = fx - x0
  const ty = fy - y0
  const at = (px, py) => mask[py * n + px]
  const top = at(x0, y0) + (at(x1, y0) - at(x0, y0)) * tx
  const bottom = at(x0, y1) + (at(x1, y1) - at(x0, y1)) * tx
  return top + (bottom - top) * ty
}

async function cutout() {
  console.log('segment…')
  const image = await loadImage(PAGODA)
  const s = await session(SEGMENT)
  const square = createCanvas(1024, 1024)
  const sq = square.getContext('2d')
  sq.drawImage(image, 0, 0, 1024, 1024)
  const rgba = sq.getImageData(0, 0, 1024, 1024).data
  const plane = 1024 * 1024
  let peak = 1
  for (let i = 0; i < rgba.length; i += 4) peak = Math.max(peak, rgba[i], rgba[i + 1], rgba[i + 2])
  const input = new Float32Array(plane * 3)
  for (let k = 0, i = 0; k < plane; k++, i += 4) {
    input[k] = rgba[i] / peak - 0.5
    input[plane + k] = rgba[i + 1] / peak - 0.5
    input[plane * 2 + k] = rgba[i + 2] / peak - 0.5
  }
  const outputs = await s.run({
    [s.inputNames[0]]: new ort.Tensor('float32', input, [1, 3, 1024, 1024]),
  })
  const pred = outputs[s.outputNames[0]].data
  let lo = Infinity
  let hi = -Infinity
  for (let k = 0; k < plane; k++) {
    lo = Math.min(lo, pred[k])
    hi = Math.max(hi, pred[k])
  }
  const range = hi - lo || 1
  const alpha = new Uint8ClampedArray(plane)
  for (let k = 0; k < plane; k++) alpha[k] = ((pred[k] - lo) / range) * 255
  const mask = cleanCutout(alpha, 1024)
  await s.release()

  let minX = image.width
  let minY = image.height
  let maxX = 0
  let maxY = 0
  const step = 4
  for (let y = 0; y < image.height; y += step) {
    for (let x = 0; x < image.width; x += step) {
      if (sampleMask(mask, 1024, x, y, image.width, image.height) < 32) continue
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }
  const padX = Math.round((maxX - minX) * 0.08)
  const padY = Math.round((maxY - minY) * 0.06)
  const crop = {
    x: Math.max(0, minX - padX),
    y: Math.max(0, minY - padY),
    w: Math.min(image.width, maxX + padX) - Math.max(0, minX - padX),
    h: Math.min(image.height, maxY + padY) - Math.max(0, minY - padY),
  }
  // The mask runs into the foreground leaves. The still shows the tower, where
  // the removed sky is the result, and stops 1.2 widths down from the spire.
  crop.h = Math.min(crop.h, Math.round(crop.w * 1.2))
  const maxW = 900
  const scale = Math.min(1, maxW / crop.w)
  const outW = Math.round(crop.w * scale)
  const outH = Math.round(crop.h * scale)
  const full = createCanvas(image.width, image.height)
  const fctx = full.getContext('2d')
  fctx.drawImage(image, 0, 0)
  const src = fctx.getImageData(crop.x, crop.y, crop.w, crop.h)
  const fitted = await resizeRgba(src.data, crop.w, crop.h, outW, outH)
  const cut = new Uint8ClampedArray(fitted)
  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const sx = crop.x + ((x + 0.5) * crop.w) / outW - 0.5
      const sy = crop.y + ((y + 0.5) * crop.h) / outH - 0.5
      cut[(y * outW + x) * 4 + 3] = sampleMask(mask, 1024, sx, sy, image.width, image.height)
    }
  }
  await writeStill('cutout-before', fitted, outW, outH)
  await writeStill('cutout-after', cut, outW, outH)
  console.log('cutout crop', crop)
}

async function removePeople() {
  const image = await loadImage(PAGODA)
  const sw = image.width
  const sh = image.height
  // Centres read off a 2× crop. The source sits on open gravel, up and to the left.
  // The figure on the open gravel. The second figure stands against the eaves,
  // and a gravel source leaves a dark patch there, so this still heals one person.
  const spots = [
    { id: 'pagoda-person-a', x: 978, y: 2024 },
  ].map((p) => ({
    id: p.id,
    mode: 'heal',
    points: [p.x / sw, p.y / sh],
    size: 0.022,
    feather: 0.55,
    opacity: 1,
    dx: -110 / sw,
    dy: -70 / sh,
  }))

  // Wide enough that the heal source (about 110 px left and 70 px up) is inside the buffer.
  const view = { x: 760, y: 1780, w: 500, h: 400 }
  const viewCanvas = createCanvas(view.w, view.h)
  const vctx = viewCanvas.getContext('2d')
  vctx.drawImage(image, view.x, view.y, view.w, view.h, 0, 0, view.w, view.h)
  const before = vctx.getImageData(0, 0, view.w, view.h)
  const after = vctx.getImageData(0, 0, view.w, view.h)
  applyHeal(
    {
      data: after.data,
      width: view.w,
      height: view.h,
      stride: 4,
      max: 255,
      left: view.x,
      top: view.y,
      fullWidth: sw,
      fullHeight: sh,
    },
    spots,
  )
  const outW = 840
  const outH = Math.round((view.h * outW) / view.w)
  await writeStill('remove-before', await resizeRgba(before.data, view.w, view.h, outW, outH), outW, outH)
  await writeStill('remove-after', await resizeRgba(after.data, view.w, view.h, outW, outH), outW, outH)
}

const TILE = 128
const PAD = 8
const SCALE = 4

function tileStarts(length) {
  if (length <= TILE) return [0]
  const starts = []
  for (let pos = 0; pos + TILE < length; pos += TILE - 2 * PAD) starts.push(pos)
  starts.push(length - TILE)
  return starts
}

function samplePlane(plane, offset, size, x, y) {
  const fx = Math.min(size - 1, Math.max(0, x))
  const fy = Math.min(size - 1, Math.max(0, y))
  const x0 = Math.floor(fx)
  const y0 = Math.floor(fy)
  const x1 = Math.min(size - 1, x0 + 1)
  const y1 = Math.min(size - 1, y0 + 1)
  const tx = fx - x0
  const ty = fy - y0
  const top = plane[offset + y0 * size + x0] + (plane[offset + y0 * size + x1] - plane[offset + y0 * size + x0]) * tx
  const bottom = plane[offset + y1 * size + x0] + (plane[offset + y1 * size + x1] - plane[offset + y1 * size + x0]) * tx
  return top + (bottom - top) * ty
}

/** Same tile loop as src/lib/upscale.worker.ts, then the 20% texture mix from upscale.ts. */
async function upscaleFactor(rgba, width, height, factor, smooth) {
  const s = await session(UPSCALE)
  const ow = Math.round(width * factor)
  const oh = Math.round(height * factor)
  const out = new Uint8ClampedArray(ow * oh * 4)
  const xs = tileStarts(width)
  const ys = tileStarts(height)
  const plane = TILE * TILE
  const input = new Float32Array(plane * 3)
  const big = TILE * SCALE
  const bigPlane = big * big
  const subs = Math.min(3, Math.max(1, Math.ceil(SCALE / factor - 0.25)))
  for (const [yi, ty] of ys.entries()) {
    for (const [xi, tx] of xs.entries()) {
      for (let y = 0; y < TILE; y++) {
        const sy = Math.min(height - 1, ty + y)
        for (let x = 0; x < TILE; x++) {
          const i = (sy * width + Math.min(width - 1, tx + x)) * 4
          const k = y * TILE + x
          input[k] = rgba[i] / 255
          input[plane + k] = rgba[i + 1] / 255
          input[plane * 2 + k] = rgba[i + 2] / 255
        }
      }
      const outputs = await s.run({ image: new ort.Tensor('float32', input, [1, 3, TILE, TILE]) })
      const result = outputs.upscaled_image.data
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
            const qy = ((Y + (sy + 0.5) / subs) / factor - ty) * SCALE - 0.5
            for (let sx = 0; sx < subs; sx++) {
              const qx = ((X + (sx + 0.5) / subs) / factor - tx) * SCALE - 0.5
              r += samplePlane(result, 0, big, qx, qy)
              g += samplePlane(result, bigPlane, big, qx, qy)
              b += samplePlane(result, bigPlane * 2, big, qx, qy)
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
    }
  }
  await s.release()
  const TEXTURE_MIX = 0.2
  for (let i = 0; i < out.length; i += 4) {
    out[i] = out[i] * (1 - TEXTURE_MIX) + smooth[i] * TEXTURE_MIX
    out[i + 1] = out[i + 1] * (1 - TEXTURE_MIX) + smooth[i + 1] * TEXTURE_MIX
    out[i + 2] = out[i + 2] * (1 - TEXTURE_MIX) + smooth[i + 2] * TEXTURE_MIX
    out[i + 3] = 255
  }
  return out
}

async function upscale() {
  console.log('upscale…')
  const image = await loadImage(PAGODA)
  // Eaves and vent under the spire: a 640×480 crop, then a long edge of 256.
  const crop = { x: 1000, y: 980, w: 600, h: 450 }
  const canvas = createCanvas(crop.w, crop.h)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h)
  const full = ctx.getImageData(0, 0, crop.w, crop.h)
  const smallW = 256
  const smallH = Math.round((crop.h * smallW) / crop.w)
  const small = await resizeRgba(full.data, crop.w, crop.h, smallW, smallH)
  const factor = 2
  const outW = smallW * factor
  const outH = smallH * factor
  const smooth = await resizeRgba(small, smallW, smallH, outW, outH)
  const ai = await upscaleFactor(small, smallW, smallH, factor, smooth)
  await writeStill('upscale-before', smooth, outW, outH)
  await writeStill('upscale-after', ai, outW, outH)
}

async function carousel() {
  const image = await loadImage(APOSTLES)
  const slideW = 540
  const slideH = 675
  const frame = { id: 'panorama', x: 0, y: 0, w: 3, h: 1, fx: 0.5, fy: 0.5, zoom: 1, rotate: 0 }
  for (let i = 0; i < 3; i++) {
    const canvas = createCanvas(slideW, slideH)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#0c100e'
    ctx.fillRect(0, 0, slideW, slideH)
    paintCarouselSlide(ctx, slideW, slideH, [frame], i, () => image)
    const pixels = ctx.getImageData(0, 0, slideW, slideH)
    await writeStill(`carousel-${i + 1}`, pixels.data, slideW, slideH)
  }
  const srcW = 960
  const srcH = Math.round((image.height * srcW) / image.width)
  const src = createCanvas(image.width, image.height)
  src.getContext('2d').drawImage(image, 0, 0)
  const raw = src.getContext('2d').getImageData(0, 0, image.width, image.height)
  await writeStill('carousel-source', await resizeRgba(raw.data, image.width, image.height, srcW, srcH), srcW, srcH)
}

await mkdir(OUT, { recursive: true })
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : ''
if (!only || only === 'develop') await develop()
if (!only || only === 'cutout') await cutout()
if (!only || only === 'remove') await removePeople()
if (!only || only === 'upscale') await upscale()
if (!only || only === 'carousel') await carousel()
console.log(JSON.stringify(manifest, null, 2))
console.log('done')
