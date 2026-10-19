import { useEffect, useRef, useState } from 'react'
import { DEFAULT_EDITS, blendEdits, type CropRect, type Preset, type RotateDegrees } from '../types/edits'
import { prepareBase, processImageSync } from '../lib/imageProcessing'

/** Long edge of the shared base the previews are rendered from. */
const THUMB_EDGE = 240

/** The photo's framing, so previews show the same crop the editor does. */
export type ThumbGeometry = { rotate: RotateDegrees; crop: CropRect }

function loadImage(url: string): Promise<HTMLImageElement> {
  const img = new Image()
  img.src = url
  return img.decode().then(() => img)
}

function nextIdle(): Promise<void> {
  return new Promise((resolve) => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(() => resolve(), { timeout: 200 })
    else setTimeout(resolve, 0)
  })
}

/**
 * Data URLs of `src` rendered with each preset at full strength, keyed by
 * preset id. Previews fill in one at a time on idle so the editor stays responsive.
 */
export function usePresetThumbnails(
  presets: Preset[],
  src: string | null,
  geometry: ThumbGeometry | null,
): Record<string, string> {
  // Previews only change when a preset's look does, not when it is renamed.
  const key = [
    src,
    geometry ? JSON.stringify(geometry) : '',
    ...presets.map((p) => `${p.id}:${JSON.stringify(p.edits).length}`),
  ].join('|')
  const [rendered, setRendered] = useState<{ key: string; thumbs: Record<string, string> }>({
    key: '',
    thumbs: {},
  })
  const inputRef = useRef({ presets, geometry })
  // Runs before the render effect below, so it always sees the latest inputs.
  useEffect(() => {
    inputRef.current = { presets, geometry }
  })

  useEffect(() => {
    const { presets, geometry } = inputRef.current
    if (!src) return
    let cancelled = false
    void (async () => {
      let img: HTMLImageElement
      try {
        img = await loadImage(src)
      } catch {
        return
      }
      const framing = geometry ?? { rotate: 0, crop: DEFAULT_EDITS.crop }
      const base = prepareBase(img, { ...DEFAULT_EDITS, ...framing }, THUMB_EDGE)
      if (!base || cancelled) return
      const canvas = document.createElement('canvas')
      canvas.width = base.width
      canvas.height = base.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      for (const preset of presets) {
        await nextIdle()
        if (cancelled) return
        // The base is already framed, so the look is applied without geometry.
        const edits = blendEdits(DEFAULT_EDITS, preset.edits, 1)
        edits.rotate = 0
        edits.crop = { ...DEFAULT_EDITS.crop }
        const imageData = new ImageData(base.data.slice(), base.width, base.height)
        processImageSync(imageData, edits)
        ctx.putImageData(imageData, 0, 0)
        const url = canvas.toDataURL('image/jpeg', 0.82)
        setRendered((prev) => ({
          key,
          thumbs: { ...(prev.key === key ? prev.thumbs : {}), [preset.id]: url },
        }))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [src, key])

  return rendered.key === key ? rendered.thumbs : {}
}
