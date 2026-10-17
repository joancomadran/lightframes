import { EDIT_SLIDERS, isNeutralHsl, type EditParams } from '../types/edits'
import { HslControls } from './HslPanel'

type AdjustmentsPanelProps = {
  edits: EditParams
  disabled?: boolean
  onChange: (patch: Partial<EditParams>) => void
  onReset: () => void
}

function SliderRow({
  slider,
  value,
  disabled,
  onChange,
}: {
  slider: (typeof EDIT_SLIDERS)[number]
  value: number
  disabled?: boolean
  onChange: (patch: Partial<EditParams>) => void
}) {
  return (
    <label className="slider">
      <span className="slider__meta">
        <span>{slider.label}</span>
        <span className="slider__value">
          {Number.isInteger(slider.step) ? value : value.toFixed(2)}
        </span>
      </span>
      <input
        type="range"
        min={slider.min}
        max={slider.max}
        step={slider.step}
        value={value}
        disabled={disabled}
        onChange={(e) =>
          onChange({ [slider.key]: Number(e.target.value) } as Partial<EditParams>)
        }
      />
    </label>
  )
}

export function AdjustmentsPanel({
  edits,
  disabled,
  onChange,
  onReset,
}: AdjustmentsPanelProps) {
  const hslActive = !isNeutralHsl(edits.hsl)

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
          <div key={slider.key} className="slider-block">
            <SliderRow
              slider={slider}
              value={edits[slider.key]}
              disabled={disabled}
              onChange={onChange}
            />
            {slider.key === 'tint' && (
              <details className="hsl-dropdown">
                <summary className="hsl-dropdown__summary">
                  <span>HSL</span>
                  {hslActive && (
                    <span className="hsl-dropdown__badge" title="HSL edits active">
                      •
                    </span>
                  )}
                </summary>
                <HslControls edits={edits} disabled={disabled} onChange={onChange} />
              </details>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
