import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'
import { pwa } from './integrations/pwa.mjs'

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://lightframes.si',
  // `file` + no trailing slash gives /tools/raw-photo-editor (served from .html) on Vercel and Cloudflare Pages alike
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !/\/404$/.test(page),
    }),
    pwa(),
  ],
  vite: {
    // The editor still reads VITE_ADS_ENABLED
    envPrefix: ['VITE_', 'PUBLIC_'],
    optimizeDeps: {
      // Pre-bundling moves these packages away from the .wasm files they load relative to themselves
      exclude: ['libraw-wasm', 'onnxruntime-web'],
    },
    worker: {
      format: 'es',
    },
  },
})
