import { useState } from 'react'
import { useEditorLang } from '../hooks/useEditorLang'
import { preloadModel } from '../lib/ai'
import {
  DEFAULT_EXPORT_OPTIONS,
  type ExportFormat,
  type ExportFrame,
  type ExportOptions,
  type WatermarkPosition,
} from '../types/edits'
import { Slider } from './Slider'

type ExportDialogProps = {
  open: boolean
  initial: ExportOptions
  selectionCount: number
  onClose: () => void
  onExport: (options: ExportOptions) => void
}

type SizePreset = {
  id: string
  label: string
  detail: string
  maxEdge: number
  frame: Omit<ExportFrame, 'background'> | null
}

const SIZE_PRESETS: Omit<SizePreset, 'label' | 'detail'>[] = [
  { id: 'original', maxEdge: 8192, frame: null },
  { id: 'web', maxEdge: 2048, frame: null },
  { id: 'ig-portrait', maxEdge: 1350, frame: { width: 1080, height: 1350 } },
  { id: 'ig-square', maxEdge: 1080, frame: { width: 1080, height: 1080 } },
  { id: 'ig-story', maxEdge: 1920, frame: { width: 1080, height: 1920 } },
]

const POSITIONS: { id: WatermarkPosition; label: string }[] = [
  { id: 'top-left', label: '↖' },
  { id: 'top-right', label: '↗' },
  { id: 'center', label: '•' },
  { id: 'bottom-left', label: '↙' },
  { id: 'bottom-right', label: '↘' },
]

function presetFor(options: ExportOptions, presets: SizePreset[]): string {
  const match = presets.find((p) =>
    p.frame
      ? options.frame?.width === p.frame.width && options.frame?.height === p.frame.height
      : !options.frame && options.maxEdge === p.maxEdge,
  )
  return match?.id ?? 'custom'
}

