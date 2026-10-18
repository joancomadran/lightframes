# Lightframes

**[Try it now → lightframes.vercel.app](https://lightframes.vercel.app)**

Free, open-source, **local** photo editor focused on custom presets and copy/paste edits — a Lightroom-like workflow without the cloud. Your photos never leave your device: no uploads, no account.

![Lightframes](public/og-image.png)

Runs entirely in the browser. Edits stay non-destructive until you export. Sessions restore from IndexedDB after a refresh. Installable as an app (PWA) and works offline once loaded.

## Features

- Open JPEG / PNG / camera RAW (ARW, CR2/CR3, NEF, DNG, RAF, ORF, RW2, …). Toolbar Open uses the file picker; Filmstrip **Folder** opens a directory (Option/Alt switches). Additional opens append to the filmstrip. RAW uses embedded JPEG when present, otherwise LibRaw WASM
- Non-destructive tonal + color sliders with live canvas preview (fast preview while scrubbing)
- HSL editor, master tone curve, crop / straighten / rotate, and radial local adjustments
- Histogram with shadow/highlight clipping overlay
- Undo / redo and before/after compare
- Multi-select filmstrip, sync edits, copy/paste across selection
- Save / update custom presets; dial intensity 0–100%; import JSON, Lightroom XMP, or `.cube` LUTs; export as JSON
- Export JPEG / PNG / WebP with quality, max edge, and filename pattern
- Works fully offline after the app is loaded

## Requirements

- Node.js 20+ (for development)
- A modern Chromium-based browser recommended (Chrome, Edge, Brave) for folder open + best canvas performance

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Production build

```bash
npm install
npm run build
npm run preview
```

`npm run build` outputs static files in `dist/`. Serve that folder from any static host, or open it via a local static server. Once loaded, the editor itself needs no network.

### Offline use

1. Open the production build once while online. A service worker precaches the app, including the LibRaw WASM, and caches Google Fonts on first visit.
2. After that, the app loads and image open / edit / preset / export work without a network connection. In Chromium you can also install it from the address bar.
3. For a fully air-gapped install, self-host the font files and remove the Google Fonts `<link>` tags in `index.html`.

## Presets

Presets are named `EditParams` stacks stored in `localStorage` and exportable as JSON. Import also accepts:

- **XMP** — Lightroom / Camera Raw develop settings mapped onto the basic + HSL sliders
- **CUBE** — 3D LUT applied after parametric edits (stored on the preset as `edits.lut`)

## Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd+Z` | Undo |
| `Ctrl/Cmd+Shift+Z` / `Ctrl/Cmd+Y` | Redo |
| `Ctrl/Cmd+C` / `V` | Copy / paste edits |
| `Ctrl/Cmd+A` | Select all in filmstrip |
| `Ctrl/Cmd+S` | Sync active edits to selection |
| `Ctrl/Cmd+E` | Export dialog |
| `\` | Before / after compare |
| `R` | Crop panel |
| `G` | Toggle filmstrip |
| `J` | Clipping overlay |
| `1`–`5` | Adjust / Curve / Crop / Local / Presets |
| `[` / `]` | Previous / next photo |

(Ignored when focus is in a text field.)

## Ad slots

Layout reserves quiet regions for future monetization (no ad network wired):

| Slot | `data-ad-slot` | Placement |
| --- | --- | --- |
| Sidebar | `sidebar` | Below presets (~120px) |
| Filmstrip | `filmstrip` | Below the file list (~90px) |

Hidden by default. Enable reserved placeholders with:

```bash
VITE_ADS_ENABLED=true npm run dev
```

## Stack

- Vite + React + TypeScript
- Canvas preview (CPU pixel pipeline with dual-resolution scrubbing)
- IndexedDB session restore
- MIT license

Optional **Tauri** desktop wrap is planned post-MVP; this repo ships as a local web app first.

## License

MIT — see [LICENSE](./LICENSE).
