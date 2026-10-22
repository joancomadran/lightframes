import { useState, type CSSProperties, type KeyboardEvent } from 'react'

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

/** Clamp to the range and snap to the step (without float noise like 0.30000000000000004). */
function snap(value: number, min: number, max: number, step: number): number {
  const decimals = (String(step).split('.')[1] ?? '').length
  const stepped = min + Math.round((value - min) / step) * step
  return Number(Math.min(max, Math.max(min, stepped)).toFixed(decimals))
}

/** Compact one-line slider: label · track · value. Double-click resets; click the value to type one. */
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
  /** Text being typed into the value, or null when not editing. */
  const [draft, setDraft] = useState<string | null>(null)
  const canReset = defaultValue !== undefined && !disabled && value !== defaultValue
  const reset = () => {
    if (canReset) onChange(defaultValue, { commit: true })
  }
  const edited = defaultValue !== undefined && value !== defaultValue
  const show = (v: number) => (format ? format(v) : defaultFormat(v, step, min < 0))

  const apply = () => {
    if (draft === null) return
    setDraft(null)
    const text = draft.trim().toLowerCase()
    // Words some sliders show at their ends ("Full") are accepted as typed.
    const word = [min, max].find((v) => show(v).toLowerCase() === text)
    // Units and signs are optional; a decimal comma works too.
    const typed = word ?? Number.parseFloat(text.replace(',', '.').replace(/[^\d.+-]/g, ''))
    if (!Number.isFinite(typed)) return
    const next = snap(typed, min, max, step)
    if (next !== value) onChange(next, { commit: true })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Keep these keys from the editor's shortcuts (Esc deselects, arrows step photos…).
    e.stopPropagation()
    if (e.key === 'Enter') {
      apply()
    } else if (e.key === 'Escape') {
      setDraft(null)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const current = Number.parseFloat((draft ?? '').replace(',', '.'))
      const delta = step * (e.shiftKey ? 10 : 1) * (e.key === 'ArrowUp' ? 1 : -1)
      setDraft(defaultFormat(snap((Number.isFinite(current) ? current : value) + delta, min, max, step), step, false))
    }
  }

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
      {draft !== null ? (
        <input
          type="text"
          inputMode="decimal"
          className="cslider__input"
          aria-label={label}
          value={draft}
          autoFocus
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={apply}
        />
      ) : (
        <button
          type="button"
          className="cslider__value"
          disabled={disabled}
          title="Click to type a value"
          onClick={(e) => {
            // A click inside the label would otherwise also go to the range input.
            e.preventDefault()
            setDraft(defaultFormat(value, step, false))
          }}
        >
          {show(value)}
        </button>
      )}
    </label>
  )
}
