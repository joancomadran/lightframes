import { useSyncExternalStore } from 'react'
import { getAiStatus, preloadModel, subscribeAi } from '../lib/ai'
import type { BackgroundEdit, BackgroundMode } from '../types/edits'

type BackgroundPanelProps = {
  background: BackgroundEdit
  disabled?: boolean
  onChange: (background: BackgroundEdit) => void
}

const MODES: { id: BackgroundMode; label: string; hint: string }[] = [
  { id: 'original', label: 'Original', hint: 'Keep the photo as it is' },
  { id: 'transparent', label: 'Remove', hint: 'Cut the subject out onto transparency (exports as PNG)' },
  { id: 'color', label: 'Color', hint: 'Put the subject on a solid colour' },
]

const SWATCHES = ['#ffffff', '#f2efe9', '#111111', '#e8f0fe']

/** One-click background removal; the subject is found on-device by IS-Net. */
export function BackgroundPanel({ background, disabled, onChange }: BackgroundPanelProps) {
  const status = useSyncExternalStore(subscribeAi, () => getAiStatus('segment'))
  const active = background.mode !== 'original'

  const setMode = (mode: BackgroundMode) => {
    // Start fetching the model on the click, before the preview asks for it.
    if (mode !== 'original') preloadModel('segment')
    onChange({ ...background, mode })
  }

  return (
    <section className="panel" aria-label="Background">
      <div className="adjust-group__header heal-header">
        <h3 className="adjust-group__title">Background</h3>
      </div>

      <div className="segmented" role="group" aria-label="Background">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={background.mode === mode.id ? 'segmented__btn segmented__btn--active' : 'segmented__btn'}
            aria-pressed={background.mode === mode.id}
            disabled={disabled}
            title={mode.hint}
            onClick={() => setMode(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {background.mode === 'color' && (
        <div className="bg-swatches" role="group" aria-label="Background colour">
          {SWATCHES.map((color) => (
            <button
              key={color}
              type="button"
              className={background.color === color ? 'bg-swatch bg-swatch--active' : 'bg-swatch'}
              style={{ background: color }}
              disabled={disabled}
              aria-label={color}
              aria-pressed={background.color === color}
              onClick={() => onChange({ ...background, color })}
            />
          ))}
          <label className="bg-swatch bg-swatch--custom" title="Custom colour">
            <input
              type="color"
              value={background.color}
              disabled={disabled}
              onChange={(e) => onChange({ ...background, color: e.target.value })}
            />
          </label>
        </div>
      )}

      {active && status.phase !== 'idle' && (
        <p
          className={status.phase === 'error' ? 'field-hint heal-status heal-status--error' : 'field-hint heal-status'}
          role="status"
        >
          {status.phase === 'downloading'
            ? `Downloading the background model (45 MB, once)… ${Math.round(status.progress * 100)}%`
            : status.phase === 'working'
              ? 'Finding the subject…'
              : `Background removal failed: ${status.message}`}
        </p>
      )}

      <p className="field-hint heal-credit">
        {active
          ? 'Works best with one clear subject. Uses '
          : 'Cut the subject out in one click. Runs on your device; your photo is never uploaded. Uses '}
        <a href="https://github.com/xuebinqin/DIS" target="_blank" rel="noreferrer">
          IS-Net
        </a>{' '}
        (Apache-2.0).
      </p>
    </section>
  )
}
