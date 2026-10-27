import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import { readFileSync } from 'node:fs'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { defineConfig } from 'astro/config'
import { pwa } from './integrations/pwa.mjs'

const outDir = new URL('./dist/', import.meta.url)

/** Built HTML of a page URL (build.format 'file': /tools/x → dist/tools/x.html), or '' if missing. */
function builtHtml(url) {
  const path = new URL(url).pathname
  try {
    return readFileSync(new URL(path === '/' ? 'index.html' : `${path.slice(1)}.html`, outDir), 'utf8')
  } catch {
    return ''
  }
}

/**
 * The sitemap is written after the pages, so the <head> of each page is the single source of truth:
 * its hreflang links (localized slugs can't be paired by path) and its JSON-LD dateModified.
 */
function serialize(item) {
  const html = builtHtml(item.url)
  const links = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(([, lang, url]) => ({
    lang,
    url,
  }))
  if (links.length > 1) item.links = links
  const modified = html.match(/"dateModified":"([^"]+)"/)?.[1]
  if (modified) item.lastmod = modified
  return item
}

/** Editorial <!-- TODO … --> notes stay in the Markdown source but never reach the published HTML. */
function stripTodoComments() {
  return {
    name: 'strip-todo-comments',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const files = await readdir(dir, { recursive: true })
        await Promise.all(
          files
            .filter((file) => file.endsWith('.html'))
            .map(async (file) => {
              const path = new URL(file, dir)
              const html = await readFile(path, 'utf8')
              const clean = html.replace(/[ \t]*<!--\s*TODO[\s\S]*?-->/g, '')
              if (clean !== html) await writeFile(path, clean)
            }),
        )
      },
    },
  }
}

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://www.lightframes.si',
  // `file` + no trailing slash gives /tools/raw-photo-editor (served from .html) on Vercel and Cloudflare Pages alike
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !/\/404$/.test(page),
      serialize,
    }),
    // Before pwa(), so the precache revisions hash the cleaned HTML
    stripTodoComments(),
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
