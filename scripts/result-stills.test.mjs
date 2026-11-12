import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import sharp from 'sharp'

/** Files the home and tool pages point at. Dimensions are the ones written into src/site/results.ts. */
const STILLS = {
  'develop-before': [1200, 801],
  'develop-after': [1200, 801],
  'cutout-before': [731, 877],
  'cutout-after': [731, 877],
  'remove-before': [840, 672],
  'remove-after': [840, 672],
  'upscale-before': [512, 384],
  'upscale-after': [512, 384],
  'carousel-source': [960, 640],
  'carousel-1': [540, 675],
  'carousel-2': [540, 675],
  'carousel-3': [540, 675],
}

test('result stills exist as webp and avif at the documented size', async () => {
  for (const [name, [width, height]] of Object.entries(STILLS)) {
    for (const ext of ['webp', 'avif']) {
      const path = `public/site/results/${name}.${ext}`
      const bytes = await readFile(path)
      assert.ok(bytes.length > 500, path)
      const meta = await sharp(bytes).metadata()
      assert.equal(meta.width, width, path)
      assert.equal(meta.height, height, path)
    }
  }
  const cutout = await sharp('public/site/results/cutout-after.webp').stats()
  assert.ok(cutout.channels[3].min < 10, 'cutout after keeps a transparent background')
})
