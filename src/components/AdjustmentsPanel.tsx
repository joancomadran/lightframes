import { EDIT_SLIDERS, type EditParams } from '../types/edits'

type AdjustmentsPanelProps = {
  edits: EditParams
  disabled?: boolean
  onChange: (patch: Partial<EditParams>) => void
  onReset: () => void
}

export function AdjustmentsPanel({
  edits,
  disabled,
  onChange,
  onReset,
}: AdjustmentsPanelProps) {
  return (
    <section className="panel" aria-label="Adjustments">
      <div className="panel__header">
        <h2 className="panel__title">Adjust</h2>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={onReset}
          disabled={disabled}
        >
          Reset
        </button>
      </div>

      <div className="sliders">
        {EDIT_SLIDERS.map((slider) => (
          <label key={slider.key} className="slider">
            <span className="slider__meta">
              <span>{slider.label}</span>
              <span className="slider__value">
                {Number.isInteger(slider.step)
                  ? edits[slider.key]
                  : edits[slider.key].toFixed(2)}
              </span>
            </span>
            <input
              type="range"
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={edits[slider.key]}
              disabled={disabled}
              onChange={(e) =>
                onChange({ [slider.key]: Number(e.target.value) } as Partial<EditParams>)
              }
            />
          </label>
        ))}
      </div>
    </section>
  )
}
