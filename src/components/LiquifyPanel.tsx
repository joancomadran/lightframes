import type { LiquifyMode } from '../types/edits'
import type { LiquifyTool } from './LiquifyOverlay'
import { Slider } from './Slider'

type LiquifyPanelProps = {
  strokeCount: number
  disabled?: boolean
  tool: LiquifyTool
  onToolChange: (tool: LiquifyTool) => void
  onClear: () => void
  /** The size slider moved: show the brush size on the photo for a moment. */
  onSizePreview: () => void
}

const MODES: { id: LiquifyMode; label: string; hint: string }[] = [
  { id: 'push', label: 'Push', hint: 'Drag to push pixels along with the brush' },
  { id: 'bloat', label: 'Bloat', hint: 'Hold to enlarge what is under the brush (Alt: pinch)' },
  { id: 'pinch', label: 'Pinch', hint: 'Hold to shrink what is under the brush (Alt: bloat)' },
  { id: 'twirl', label: 'Twirl', hint: 'Hold to spin clockwise (Alt: counterclockwise)' },
  { id: 'restore', label: 'Restore', hint: 'Paint to ease the warp back to the original' },
]

const HINTS: Record<LiquifyMode, string> = {
  push: 'Drag across the photo to push pixels around: slim, straighten or nudge shapes.',
  bloat: 'Click and hold to enlarge what is under the brush; drag to keep going. Alt pinches instead.',
  pinch: 'Click and hold to shrink what is under the brush; drag to keep going. Alt bloats instead.',
  twirl: 'Click and hold to spin what is under the brush clockwise. Alt turns it the other way.',
  twirlLeft: 'Click and hold to spin what is under the brush counterclockwise.',
  restore: 'Paint over a warped area to ease it back towards the original.',
}

export function LiquifyPanel({ strokeCount, disabled, tool, onToolChange, onClear, onSizePreview }: LiquifyPanelProps) {
  const change = (patch: Partial<LiquifyTool>) => onToolChange({ ...tool, ...patch })

  return (
    <section className="panel" aria-label="Liquify">
      <div className="adjust-group__header heal-header">
        <h3 className="adjust-group__title">Liquify</h3>
        {strokeCount > 0 && (
          <button type="button" className="btn btn--ghost btn--sm" disabled={disabled} onClick={onClear}>
            Reset all
          </button>
        )}
      </div>

      <div className="brush-tools">
        <div className="segmented" role="group" aria-label="Liquify brush">
          {MODES.map((mode) => {
            const active = tool.mode === mode.id || (mode.id === 'twirl' && tool.mode === 'twirlLeft')
            return (
              <button
                key={mode.id}
                type="button"
                className={active ? 'segmented__btn segmented__btn--active' : 'segmented__btn'}
                aria-pressed={active}
                disabled={disabled}
                title={mode.hint}
                onClick={() => change({ mode: mode.id })}
              >
                {mode.label}
              </button>
            )
          })}
        </div>
        <Slider
          label="Size"
          value={tool.size * 100}
          min={1}
          max={40}
          step={0.5}
          defaultValue={8}
          disabled={disabled}
          format={(v) => v.toFixed(1)}
          onChange={(v) => {
            change({ size: v / 100 })
            onSizePreview()
          }}
        />
        <Slider
          label="Strength"
          value={tool.strength * 100}
          min={5}
          max={100}
          step={1}
          defaultValue={50}
          disabled={disabled}
          format={(v) => `${Math.round(v)}%`}
          onChange={(v) => change({ strength: v / 100 })}
        />
      </div>

      <p className="field-hint">{HINTS[tool.mode]}</p>
      <p className="field-hint">
        {strokeCount === 0
          ? 'A big, soft brush gives the most natural result. Each stroke is one undo step.'
          : `${strokeCount} stroke${strokeCount === 1 ? '' : 's'}. Undo removes the last one; Reset all brings back the original shape.`}
      </p>
    </section>
  )
}
