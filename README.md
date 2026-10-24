# Lightframes

**Use your Lightroom presets, without Lightroom.**

Free, open-source in-browser RAW photo editor that applies Lightroom XMP presets and `.cube` LUTs. No uploads, no account.

[![MIT license](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)
[![Live site](https://img.shields.io/badge/live-lightframes.si-2ea44f?style=flat-square)](https://www.lightframes.si)
[![Latest release](https://img.shields.io/github/v/release/joancomadran/lightframes?style=flat-square&label=release)](https://github.com/joancomadran/lightframes/releases/latest)
[![GitHub stars](https://img.shields.io/github/stars/joancomadran/lightframes?style=social)](https://github.com/joancomadran/lightframes/stargazers)

**[Try it](https://www.lightframes.si/editor)**

[![Adjust a photo, paste the edit across the shoot, export, then apply presets](docs/demo.gif)](https://www.lightframes.si/editor)

Fifteen seconds: sliders on an open photo, paste across the shoot, export, then presets (XMP and .cube LUTs). [MP4](docs/demo.mp4) if the GIF does not play.

If you find it useful, a star helps others find it ⭐

Lightroom and Camera Raw are trademarks of Adobe. Lightframes is an independent project and is not affiliated with or endorsed by Adobe.

![Lightframes editor with a RAW photo open and the presets panel](docs/screenshots/editor.jpg)

## Features

- **RAW, JPEG and PNG.** RAW formats: ARW, CR2, CR3, NEF, NRW, DNG, RAF, ORF, RW2, PEF, SRW. Decoded in the browser with LibRaw (WebAssembly). The preview is a half-size decode; export develops the file again at full resolution.
- **Non-destructive edits.** Light, white balance, texture, clarity, dehaze, HSL, effects, tone curves, crop, straighten and rotate. Undo / redo, histogram, clipping, before/after.
- **Presets and LUTs.** Save your own, set intensity from 0–100%, import and export JSON. Built-in looks ship with the app. `.cube` 3D LUTs apply after the parametric edits.
- **Lightroom XMP.** Develop presets map onto Lightframes sliders. See the limits below — profiles, lens corrections, masks, crop and calibration are not imported.
- **Batch.** Copy / paste edits onto a selection, or sync the active photo. Several photos export as one ZIP.
- **Retouch and on-device AI.** Heal and clone, object removal, subject and background masks, background replacement, optional 2× / 4× upscale on export.
- **Collage and carousel.** Up to 9 photos on a slide, or 2–10 carousel slides. Instagram shapes (4:5, 1:1 and 3:4) export at 1080 px wide.
- **Export.** JPEG, PNG or WebP, with quality, a long edge up to 8192 px, a filename pattern and an optional text watermark.
- **Installable PWA.** Sessions restore from IndexedDB. Editing works offline once the app has loaded.

## XMP import

`.xmp` develop presets, including Lightroom and Camera Raw, are mapped onto Lightframes sliders.

What is imported: basic tone (exposure, contrast, highlights, shadows, whites, blacks), white balance (a relative temperature, or an approximation of Kelvin), tint, HSL, the tone curve (master and per channel), vibrance and saturation, texture, clarity, dehaze, colour grading (or the older split toning), vignette amount and midpoint, grain, sharpening, and luminance and colour noise reduction.

What is **not** imported: camera profiles, lens corrections, local masks, crop and transform, calibration, and detail controls beyond those sliders. A preset that depends on the missing pieces will not match Lightroom.

## Privacy

Your photos are opened, edited and exported in the browser. Nothing is uploaded.

The first use of object removal downloads its AI model (MI-GAN) from Hugging Face, checks it against a SHA-256, and caches it. The photo is not uploaded with that download. Segmentation and upscale models are served from this site, not from a third party. Each model downloads once, is hash-checked, and then runs in the browser.

Page visits are counted with Vercel Web Analytics, which does not use cookies and does not receive your photos.

The editor and the [gear page](https://www.lightframes.si/gear) include links to Amazon.es. As an Amazon Associate, Lightframes earns from qualifying purchases. The cards are drawings in the page: they do not load images or scripts from Amazon. Amazon is contacted only when you click a link.

## Self-host

Node.js 20+. The production build is a static `dist/` folder. Any static host can serve it.

```bash
npm install
npm run build
```

`npm run preview` serves that build locally. `npm run dev` starts the dev server (usually `http://localhost:4321`). The landing page is `/`. The editor is `/editor`.

| Script            | What it does                                    |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Dev server with hot reload                      |
| `npm run build`   | Type-check (`astro check`) and build to `dist/` |
| `npm run preview` | Serve the production build locally              |
| `npm run check`   | Type-check `.astro`, `.ts` and `.tsx` only      |
| `npm run lint`    | Lint with oxlint                                |

A Chromium browser (Chrome, Edge, Brave) is the best bet for opening a folder and for canvas performance. Large RAW files and the AI tools are slower on phones.

## Tech stack

- Astro static site (English and Spanish), React + TypeScript editor
- LibRaw compiled to WebAssembly for RAW
- ONNX Runtime Web for the AI models (WASM; WebGPU for upscale when the browser has it)
- Installable PWA (Workbox service worker). Variable fonts are self-hosted, so page load does not request Google Fonts
- IndexedDB for the session and presets, with a `localStorage` backup of presets
- MIT license

## Offline use

1. Open the production build once while online. The service worker precaches the app, including the LibRaw WASM and the self-hosted font files.
2. After that, open, edit, presets and export work without a network. In Chromium you can install it from the address bar.
3. The AI models and the ONNX runtime are not precached. Segmentation and upscale come from this site the first time you use them. Object removal downloads MI-GAN from Hugging Face the first time you use it. Each is cached after that.
4. The installed app starts at `/editor`.

## Project structure

```
astro.config.mjs        site URL, integrations (React, sitemap, PWA)
integrations/pwa.mjs    writes dist/sw.js with workbox-build after the build
vercel.json             clean URLs, no trailing slash
src/
  App.tsx, components/, hooks/, lib/, types/   the editor (React)
  EditorRoot.tsx        editor entry, mounted by src/pages/editor.astro
  pages/                routes: landing, editor, tools, blog, FAQ, legal, robots.txt, llms.txt…
  site/                 layouts, i18n, JSON-LD, landing copy
  content/              tools, blog, pages, FAQ (Markdown / JSON, EN + ES)
public/                 icons, manifest, samples, AI models, site images
promo/                  promo video (Remotion), separate package
```

Tool pages, guides, the FAQ and the legal pages are Markdown or JSON in `src/content/`. See [docs/SEO.md](docs/SEO.md) for the URL map and how to add a post.

## Shortcuts

Press `?` in the editor for the full list. Shortcuts are ignored while a text field is focused.

| Shortcut                          | Action                                     |
| --------------------------------- | ------------------------------------------ |
| `Ctrl/Cmd+Z`                      | Undo                                       |
| `Ctrl/Cmd+Shift+Z` / `Ctrl/Cmd+Y` | Redo                                       |
| `Ctrl/Cmd+C`                      | Copy edits                                 |
| `Ctrl/Cmd+V`                      | Paste edits to the selection               |
| `Ctrl/Cmd+A`                      | Select all in the filmstrip                |
| `Ctrl/Cmd+E`                      | Export dialog                              |
| `Shift+1`–`8`                     | Switch panel                               |
| `W`                               | White balance picker                       |
| `R`                               | Crop                                       |
| `Q`                               | Retouch: spots and background              |
| `M` / `Shift+M`                   | New linear / radial mask                   |
| `K` / `Shift+K`                   | New brush / AI subject mask                |
| `\`                               | Before (whole image)                       |
| `Y`                               | Before / after split                       |
| `J`                               | Clipping overlay                           |
| `G`                               | Show / hide filmstrip                      |
| `1`–`5` / `0`                     | Rate stars / clear rating                  |
| `P` / `X` / `U`                   | Pick / reject / unflag                     |
| `[` `]` or `↑` `↓`                | Previous / next photo                      |

## Contributing

Issues and pull requests are welcome. For anything larger than a small fix, open an issue first so the approach is agreed.

```bash
npm install
npm run lint
npm run build
```

Bug reports are most useful with the browser, the device, and, for RAW, the camera model. Please don't add a third-party script, font host, ad network or tracker: a page load stays on this origin, apart from the cases named in the privacy policy.

## License

MIT. See [LICENSE](./LICENSE).

Sample photos in `public/samples/` (and the preset renders made from them) are © the Lightframes author, all rights reserved. They are not covered by the MIT license. The AI models keep their own licenses (see `public/models/NOTICE.md`).

---

[![Lightframes — the open-source photo editor that stays on your device](public/og-image.png)](https://www.lightframes.si)

<p align="center">
  Your photos, your presets, your device.<br>
  <strong><a href="https://www.lightframes.si/editor">Try the editor →</a></strong>
</p>
