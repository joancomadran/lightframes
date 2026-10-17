import type { EditParams, RadialAdjustment } from '../types/edits'
import { Slider } from './Slider'

type LocalAdjustPanelProps = {
  edits: EditParams
  disabled?: boolean
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: () => void
  onUpdate: (id: string, patch: Partial<RadialAdjustment>) => void
  onRemove: (id: string) => void
  onBegin?: () => void
  onCommit?: () => void
}

const SLIDERS: {
  key: 'exposure' | 'contrast' | 'saturation' | 'feather'
  label: string
  min: number
  max: number
  step: number
  defaultValue: number
  track?: string
  format?: (v: number) => string
}[] = [
  { key: 'exposure', label: 'Exposure', min: -2, max: 2, step: 0.01, defaultValue: 0 },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1, defaultValue: 0 },
  {
    key: 'saturation',
    label: 'Saturation',
    min: -100,
    max: 100,
    step: 1,
    defaultValue: 0,
    track: 'linear-gradient(90deg, #7d827e, #e25555, #e6c84a, #4caf6a, #4a7fd4)',
  },
  {
    key: 'feather',
    label: 'Feather',
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0.35,
    format: (v) => `${Math.round(v * 100)}%`,
  },
]

function summary(adj: RadialAdjustment): string {
  const parts: string[] = []
  if (adj.exposure !== 0) parts.push(`Exp ${adj.exposure > 0 ? '+' : ''}${adj.exposure.toFixed(2)}`)
  if (adj.contrast !== 0) parts.push(`Con ${adj.contrast > 0 ? '+' : ''}${adj.contrast}`)
  if (adj.saturation !== 0) parts.push(`Sat ${adj.saturation > 0 ? '+' : ''}${adj.saturation}`)
  return parts.length > 0 ? parts.join(' · ') : 'No changes yet'
}

export function LocalAdjustPanel({
  edits,
  disabled,
  selectedId,
  onSelect,
  onAdd,
  onUpdate,
  onRemove,
  onBegin,
  onCommit,
}: LocalAdjustPanelProps) {
  const items = edits.localAdjustments

  return (
    <section className="panel" aria-label="Local adjustments">
      <div className="adjust-group__header">
        <h3 className="adjust-group__title">Radial masks</h3>
        {items.length > 0 && (
          <button type="button" className="btn btn--sm" disabled={disabled} onClick={onAdd}>
            + Add
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden="true" />
          <p className="empty-state__text">
            Brighten a face, darken a corner or make one area pop with an elliptical mask.
          </p>
          <button type="button" className="btn btn--accent btn--sm" disabled={disabled} onClick={onAdd}>
            Add radial mask
          </button>
        </div>
      ) : (
        <ul className="mask-list">
          {items.map((adj, index) => {
            const selected = adj.id === selectedId
            return (
              <li key={adj.id} className={selected ? 'mask-card mask-card--selected' : 'mask-card'}>
                <div className="mask-card__head">
                  <button
                    type="button"
                    className="mask-card__select"
                    aria-expanded={selected}
                    disabled={disabled}
                    onClick={() => onSelect(adj.id)}
                  >
                    <span className="mask-card__icon" aria-hidden="true" />
                    <span className="mask-card__name">Radial {index + 1}</span>
                    {!selected && <span className="mask-card__summary">{summary(adj)}</span>}
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm btn--icon"
                    disabled={disabled}
                    onClick={() => onRemove(adj.id)}
                    title="Delete mask"
                    aria-label={`Delete radial ${index + 1}`}
                  >
                    ×
                  </button>
                </div>

                {selected && (
                  <div className="mask-card__body">
                    {SLIDERS.map((slider) => (
                      <Slider
                        key={slider.key}
                        label={slider.label}
                        value={adj[slider.key]}
                        min={slider.min}
                        max={slider.max}
                        step={slider.step}
                        defaultValue={slider.defaultValue}
                        track={slider.track}
                        format={slider.format}
                        disabled={disabled}
                        onChange={(value, opts) => {
                          onUpdate(adj.id, { [slider.key]: value })
                          // updateRadial opens the history step; close it once state has landed.
                          if (opts?.commit) window.setTimeout(() => onCommit?.(), 0)
                        }}
                        onBegin={onBegin}
                        onCommit={onCommit}
                      />
                    ))}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {items.length > 0 && (
        <p className="field-hint">Drag the centre pin on the image to move a mask, the side handles to resize it.</p>
      )}
    </section>
  )
}
