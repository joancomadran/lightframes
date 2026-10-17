import type { CSSProperties } from 'react'

type SliderProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  /** Value restored on double-click. Omit to disable reset. */
  defaultValue?: number
  /** CSS background for the track (e.g. a gradient). */
  track?: string
  disabled?: boolean
  format?: (value: number) => string
  onChange: (value: number, opts?: { commit?: boolean }) => void
  onBegin?: () => void
  onCommit?: () => void
}

function defaultFormat(value: number, step: number, signed: boolean): string {
  const text = Number.isInteger(step) ? String(Math.round(value)) : value.toFixed(step < 0.1 ? 2 : 1)
  return signed && value > 0 ? `+${text}` : text
}

/** Compact one-line slider: label · track · value. Double-click resets. */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  defaultValue,
  track,
  disabled,
  format,
  onChange,
  onBegin,
  onCommit,
}: SliderProps) {
  const canReset = defaultValue !== undefined && !disabled && value !== defaultValue
  const reset = () => {
    if (canReset) onChange(defaultValue, { commit: true })
  }
  const edited = defaultValue !== undefined && value !== defaultValue

  return (
    <label className={edited ? 'cslider cslider--edited' : 'cslider'}>
      <span className="cslider__label" onDoubleClick={reset}>
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        title={defaultValue !== undefined ? 'Double-click to reset' : undefined}
        style={track ? ({ '--track': track } as CSSProperties) : undefined}
        onPointerDown={() => onBegin?.()}
        onPointerUp={() => onCommit?.()}
        onChange={(e) => onChange(Number(e.target.value))}
        onDoubleClick={reset}
      />
      <span className="cslider__value" onDoubleClick={reset}>
        {format ? format(value) : defaultFormat(value, step, min < 0)}
      </span>
    </label>
  )
}
