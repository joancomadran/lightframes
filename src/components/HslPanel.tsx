import { useState } from 'react'
import {
  HSL_CHANNELS,
  createDefaultHsl,
  isNeutralHsl,
  type EditParams,
  type HslBand,
  type HslChannel,
} from '../types/edits'

type HslMode = keyof HslBand

const MODES: { id: HslMode; label: string }[] = [
  { id: 'hue', label: 'Hue' },
  { id: 'saturation', label: 'Sat' },
  { id: 'luminance', label: 'Lum' },
]

type HslControlsProps = {
  edits: EditParams
  disabled?: boolean
  onChange: (patch: Partial<EditParams>) => void
}

/** HSL mixer body — embedded under Tint in Adjust. */
export function HslControls({ edits, disabled, onChange }: HslControlsProps) {
  const [mode, setMode] = useState<HslMode>('hue')

  const setBandValue = (channel: HslChannel, value: number) => {
    onChange({
      hsl: {
        ...edits.hsl,
        [channel]: {
          ...edits.hsl[channel],
          [mode]: value,
        },
      },
    })
  }

  return (
    <div className="hsl-dropdown__body">
      <div className="hsl-dropdown__toolbar">
        <div className="hsl-modes" role="tablist" aria-label="HSL mode">
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={mode === item.id}
              className={
                mode === item.id ? 'hsl-modes__btn hsl-modes__btn--active' : 'hsl-modes__btn'
              }
              disabled={disabled}
              onClick={() => setMode(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => onChange({ hsl: createDefaultHsl() })}
          disabled={disabled || isNeutralHsl(edits.hsl)}
        >
          Reset
        </button>
      </div>

      <div className="sliders sliders--hsl">
        {HSL_CHANNELS.map((channel) => {
          const value = edits.hsl[channel.id][mode]
          return (
            <label key={channel.id} className="slider slider--hsl">
              <span className="slider__meta">
                <span className="hsl-channel">
                  <span
                    className="hsl-channel__swatch"
                    style={{ background: channel.swatch }}
                    aria-hidden="true"
                  />
                  {channel.label}
                </span>
                <span className="slider__value">{value}</span>
              </span>
              <input
                type="range"
                min={-100}
                max={100}
                step={1}
                value={value}
                disabled={disabled}
                aria-label={`${channel.label} ${mode}`}
                onChange={(e) => setBandValue(channel.id, Number(e.target.value))}
              />
            </label>
          )
        })}
      </div>
    </div>
  )
}
