import { useEffect } from 'react'
import type { HealMode, HealSpot } from '../types/edits'
import type { HealTool } from './HealOverlay'
import { Slider } from './Slider'

type HealPanelProps = {
  spots: HealSpot[]
  disabled?: boolean
  selectedId: string | null
  tool: HealTool
  onToolChange: (tool: HealTool) => void
  onSelect: (id: string | null) => void
  onUpdate: (id: string, patch: Partial<HealSpot>, opts?: { commit?: boolean }) => void
  onRemove: (id: string) => void
  onClear: () => void
  onNewSource: (id: string) => void
  onBegin?: () => void
  onCommit?: () => void
}

const MODES: { id: HealMode; label: string; hint: string }[] = [
  { id: 'heal', label: 'Heal', hint: 'Blend the fix into its surroundings' },
  { id: 'clone', label: 'Clone', hint: 'Copy the source exactly' },
]

export function HealPanel({
  spots,
  disabled,
  selectedId,
  tool,
  onToolChange,
  onSelect,
  onUpdate,
  onRemove,
  onClear,
  onNewSource,
  onBegin,
  onCommit,
}: HealPanelProps) {
  const selected = spots.find((s) => s.id === selectedId) ?? null
  // The sliders show (and edit) the selected spot; new spots use the same settings.
  const shown = selected ?? tool
  // onUpdate opens the history step; a reset closes it once state has landed.
  const commitSoon = () => window.setTimeout(() => onCommit?.(), 0)

  const change = (patch: Partial<HealTool>, opts?: { commit?: boolean }) => {
    onToolChange({ ...tool, ...patch })
    if (!selected) return
    onUpdate(selected.id, patch, opts)
  }

  // Delete removes the selected spot, / looks for another source, Esc deselects.
  useEffect(() => {
    if (disabled) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        (target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable))
      ) {
        return
      }
      if (e.key === 'Escape' && selectedId) {
        onSelect(null)
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        onRemove(selectedId)
      } else if (e.key === '/' && selectedId) {
        e.preventDefault()
        onNewSource(selectedId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [disabled, selectedId, onSelect, onRemove, onNewSource])

  return (
    <section className="panel" aria-label="Spot removal">
      <div className="adjust-group__header">
        <h3 className="adjust-group__title">Spot removal</h3>
        {spots.length > 0 && (
          <button type="button" className="link-btn" disabled={disabled} onClick={onClear}>
            Clear all
          </button>
        )}
      </div>

      <div className="brush-tools">
        <div className="segmented" role="group" aria-label="Spot mode">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={shown.mode === mode.id ? 'segmented__btn segmented__btn--active' : 'segmented__btn'}
              aria-pressed={shown.mode === mode.id}
              disabled={disabled}
              title={mode.hint}
              onClick={() => change({ mode: mode.id }, { commit: true })}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <Slider
          label="Size"
          value={shown.size * 100}
          min={0.2}
          max={10}
          step={0.1}
          disabled={disabled}
          format={(v) => v.toFixed(1)}
          onChange={(v, opts) => {
            change({ size: v / 100 })
            if (opts?.commit && selected) commitSoon()
          }}
          onBegin={onBegin}
          onCommit={onCommit}
        />
        <Slider
          label="Feather"
          value={shown.feather * 100}
          min={0}
          max={100}
          step={1}
          defaultValue={30}
          disabled={disabled}
          format={(v) => `${Math.round(v)}%`}
          onChange={(v, opts) => {
            change({ feather: v / 100 })
            if (opts?.commit && selected) commitSoon()
          }}
          onBegin={onBegin}
          onCommit={onCommit}
        />
        <Slider
          label="Opacity"
          value={shown.opacity * 100}
          min={5}
          max={100}
          step={1}
          defaultValue={100}
          disabled={disabled}
          format={(v) => `${Math.round(v)}%`}
          onChange={(v, opts) => {
            change({ opacity: v / 100 })
            if (opts?.commit && selected) commitSoon()
          }}
          onBegin={onBegin}
          onCommit={onCommit}
        />
      </div>

      {selected ? (
        <div className="mask-card__actions">
          <button
            type="button"
            className="btn btn--sm"
            disabled={disabled}
            onClick={() => onNewSource(selected.id)}
            title="Try another place to copy from (/)"
          >
            New source
          </button>
          <button
            type="button"
            className="link-btn"
            disabled={disabled}
            onClick={() => onRemove(selected.id)}
            title="Delete spot (Delete)"
          >
            Delete spot
          </button>
        </div>
      ) : null}

      <p className="field-hint">
        {spots.length === 0
          ? 'Paint over a blemish, dust spot or small object to remove it. Click for a dot, drag for a stroke.'
          : `${spots.length} spot${spots.length === 1 ? '' : 's'}. Click a spot to select it, then drag its green outline to change where the fix comes from.`}
      </p>
    </section>
  )
}
