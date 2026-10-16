import { useRef, useState } from 'react'
import type { Preset } from '../types/edits'
import { AdSlot } from './AdSlot'

type PresetsPanelProps = {
  presets: Preset[]
  disabled?: boolean
  onSave: (name: string) => void
  onApply: (preset: Preset) => void
  onDelete: (id: string) => void
  onExport: (preset: Preset) => void
  onImport: (file: File) => void
}

export function PresetsPanel({
  presets,
  disabled,
  onSave,
  onApply,
  onDelete,
  onExport,
  onImport,
}: PresetsPanelProps) {
  const [name, setName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

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
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onImport(file)
            e.target.value = ''
          }}
        />
      </div>

      <form
        className="preset-save"
        onSubmit={(e) => {
          e.preventDefault()
          if (!name.trim() || disabled) return
          onSave(name)
          setName('')
        }}
      >
        <input
          className="preset-save__input"
          type="text"
          placeholder="Preset name"
          value={name}
          disabled={disabled}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn btn--accent btn--sm" disabled={disabled || !name.trim()}>
          Save
        </button>
      </form>

      <ul className="preset-list">
        {presets.length === 0 && (
          <li className="preset-list__empty">Save edits as a reusable JSON preset</li>
        )}
        {presets.map((preset) => (
          <li key={preset.id} className="preset-list__item">
            <button
              type="button"
              className="preset-list__apply"
              disabled={disabled}
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
        ))}
      </ul>

      <AdSlot id="sidebar" height={120} />
    </section>
  )
}
