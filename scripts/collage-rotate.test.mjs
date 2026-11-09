import test from 'node:test'
import assert from 'node:assert/strict'
import { coverWindow, coverOverflow, screenPanDelta, normalizeCollageRotate } from '../src/lib/collageCover.js'

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
