import { useSyncExternalStore } from 'react'
import { getAiStatus, preloadModel, subscribeAi } from '../lib/ai'
import {
  DEFAULT_MASK_RANGE,
  isRangeActive,
  type EditParams,
  type LocalAdjustment,
  type LocalAdjustmentPatch,
  type LocalAdjustmentType,
  type MaskRange,
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
  /** A brush mask set up for whitening teeth. */
  onAddTeeth: () => void
  /** An inverted subject mask: everything but the subject. */
  onAddBackground: () => void
  onUpdate: (id: string, patch: LocalAdjustmentPatch) => void
  onRemove: (id: string) => void
  onBrushChange: (brush: BrushSettings) => void
  onToggleOverlay: () => void
  onBegin?: () => void
  onCommit?: () => void
}

const SATURATION_TRACK = 'linear-gradient(90deg, #7d827e, #e25555, #e6c84a, #4caf6a, #4a7fd4)'

const ADJUST_SLIDERS: {
  key: 'exposure' | 'contrast' | 'saturation' | 'temperature' | 'whiten'
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
  { key: 'whiten', label: 'Whiten', min: 0, max: 100, step: 1, track: 'linear-gradient(90deg, #d8c48f, #f4f4f0)' },
]

const LUMINANCE_TRACK = 'linear-gradient(90deg, #111, #f4f4f0)'
const HUE_TRACK =
  'linear-gradient(90deg, hsl(0 70% 55%), hsl(60 70% 55%), hsl(120 70% 45%), hsl(180 70% 45%), hsl(240 70% 60%), hsl(300 70% 55%), hsl(360 70% 55%))'

const HUE_NAMES: [number, string][] = [
  [15, 'Red'],
  [45, 'Orange'],
  [70, 'Yellow'],
  [160, 'Green'],
  [200, 'Aqua'],
  [255, 'Blue'],
  [290, 'Purple'],
  [335, 'Magenta'],
  [360, 'Red'],
]

function hueName(hue: number): string {
  return HUE_NAMES.find(([limit]) => hue < limit)?.[1] ?? 'Red'
}

const TYPES: { id: LocalAdjustmentType; label: string; key: string; hint: string }[] = [
  { id: 'radial', label: 'Radial', key: '⇧M', hint: 'Elliptical area: a face, a subject' },
  { id: 'linear', label: 'Linear', key: 'M', hint: 'Graduated filter: skies, foregrounds' },
  { id: 'brush', label: 'Brush', key: 'K', hint: 'Paint exactly where you want it' },
  { id: 'subject', label: 'Subject', key: '⇧K', hint: 'Finds the main subject for you (AI, on your device)' },
]

const TYPE_LABEL: Record<LocalAdjustmentType, string> = {
  radial: 'Radial',
  linear: 'Linear',
  brush: 'Brush',
  subject: 'Subject',
}

