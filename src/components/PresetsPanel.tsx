import { useRef, useState } from 'react'
import type { Preset } from '../types/edits'
import { AdSlot } from './AdSlot'

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
  onImport,
}: PresetsPanelProps) {
  const [name, setName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const selected = presets.find((p) => p.id === selectedPresetId) ?? null
  const canSave = Boolean(!disabled && name.trim())
  const canUpdate = Boolean(!disabled && selected)

  return (
    <section className="panel panel--presets" aria-label="Presets">
      <div className="panel__header">
        <h2 className="panel__title">Presets</h2>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => fileRef.current?.click()}
        >
          Import
        </button>
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

      <label className={`preset-intensity${selected ? '' : ' preset-intensity--idle'}`}>
        <span className="slider__meta">
          <span>Intensity{selected ? ` · ${selected.name}` : ''}</span>
          <span className="slider__value">{intensity}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={intensity}
          disabled={disabled || !selected}
          aria-label="Preset intensity"
          onChange={(e) => onIntensityChange(Number(e.target.value))}
        />
      </label>

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
          placeholder="Custom preset name"
          value={name}
          disabled={disabled}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn btn--accent btn--sm" disabled={!canSave}>
          Save
        </button>
      </form>

      <div className="preset-save-actions">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          disabled={!canUpdate}
          title={
            selected
              ? `Overwrite “${selected.name}” with current adjustments`
              : 'Select a preset to update'
          }
          onClick={onUpdateSelected}
        >
          Update selected
        </button>
      </div>

      <ul className="preset-list">
        {presets.length === 0 && (
          <li className="preset-list__empty">
            Save current edits as a custom preset, or import JSON / XMP / CUBE
          </li>
        )}
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
              >
                {preset.name}
              </button>
              <div className="preset-list__actions">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => onExport(preset)}
                  title="Export JSON"
                >
                  JSON
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => onDelete(preset.id)}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <AdSlot id="sidebar" height={120} />
    </section>
  )
}
