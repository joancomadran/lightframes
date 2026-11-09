import { useMemo, type ReactNode } from 'react'
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
  actions: ReactNode
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

export function StudioExportBar({ label, children }: { label: string; children: ReactNode }) {
  return (
    <footer className="studio-export" aria-label={label}>
      {children}
    </footer>
  )
}

export function CollageExportControls({
  doc,
  settings,
  onChange,
  strings,
  previewSize,
  disabled,
  actions,
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

  const selected = PRESET_META[settings.preset]

  return (
    <StudioExportBar label={strings.exportBar}>
      <div className="studio-export__options">
        <h3 className="studio-export__title">{strings.sizeAndQuality}</h3>
        <div className="studio-export__presets" role="group" aria-label={strings.exportSize}>
          {COLLAGE_EXPORT_PRESETS.map((id) => {
            const meta = PRESET_META[id]
            const label = strings[meta.label]
            const detail = strings[meta.detail]
            return (
              <button
                key={id}
                type="button"
                disabled={disabled}
                className={settings.preset === id ? 'studio-export__preset studio-export__preset--active' : 'studio-export__preset'}
                aria-pressed={settings.preset === id}
                aria-label={`${label}: ${detail}`}
                title={detail}
                onClick={() => patch({ preset: id })}
              >
                {label}
              </button>
            )
          })}
        </div>
        <p className="studio-export__hint">{strings[selected.detail]}</p>
        <Slider
          label={strings.quality}
          value={Math.round(settings.quality * 100)}
          min={50}
          max={100}
          step={1}
          disabled={disabled}
          onChange={(q) => patch({ quality: q / 100 })}
        />
        <p className="studio-export__hint">{strings.sizePerSlide(hintSize.width, hintSize.height)}</p>
      </div>
      <div className="studio-export__actions">{actions}</div>
    </StudioExportBar>
  )
}
