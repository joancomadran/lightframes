# Lightframes

Free, open-source, **local** photo editor focused on custom presets and copy/paste edits — a Lightroom-like workflow without the cloud.

Runs entirely in the browser. Edits stay non-destructive until you export.

## Features (MVP)

- Open JPEG / PNG images (folder picker when the File System Access API is available)
- Non-destructive tonal + color sliders with live canvas preview
- Save / apply custom presets; import and export as JSON
- Copy and paste edits between photos (`Ctrl/Cmd+C` / `Ctrl/Cmd+V`)
- Export edited JPEG
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

1. Build or run the app once while online (fonts load from Google Fonts on first visit).
2. After that, image open / edit / preset / export work without a network connection.
3. For a fully air-gapped install, self-host the font files and remove the Google Fonts `<link>` tags in `index.html`.

## Presets

Presets are named `EditParams` stacks stored in `localStorage` and exportable as JSON:

```json
{
  "id": "…",
  "name": "Golden hour soft",
  "edits": {
    "exposure": 0.2,
    "contrast": 10,
    "highlights": -20,
    "shadows": 15,
    "whites": 0,
    "blacks": -5,
    "temperature": 25,
    "tint": 5,
    "vibrance": 15,
    "saturation": 5
  },
  "createdAt": "2026-10-16T00:00:00.000Z"
}
```

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

## Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd+C` | Copy edits from the active photo |
| `Ctrl/Cmd+V` | Paste edits onto the active photo |

(Ignored when focus is in a text field.)

## Stack

- Vite + React + TypeScript
- Canvas preview (CPU pixel pipeline for MVP)
- MIT license

Optional **Tauri** desktop wrap is planned post-MVP; this repo ships as a local web app first.

## License

MIT — see [LICENSE](./LICENSE).
