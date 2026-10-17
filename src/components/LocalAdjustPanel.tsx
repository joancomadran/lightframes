import type {
  EditParams,
  LocalAdjustment,
  LocalAdjustmentPatch,
  LocalAdjustmentType,
} from '../types/edits'
import type { BrushSettings } from './MaskOverlay'
import { Slider } from './Slider'

type LocalAdjustPanelProps = {
  edits: EditParams
  disabled?: boolean
  selectedId: string | null
  brush: BrushSettings
  showOverlay: boolean
  onSelect: (id: string) => void
  onAdd: (type: LocalAdjustmentType) => void
  onUpdate: (id: string, patch: LocalAdjustmentPatch) => void
  onRemove: (id: string) => void
  onBrushChange: (brush: BrushSettings) => void
  onToggleOverlay: () => void
  onBegin?: () => void
  onCommit?: () => void
}

const SATURATION_TRACK = 'linear-gradient(90deg, #7d827e, #e25555, #e6c84a, #4caf6a, #4a7fd4)'

const ADJUST_SLIDERS: {
  key: 'exposure' | 'contrast' | 'saturation' | 'temperature'
  label: string
  min: number
  max: number
  step: number
  track?: string
}[] = [
  { key: 'exposure', label: 'Exposure', min: -2, max: 2, step: 0.01 },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1 },
  { key: 'saturation', label: 'Saturation', min: -100, max: 100, step: 1, track: SATURATION_TRACK },
  {
    key: 'temperature',
    label: 'Temperature',
    min: -100,
    max: 100,
    step: 1,
    track: 'linear-gradient(90deg, #4a7fd4, #b9b9b0, #e6b84a)',
  },
]

const TYPES: { id: LocalAdjustmentType; label: string; key: string; hint: string }[] = [
  { id: 'radial', label: 'Radial', key: '⇧M', hint: 'Elliptical area: a face, a subject' },
  { id: 'linear', label: 'Linear', key: 'M', hint: 'Graduated filter: skies, foregrounds' },
  { id: 'brush', label: 'Brush', key: 'K', hint: 'Paint exactly where you want it' },
]

const TYPE_LABEL: Record<LocalAdjustmentType, string> = { radial: 'Radial', linear: 'Linear', brush: 'Brush' }

function summary(adj: LocalAdjustment): string {
  const parts: string[] = []
  const signed = (v: number, digits = 0) => `${v > 0 ? '+' : ''}${v.toFixed(digits)}`
  if (adj.exposure !== 0) parts.push(`Exp ${signed(adj.exposure, 2)}`)
  if (adj.contrast !== 0) parts.push(`Con ${signed(adj.contrast)}`)
  if (adj.saturation !== 0) parts.push(`Sat ${signed(adj.saturation)}`)
  if (adj.temperature !== 0) parts.push(`Temp ${signed(adj.temperature)}`)
  if (adj.invert) parts.push('Inverted')
  return parts.length > 0 ? parts.join(' · ') : 'No changes yet'
}

function MaskIcon({ type }: { type: LocalAdjustmentType }) {
  return <span className={`mask-card__icon mask-card__icon--${type}`} aria-hidden="true" />
}

