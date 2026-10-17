import {
  ASPECT_PRESETS,
  createDefaultCrop,
  stepRotate,
  type EditParams,
} from '../types/edits'

type CropPanelProps = {
  edits: EditParams
  disabled?: boolean
  cropMode: boolean
  onToggleCropMode: () => void
  onChange: (patch: Partial<EditParams>, opts?: { commit?: boolean }) => void
  onBegin?: () => void
  onCommit?: () => void
}

function applyAspect(edits: EditParams, ratio: number | null): EditParams['crop'] {
  const crop = { ...edits.crop }
  if (ratio == null) return crop
  const current = crop.width / Math.max(0.001, crop.height)
  if (Math.abs(current - ratio) < 0.001) return crop
  if (ratio > current) {
    const height = crop.width / ratio
    crop.y = Math.min(crop.y, 1 - height)
    crop.height = height
  } else {
    const width = crop.height * ratio
    crop.x = Math.min(crop.x, 1 - width)
    crop.width = width
  }
  return crop
}

export function CropPanel({
  edits,
  disabled,
  cropMode,
  onToggleCropMode,
  onChange,
  onBegin,
  onCommit,
}: CropPanelProps) {
  const crop = edits.crop

  return (
    <section className="panel" aria-label="Crop and rotate">
      <div className="panel__header">
        <h2 className="panel__title">Crop</h2>
        <button
          type="button"
          className={cropMode ? 'btn btn--sm btn--accent' : 'btn btn--ghost btn--sm'}
          disabled={disabled}
          onClick={onToggleCropMode}
        >
          {cropMode ? 'Editing' : 'Edit'}
        </button>
      </div>

      <div className="chip-row">
        {ASPECT_PRESETS.filter((p) => p.id !== 'original').map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="chip"
            disabled={disabled}
            onClick={() => {
              onBegin?.()
              onChange({ crop: applyAspect(edits, preset.ratio) }, { commit: true })
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <label className="slider">
        <span className="slider__meta">
          <span>Straighten</span>
          <span className="slider__value">{crop.straighten.toFixed(1)}°</span>
        </span>
        <input
          type="range"
          min={-45}
          max={45}
          step={0.1}
          value={crop.straighten}
          disabled={disabled}
          onPointerDown={() => onBegin?.()}
          onPointerUp={() => onCommit?.()}
          onChange={(e) =>
            onChange({ crop: { ...crop, straighten: Number(e.target.value) } })
          }
        />
      </label>

      <label className="slider">
        <span className="slider__meta">
          <span>Left</span>
          <span className="slider__value">{Math.round(crop.x * 100)}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={0.9}
          step={0.01}
          value={crop.x}
          disabled={disabled}
          onPointerDown={() => onBegin?.()}
          onPointerUp={() => onCommit?.()}
          onChange={(e) => {
            const x = Number(e.target.value)
            const width = Math.min(crop.width, 1 - x)
            onChange({ crop: { ...crop, x, width } })
          }}
        />
      </label>

      <label className="slider">
        <span className="slider__meta">
          <span>Top</span>
          <span className="slider__value">{Math.round(crop.y * 100)}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={0.9}
          step={0.01}
          value={crop.y}
          disabled={disabled}
          onPointerDown={() => onBegin?.()}
          onPointerUp={() => onCommit?.()}
          onChange={(e) => {
            const y = Number(e.target.value)
            const height = Math.min(crop.height, 1 - y)
            onChange({ crop: { ...crop, y, height } })
          }}
        />
      </label>

      <label className="slider">
        <span className="slider__meta">
          <span>Width</span>
          <span className="slider__value">{Math.round(crop.width * 100)}%</span>
        </span>
        <input
          type="range"
          min={0.05}
          max={1}
          step={0.01}
          value={crop.width}
          disabled={disabled}
          onPointerDown={() => onBegin?.()}
          onPointerUp={() => onCommit?.()}
          onChange={(e) => {
            const width = Number(e.target.value)
            onChange({
              crop: { ...crop, width, x: Math.min(crop.x, 1 - width) },
            })
          }}
        />
      </label>

      <label className="slider">
        <span className="slider__meta">
          <span>Height</span>
          <span className="slider__value">{Math.round(crop.height * 100)}%</span>
        </span>
        <input
          type="range"
          min={0.05}
          max={1}
          step={0.01}
          value={crop.height}
          disabled={disabled}
          onPointerDown={() => onBegin?.()}
          onPointerUp={() => onCommit?.()}
          onChange={(e) => {
            const height = Number(e.target.value)
            onChange({
              crop: { ...crop, height, y: Math.min(crop.y, 1 - height) },
            })
          }}
        />
      </label>

      <div className="chip-row">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          disabled={disabled}
          onClick={() =>
            onChange({ rotate: stepRotate(edits.rotate, -90) }, { commit: true })
          }
        >
          Rotate left
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          disabled={disabled}
          onClick={() =>
            onChange({ rotate: stepRotate(edits.rotate, 90) }, { commit: true })
          }
        >
          Rotate right
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          disabled={disabled}
          onClick={() => onChange({ crop: createDefaultCrop() }, { commit: true })}
        >
          Reset crop
        </button>
      </div>
    </section>
  )
}
