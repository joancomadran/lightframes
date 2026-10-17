import { DEFAULT_EDITS, EDIT_SLIDERS, type BasicEditKey, type EditParams } from '../types/edits'
import { HslControls } from './HslPanel'
import { Slider } from './Slider'

type EditChange = (patch: Partial<EditParams>, opts?: { commit?: boolean }) => void

type AdjustmentsPanelProps = {
  edits: EditParams
  disabled?: boolean
  onChange: EditChange
  onReset: () => void
  onBegin?: () => void
  onCommit?: () => void
}

const GROUPS: { title: string; keys: BasicEditKey[] }[] = [
  { title: 'Light', keys: ['exposure', 'contrast', 'highlights', 'shadows', 'whites', 'blacks'] },
  { title: 'Color', keys: ['temperature', 'tint', 'vibrance', 'saturation'] },
]

/** Gradient tracks that hint at what a slider does; others get a neutral track. */
const TRACKS: Partial<Record<BasicEditKey, string>> = {
  temperature: 'linear-gradient(90deg, #4a7fd4, #b9b9b0, #e6b84a)',
  tint: 'linear-gradient(90deg, #4caf6a, #b9b9b0, #d45aa8)',
  vibrance: 'linear-gradient(90deg, #7d827e, #6fa4d8)',
  saturation: 'linear-gradient(90deg, #7d827e, #e25555, #e6c84a, #4caf6a, #4a7fd4)',
}

export function AdjustmentsPanel({
  edits,
  disabled,
  onChange,
  onReset,
  onBegin,
  onCommit,
}: AdjustmentsPanelProps) {
  return (
    <section className="panel" aria-label="Adjustments">
      {GROUPS.map((group, index) => (
        <div key={group.title} className="adjust-group">
          <div className="adjust-group__header">
            <h3 className="adjust-group__title">{group.title}</h3>
            {index === 0 && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={onReset}
                disabled={disabled}
                title="Reset all adjustments"
              >
                Reset all
              </button>
            )}
          </div>
          {group.keys.map((key) => {
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
                track={TRACKS[key]}
                disabled={disabled}
                onChange={(value, opts) =>
                  onChange({ [key]: value } as Partial<EditParams>, opts)
                }
                onBegin={onBegin}
                onCommit={onCommit}
              />
            )
          })}
        </div>
      ))}

      <HslControls
        edits={edits}
        disabled={disabled}
        onChange={onChange}
        onBegin={onBegin}
        onCommit={onCommit}
      />
    </section>
  )
}
