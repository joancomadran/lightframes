import { useMemo } from 'react'
import {
  COLLAGE_EXPORT_PRESETS,
  presetLongEdge,
  saveCollageExportSettings,
  type CollageExportPreset,
  type CollageExportSettings,
} from '../lib/collageExport'
import type { CollageDoc } from '../lib/collage'
import { aspectById } from '../lib/collage'
import type { CollageExportStrings } from '../hooks/useEditorLang'
import { Slider } from './Slider'

type CollageExportControlsProps = {
  doc: CollageDoc
  settings: CollageExportSettings
  onChange: (next: CollageExportSettings) => void
  strings: CollageExportStrings
  /** Preview output size for the current preset at 1× slide (fixed presets only). */
  previewSize?: { width: number; height: number }
  disabled?: boolean
}

type CollageExportTextKey = Exclude<
  {
    [K in keyof CollageExportStrings]: CollageExportStrings[K] extends string ? K : never
  }[keyof CollageExportStrings],
  never
>

const PRESET_META: Record<CollageExportPreset, { label: CollageExportTextKey; detail: CollageExportTextKey }> = {
  '1x': { label: 'preset1x', detail: 'preset1xDetail' },
  '2x': { label: 'preset2x', detail: 'preset2xDetail' },
  '3x': { label: 'preset3x', detail: 'preset3xDetail' },
  original: { label: 'presetOriginal', detail: 'presetOriginalDetail' },
}

export function CollageExportControls({
  doc,
  settings,
  onChange,
  strings,
  previewSize,
  disabled,
}: CollageExportControlsProps) {
  const base = aspectById(doc.aspect)
  const hintSize = useMemo(() => {
    if (previewSize) return previewSize
    const long = presetLongEdge(doc, settings.preset)
    if (long === null) return { width: base.width, height: base.height }
    const scale = long / Math.max(base.width, base.height)
    return {
      width: Math.round(base.width * scale),
      height: Math.round(base.height * scale),
    }
  }, [base.height, base.width, doc, previewSize, settings.preset])

  const patch = (next: Partial<CollageExportSettings>) => {
    const merged = { ...settings, ...next }
    onChange(merged)
    saveCollageExportSettings(merged)
  }

  return (
    <>
      <div className="export-section">
        <h3 className="adjust-group__title">{strings.exportSize}</h3>
        <div className="export-presets" role="group" aria-label={strings.exportSize}>
          {COLLAGE_EXPORT_PRESETS.map((id) => {
            const meta = PRESET_META[id]
            return (
              <button
                key={id}
                type="button"
                disabled={disabled}
                className={settings.preset === id ? 'export-preset export-preset--active' : 'export-preset'}
                aria-pressed={settings.preset === id}
                onClick={() => patch({ preset: id })}
              >
                <span className="export-preset__label">{strings[meta.label]}</span>
                <span className="export-preset__detail">{strings[meta.detail]}</span>
              </button>
            )
          })}
        </div>
        <Slider
          label={strings.quality}
          value={Math.round(settings.quality * 100)}
          min={50}
          max={100}
          step={1}
          disabled={disabled}
          onChange={(q) => patch({ quality: q / 100 })}
        />
        <p className="field-hint">{strings.sizePerSlide(hintSize.width, hintSize.height)}</p>
      </div>
    </>
  )
}
