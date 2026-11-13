import { useRef, useState, type ReactNode } from 'react'
import { usePresetThumbnails, type ThumbGeometry } from '../hooks/usePresetThumbnails'
import { useEditorLang } from '../hooks/useEditorLang'
import { trackFreePackDownload } from '../lib/analytics'
import { BUILTIN_PRESETS, isBuiltinPreset } from '../lib/builtinPresets'
import { FREE_PACK_PRESETS, freePackPresetLabel, isFreePackPreset } from '../lib/freePackPresets'
import { freePresetsPackPath, freePresetsPackZipUrl } from '../site/freePresetsPack'
import type { Preset } from '../types/edits'

type PresetTileProps = {
  preset: Preset
  thumb: string | undefined
  selected: boolean
  /** Strength of the selected preset (0–100), set from a slider on its tile. */
  intensity: number
  disabled?: boolean
  onApply: (preset: Preset) => void
  onRemove: () => void
  onIntensityChange: (intensity: number) => void
  actions?: ReactNode
  applyLabel: (name: string) => string
  removeLabel: (name: string) => string
  intensityLabel: (name: string) => string
  intensityTitle: string
}

function PresetTile({
  preset,
  thumb,
  selected,
  intensity,
  disabled,
  onApply,
  onRemove,
  onIntensityChange,
  actions,
  applyLabel,
  removeLabel,
  intensityLabel,
  intensityTitle,
}: PresetTileProps) {
  return (
    <li className={selected ? 'preset-grid__item preset-grid__item--active' : 'preset-grid__item'}>
      <button
        type="button"
        className="preset-grid__apply"
        disabled={disabled}
        aria-pressed={selected}
        onClick={() => (selected ? onRemove() : onApply(preset))}
        title={selected ? removeLabel(preset.name) : applyLabel(preset.name)}
      >
        <span className="preset-grid__thumb">
          {thumb && <img src={thumb} alt="" draggable={false} />}
        </span>
        <span className="preset-grid__name">{preset.name}</span>
      </button>
      {/* Sits over the thumbnail, outside the button, so dragging it doesn't toggle the preset. */}
      {selected && (
        <div className="preset-grid__intensity">
          <label className="preset-grid__intensity-bar" title={intensityTitle}>
            <span className="preset-grid__intensity-value">{intensity}%</span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={intensity}
              disabled={disabled}
              aria-label={intensityLabel(preset.name)}
              onChange={(e) => onIntensityChange(Number(e.target.value))}
              onDoubleClick={() => onIntensityChange(100)}
            />
          </label>
        </div>
      )}
      {actions && <div className="preset-grid__actions">{actions}</div>}
    </li>
  )
}

type PresetsPanelProps = {
  presets: Preset[]
  /** Active photo the previews are rendered from. */
  previewSrc: string | null
  previewGeometry: ThumbGeometry | null
  selectedPresetId: string | null
  intensity: number
  disabled?: boolean
  onSave: (name: string) => void
  onUpdateSelected: () => void
  onApply: (preset: Preset) => void
  onRemove: () => void
  onIntensityChange: (intensity: number) => void
  onDelete: (id: string) => void
  onExport: (preset: Preset) => void
  onExportAll: () => void
  onImport: (file: File) => void
}

