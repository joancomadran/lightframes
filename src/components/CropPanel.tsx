import { aspectRatioFor, type Size } from '../lib/crop'
import { ASPECT_PRESETS, createDefaultCrop, stepRotate, type EditParams } from '../types/edits'
import { Slider } from './Slider'

type CropPanelProps = {
  edits: EditParams
  disabled?: boolean
  cropMode: boolean
  onToggleCropMode: () => void
  aspectId: string
  aspectFlipped: boolean
  onAspectChange: (id: string, flipped: boolean) => void
  /** Full-resolution size of the uncropped frame, once known. */
  frameSize: Size | null
  onChange: (patch: Partial<EditParams>, opts?: { commit?: boolean }) => void
  onBegin?: () => void
  onCommit?: () => void
}

/** Largest crop with the given pixel aspect, centred on the current crop. */
function fitAspect(edits: EditParams, ratio: number, frameSize: Size): EditParams['crop'] {
  const crop = edits.crop
  const normalized = ratio / (frameSize.w / frameSize.h)
  const width = normalized >= 1 ? 1 : normalized
  const height = normalized >= 1 ? 1 / normalized : 1
  const cx = crop.x + crop.width / 2
  const cy = crop.y + crop.height / 2
  return {
    ...crop,
    width,
    height,
    x: Math.min(1 - width, Math.max(0, cx - width / 2)),
    y: Math.min(1 - height, Math.max(0, cy - height / 2)),
  }
}

const ASPECT_LABELS: Record<string, string> = { original: 'Original' }

export function CropPanel({
  edits,
  disabled,
  cropMode,
  onToggleCropMode,
  aspectId,
  aspectFlipped,
  onAspectChange,
  frameSize,
  onChange,
  onBegin,
  onCommit,
}: CropPanelProps) {
  const crop = edits.crop
  const canFlip = aspectId !== 'free' && aspectId !== '1:1'

  const selectAspect = (id: string, flipped: boolean) => {
    onAspectChange(id, flipped)
    const ratio = aspectRatioFor(id, flipped, frameSize)
    if (ratio != null && frameSize) {
      onChange({ crop: fitAspect(edits, ratio, frameSize) }, { commit: true })
    }
  }

  const outW = frameSize ? Math.round(crop.width * frameSize.w) : null
  const outH = frameSize ? Math.round(crop.height * frameSize.h) : null

  return (
    <section className="panel" aria-label="Crop and rotate">
      <div className="adjust-group">
        <div className="adjust-group__header">
          <h3 className="adjust-group__title">Crop</h3>
          <button
            type="button"
            className={cropMode ? 'btn btn--sm btn--accent' : 'btn btn--sm'}
            disabled={disabled}
            onClick={onToggleCropMode}
            title={cropMode ? 'Apply and show the cropped result' : 'Show the crop box on the image'}
          >
            {cropMode ? 'Done' : 'Edit crop'}
          </button>
        </div>

        <div className="field-row">
          <span className="field-row__label">Aspect</span>
          <button
            type="button"
            className="btn btn--ghost btn--sm btn--icon"
            disabled={disabled || !canFlip}
            onClick={() => selectAspect(aspectId, !aspectFlipped)}
            title={aspectFlipped ? 'Switch to landscape' : 'Switch to portrait'}
            aria-label="Swap orientation"
            aria-pressed={aspectFlipped}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {aspectFlipped ? (
                <rect x="7" y="3" width="10" height="18" rx="1.5" stroke="currentColor" strokeWidth="2" />
              ) : (
                <rect x="3" y="7" width="18" height="10" rx="1.5" stroke="currentColor" strokeWidth="2" />
              )}
            </svg>
          </button>
        </div>

        <div className="segmented segmented--grid" role="group" aria-label="Aspect ratio">
          {ASPECT_PRESETS.map((preset) => {
            const active = preset.id === aspectId
            const [a, b] = preset.label.split(':')
            const label =
              ASPECT_LABELS[preset.id] ?? (aspectFlipped && b && canFlip ? `${b}:${a}` : preset.label)
            return (
              <button
                key={preset.id}
                type="button"
                className={active ? 'segmented__btn segmented__btn--active' : 'segmented__btn'}
                aria-pressed={active}
                disabled={disabled}
                onClick={() => selectAspect(preset.id, preset.id === '1:1' ? false : aspectFlipped)}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div className="crop-info">
          <span>{outW && outH ? `${outW} × ${outH} px` : '—'}</span>
          <button
            type="button"
            className="link-btn"
            disabled={disabled}
            onClick={() => {
              onAspectChange('free', false)
              onChange({ crop: createDefaultCrop() }, { commit: true })
            }}
          >
            Reset crop
          </button>
        </div>
      </div>

      <div className="adjust-group">
        <div className="adjust-group__header">
          <h3 className="adjust-group__title">Rotate</h3>
          <div className="btn-group">
            <button
              type="button"
              className="btn btn--ghost btn--sm btn--icon"
              disabled={disabled}
              onClick={() => onChange({ rotate: stepRotate(edits.rotate, -90) }, { commit: true })}
              title="Rotate left"
              aria-label="Rotate left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M2.5 12a9.5 9.5 0 1 0 3.2-7.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path
                  d="M2.5 5.5v4.2h4.2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm btn--icon"
              disabled={disabled}
              onClick={() => onChange({ rotate: stepRotate(edits.rotate, 90) }, { commit: true })}
              title="Rotate right"
              aria-label="Rotate right"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21.5 12a9.5 9.5 0 1 1-3.2-7.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path
                  d="M21.5 5.5v4.2h-4.2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <Slider
          label="Straighten"
          value={crop.straighten}
          min={-45}
          max={45}
          step={0.1}
          defaultValue={0}
          disabled={disabled}
          format={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}°`}
          onChange={(straighten, opts) => onChange({ crop: { ...crop, straighten } }, opts)}
          onBegin={onBegin}
          onCommit={onCommit}
        />
      </div>

      <p className="field-hint">
        {cropMode
          ? 'Drag the box to move it, or the handles to resize.'
          : 'Press Edit crop (or R) to adjust the frame on the image.'}
      </p>
    </section>
  )
}
