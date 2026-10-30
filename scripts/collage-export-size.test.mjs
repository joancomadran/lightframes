import test from 'node:test'
import assert from 'node:assert/strict'
import { clampCanvasSize, MAX_CANVAS_AREA, MAX_CANVAS_EDGE } from '../src/lib/canvasLimits.js'

test('keeps small sizes unchanged', () => {
  const out = clampCanvasSize(1080, 1350)
  assert.equal(out.clamped, false)
  assert.equal(out.width, 1080)
  assert.equal(out.height, 1350)
})

test('scales down when edge exceeds browser limit', () => {
  const out = clampCanvasSize(20000, 10000)
  assert.equal(out.clamped, true)
  assert.ok(out.width <= MAX_CANVAS_EDGE)
  assert.ok(out.height <= MAX_CANVAS_EDGE)
})

test('keeps pixel area within browser limit after edge clamp', () => {
  const out = clampCanvasSize(24000, 24000)
  assert.equal(out.clamped, true)
  assert.ok(out.width * out.height <= MAX_CANVAS_AREA)
  assert.ok(out.width <= MAX_CANVAS_EDGE)
  assert.ok(out.height <= MAX_CANVAS_EDGE)
})