export function ExportDialog({ open, initial, selectionCount, onClose, onExport }: ExportDialogProps) {
  const { copy } = useEditorLang()
  const ex = copy.export
  const sizePresets: SizePreset[] = [
    { ...SIZE_PRESETS[0]!, label: ex.original, detail: ex.originalDetail },
    { ...SIZE_PRESETS[1]!, label: ex.web, detail: ex.webDetail },
    { ...SIZE_PRESETS[2]!, label: ex.igPortrait, detail: ex.igPortraitDetail },
    { ...SIZE_PRESETS[3]!, label: ex.igSquare, detail: ex.igSquareDetail },
    { ...SIZE_PRESETS[4]!, label: ex.story, detail: ex.storyDetail },
  ]
  const [options, setOptions] = useState<ExportOptions>(initial)
  const patch = (next: Partial<ExportOptions>) => setOptions((prev) => ({ ...prev, ...next }))
  const mark = options.watermark
  const patchMark = (next: Partial<ExportOptions['watermark']>) =>
    setOptions((prev) => ({ ...prev, watermark: { ...prev.watermark, ...next } }))

  if (!open) return null
  const preset = presetFor(options, sizePresets)

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={ex.dialog}>
      <button type="button" className="modal__backdrop" aria-label={ex.close} onClick={onClose} />
      <div className="modal__card modal__card--wide">
        <div className="panel__header">
          <h2 className="panel__title">{selectionCount > 1 ? ex.titleMany(selectionCount) : ex.title}</h2>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            {ex.close}
          </button>
        </div>

        <div className="export-section">
          <h3 className="adjust-group__title">{ex.size}</h3>
          <div className="export-presets" role="group" aria-label={ex.sizePreset}>
            {sizePresets.map((item) => (
              <button
                key={item.id}
                type="button"
                className={preset === item.id ? 'export-preset export-preset--active' : 'export-preset'}
                aria-pressed={preset === item.id}
                onClick={() =>
                  patch({
                    maxEdge: item.maxEdge,
                    frame: item.frame ? { ...item.frame, background: options.frame?.background ?? '#ffffff' } : null,
                    ...(item.frame ? { format: 'jpeg' as const } : {}),
                  })
                }
              >
                <span className="export-preset__label">{item.label}</span>
                <span className="export-preset__detail">{item.detail}</span>
              </button>
            ))}
          </div>
          {options.frame ? (
            <div className="field-row">
              <span>{ex.border}</span>
              <span className="btn-group">
                {['#ffffff', '#000000', '#f1ece4'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={
                      options.frame?.background === color ? 'swatch-btn swatch-btn--active' : 'swatch-btn'
                    }
                    style={{ background: color }}
                    aria-label={ex.borderColor(color)}
                    onClick={() => patch({ frame: options.frame ? { ...options.frame, background: color } : null })}
                  />
                ))}
              </span>
            </div>
          ) : (
            <Slider
              label={ex.longEdge}
              value={options.maxEdge}
              min={800}
              max={8192}
              step={16}
              format={(v) => (v >= 8192 ? ex.full : `${v}px`)}
              onChange={(maxEdge) => patch({ maxEdge })}
            />
          )}
        </div>

        <div className="export-section">
          <div className="field-row">
            <span>{ex.upscale}</span>
            <span className="segmented segmented--compact" role="group" aria-label={ex.upscale}>
              {([1, 2, 4] as const).map((factor) => (
                <button
                  key={factor}
                  type="button"
                  className={options.upscale === factor ? 'segmented__btn segmented__btn--active' : 'segmented__btn'}
                  aria-pressed={options.upscale === factor}
                  onClick={() => {
                    if (factor > 1) preloadModel('upscale')
                    patch({ upscale: factor })
                  }}
                >
                  {factor === 1 ? ex.off : `${factor}×`}
                </button>
              ))}
            </span>
          </div>
          {options.upscale > 1 && (
            <p className="field-hint">
              {ex.upscaleHint}
            </p>
          )}
        </div>

        <div className="export-section">
          <h3 className="adjust-group__title">{ex.file}</h3>
          <div className="field-row">
            <span>{ex.format}</span>
            <select
              className="field field--sm"
              value={options.format}
              onChange={(e) => patch({ format: e.target.value as ExportFormat })}
            >
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
          </div>
          {options.format !== 'png' && (
            <Slider
              label={ex.quality}
              value={Math.round(options.quality * 100)}
              min={50}
              max={100}
              step={1}
              onChange={(q) => patch({ quality: q / 100 })}
            />
          )}
          <label className="field-row">
            <span>{ex.filename}</span>
            <input
              className="field field--sm"
              value={options.filenamePattern}
              onChange={(e) => patch({ filenamePattern: e.target.value })}
              placeholder="{name}-edited"
              title={ex.filenameTitle}
            />
          </label>
        </div>

        <div className="export-section">
          <div className="adjust-group__header">
            <h3 className="adjust-group__title">{ex.watermark}</h3>
            <label className="check">
              <input
                type="checkbox"
                checked={mark.enabled}
                onChange={(e) => patchMark({ enabled: e.target.checked })}
              />
              <span>{ex.add}</span>
            </label>
          </div>
          {mark.enabled && (
            <>
              <input
                className="field"
                value={mark.text}
                onChange={(e) => patchMark({ text: e.target.value })}
                placeholder="© Your name"
                aria-label={ex.watermarkText}
              />
              <div className="field-row">
                <span>{ex.position}</span>
                <span className="segmented segmented--compact" role="group" aria-label={ex.position}>
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      className={mark.position === pos.id ? 'segmented__btn segmented__btn--active' : 'segmented__btn'}
                      aria-pressed={mark.position === pos.id}
                      aria-label={pos.id}
                      onClick={() => patchMark({ position: pos.id })}
                    >
                      {pos.label}
                    </button>
                  ))}
                </span>
              </div>
              <Slider
                label={ex.markSize}
                value={Math.round(mark.size * 1000) / 10}
                min={1}
                max={10}
                step={0.1}
                format={(v) => `${v.toFixed(1)}%`}
                onChange={(v) => patchMark({ size: v / 100 })}
              />
              <Slider
                label={ex.opacity}
                value={Math.round(mark.opacity * 100)}
                min={10}
                max={100}
                step={1}
                format={(v) => `${v}%`}
                onChange={(v) => patchMark({ opacity: v / 100 })}
              />
            </>
          )}
        </div>

        <div className="modal__actions">
          <button type="button" className="btn" onClick={() => setOptions(DEFAULT_EXPORT_OPTIONS)}>
            {ex.reset}
          </button>
          <button type="button" className="btn btn--accent" onClick={() => onExport(options)}>
            {selectionCount > 1 ? ex.exportFiles(selectionCount) : ex.title}
          </button>
        </div>
      </div>
    </div>
  )
}
