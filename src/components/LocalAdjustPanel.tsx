import type { EditParams, RadialAdjustment } from '../types/edits'

type LocalAdjustPanelProps = {
  edits: EditParams
  disabled?: boolean
  onAdd: () => void
  onUpdate: (id: string, patch: Partial<RadialAdjustment>) => void
  onRemove: (id: string) => void
  onBegin?: () => void
  onCommit?: () => void
}

export function LocalAdjustPanel({
  edits,
  disabled,
  onAdd,
  onUpdate,
  onRemove,
  onBegin,
  onCommit,
}: LocalAdjustPanelProps) {
  return (
    <section className="panel" aria-label="Local adjustments">
      <div className="panel__header">
        <h2 className="panel__title">Local</h2>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          disabled={disabled}
          onClick={onAdd}
        >
          Add radial
        </button>
      </div>

      {edits.localAdjustments.length === 0 && (
        <p className="field-hint">Add a radial for local exposure / contrast / saturation.</p>
      )}

      {edits.localAdjustments.map((adj, index) => (
        <div key={adj.id} className="local-card">
          <div className="panel__header">
            <h3 className="panel__subtitle">Radial {index + 1}</h3>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              disabled={disabled}
              onClick={() => onRemove(adj.id)}
            >
              Remove
            </button>
          </div>

          {(
            [
              ['cx', 'Center X', 0, 1, 0.01],
              ['cy', 'Center Y', 0, 1, 0.01],
              ['radiusX', 'Radius X', 0.05, 1, 0.01],
              ['radiusY', 'Radius Y', 0.05, 1, 0.01],
              ['feather', 'Feather', 0, 1, 0.01],
              ['exposure', 'Exposure', -2, 2, 0.01],
              ['contrast', 'Contrast', -100, 100, 1],
              ['saturation', 'Saturation', -100, 100, 1],
            ] as const
          ).map(([key, label, min, max, step]) => (
            <label key={key} className="slider">
              <span className="slider__meta">
                <span>{label}</span>
                <span className="slider__value">
                  {Number.isInteger(step)
                    ? adj[key]
                    : Number(adj[key]).toFixed(2)}
                </span>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={adj[key]}
                disabled={disabled}
                onPointerDown={() => onBegin?.()}
                onPointerUp={() => onCommit?.()}
                onChange={(e) => onUpdate(adj.id, { [key]: Number(e.target.value) })}
              />
            </label>
          ))}
        </div>
      ))}
    </section>
  )
}
