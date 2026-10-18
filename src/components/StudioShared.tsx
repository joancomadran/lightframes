import type { PhotoSession } from '../types/edits'
import { PHOTO_MIME, SWATCH_COLORS, type StudioFormat, type useSlideExport } from '../hooks/useStudio'

export function ExportStatus({
  progress,
  ready,
  onSave,
  onShare,
}: Pick<ReturnType<typeof useSlideExport>, 'progress' | 'ready'> & { onSave: () => void; onShare: () => void }) {
  if (!progress && !ready) return null
  return (
    <div className="collage-ready" role="status">
      {progress ? (
        <span>Rendering… {Math.round((progress.done / Math.max(1, progress.total)) * 100)}%</span>
      ) : (
        <>
          <span>{ready!.length > 1 ? `${ready!.length} slides ready` : 'Image ready'}</span>
          <button type="button" className="btn btn--sm" onClick={onSave}>
            Save
          </button>
          <button type="button" className="btn btn--sm btn--accent" onClick={onShare}>
            Share
          </button>
        </>
      )}
    </div>
  )
}

export function FormatSwitch({ format, onChange }: { format: StudioFormat; onChange: (format: StudioFormat) => void }) {
  return (
    <div className="adjust-group">
      <div className="adjust-group__header">
        <h3 className="adjust-group__title">Format</h3>
      </div>
      <div className="segmented" role="group" aria-label="Format">
        {(
          [
            ['collage', 'Collage', 'Grids of photos, one or more slides'],
            ['carousel', 'Carousel', 'One seamless picture that continues across slides'],
          ] as const
        ).map(([id, label, title]) => (
          <button
            key={id}
            type="button"
            className={format === id ? 'segmented__btn segmented__btn--active' : 'segmented__btn'}
            aria-pressed={format === id}
            title={title}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ColorSwatches({
  value,
  label,
  onChange,
}: {
  value: string
  label: string
  onChange: (color: string) => void
}) {
  return (
    <span className="collage-swatches">
      {SWATCH_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className={color === value.toLowerCase() ? 'collage-swatch collage-swatch--active' : 'collage-swatch'}
          style={{ background: color }}
          aria-label={`${label} ${color}`}
          aria-pressed={color === value.toLowerCase()}
          onClick={() => onChange(color)}
        />
      ))}
      <input
        type="color"
        className="collage-swatch collage-swatch--custom"
        value={value}
        aria-label={`Custom ${label.toLowerCase()}`}
        onChange={(e) => onChange(e.target.value)}
      />
    </span>
  )
}

/** The photos column: tap to place, or drag onto the canvas. */
export function PhotoTray({
  photos,
  usedIds,
  onPick,
  onOpen,
  pickTitle,
}: {
  photos: PhotoSession[]
  usedIds: Set<string>
  onPick: (photoId: string) => void
  onOpen: () => void
  pickTitle: string
}) {
  return (
    <aside className="filmstrip collage-tray" aria-label="Photos">
      <div className="filmstrip__header">
        <span className="filmstrip__title">Photos</span>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onOpen}>
          Add
        </button>
      </div>
      <ul className="filmstrip__list">
        {photos.length === 0 && <li className="filmstrip__empty">Open photos to get started</li>}
        {photos.map((photo) => {
          const used = usedIds.has(photo.id)
          return (
            <li key={photo.id}>
              <button
                type="button"
                className={used ? 'filmstrip__item collage-tray__item--used' : 'filmstrip__item'}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(PHOTO_MIME, photo.id)
                  e.dataTransfer.effectAllowed = 'copy'
                }}
                onClick={() => onPick(photo.id)}
                title={pickTitle}
              >
                <span className="filmstrip__thumb-wrap">
                  <img src={photo.thumbnailUrl} alt="" className="filmstrip__thumb" draggable={false} />
                  {used && (
                    <span className="collage-tray__badge" aria-label="In use">
                      ✓
                    </span>
                  )}
                </span>
                <span className="filmstrip__meta">
                  <span className="filmstrip__name">{photo.name}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
