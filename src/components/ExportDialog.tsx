import { useState } from 'react'
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

const SIZE_PRESETS: SizePreset[] = [
  { id: 'original', label: 'Original', detail: 'Full resolution', maxEdge: 8192, frame: null },
  { id: 'web', label: 'Web', detail: '2048 px long edge', maxEdge: 2048, frame: null },
  { id: 'ig-portrait', label: 'IG 4:5', detail: '1080 × 1350', maxEdge: 1350, frame: { width: 1080, height: 1350 } },
  { id: 'ig-square', label: 'IG 1:1', detail: '1080 × 1080', maxEdge: 1080, frame: { width: 1080, height: 1080 } },
  { id: 'ig-story', label: 'Story', detail: '1080 × 1920', maxEdge: 1920, frame: { width: 1080, height: 1920 } },
]

const POSITIONS: { id: WatermarkPosition; label: string }[] = [
  { id: 'top-left', label: '↖' },
  { id: 'top-right', label: '↗' },
  { id: 'center', label: '•' },
  { id: 'bottom-left', label: '↙' },
  { id: 'bottom-right', label: '↘' },
]

function presetFor(options: ExportOptions): string {
  const match = SIZE_PRESETS.find((p) =>
    p.frame
      ? options.frame?.width === p.frame.width && options.frame?.height === p.frame.height
      : !options.frame && options.maxEdge === p.maxEdge,
  )
  return match?.id ?? 'custom'
}

export function ExportDialog({ open, initial, selectionCount, onClose, onExport }: ExportDialogProps) {
  const [options, setOptions] = useState<ExportOptions>(initial)
  const patch = (next: Partial<ExportOptions>) => setOptions((prev) => ({ ...prev, ...next }))
  const mark = options.watermark
  const patchMark = (next: Partial<ExportOptions['watermark']>) =>
    setOptions((prev) => ({ ...prev, watermark: { ...prev.watermark, ...next } }))

  if (!open) return null
  const preset = presetFor(options)

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Export options">
      <button type="button" className="modal__backdrop" aria-label="Close" onClick={onClose} />
      <div className="modal__card modal__card--wide">
        <div className="panel__header">
          <h2 className="panel__title">Export {selectionCount > 1 ? `${selectionCount} photos` : ''}</h2>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="export-section">
          <h3 className="adjust-group__title">Size</h3>
          <div className="export-presets" role="group" aria-label="Size preset">
            {SIZE_PRESETS.map((item) => (
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
              <span>Border colour (photo is fitted, not cropped)</span>
              <span className="btn-group">
                {['#ffffff', '#000000', '#f1ece4'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={
                      options.frame?.background === color ? 'swatch-btn swatch-btn--active' : 'swatch-btn'
                    }
                    style={{ background: color }}
                    aria-label={`Border ${color}`}
                    onClick={() => patch({ frame: options.frame ? { ...options.frame, background: color } : null })}
                  />
                ))}
              </span>
            </div>
          ) : (
            <Slider
              label="Long edge"
              value={options.maxEdge}
              min={800}
              max={8192}
              step={16}
              format={(v) => (v >= 8192 ? 'Full' : `${v}px`)}
              onChange={(maxEdge) => patch({ maxEdge })}
            />
          )}
        </div>

        <div className="export-section">
          <div className="field-row">
            <span>AI upscale</span>
            <span className="segmented segmented--compact" role="group" aria-label="AI upscale">
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
                  {factor === 1 ? 'Off' : `${factor}×`}
                </button>
              ))}
            </span>
          </div>
          {options.upscale > 1 && (
            <p className="field-hint">
              Sharp enlargement, up to the size above (8192 px max). Best on small or cropped photos; big ones can
              take a while. Downloads a 5 MB model once and runs on your device, on the GPU when it can.
            </p>
          )}
        </div>

        <div className="export-section">
          <h3 className="adjust-group__title">File</h3>
          <div className="field-row">
            <span>Format</span>
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
              label="Quality"
              value={Math.round(options.quality * 100)}
              min={50}
              max={100}
              step={1}
              onChange={(q) => patch({ quality: q / 100 })}
            />
          )}
          <label className="field-row">
            <span>Filename</span>
            <input
              className="field field--sm"
              value={options.filenamePattern}
              onChange={(e) => patch({ filenamePattern: e.target.value })}
              placeholder="{name}-edited"
              title="{name} is replaced with the original file name"
            />
          </label>
        </div>

        <div className="export-section">
          <div className="adjust-group__header">
            <h3 className="adjust-group__title">Watermark</h3>
            <label className="check">
              <input
                type="checkbox"
                checked={mark.enabled}
                onChange={(e) => patchMark({ enabled: e.target.checked })}
              />
              <span>Add</span>
            </label>
          </div>
          {mark.enabled && (
            <>
              <input
                className="field"
                value={mark.text}
                onChange={(e) => patchMark({ text: e.target.value })}
                placeholder="© Your name"
                aria-label="Watermark text"
              />
              <div className="field-row">
                <span>Position</span>
                <span className="segmented segmented--compact" role="group" aria-label="Watermark position">
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
                label="Size"
                value={Math.round(mark.size * 1000) / 10}
                min={1}
                max={10}
                step={0.1}
                format={(v) => `${v.toFixed(1)}%`}
                onChange={(v) => patchMark({ size: v / 100 })}
              />
              <Slider
                label="Opacity"
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
            Reset defaults
          </button>
          <button type="button" className="btn btn--accent" onClick={() => onExport(options)}>
            Export {selectionCount > 1 ? `${selectionCount} files` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
