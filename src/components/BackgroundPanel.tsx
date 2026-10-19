import { useSyncExternalStore } from 'react'
import { getAiStatus, preloadModel, subscribeAi } from '../lib/ai'
import type { BackgroundEdit, BackgroundMode } from '../types/edits'
import type { RefineTool } from './RefineOverlay'
import { Slider } from './Slider'

type BackgroundPanelProps = {
  background: BackgroundEdit
  disabled?: boolean
  /** Without `commit`, the change joins the history step opened by onBegin (slider drags). */
  onChange: (background: BackgroundEdit, opts?: { commit?: boolean }) => void
  onBegin?: () => void
  onCommit?: () => void
  /** The keep / erase brush for fixing the cutout; null while it is off. */
  refine: RefineTool | null
  onRefineChange: (tool: RefineTool | null) => void
}

const MODES: { id: BackgroundMode; label: string; hint: string }[] = [
  { id: 'original', label: 'Original', hint: 'Keep the photo as it is' },
  { id: 'transparent', label: 'Remove', hint: 'Cut the subject out onto transparency (exports as PNG)' },
  { id: 'color', label: 'Color', hint: 'Put the subject on a solid colour' },
  { id: 'blur', label: 'Blur', hint: 'Keep the background but blur it, like a portrait lens' },
]

const SWATCHES = ['#ffffff', '#f2efe9', '#111111', '#e8f0fe']

/** One-click background removal; the subject is found on-device by IS-Net. */
export function BackgroundPanel({
  background,
  disabled,
  onChange,
  onBegin,
  onCommit,
  refine,
  onRefineChange,
}: BackgroundPanelProps) {
  const status = useSyncExternalStore(subscribeAi, () => getAiStatus('segment'))
  const active = background.mode !== 'original'

  const setMode = (mode: BackgroundMode) => {
    // Start fetching the model on the click, before the preview asks for it.
    if (mode !== 'original') preloadModel('segment')
    onChange({ ...background, mode }, { commit: true })
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
              onClick={() => onChange({ ...background, color }, { commit: true })}
            />
          ))}
          <label className="bg-swatch bg-swatch--custom" title="Custom colour">
            <input
              type="color"
              value={background.color}
              disabled={disabled}
              onChange={(e) => onChange({ ...background, color: e.target.value }, { commit: true })}
            />
          </label>
        </div>
      )}

      {background.mode === 'blur' && (
        <div className="bg-blur">
          <Slider
            label="Amount"
            value={background.blur}
            min={0}
            max={100}
            step={1}
            defaultValue={40}
            disabled={disabled}
            onChange={(blur, opts) => onChange({ ...background, blur }, opts)}
            onBegin={onBegin}
            onCommit={onCommit}
          />
        </div>
      )}

      {active && (
        <div className="bg-refine">
          <div className="field-row">
            <span>Fix the cutout</span>
            <span className="btn-group">
              {background.refine.length > 0 && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  disabled={disabled}
                  onClick={() => onChange({ ...background, refine: [] }, { commit: true })}
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                className={refine ? 'btn btn--ghost btn--sm btn--on heal-toggle' : 'btn btn--ghost btn--sm heal-toggle'}
                disabled={disabled}
                aria-pressed={Boolean(refine)}
                onClick={() => onRefineChange(refine ? null : { keep: true, size: 0.03 })}
              >
                Brush
              </button>
            </span>
          </div>
          {refine && (
            <>
              <div className="segmented" role="group" aria-label="Refine brush">
                {[
                  { keep: true, label: 'Keep', hint: 'Paint back parts of the subject the cutout missed' },
                  { keep: false, label: 'Erase', hint: 'Paint away background the cutout kept' },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    className={refine.keep === option.keep ? 'segmented__btn segmented__btn--active' : 'segmented__btn'}
                    aria-pressed={refine.keep === option.keep}
                    title={option.hint}
                    disabled={disabled}
                    onClick={() => onRefineChange({ ...refine, keep: option.keep })}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <Slider
                label="Size"
                value={refine.size * 100}
                min={0.5}
                max={15}
                step={0.5}
                disabled={disabled}
                format={(v) => v.toFixed(1)}
                onChange={(v) => onRefineChange({ ...refine, size: v / 100 })}
              />
              <p className="field-hint">Paint on the photo: Keep adds to the subject, Erase removes from it.</p>
            </>
          )}
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
