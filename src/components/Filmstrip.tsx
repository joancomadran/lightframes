import type { FilmstripFilter } from '../hooks/useEditorSession'
import type { PhotoSession } from '../types/edits'
import { AdSlot } from './AdSlot'

type FilmstripProps = {
  photos: PhotoSession[]
  totalCount: number
  activeId: string | null
  selectedIds: string[]
  visible?: boolean
  filter: FilmstripFilter
  onFilterChange: (filter: FilmstripFilter) => void
  onSelect: (id: string, opts?: { additive?: boolean; range?: boolean }) => void
  onOpen: (opts?: { folder?: boolean }) => void
  onSync?: () => void
}

const FILTERS: { id: FilmstripFilter; label: string }[] = [
  { id: 'all', label: 'All photos' },
  { id: 'picks', label: 'Picks' },
  { id: 'unflagged', label: 'Unflagged' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'stars-1', label: '★ 1+' },
  { id: 'stars-2', label: '★ 2+' },
  { id: 'stars-3', label: '★ 3+' },
  { id: 'stars-4', label: '★ 4+' },
  { id: 'stars-5', label: '★ 5' },
]

export function Filmstrip({
  photos,
  totalCount,
  activeId,
  selectedIds,
  visible = true,
  filter,
  onFilterChange,
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

      {totalCount > 0 && (
        <div className="filmstrip__filter">
          <select
            className="field field--sm"
            value={filter}
            onChange={(e) => onFilterChange(e.target.value as FilmstripFilter)}
            aria-label="Show photos"
            title="Rate with 1–5, flag with P / X / U"
          >
            {FILTERS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <span className="filmstrip__count">
            {photos.length}/{totalCount}
          </span>
        </div>
      )}

      <ul className="filmstrip__list">
        {totalCount === 0 && (
          <li className="filmstrip__empty">No images yet</li>
        )}
        {totalCount > 0 && photos.length === 0 && (
          <li className="filmstrip__empty">No photos match this filter</li>
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
                  photo.flag === 'reject' ? 'filmstrip__item--rejected' : '',
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
                <span className="filmstrip__thumb-wrap">
                  <img src={photo.thumbnailUrl} alt="" className="filmstrip__thumb" />
                  {photo.flag && (
                    <span
                      className={`filmstrip__flag filmstrip__flag--${photo.flag}`}
                      title={photo.flag === 'pick' ? 'Pick' : 'Rejected'}
                    >
                      {photo.flag === 'pick' ? '✓' : '✕'}
                    </span>
                  )}
                </span>
                <span className="filmstrip__meta">
                  <span className="filmstrip__name">{photo.name}</span>
                  {photo.rating > 0 && (
                    <span className="filmstrip__stars" aria-label={`${photo.rating} stars`}>
                      {'★'.repeat(photo.rating)}
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <AdSlot id="filmstrip" height={90} />
    </aside>
  )
}