function summary(adj: LocalAdjustment): string {
  const parts: string[] = []
  const signed = (v: number, digits = 0) => `${v > 0 ? '+' : ''}${v.toFixed(digits)}`
  if (adj.exposure !== 0) parts.push(`Exp ${signed(adj.exposure, 2)}`)
  if (adj.contrast !== 0) parts.push(`Con ${signed(adj.contrast)}`)
  if (adj.saturation !== 0) parts.push(`Sat ${signed(adj.saturation)}`)
  if (adj.temperature !== 0) parts.push(`Temp ${signed(adj.temperature)}`)
  if (adj.whiten > 0) parts.push(`Whiten ${Math.round(adj.whiten)}`)
  if (adj.invert) parts.push('Inverted')
  if (isRangeActive(adj.range)) parts.push('Range')
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
  onAddTeeth,
  onAddBackground,
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
  const typeCounts: Record<LocalAdjustmentType, number> = { radial: 0, linear: 0, brush: 0, subject: 0 }
  const segment = useSyncExternalStore(subscribeAi, () => getAiStatus('segment'))
  const hasSubject = items.some((adj) => adj.type === 'subject')

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
            onClick={() => {
              if (type.id === 'subject') preloadModel('segment')
              onAdd(type.id)
            }}
            title={`${type.hint} (${type.key})`}
          >
            <MaskIcon type={type.id} />
            <span>+ {type.label}</span>
          </button>
        ))}
        <button
          type="button"
          className="mask-add__btn"
          disabled={disabled}
          onClick={onAddTeeth}
          title="Brush set up to whiten teeth: only light, yellowish pixels change, so lips and skin stay as they are"
        >
          <span className="mask-card__icon mask-card__icon--teeth" aria-hidden="true" />
          <span>+ Teeth</span>
        </button>
        <button
          type="button"
          className="mask-add__btn"
          disabled={disabled}
          onClick={() => {
            preloadModel('segment')
            onAddBackground()
          }}
          title="Everything except the main subject (AI, on your device)"
        >
          <span className="mask-card__icon mask-card__icon--background" aria-hidden="true" />
          <span>+ Background</span>
        </button>
      </div>

      {hasSubject && segment.phase !== 'idle' && (
        <p
          className={segment.phase === 'error' ? 'field-hint heal-status heal-status--error' : 'field-hint heal-status'}
          role="status"
        >
          {segment.phase === 'downloading'
            ? `Downloading the subject model (45 MB, once)… ${Math.round(segment.progress * 100)}%`
            : segment.phase === 'working'
              ? 'Finding the subject…'
              : `Could not find the subject: ${segment.message}`}
        </p>
      )}

      {items.length === 0 ? (
        <p className="field-hint">
          Add a mask, then use its sliders to change only that area. Masks can be inverted to affect everything else.
        </p>
      ) : (
        <ul className="mask-list">
          {items.map((adj) => {
            typeCounts[adj.type] += 1
            const name = adj.name ?? `${TYPE_LABEL[adj.type]} ${typeCounts[adj.type]}`
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

                    <RangeControls
                      range={adj.range}
                      disabled={disabled}
                      onChange={(range, commit) => {
                        onUpdate(adj.id, { range })
                        if (commit) commitSoon()
                      }}
                      onBegin={onBegin}
                      onCommit={onCommit}
                    />

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

type RangeControlsProps = {
  range: MaskRange | undefined
  disabled?: boolean
  onChange: (range: MaskRange, commit: boolean) => void
  onBegin?: () => void
  onCommit?: () => void
}

/** Luminance and colour range: narrows any mask to some tones or one colour. */
function RangeControls({ range, disabled, onChange, onBegin, onCommit }: RangeControlsProps) {
  const current = range ?? DEFAULT_MASK_RANGE
  const active = isRangeActive(range)
  const set = (patch: Partial<MaskRange>, commit = false) => onChange({ ...current, ...patch }, commit)

  return (
    <div className="mask-range">
      <div className="adjust-group__header">
        <h4 className="mask-range__title">Refine by range</h4>
        {active && (
          <button
            type="button"
            className="link-btn"
            disabled={disabled}
            onClick={() => set({ ...DEFAULT_MASK_RANGE }, true)}
          >
            Reset
          </button>
        )}
      </div>
      <Slider
        label="Darkest"
        value={current.lumMin}
        min={0}
        max={100}
        step={1}
        defaultValue={0}
        track={LUMINANCE_TRACK}
        disabled={disabled}
        onChange={(v, opts) => set({ lumMin: v, lumMax: Math.max(v, current.lumMax) }, opts?.commit)}
        onBegin={onBegin}
        onCommit={onCommit}
      />
      <Slider
        label="Brightest"
        value={current.lumMax}
        min={0}
        max={100}
        step={1}
        defaultValue={100}
        track={LUMINANCE_TRACK}
        disabled={disabled}
        onChange={(v, opts) => set({ lumMax: v, lumMin: Math.min(v, current.lumMin) }, opts?.commit)}
        onBegin={onBegin}
        onCommit={onCommit}
      />
      <label className="check">
        <input
          type="checkbox"
          checked={current.hue !== null}
          disabled={disabled}
          onChange={(e) => set({ hue: e.target.checked ? 220 : null }, true)}
        />
        <span>Only one colour</span>
      </label>
      {current.hue !== null && (
        <>
          <Slider
            label="Colour"
            value={current.hue}
            min={0}
            max={359}
            step={1}
            track={HUE_TRACK}
            disabled={disabled}
            format={(v) => hueName(v)}
            onChange={(v, opts) => set({ hue: v }, opts?.commit)}
            onBegin={onBegin}
            onCommit={onCommit}
          />
          <Slider
            label="Colour range"
            value={current.hueWidth}
            min={0}
            max={100}
            step={1}
            defaultValue={DEFAULT_MASK_RANGE.hueWidth}
            disabled={disabled}
            onChange={(v, opts) => set({ hueWidth: v }, opts?.commit)}
            onBegin={onBegin}
            onCommit={onCommit}
          />
        </>
      )}
      {active && (
        <Slider
          label="Smoothness"
          value={current.smoothness}
          min={0}
          max={100}
          step={1}
          defaultValue={DEFAULT_MASK_RANGE.smoothness}
          disabled={disabled}
          onChange={(v, opts) => set({ smoothness: v }, opts?.commit)}
          onBegin={onBegin}
          onCommit={onCommit}
        />
      )}
    </div>
  )
}
