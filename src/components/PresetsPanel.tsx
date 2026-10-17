import { useRef, useState } from 'react'
import type { Preset } from '../types/edits'
import { Slider } from './Slider'

type PresetsPanelProps = {
  presets: Preset[]
  selectedPresetId: string | null
  intensity: number
  disabled?: boolean
  onSave: (name: string) => void
  onUpdateSelected: () => void
  onApply: (preset: Preset) => void
  onIntensityChange: (intensity: number) => void
  onDelete: (id: string) => void
  onExport: (preset: Preset) => void
  onExportAll: () => void
  onImport: (file: File) => void
}

export function PresetsPanel({
  presets,
  selectedPresetId,
  intensity,
  disabled,
  onSave,
  onUpdateSelected,
  onApply,
  onIntensityChange,
  onDelete,
  onExport,
  onExportAll,
  onImport,
}: PresetsPanelProps) {
  const [name, setName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const selected = presets.find((p) => p.id === selectedPresetId) ?? null
  const canSave = Boolean(!disabled && name.trim())
  const canUpdate = Boolean(!disabled && selected)

  return (
    <section className="panel panel--presets" aria-label="Presets">
      <div className="adjust-group__header">
        <h3 className="adjust-group__title">Presets</h3>
        <div className="btn-group">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => fileRef.current?.click()}
            title="Import a JSON, Lightroom XMP or CUBE LUT preset"
          >
            Import
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            disabled={presets.length === 0}
            onClick={onExportAll}
            title="Download all presets as one JSON backup"
          >
            Backup
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".json,.xmp,.cube,application/json,application/octet-stream,text/plain"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onImport(file)
            e.target.value = ''
          }}
        />
      </div>

      {selected && (
        <div className="preset-applied">
          <div className="preset-applied__head">
            <span className="preset-applied__label">Applied</span>
            <span className="preset-applied__name">{selected.name}</span>
          </div>
          <Slider
            label="Intensity"
            value={intensity}
            min={0}
            max={100}
            step={1}
            defaultValue={100}
            disabled={disabled}
            format={(v) => `${v}%`}
            onChange={(value) => onIntensityChange(value)}
          />
          <button
            type="button"
            className="link-btn preset-applied__update"
            disabled={!canUpdate}
            title={`Overwrite “${selected.name}” with current adjustments`}
            onClick={onUpdateSelected}
          >
            Update preset with current edits
          </button>
        </div>
      )}

      <form
        className="preset-save"
        onSubmit={(e) => {
          e.preventDefault()
          if (!canSave) return
          onSave(name)
          setName('')
        }}
      >
        <input
          className="preset-save__input"
          type="text"
          placeholder="Save current edits as…"
          aria-label="New preset name"
          value={name}
          disabled={disabled}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn btn--accent btn--sm" disabled={!canSave}>
          Save
        </button>
      </form>

      {presets.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__text">
            No presets yet. Save your current look above, or import a JSON, Lightroom XMP or CUBE
            file.
          </p>
        </div>
      ) : (
        <>
          <div className="field-row">
            <span>My presets</span>
            <span className="field-row__count">{presets.length}</span>
          </div>
          <ul className="preset-list">
            {presets.map((preset) => {
              const isSelected = preset.id === selectedPresetId
              return (
                <li
                  key={preset.id}
                  className={
                    isSelected ? 'preset-list__item preset-list__item--active' : 'preset-list__item'
                  }
                >
                  <button
                    type="button"
                    className="preset-list__apply"
                    disabled={disabled}
                    aria-pressed={isSelected}
                    onClick={() => onApply(preset)}
                    title={`Apply “${preset.name}”`}
                  >
                    <span className="preset-list__check" aria-hidden="true">
                      {isSelected ? '✓' : ''}
                    </span>
                    <span className="preset-list__name">{preset.name}</span>
                  </button>
                  <div className="preset-list__actions">
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm btn--icon"
                      onClick={() => onExport(preset)}
                      title="Download as JSON"
                      aria-label={`Download ${preset.name}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm btn--icon"
                      onClick={() => onDelete(preset.id)}
                      title="Delete preset"
                      aria-label={`Delete ${preset.name}`}
                    >
                      ×
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}
