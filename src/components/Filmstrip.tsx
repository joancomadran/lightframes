import type { PhotoSession } from '../types/edits'
import { AdSlot } from './AdSlot'

type FilmstripProps = {
  photos: PhotoSession[]
  activeId: string | null
  selectedIds: string[]
  visible?: boolean
  onSelect: (id: string, opts?: { additive?: boolean; range?: boolean }) => void
  onOpen: (opts?: { folder?: boolean }) => void
  onSync?: () => void
}

export function Filmstrip({
  photos,
  activeId,
  selectedIds,
  visible = true,
  onSelect,
  onOpen,
  onSync,
}: FilmstripProps) {
  if (!visible) return null

  return (
    <aside className="filmstrip" aria-label="Filmstrip">
      <div className="filmstrip__header">
        <span className="filmstrip__title">Filmstrip</span>
        <div className="filmstrip__actions">
          {onSync && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              title="Sync active edits to selection (Ctrl/Cmd+S)"
              disabled={selectedIds.length < 2}
              onClick={onSync}
            >
              Sync
            </button>
          )}
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            title="Open a folder of images. Hold Option/Alt for the file picker."
            onClick={(e) => onOpen({ folder: !e.altKey })}
          >
            Folder
          </button>
        </div>
      </div>

      <ul className="filmstrip__list">
        {photos.length === 0 && (
          <li className="filmstrip__empty">No images yet</li>
        )}
        {photos.map((photo) => {
          const selected = selectedIds.includes(photo.id)
          const active = photo.id === activeId
          return (
            <li key={photo.id}>
              <button
                type="button"
                className={[
                  'filmstrip__item',
                  active ? 'filmstrip__item--active' : '',
                  selected ? 'filmstrip__item--selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={(e) =>
                  onSelect(photo.id, {
                    additive: e.metaKey || e.ctrlKey,
                    range: e.shiftKey,
                  })
                }
              >
                <img src={photo.thumbnailUrl} alt="" className="filmstrip__thumb" />
                <span className="filmstrip__name">{photo.name}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <AdSlot id="filmstrip" height={90} />
    </aside>
  )
}
