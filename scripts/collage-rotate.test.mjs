import test from 'node:test'
import assert from 'node:assert/strict'
import {
  coverWindow,
  coverOverflow,
  screenPanDelta,
  normalizeCollageRotate,
  deviceToSource,
  rotatedCoverSamples,
} from '../src/lib/collageCover.js'

test('normalizeCollageRotate wraps to quarter turns', () => {
  assert.equal(normalizeCollageRotate(90), 90)
  assert.equal(normalizeCollageRotate(450), 90)
  assert.equal(normalizeCollageRotate(-90), 270)
})

test('coverWindow at 0° uses cover scale and stays inside the image', () => {
  const win = coverWindow(1600, 1200, 400, 300, { x: 0.5, y: 0.5, zoom: 1, rotate: 0 })
  assert.ok(win.scale > 0)
  assert.ok(win.x >= 0 && win.y >= 0)
  assert.ok(win.x + win.w <= 1600 + 1e-6)
  assert.ok(win.y + win.h <= 1200 + 1e-6)
})

test('coverWindow at 90° swaps fit axes and maps source rect', () => {
  const flat = coverWindow(1600, 1200, 400, 300, { x: 0.5, y: 0.5, zoom: 1, rotate: 0 })
  const turned = coverWindow(1600, 1200, 400, 300, { x: 0.5, y: 0.5, zoom: 1, rotate: 90 })
  assert.equal(turned.rotate, 90)
  assert.notEqual(turned.scale, flat.scale)
  assert.ok(turned.x >= 0 && turned.y >= 0)
  assert.ok(turned.x + turned.w <= 1600 + 1e-6)
  assert.ok(turned.y + turned.h <= 1200 + 1e-6)
})

test('rotated cover overflow uses effective image dimensions', () => {
  const over = coverOverflow(2000, 1000, 500, 500, { x: 0.5, y: 0.5, zoom: 1.2, rotate: 90 })
  assert.ok(over.x > 0)
  assert.ok(over.y > 0)
})

test('screenPanDelta maps drag to logical framing at 90°', () => {
  assert.deepEqual(screenPanDelta(90, 10, 0), [0, -10])
  assert.deepEqual(screenPanDelta(0, 10, 5), [10, 5])
})

const framing = { x: 0.5, y: 0.5, zoom: 1 }

function rasterCell(imageRgb, imageW, imageH, boxW, boxH, cellFraming, bg = [255, 255, 255]) {
  const out = new Uint8Array(boxW * boxH * 3)
  for (let y = 0; y < boxH; y++) {
    for (let x = 0; x < boxW; x++) {
      const src = deviceToSource(x + 0.5, y + 0.5, boxW, boxH, cellFraming, imageW, imageH)
      const o = (y * boxW + x) * 3
      if (!src) {
        out[o] = bg[0]
        out[o + 1] = bg[1]
        out[o + 2] = bg[2]
        continue
      }
      const ix = Math.min(imageW - 1, Math.max(0, Math.floor(src.x)))
      const iy = Math.min(imageH - 1, Math.max(0, Math.floor(src.y)))
      const i = (iy * imageW + ix) * 3
      out[o] = imageRgb[i]
      out[o + 1] = imageRgb[i + 1]
      out[o + 2] = imageRgb[i + 2]
    }
  }
  return out
}

function solidImage(w, h, rgb) {
  const data = new Uint8Array(w * h * 3)
  for (let i = 0; i < w * h; i++) {
    data[i * 3] = rgb[0]
    data[i * 3 + 1] = rgb[1]
    data[i * 3 + 2] = rgb[2]
  }
  return data
}

function pixelAt(buf, boxW, x, y) {
  const o = (y * boxW + x) * 3
  return [buf[o], buf[o + 1], buf[o + 2]]
}

const coverageCases = [
  { name: 'tall cell 90°', boxW: 120, boxH: 220, rotate: 90 },
  { name: 'tall cell 270°', boxW: 120, boxH: 220, rotate: 270 },
  { name: 'wide cell 90°', boxW: 220, boxH: 120, rotate: 90 },
  { name: 'wide cell 270°', boxW: 220, boxH: 120, rotate: 270 },
]

for (const { name, boxW, boxH, rotate } of coverageCases) {
  test(`rotated cover fills cell corners (${name})`, () => {
    const imageW = 400
    const imageH = 300
    const cellFraming = { ...framing, rotate }
    const samples = rotatedCoverSamples(boxW, boxH, cellFraming, imageW, imageH)
    for (const s of samples) {
      assert.ok(s.src, `corner/edge (${s.x},${s.y}) should map to image, got null`)
      assert.ok(s.src.x >= 0 && s.src.y >= 0)
      assert.ok(s.src.x <= imageW && s.src.y <= imageH)
    }
    const img = solidImage(imageW, imageH, [200, 40, 40])
    const raster = rasterCell(img, imageW, imageH, boxW, boxH, cellFraming)
    const corners = [
      [0, 0],
      [boxW - 1, 0],
      [boxW - 1, boxH - 1],
      [0, boxH - 1],
    ]
    for (const [x, y] of corners) {
      const p = pixelAt(raster, boxW, x, y)
      assert.notDeepEqual(p, [255, 255, 255], `corner (${x},${y}) should be image, not background`)
      assert.deepEqual(p, [200, 40, 40])
    }
  })
}

test('pan at extremes keeps corners on image for 90° tall cell', () => {
  const imageW = 400
  const imageH = 300
  const boxW = 120
  const boxH = 220
  const over = coverOverflow(imageW, imageH, boxW, boxH, { x: 0.5, y: 0.5, zoom: 1.5, rotate: 90 })
  for (const x of [0, 1]) {
    for (const y of [0, 1]) {
      const cellFraming = { x, y, zoom: 1.5, rotate: 90 }
      const samples = rotatedCoverSamples(boxW, boxH, cellFraming, imageW, imageH)
      assert.ok(samples.every((s) => s.src), `framing x=${x} y=${y}`)
    }
  }
  assert.ok(over.x > 0 || over.y > 0)
})
