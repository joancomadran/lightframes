import { useState } from 'react'
import {
  DEFAULT_EXPORT_OPTIONS,
  type ExportFormat,
  type ExportOptions,
} from '../types/edits'

type ExportDialogProps = {
  open: boolean
  initial: ExportOptions
  selectionCount: number
  onClose: () => void
  onExport: (options: ExportOptions) => void
}

export function ExportDialog({
  open,
  initial,
  selectionCount,
  onClose,
  onExport,
}: ExportDialogProps) {
  const [options, setOptions] = useState<ExportOptions>(initial)

  if (!open) return null

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Export options">
      <button type="button" className="modal__backdrop" aria-label="Close" onClick={onClose} />
      <div className="modal__card">
        <div className="panel__header">
          <h2 className="panel__title">Export</h2>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Close
          </button>
        </div>

        <label className="slider">
          <span className="slider__meta">
            <span>Format</span>
          </span>
          <select
            className="field"
            value={options.format}
            onChange={(e) =>
              setOptions((prev) => ({
                ...prev,
                format: e.target.value as ExportFormat,
              }))
            }
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
        </label>

        {options.format !== 'png' && (
          <label className="slider">
            <span className="slider__meta">
              <span>Quality</span>
              <span className="slider__value">{Math.round(options.quality * 100)}</span>
            </span>
            <input
              type="range"
              min={0.5}
              max={1}
              step={0.01}
              value={options.quality}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, quality: Number(e.target.value) }))
              }
            />
          </label>
        )}

        <label className="slider">
          <span className="slider__meta">
            <span>Max edge (px)</span>
            <span className="slider__value">{options.maxEdge}</span>
          </span>
          <input
            type="range"
            min={800}
            max={8192}
            step={16}
            value={options.maxEdge}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, maxEdge: Number(e.target.value) }))
            }
          />
        </label>

        <label className="slider">
          <span className="slider__meta">
            <span>Filename pattern</span>
          </span>
          <input
            className="field"
            value={options.filenamePattern}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, filenamePattern: e.target.value }))
            }
            placeholder="{name}-edited"
          />
          <span className="field-hint">Use {'{name}'} for the source basename.</span>
        </label>

        <div className="modal__actions">
          <button
            type="button"
            className="btn"
            onClick={() => setOptions(DEFAULT_EXPORT_OPTIONS)}
          >
            Reset defaults
          </button>
          <button
            type="button"
            className="btn btn--accent"
            onClick={() => onExport(options)}
          >
            Export {selectionCount > 1 ? `${selectionCount} files` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