export function PresetsPanel({
  presets,
  previewSrc,
  previewGeometry,
  selectedPresetId,
  intensity,
  disabled,
  onSave,
  onUpdateSelected,
  onApply,
  onRemove,
  onIntensityChange,
  onDelete,
  onExport,
  onExportAll,
  onImport,
}: PresetsPanelProps) {
  const { lang, copy } = useEditorLang()
  const tx = copy.presets
  const [name, setName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const catalog = [...BUILTIN_PRESETS, ...FREE_PACK_PRESETS, ...presets]
  const selected = catalog.find((p) => p.id === selectedPresetId) ?? null
  const selectedIsLocked = Boolean(selected && (isBuiltinPreset(selected.id) || isFreePackPreset(selected.id)))
  const canSave = Boolean(!disabled && name.trim())
  const canUpdate = Boolean(!disabled && selected && !selectedIsLocked)
  const builtinThumbs = usePresetThumbnails(BUILTIN_PRESETS, previewSrc, previewGeometry)
  const freePackThumbs = usePresetThumbnails(FREE_PACK_PRESETS, previewSrc, previewGeometry)
  const customThumbs = usePresetThumbnails(presets, previewSrc, previewGeometry)
  const tileLabels = {
    applyLabel: tx.apply,
    removeLabel: tx.remove,
    intensityLabel: tx.intensity,
    intensityTitle: tx.intensityTitle,
  }

  return (
    <section className="panel panel--presets" aria-label={copy.panels.presets}>
      <div className="adjust-group__header">
        <h3 className="adjust-group__title">{copy.panels.presets}</h3>
        <div className="btn-group">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => fileRef.current?.click()}
            title={tx.importTitle}
          >
            {tx.import}
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            disabled={presets.length === 0}
            onClick={onExportAll}
            title={tx.backupTitle}
          >
            {tx.backup}
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

      <div className="field-row">
        <span>{tx.filters}</span>
        <span className="field-row__count">{BUILTIN_PRESETS.length}</span>
      </div>
      <ul className="preset-grid">
        {BUILTIN_PRESETS.map((preset) => (
          <PresetTile
            key={preset.id}
            preset={preset}
            thumb={builtinThumbs[preset.id]}
            selected={preset.id === selectedPresetId}
            intensity={intensity}
            disabled={disabled}
            onApply={onApply}
            onRemove={onRemove}
            onIntensityChange={onIntensityChange}
            {...tileLabels}
          />
        ))}
      </ul>

      <div className="field-row">
        <span>{tx.freePack}</span>
        <span className="field-row__count">{FREE_PACK_PRESETS.length}</span>
      </div>
      <p className="preset-pack__links">
        <a href={freePresetsPackZipUrl} download onClick={() => trackFreePackDownload('full-pack')}>
          {tx.downloadZip}
        </a>
        <a href={freePresetsPackPath[lang]}>{tx.packPage}</a>
      </p>
      <ul className="preset-grid" aria-label={tx.freePack}>
        {FREE_PACK_PRESETS.map((preset) => {
          const labeled = { ...preset, name: freePackPresetLabel(preset, lang) }
          return (
            <PresetTile
              key={preset.id}
              preset={labeled}
              thumb={freePackThumbs[preset.id]}
              selected={preset.id === selectedPresetId}
              intensity={intensity}
              disabled={disabled}
              onApply={() => onApply(preset)}
              onRemove={onRemove}
              onIntensityChange={onIntensityChange}
              {...tileLabels}
            />
          )
        })}
      </ul>

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
          placeholder={tx.savePlaceholder}
          aria-label={tx.saveLabel}
          value={name}
          disabled={disabled}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn btn--accent btn--sm" disabled={!canSave}>
          {tx.save}
        </button>
      </form>

      {presets.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__text">
            {tx.empty}
          </p>
        </div>
      ) : (
        <>
          <div className="field-row">
            <span>{tx.mine}</span>
            <span className="field-row__count">{presets.length}</span>
          </div>
          <ul className="preset-grid">
            {presets.map((preset) => (
              <PresetTile
                key={preset.id}
                preset={preset}
                thumb={customThumbs[preset.id]}
                selected={preset.id === selectedPresetId}
                intensity={intensity}
                disabled={disabled}
                onApply={onApply}
                onRemove={onRemove}
                onIntensityChange={onIntensityChange}
                {...tileLabels}
                actions={
                  <>
                    {preset.id === selectedPresetId && (
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm btn--icon"
                        disabled={!canUpdate}
                        onClick={onUpdateSelected}
                        title={tx.updateTitle}
                        aria-label={tx.update(preset.name)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4.5h-4.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm btn--icon"
                      onClick={() => onExport(preset)}
                      title={tx.downloadTitle}
                      aria-label={tx.download(preset.name)}
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
                      title={tx.deleteTitle}
                      aria-label={tx.delete(preset.name)}
                    >
                      ×
                    </button>
                  </>
                }
              />
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
