import { useState } from 'react'
import {
  HSL_CHANNELS,
  createDefaultHsl,
  isNeutralHsl,
  type EditParams,
  type HslBand,
  type HslChannel,
} from '../types/edits'
import { Slider } from './Slider'

type HslMode = keyof HslBand

/** Matches HSL_HUE_DEGREES in imageProcessing: ±100 on the slider ≈ ±30°. */
const HUE_SHIFT_DEGREES = 30

const MODES: { id: HslMode; label: string; track: (center: number) => string }[] = [
  {
    id: 'hue',
    label: 'Hue',
    track: (c) =>
      `linear-gradient(90deg, hsl(${c - HUE_SHIFT_DEGREES} 75% 55%), hsl(${c} 75% 55%), hsl(${c + HUE_SHIFT_DEGREES} 75% 55%))`,
  },
  {
    id: 'saturation',
    label: 'Saturation',
    track: (c) => `linear-gradient(90deg, hsl(${c} 0% 50%), hsl(${c} 90% 52%))`,
  },
  {
    id: 'luminance',
    label: 'Luminance',
    track: (c) =>
      `linear-gradient(90deg, hsl(${c} 55% 12%), hsl(${c} 65% 50%), hsl(${c} 70% 88%))`,
  },
]

const isNeutralBand = (band: HslBand) =>
  band.hue === 0 && band.saturation === 0 && band.luminance === 0

type HslControlsProps = {
  edits: EditParams
  disabled?: boolean
  onChange: (patch: Partial<EditParams>, opts?: { commit?: boolean }) => void
  onBegin?: () => void
  onCommit?: () => void
}

/** Color mixer: pick a color, then tune its hue, saturation and luminance. */
export function HslControls({ edits, disabled, onChange, onBegin, onCommit }: HslControlsProps) {
  const [channelId, setChannelId] = useState<HslChannel>('reds')
  const channel = HSL_CHANNELS.find((c) => c.id === channelId) ?? HSL_CHANNELS[0]
  const band = edits.hsl[channel.id]

  const setBand = (next: HslBand, opts?: { commit?: boolean }) => {
    onChange({ hsl: { ...edits.hsl, [channel.id]: next } }, opts)
  }

  return (
    <div className="adjust-group">
      <div className="adjust-group__header">
        <h3 className="adjust-group__title">
          Color mixer <span className="adjust-group__sub">· {channel.label}</span>
        </h3>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => onChange({ hsl: createDefaultHsl() }, { commit: true })}
          disabled={disabled || isNeutralHsl(edits.hsl)}
          title="Reset every color"
        >
          Reset
        </button>
      </div>

      <div className="hsl-colors" role="tablist" aria-label="Color">
        {HSL_CHANNELS.map((item) => {
          const active = item.id === channel.id
          const edited = !isNeutralBand(edits.hsl[item.id])
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={item.label}
              title={item.label}
              className={active ? 'hsl-colors__btn hsl-colors__btn--active' : 'hsl-colors__btn'}
              style={{ background: item.swatch }}
              disabled={disabled}
              onClick={() => setChannelId(item.id)}
            >
              {edited && <span className="hsl-colors__dot" aria-hidden="true" />}
            </button>
          )
        })}
      </div>

      {MODES.map((mode) => (
        <Slider
          key={mode.id}
          label={mode.label}
          value={band[mode.id]}
          min={-100}
          max={100}
          step={1}
          defaultValue={0}
          track={mode.track(channel.center)}
          disabled={disabled}
          onChange={(value, opts) => setBand({ ...band, [mode.id]: value }, opts)}
          onBegin={onBegin}
          onCommit={onCommit}
        />
      ))}
    </div>
  )
}
