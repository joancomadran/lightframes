# Lightframes promo

51 s, 1920×1080 at 60 fps, built with [Remotion](https://remotion.dev). The editor UI is rebuilt in React from the app's real layout and tokens; every photo look on screen is a real export from the app.

```bash
npm install
npm run studio        # live preview / scrub
npm run render        # → out/lightframes-promo.mp4
```

## Layout

- `src/cues.ts`: the timeline in frames (120 BPM: 30 frames a beat). The video and the music both read it, so any retime stays in sync.
- `src/scenes/`: `Intro` (phrases + logo), `EditorShow` (one continuous camera through Adjust → Before/After → Batch → Presets → AI → Collage), `RapidFire`, `Outro`.
- `src/ui/`: the editor, collage studio, cursor and icons, rebuilt from `src/index.css` / components.
- `scripts/music.ts`: procedural score and foley → `public/music.wav` (`node scripts/music.ts`). To use a licensed track, replace `public/music.wav`. The drop sits at 5 s (frame 300), the outro hit at 45 s (frame 2700).
- `scripts/capture-*.mjs`: regenerate `public/renders/` from the running app (`npm run dev -- --port 5199` in the repo root), via Playwright.
- `scripts/stills.mjs 120 900 …`: render single frames to `shots/` for review.
