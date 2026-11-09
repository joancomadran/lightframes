import test from 'node:test'
import assert from 'node:assert/strict'
import { createCanvas } from '@napi-rs/canvas'
import { coverWindow, coverOverflow, screenPanDelta, normalizeCollageRotate } from '../src/lib/collageCover.js'
import { paintCollageCell } from '../src/lib/collageExportPaint.js'

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

/** Same draw `renderCollageSlide` uses (`drawRotatedCoverCell`). */
function paintCell(imageW, imageH, boxW, boxH, framing, imageRgb, bgRgb) {
  const src = createCanvas(imageW, imageH)
  const sctx = src.getContext('2d')
  sctx.fillStyle = `rgb(${imageRgb.join(',')})`
  sctx.fillRect(0, 0, imageW, imageH)
  const canvas = createCanvas(boxW, boxH)
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = `rgb(${bgRgb.join(',')})`
  ctx.fillRect(0, 0, boxW, boxH)
  paintCollageCell(ctx, src, 0, 0, boxW, boxH, framing)
  return ctx.getImageData(0, 0, boxW, boxH)
}

function pixelAt(imageData, boxW, x, y) {
  const o = (y * boxW + x) * 4
  return [imageData.data[o], imageData.data[o + 1], imageData.data[o + 2]]
}

const coverageCases = [
  { name: 'tall portrait 90°', imageW: 240, imageH: 360, boxW: 90, boxH: 220, rotate: 90 },
  { name: 'tall portrait 270°', imageW: 240, imageH: 360, boxW: 90, boxH: 220, rotate: 270 },
  { name: 'wide landscape 90°', imageW: 360, imageH: 240, boxW: 220, boxH: 90, rotate: 90 },
  { name: 'wide landscape 270°', imageW: 360, imageH: 240, boxW: 220, boxH: 90, rotate: 270 },
]

const BG = [255, 255, 255]
const FG = [200, 40, 40]

for (const { name, imageW, imageH, boxW, boxH, rotate } of coverageCases) {
  test(`export draw covers cell (${name})`, () => {
    const data = paintCell(imageW, imageH, boxW, boxH, { x: 0.5, y: 0.5, zoom: 1, rotate }, FG, BG)
    const samples = [
      [1, 1],
      [boxW - 2, 1],
      [boxW - 2, boxH - 2],
      [1, boxH - 2],
      [Math.floor(boxW / 2), 1],
      [boxW - 2, Math.floor(boxH / 2)],
      [Math.floor(boxW / 2), boxH - 2],
      [1, Math.floor(boxH / 2)],
      [Math.floor(boxW / 2), Math.floor(boxH / 2)],
    ]
    for (const [x, y] of samples) {
      const p = pixelAt(data, boxW, x, y)
      assert.notDeepEqual(p, BG, `(${x},${y}) is background`)
      assert.deepEqual(p, FG, `(${x},${y})`)
    }
  })
}

test('export draw stays covered when panned at zoom 1.5', () => {
  const imageW = 240
  const imageH = 360
  const boxW = 90
  const boxH = 220
  for (const rotate of [90, 270]) {
    for (const x of [0, 1]) {
      for (const y of [0, 1]) {
        const data = paintCell(imageW, imageH, boxW, boxH, { x, y, zoom: 1.5, rotate }, FG, BG)
        for (const [px, py] of [
          [1, 1],
          [boxW - 2, 1],
          [boxW - 2, boxH - 2],
          [1, boxH - 2],
          [Math.floor(boxW / 2), Math.floor(boxH / 2)],
        ]) {
          assert.deepEqual(pixelAt(data, boxW, px, py), FG, `rot ${rotate} pan ${x},${y} @ ${px},${py}`)
        }
      }
    }
  }
})
