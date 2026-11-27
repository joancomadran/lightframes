import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateSW } from 'workbox-build'

/** The HEIC decoder is a lazy chunk. Leave it out of the precache so the first visit does not download it. */
function isHeicDecoderChunk(dir, url) {
  if (!url.endsWith('.js')) return false
  try {
    return readFileSync(join(dir, url), 'utf8').includes('HEIF image not found')
  } catch {
    return false
  }
}

/**
 * Writes dist/sw.js once Astro has rendered every page, so the precache covers the
 * editor and the static pages. Same caching rules the editor had under vite-plugin-pwa.
 */
export function pwa() {
  return {
    name: 'lightframes-pwa',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const globDirectory = fileURLToPath(dir)
        const { count, size, warnings } = await generateSW({
          globDirectory,
          swDest: `${globDirectory}sw.js`,
          // Precache the LibRaw WASM so RAW decoding works offline too
          globPatterns: ['**/*.{js,css,html,svg,png,wasm,webmanifest,woff2}'],
          globIgnores: ['og-image.png', 'samples/**', 'site/**', 'video/**', '_astro/ort-*.wasm'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          manifestTransforms: [
            async (entries) => ({
              manifest: entries.filter((entry) => !isHeicDecoderChunk(globDirectory, entry.url)),
              warnings: [],
            }),
          ],
          runtimeCaching: [
            {
              // The inpainting runtime (~14 MB) is too big to precache: keep it once it has been used
              urlPattern: ({ url }) => /\/_astro\/ort-.*\.wasm$/.test(url.pathname),
              handler: 'CacheFirst',
              options: { cacheName: 'inpaint-runtime', expiration: { maxEntries: 2 } },
            },
            {
              // Demo photos are fetched on demand, then kept for offline use
              urlPattern: ({ url }) => url.pathname.startsWith('/samples/'),
              handler: 'CacheFirst',
              options: { cacheName: 'samples', expiration: { maxEntries: 10 } },
            },
          ],
        })
        for (const warning of warnings) logger.warn(warning)
        logger.info(`sw.js precaches ${count} files (${(size / 1024 / 1024).toFixed(1)} MB)`)
      },
    },
  }
}
