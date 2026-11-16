import test from 'node:test'
import assert from 'node:assert/strict'
import { register } from 'node:module'

register('./ts-resolve-hook.mjs', new URL('./', import.meta.url).href)

const { faqAnswerParts, faqAnswerText } = await import('../src/site/schema.ts')

test('FAQ answers keep link labels in JSON-LD and only allow site or https links', () => {
  const answer =
    'See [how to use XMP presets without Lightroom](/xmp-presets-without-lightroom) and the [free presets and LUTs pack](/free-presets-luts).'
  assert.equal(
    faqAnswerText(answer),
    'See how to use XMP presets without Lightroom and the free presets and LUTs pack.',
  )
  assert.deepEqual(faqAnswerParts(answer), [
    { text: 'See ' },
    { text: 'how to use XMP presets without Lightroom', href: '/xmp-presets-without-lightroom' },
    { text: ' and the ' },
    { text: 'free presets and LUTs pack', href: '/free-presets-luts' },
    { text: '.' },
  ])
  const plain = 'No markup here.'
  assert.equal(faqAnswerText(plain), plain)
  assert.deepEqual(faqAnswerParts(plain), [{ text: plain }])
  const unsafe = 'Ignore [this](javascript:alert(1)) and [that](http://example.com).'
  assert.equal(faqAnswerText(unsafe), unsafe)
  assert.deepEqual(faqAnswerParts(unsafe), [{ text: unsafe }])
})
