import { fileURLToPath } from 'node:url'
import { generateSW } from 'workbox-build'

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
          globPatterns: ['**/*.{js,css,html,svg,png,wasm,webmanifest}'],
          globIgnores: ['og-image.png', 'samples/**', 'site/**', 'video/**', '_astro/ort-*.wasm'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
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
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        })
        for (const warning of warnings) logger.warn(warning)
        logger.info(`sw.js precaches ${count} files (${(size / 1024 / 1024).toFixed(1)} MB)`)
      },
    },
  }
}
