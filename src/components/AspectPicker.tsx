import type { CollageAspectId } from '../lib/collage'

type Aspect = {
  id: CollageAspectId
  label: string
  hint: string
  width: number
  height: number
}

type AspectPickerProps = {
  aspects: readonly Aspect[]
  value: CollageAspectId
  onChange: (id: CollageAspectId) => void
}

/** Longest side of the shape drawn for each ratio, in px. */
const ICON_SIZE = 22

/** Size options drawn as their own shape, so nobody has to read ratios. */
export function AspectPicker({ aspects, value, onChange }: AspectPickerProps) {
  return (
    <div className="aspect-picker" role="group" aria-label="Aspect ratio">
      {aspects.map((a) => {
        const ratio = a.width / a.height
        const w = ratio >= 1 ? ICON_SIZE : ICON_SIZE * ratio
        const h = ratio >= 1 ? ICON_SIZE / ratio : ICON_SIZE
        const active = a.id === value
        return (
          <button
            key={a.id}
            type="button"
            className={active ? 'aspect-picker__btn aspect-picker__btn--active' : 'aspect-picker__btn'}
            aria-pressed={active}
            title={`${a.hint} · ${a.width} × ${a.height}`}
            onClick={() => onChange(a.id)}
          >
            <span className="aspect-picker__icon" aria-hidden="true">
              <span style={{ width: w, height: h }} />
            </span>
            <span className="aspect-picker__label">{a.label}</span>
            <span className="aspect-picker__hint">{a.hint}</span>
          </button>
        )
      })}
    </div>
  )
}