export function LocalAdjustPanel({
  edits,
  disabled,
  selectedId,
  brush,
  showOverlay,
  onSelect,
  onAdd,
  onUpdate,
  onRemove,
  onBrushChange,
  onToggleOverlay,
  onBegin,
  onCommit,
}: LocalAdjustPanelProps) {
  const items = edits.localAdjustments
  // updateLocal opens the history step; a reset closes it once state has landed.
  const commitSoon = () => window.setTimeout(() => onCommit?.(), 0)
  const typeCounts: Record<LocalAdjustmentType, number> = { radial: 0, linear: 0, brush: 0 }

  return (
    <section className="panel" aria-label="Local adjustments">
      <div className="adjust-group__header">
        <h3 className="adjust-group__title">Masks</h3>
        {items.length > 0 && (
          <button
            type="button"
            className={showOverlay ? 'btn btn--sm btn--accent' : 'btn btn--ghost btn--sm'}
            disabled={disabled}
            onClick={onToggleOverlay}
            aria-pressed={showOverlay}
            title="Tint the selected mask in red (O)"
          >
            Show mask
          </button>
        )}
      </div>

      <div className="mask-add" role="group" aria-label="Add mask">
        {TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            className="mask-add__btn"
            disabled={disabled}
            onClick={() => onAdd(type.id)}
            title={`${type.hint} (${type.key})`}
          >
            <MaskIcon type={type.id} />
            <span>+ {type.label}</span>
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="field-hint">
          Add a mask, then use its sliders to change only that area. Masks can be inverted to affect everything else.
        </p>
      ) : (
        <ul className="mask-list">
          {items.map((adj) => {
            typeCounts[adj.type] += 1
            const name = `${TYPE_LABEL[adj.type]} ${typeCounts[adj.type]}`
            const selected = adj.id === selectedId
            return (
              <li key={adj.id} className={selected ? 'mask-card mask-card--selected' : 'mask-card'}>
                <div className="mask-card__head">
                  <button
                    type="button"
                    className="mask-card__select"
                    aria-expanded={selected}
                    disabled={disabled}
                    onClick={() => onSelect(adj.id)}
                  >
                    <MaskIcon type={adj.type} />
                    <span className="mask-card__name">{name}</span>
                    {!selected && <span className="mask-card__summary">{summary(adj)}</span>}
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm btn--icon"
                    disabled={disabled}
                    onClick={() => onRemove(adj.id)}
                    title="Delete mask"
                    aria-label={`Delete ${name}`}
                  >
                    ×
                  </button>
                </div>

                {selected && (
                  <div className="mask-card__body">
                    {adj.type === 'brush' && (
                      <div className="brush-tools">
                        <div className="segmented" role="group" aria-label="Brush mode">
                          <button
                            type="button"
                            className={!brush.erase ? 'segmented__btn segmented__btn--active' : 'segmented__btn'}
                            aria-pressed={!brush.erase}
                            disabled={disabled}
                            onClick={() => onBrushChange({ ...brush, erase: false })}
                          >
                            Paint
                          </button>
                          <button
                            type="button"
                            className={brush.erase ? 'segmented__btn segmented__btn--active' : 'segmented__btn'}
                            aria-pressed={brush.erase}
                            disabled={disabled}
                            onClick={() => onBrushChange({ ...brush, erase: true })}
                            title="Or hold Alt while painting"
                          >
                            Erase
                          </button>
                        </div>
                        <Slider
                          label="Size"
                          value={brush.size * 100}
                          min={0.5}
                          max={25}
                          step={0.5}
                          disabled={disabled}
                          format={(v) => v.toFixed(1)}
                          onChange={(v) => onBrushChange({ ...brush, size: v / 100 })}
                        />
                        <Slider
                          label="Feather"
                          value={brush.feather * 100}
                          min={0}
                          max={100}
                          step={1}
                          disabled={disabled}
                          format={(v) => `${Math.round(v)}%`}
                          onChange={(v) => onBrushChange({ ...brush, feather: v / 100 })}
                        />
                        <Slider
                          label="Flow"
                          value={brush.flow * 100}
                          min={5}
                          max={100}
                          step={1}
                          disabled={disabled}
                          format={(v) => `${Math.round(v)}%`}
                          onChange={(v) => onBrushChange({ ...brush, flow: v / 100 })}
                        />
                        {adj.strokes.length === 0 && (
                          <p className="field-hint">Paint on the image to build the mask.</p>
                        )}
                      </div>
                    )}

                    {ADJUST_SLIDERS.map((slider) => (
                      <Slider
                        key={slider.key}
                        label={slider.label}
                        value={adj[slider.key]}
                        min={slider.min}
                        max={slider.max}
                        step={slider.step}
                        defaultValue={0}
                        track={slider.track}
                        disabled={disabled}
                        onChange={(value, opts) => {
                          onUpdate(adj.id, { [slider.key]: value })
                          if (opts?.commit) commitSoon()
                        }}
                        onBegin={onBegin}
                        onCommit={onCommit}
                      />
                    ))}
                    {adj.type === 'radial' && (
                      <Slider
                        label="Feather"
                        value={adj.feather}
                        min={0}
                        max={1}
                        step={0.01}
                        defaultValue={0.35}
                        disabled={disabled}
                        format={(v) => `${Math.round(v * 100)}%`}
                        onChange={(feather, opts) => {
                          onUpdate(adj.id, { feather })
                          if (opts?.commit) commitSoon()
                        }}
                        onBegin={onBegin}
                        onCommit={onCommit}
                      />
                    )}

                    <div className="mask-card__actions">
                      <label className="check">
                        <input
                          type="checkbox"
                          checked={adj.invert}
                          disabled={disabled}
                          onChange={(e) => {
                            onUpdate(adj.id, { invert: e.target.checked })
                            commitSoon()
                          }}
                        />
                        <span>Invert mask</span>
                      </label>
                      {adj.type === 'brush' && adj.strokes.length > 0 && (
                        <button
                          type="button"
                          className="link-btn"
                          disabled={disabled}
                          onClick={() => {
                            onUpdate(adj.id, { strokes: [] })
                            commitSoon()
                          }}
                        >
                          Clear strokes
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {items.length > 0 && (
        <p className="field-hint">
          Radial: drag the pin to move, side handles to resize. Linear: drag either end; full effect starts at the
          solid dot.
        </p>
      )}
    </section>
  )
}
