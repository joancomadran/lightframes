// Usage: node scripts/stills.mjs 120 450 900 …  → shots/f0120.jpg …
import { bundle } from '@remotion/bundler'
import { renderStill, selectComposition } from '@remotion/renderer'
import path from 'node:path'

const frames = process.argv.slice(2).map(Number)
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') })
const composition = await selectComposition({ serveUrl, id: 'PromoSilent' })
for (const frame of frames) {
  const output = `shots/f${String(frame).padStart(4, '0')}.jpg`
  await renderStill({ serveUrl, composition, frame, output, imageFormat: 'jpeg', jpegQuality: 85, scale: 0.5 })
  console.log(output)
}
