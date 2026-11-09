import test from 'node:test'
import assert from 'node:assert/strict'
import { createCanvas } from '@napi-rs/canvas'
import { coverWindow, coverOverflow, screenPanDelta, normalizeCollageRotate } from '../src/lib/collageCover.js'
import { paintCollageCell } from '../src/lib/collageExportPaint.js'
import { paintCarouselSlide } from '../src/lib/carouselPaint.js'
import { packStudioState, unpackStudioState } from '../src/lib/studioState.js'

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

function paintSlide(slideW, slideH, frames, imageW, imageH, imageRgb, bgRgb, slideIndex = 0) {
  const src = createCanvas(imageW, imageH)
  const sctx = src.getContext('2d')
  sctx.fillStyle = `rgb(${imageRgb.join(',')})`
  sctx.fillRect(0, 0, imageW, imageH)
  const canvas = createCanvas(slideW, slideH)
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = `rgb(${bgRgb.join(',')})`
  ctx.fillRect(0, 0, slideW, slideH)
  paintCarouselSlide(ctx, slideW, slideH, frames, slideIndex, () => src)
  return ctx.getImageData(0, 0, slideW, slideH)
}

const carouselCases = [
  { name: 'full slide portrait 90°', imageW: 240, imageH: 360, slideW: 108, slideH: 135, rotate: 90, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { name: 'full slide portrait 270°', imageW: 240, imageH: 360, slideW: 108, slideH: 135, rotate: 270, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { name: 'full slide landscape 90°', imageW: 360, imageH: 200, slideW: 160, slideH: 90, rotate: 90, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { name: 'full slide landscape 270°', imageW: 360, imageH: 200, slideW: 160, slideH: 90, rotate: 270, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { name: 'inset frame 90°', imageW: 240, imageH: 360, slideW: 120, slideH: 160, rotate: 90, frame: { x: 0.15, y: 0.2, w: 0.55, h: 0.5 } },
  { name: 'inset frame 270°', imageW: 360, imageH: 200, slideW: 140, slideH: 100, rotate: 270, frame: { x: 0.1, y: 0.25, w: 0.7, h: 0.45 } },
]

for (const { name, imageW, imageH, slideW, slideH, rotate, frame } of carouselCases) {
  test(`carousel export covers the frame (${name})`, () => {
    const placed = { ...frame, fx: 0.5, fy: 0.5, zoom: 1, rotate }
    const data = paintSlide(slideW, slideH, [placed], imageW, imageH, FG, BG)
    const x0 = Math.round(frame.x * slideW)
    const y0 = Math.round(frame.y * slideH)
    const x1 = Math.round((frame.x + frame.w) * slideW)
    const y1 = Math.round((frame.y + frame.h) * slideH)
    const samples = [
      [x0 + 1, y0 + 1],
      [x1 - 2, y0 + 1],
      [x1 - 2, y1 - 2],
      [x0 + 1, y1 - 2],
      [Math.floor((x0 + x1) / 2), y0 + 1],
      [x1 - 2, Math.floor((y0 + y1) / 2)],
      [Math.floor((x0 + x1) / 2), y1 - 2],
      [x0 + 1, Math.floor((y0 + y1) / 2)],
      [Math.floor((x0 + x1) / 2), Math.floor((y0 + y1) / 2)],
    ]
    for (const [x, y] of samples) {
      assert.deepEqual(pixelAt(data, slideW, x, y), FG, `(${x},${y})`)
    }
    if (frame.x > 0) {
      assert.deepEqual(pixelAt(data, slideW, 1, 1), BG, 'outside the frame stays background')
    }
  })
}

test('carousel export covers a frame that straddles two slides', () => {
  const slideW = 100
  const slideH = 140
  const frame = { x: 0.62, y: 0, w: 0.7, h: 1, fx: 0.5, fy: 0.5, zoom: 1, rotate: 90 }
  for (const slideIndex of [0, 1]) {
    const data = paintSlide(slideW, slideH, [frame], 180, 320, FG, BG, slideIndex)
    const left = Math.max(0, Math.round((frame.x - slideIndex) * slideW))
    const right = Math.min(slideW, Math.round((frame.x + frame.w - slideIndex) * slideW))
    for (const [x, y] of [
      [left + 1, 1],
      [right - 2, 1],
      [right - 2, slideH - 2],
      [left + 1, slideH - 2],
      [Math.floor((left + right) / 2), Math.floor(slideH / 2)],
    ]) {
      assert.deepEqual(pixelAt(data, slideW, x, y), FG, `slide ${slideIndex} (${x},${y})`)
    }
  }
})

test('carousel export stays covered when panned at zoom 1.5', () => {
  const slideW = 90
  const slideH = 220
  const frame = { x: 0, y: 0, w: 1, h: 1 }
  for (const rotate of [90, 270]) {
    for (const fx of [0, 1]) {
      for (const fy of [0, 1]) {
        const data = paintSlide(slideW, slideH, [{ ...frame, fx, fy, zoom: 1.5, rotate }], 240, 360, FG, BG)
        for (const [px, py] of [
          [1, 1],
          [slideW - 2, 1],
          [slideW - 2, slideH - 2],
          [1, slideH - 2],
          [Math.floor(slideW / 2), Math.floor(slideH / 2)],
        ]) {
          assert.deepEqual(pixelAt(data, slideW, px, py), FG, `rot ${rotate} pan ${fx},${fy} @ ${px},${py}`)
        }
      }
    }
  }
})

test('rotation persists through a local session round-trip', () => {
  const state = {
    format: 'carousel',
    collage: {
      aspect: '4:5',
      border: { enabled: true, size: 0.015, color: '#ffffff', outer: true },
      slides: [
        {
          id: 's1',
          layoutId: 'cols-2',
          cells: [
            { photoId: 'a', x: 0.2, y: 0.8, zoom: 1.4, rotate: 90 },
            { photoId: 'b', x: 0.5, y: 0.5, zoom: 1, rotate: 450 },
          ],
        },
      ],
    },
    carousel: {
      aspect: '1:1',
      slideCount: 3,
      background: '#111111',
      pool: ['a', 'b'],
      frames: [
        { id: 'f1', photoId: 'a', x: 0, y: 0, w: 1, h: 1, fx: 0.3, fy: 0.7, zoom: 1.2, rotate: -90 },
        { id: 'f2', photoId: 'b', x: 1, y: 0.1, w: 0.8, h: 0.8, fx: 0.5, fy: 0.5, zoom: 1 },
      ],
    },
  }
  const session = {
    photos: [{ id: 'a' }],
    activeId: 'a',
    selectedIds: ['a'],
    updatedAt: '2026-11-09T00:00:00.000Z',
    studio: packStudioState(state),
  }
  const stored = JSON.parse(JSON.stringify(session))
  assert.equal(JSON.stringify(stored).includes('http'), false)
  const restored = unpackStudioState(stored.studio)
  assert.equal(restored.format, 'carousel')
  assert.equal(restored.collage.slides[0].cells[0].rotate, 90)
  assert.equal(restored.collage.slides[0].cells[0].x, 0.2)
  assert.equal(restored.collage.slides[0].cells[1].rotate, 90)
  assert.equal(restored.carousel.frames[0].rotate, 270)
  assert.equal(restored.carousel.frames[0].fx, 0.3)
  assert.equal(restored.carousel.frames[1].rotate, 0)
  assert.equal(restored.carousel.background, '#111111')
  assert.deepEqual(packStudioState(restored), stored.studio)
  assert.equal(unpackStudioState(null), null)
  assert.equal(unpackStudioState('nope'), null)
})

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
