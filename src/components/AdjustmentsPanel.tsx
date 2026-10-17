import { DEFAULT_EDITS, EDIT_SLIDERS, type BasicEditKey, type EditParams } from '../types/edits'
import { Slider } from './Slider'

type EditChange = (patch: Partial<EditParams>, opts?: { commit?: boolean }) => void

type AdjustmentsPanelProps = {
  edits: EditParams
  disabled?: boolean
  pickingWhiteBalance: boolean
  onChange: EditChange
  onReset: () => void
  onAutoTone: () => void
  onAutoWhiteBalance: () => void
  onTogglePicker: () => void
  onBegin?: () => void
  onCommit?: () => void
}

/** Gradient tracks that hint at what a slider does; others get a neutral track. */
const SLIDER_TRACKS: Partial<Record<BasicEditKey, string>> = {
  temperature: 'linear-gradient(90deg, #4a7fd4, #b9b9b0, #e6b84a)',
  tint: 'linear-gradient(90deg, #4caf6a, #b9b9b0, #d45aa8)',
  vibrance: 'linear-gradient(90deg, #7d827e, #6fa4d8)',
  saturation: 'linear-gradient(90deg, #7d827e, #e25555, #e6c84a, #4caf6a, #4a7fd4)',
  dehaze: 'linear-gradient(90deg, #c9ccd0, #7d827e, #3d5d7a)',
  vignette: 'linear-gradient(90deg, #111, #7d827e, #f2f2ee)',
}

type SliderGroupProps = {
  keys: BasicEditKey[]
  edits: EditParams
  disabled?: boolean
  onChange: EditChange
  onBegin?: () => void
  onCommit?: () => void
}

/** A run of basic sliders, looked up in EDIT_SLIDERS. Shared by Adjust and Effects. */
export function SliderGroup({ keys, edits, disabled, onChange, onBegin, onCommit }: SliderGroupProps) {
  return (
    <>
      {keys.map((key) => {
        const slider = EDIT_SLIDERS.find((s) => s.key === key)
        if (!slider) return null
        return (
          <Slider
            key={key}
            label={slider.label}
            value={edits[key]}
            min={slider.min}
            max={slider.max}
            step={slider.step}
            defaultValue={DEFAULT_EDITS[key]}
            track={SLIDER_TRACKS[key]}
            disabled={disabled}
            onChange={(value, opts) => onChange({ [key]: value } as Partial<EditParams>, opts)}
            onBegin={onBegin}
            onCommit={onCommit}
          />
        )
      })}
    </>
  )
}

export function AdjustmentsPanel({
  edits,
  disabled,
  pickingWhiteBalance,
  onChange,
  onReset,
  onAutoTone,
  onAutoWhiteBalance,
  onTogglePicker,
  onBegin,
  onCommit,
}: AdjustmentsPanelProps) {
  const sliderProps = { edits, disabled, onChange, onBegin, onCommit }
  return (
    <section className="panel" aria-label="Adjustments">
      <div className="adjust-group">
        <div className="adjust-group__header">
          <h3 className="adjust-group__title">Light</h3>
          <div className="btn-group">
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={onAutoTone}
              disabled={disabled}
              title="Set exposure, contrast and tone from the histogram"
            >
              Auto
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={onReset}
              disabled={disabled}
              title="Reset all adjustments"
            >
              Reset all
            </button>
          </div>
        </div>
        <SliderGroup keys={['exposure', 'contrast', 'highlights', 'shadows', 'whites', 'blacks']} {...sliderProps} />
      </div>

      <div className="adjust-group">
        <div className="adjust-group__header">
          <h3 className="adjust-group__title">Color</h3>
          <div className="btn-group">
            <button
              type="button"
              className={pickingWhiteBalance ? 'btn btn--sm btn--accent btn--icon' : 'btn btn--ghost btn--sm btn--icon'}
              onClick={onTogglePicker}
              disabled={disabled}
              aria-pressed={pickingWhiteBalance}
              title="White balance picker (W): click something neutral"
              aria-label="White balance picker"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="m14.5 5.5 4 4M4 20l1-4 9.5-9.5 3 3L8 19l-4 1Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="m16 4 1.5-1.5a2.1 2.1 0 0 1 3 3L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={onAutoWhiteBalance}
              disabled={disabled}
              title="Neutralise the overall colour cast"
            >
              Auto
            </button>
          </div>
        </div>
        <SliderGroup keys={['temperature', 'tint', 'vibrance', 'saturation']} {...sliderProps} />
      </div>

      <div className="adjust-group">
        <div className="adjust-group__header">
          <h3 className="adjust-group__title">Presence</h3>
        </div>
        <SliderGroup keys={['texture', 'clarity', 'dehaze']} {...sliderProps} />
      </div>
    </section>
  )
}
