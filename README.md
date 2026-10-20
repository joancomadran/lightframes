# Lightframes

**[Try it now → lightframes.si](https://www.lightframes.si)** · [Open the editor](https://www.lightframes.si/editor)

Free, **open-source**, local photo editor focused on custom presets and copy/paste edits. The code is MIT-licensed and your photos never leave your device: no uploads, no account, no cloud.

![Lightframes editor with a RAW photo open and the presets panel](docs/screenshots/editor.jpg)

Runs entirely in the browser. Edits stay non-destructive until you export. Sessions restore from IndexedDB after a refresh. Installable as an app (PWA) and works offline once loaded.

## Screenshots

| Start screen                                     | Carousel                                                                             |
| ------------------------------------------------ | ------------------------------------------------------------------------------------ |
| ![Empty start screen](docs/screenshots/home.jpg) | ![Carousel mode splitting a panorama across 4 slides](docs/screenshots/carousel.jpg) |

## Features

- **Open** JPEG, PNG and camera RAW (ARW, CR2, CR3, NEF, NRW, DNG, RAF, ORF, RW2, PEF, SRW). Toolbar **Open** uses the file picker; Filmstrip **Folder** opens a whole directory. More opens append to the filmstrip. RAW previews are a half-size LibRaw (WASM) decode, developed again at full resolution on export; the embedded JPEG is the fallback
- **Adjust**: light, white balance (with picker), presence, HSL / color, effects, master tone curve, crop / straighten / rotate
- **Local adjustments**: linear, radial, brush and AI subject masks
- **Retouch**: heal, clone and AI object removal (MI-GAN); AI background removal / replacement (IS-Net)
- Histogram with shadow/highlight clipping overlay, undo / redo, before/after (whole image or split)
- **Filmstrip**: multi-select, star ratings, pick / reject flags, filters
- **Copy / paste edits** across a selection, choosing which settings to paste
- **Presets**: save / update your own, dial intensity 0–100%, import JSON, XMP or `.cube` LUTs, export as JSON
- **Export** JPEG / PNG / WebP with quality, max edge (up to 8192 px), filename pattern, optional 2× / 4× AI upscaling (Real-ESRGAN); several photos export as one ZIP
- **Collage and carousel**: collages of 1–9 photos per slide in several sizes, and seamless swipe carousels (4:5, 3:4, 1:1) exported at 1080 px wide, both with ready-made layouts
- AI models run on-device with ONNX Runtime Web; each downloads once, is checked against a SHA-256 hash and is cached
- Works fully offline after the app is loaded

## Requirements

- Node.js 20+ (for development)
- A modern Chromium-based browser recommended (Chrome, Edge, Brave) for folder open + best canvas performance

## Run locally

```bash
npm install
npm run dev
```

Open the URL Astro prints (usually `http://localhost:4321`). The landing page is at `/` and the editor at `/editor`.

| Script            | What it does                                     |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Dev server with hot reload                       |
| `npm run build`   | Type-check (`astro check`) and build to `dist/`  |
| `npm run preview` | Serve the production build locally               |
| `npm run check`   | Type-check `.astro`, `.ts` and `.tsx` files only |
| `npm run lint`    | Lint with oxlint                                 |

`dist/` is plain static files: serve it from any static host. Once loaded, the editor itself needs no network.

## Project structure

The repo is one Astro project. The site pages are static HTML with no JavaScript; the editor is a React island on its own page.

```
astro.config.mjs        site URL, integrations (React, sitemap, PWA)
integrations/pwa.mjs    writes dist/sw.js with workbox-build after the build
vercel.json             clean URLs, no trailing slash
src/
  App.tsx, components/, hooks/, lib/, types/   the editor (React)
  EditorRoot.tsx        editor entry, mounted by src/pages/editor.astro
  pages/                routes: landing, editor, tools, blog, FAQ, legal, robots.txt, llms.txt…
  site/                 site layouts, components, views, i18n, JSON-LD, copy for the landing page
  content/              editable content: tools, blog, pages, FAQ (Markdown / JSON, EN + ES)
  content.config.ts     content schema (frontmatter is validated at build time)
public/                 icons, manifest, samples, AI models, site images
promo/                  promo video (Remotion), separate package
```

### Website and blog

The site is in English and Spanish (`/es/…`, with localized slugs and `hreflang`). Tool pages, guides, the FAQ and the legal pages are Markdown or JSON files in `src/content/`, so they can be edited without touching components. Every page has a canonical URL, Open Graph tags and JSON-LD. The build also generates the sitemap, RSS feeds, `robots.txt`, `llms.txt` and `llms-full.txt`.

See **[docs/SEO.md](docs/SEO.md)** for the URL map, frontmatter fields, how to add a post and the open SEO tasks.

## Offline use and PWA

1. Open the production build once while online. A service worker precaches the app, including the LibRaw WASM, and caches Google Fonts on first visit.
2. After that, the editor loads, and open, edit, preset and export all work without a network connection. In Chromium you can also install it from the address bar.
3. The AI models and the inpainting runtime are too big to precache: each is cached the first time it is used.
4. For a fully air-gapped install, self-host the font files and remove the Google Fonts `<link>` tags in `src/pages/editor.astro` and `src/site/layouts/Base.astro`.

The installed app starts at `/editor`. The manifest keeps `id: "/"`, so installs made before the editor moved there stay the same app, and the landing page sends standalone launches at `/` on to the editor.

## Presets

Presets are named `EditParams` stacks stored in IndexedDB (`lightframes-presets`), with a backup copy in `localStorage`, and exportable as JSON. Import also accepts:

- **XMP**: develop settings from `.xmp` presets mapped onto the basic + HSL sliders
- **CUBE**: 3D LUT applied after parametric edits (stored on the preset as `edits.lut`)

## Shortcuts

Press `?` in the editor for the full list.

| Shortcut                    | Action                                    |
| --------------------------- | ----------------------------------------- |
| `Ctrl/Cmd+Z`                | Undo                                      |
| `Ctrl/Cmd+Shift+Z` / `Ctrl/Cmd+Y` | Redo                                |
| `Ctrl/Cmd+C`                | Copy edits                                |
| `Ctrl/Cmd+V`                | Paste edits to selection (choose settings) |
| `Ctrl/Cmd+A`                | Select all in filmstrip                   |
| `Ctrl/Cmd+E`                | Export dialog                             |
| `Shift+1`–`8`               | Switch panel                              |
| `W`                         | White balance picker                      |
| `R`                         | Crop                                      |
| `Q`                         | Retouch: spots and background             |
| `M` / `Shift+M`             | New linear / radial mask                  |
| `K` / `Shift+K`             | New brush / AI subject mask               |
| `\`                         | Before (whole image)                      |
| `Y`                         | Before / after split                      |
| `J`                         | Clipping overlay                          |
| `G`                         | Show / hide filmstrip                     |
| `1`–`5` / `0`               | Rate stars / clear rating                 |
| `P` / `X` / `U`             | Pick / reject / unflag                    |
| `[` `]` or `↑` `↓`          | Previous / next photo                     |

(Ignored when focus is in a text field.)

## Ad slots

The editor reserves two quiet regions outside the canvas. No ad network is wired: each slot shows an Amazon.es affiliate card when it has a pick in `SLOT_ADS` (`src/lib/affiliate.ts`), otherwise nothing.

| Slot      | `data-ad-slot` | Placement                   |
| --------- | -------------- | --------------------------- |
| Sidebar   | `sidebar`      | Below presets (~120px)      |
| Filmstrip | `filmstrip`    | Below the file list (~90px) |

Empty slots show a placeholder in dev, or in production with:

```bash
VITE_ADS_ENABLED=true npm run build
```

The same affiliate list (`GEAR`) feeds the editor's gear dialog and the `/gear` page.

## Stack

- Astro (static site, blog, i18n, sitemap, RSS)
- React + TypeScript editor island
- Canvas preview (CPU pixel pipeline with dual-resolution scrubbing, Web Worker pool)
- LibRaw (WASM) for RAW, ONNX Runtime Web for the AI models
- IndexedDB session restore, Workbox service worker
- MIT license

An optional **Tauri** desktop wrap is planned post-MVP; this repo ships as a web app first.

## License

MIT — see [LICENSE](./LICENSE).

Sample photos in `public/samples/` (and the preset renders made from them in `src/assets/looks/` and `public/site/looks/thumbs/`) are © the Lightframes author, all rights reserved. They are not covered by the MIT license and may not be reused outside this project. The AI models keep their own licenses (see `public/models/`).

---

[![Lightframes — the open-source photo editor that stays on your device](public/og-image.png)](https://www.lightframes.si)

<p align="center">
  Your photos, your presets, your device.<br>
  <strong><a href="https://www.lightframes.si">Open Lightframes →</a></strong> · if it saves you time, a ⭐ on the repo helps others find it.
</p>
