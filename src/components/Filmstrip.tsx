import type { PhotoSession } from '../types/edits'
import { AdSlot } from './AdSlot'

type FilmstripProps = {
  photos: PhotoSession[]
  activeId: string | null
  onSelect: (id: string) => void
  onOpen: () => void
}

export function Filmstrip({ photos, activeId, onSelect, onOpen }: FilmstripProps) {
  return (
    <aside className="filmstrip" aria-label="Filmstrip">
      <div className="filmstrip__header">
        <span className="filmstrip__title">Filmstrip</span>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onOpen}>
          Open
        </button>
      </div>

      <ul className="filmstrip__list">
        {photos.length === 0 && (
          <li className="filmstrip__empty">No images yet</li>
        )}
        {photos.map((photo) => (
          <li key={photo.id}>
            <button
              type="button"
              className={
                photo.id === activeId
                  ? 'filmstrip__item filmstrip__item--active'
                  : 'filmstrip__item'
              }
              onClick={() => onSelect(photo.id)}
            >
              <img src={photo.thumbnailUrl} alt="" className="filmstrip__thumb" />
              <span className="filmstrip__name">{photo.name}</span>
            </button>
          </li>
        ))}
      </ul>

      <AdSlot id="filmstrip" height={90} />
    </aside>
  )
}
