import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Lightframes',
        short_name: 'Lightframes',
        description: 'Free local photo editor with custom presets and copy/paste edits.',
        theme_color: '#171e1a',
        background_color: '#0c100e',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the LibRaw WASM so RAW decoding works offline too
        globPatterns: ['**/*.{js,css,html,svg,png,wasm}'],
        globIgnores: ['og-image.png', 'samples/**', 'assets/ort-*.wasm'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            // The inpainting runtime (~14 MB) is too big to precache: keep it once it has been used
            urlPattern: ({ url }) => /\/assets\/ort-.*\.wasm$/.test(url.pathname),
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
      },
    }),
  ],
  optimizeDeps: {
    // Pre-bundling moves these packages away from the .wasm files they load relative to themselves
    exclude: ['libraw-wasm', 'onnxruntime-web'],
  },
  worker: {
    format: 'es',
  },
})
