import { useRef, useState } from 'react'
import { useEditorLang } from '../hooks/useEditorLang'
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
  onClear?: () => void
}

const FILTER_IDS: FilmstripFilter[] = [
  'all',
  'picks',
  'unflagged',
  'rejected',
  'stars-1',
  'stars-2',
  'stars-3',
  'stars-4',
  'stars-5',
]

/** Touch has no ⌘/Shift: a long press adds a photo to the selection instead. */
const LONG_PRESS_MS = 450
const LAYOUT_KEY = 'lightframes:filmstrip-layout'

type FilmstripLayout = 'list' | 'grid'

function loadLayout(): FilmstripLayout {
  try {
    return localStorage.getItem(LAYOUT_KEY) === 'grid' ? 'grid' : 'list'
  } catch {
    return 'list'
  }
}

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
  onClear,
}: FilmstripProps) {
  const { copy } = useEditorLang()
  const strip = copy.filmstrip
  const filterLabel: Record<FilmstripFilter, string> = {
    all: strip.all,
    picks: strip.picks,
    unflagged: strip.unflagged,
    rejected: strip.rejected,
    'stars-1': '★ 1+',
    'stars-2': '★ 2+',
    'stars-3': '★ 3+',
    'stars-4': '★ 4+',
    'stars-5': '★ 5',
  }
  const pressRef = useRef<{ id: string; timer: number; x: number; y: number; fired: boolean } | null>(null)
  const [layout, setLayout] = useState(loadLayout)
  const toggleLayout = () => {
    const next = layout === 'list' ? 'grid' : 'list'
    setLayout(next)
    try {
      localStorage.setItem(LAYOUT_KEY, next)
    } catch {
      // Storage unavailable — keep the choice for this session only.
    }
  }
  const cancelPress = () => {
    if (pressRef.current) window.clearTimeout(pressRef.current.timer)
  }

  if (!visible) return null

  return (
    <aside
      className={[
        'filmstrip',
        totalCount <= 1 ? 'filmstrip--sparse' : '',
        layout === 'grid' ? 'filmstrip--grid' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={strip.title}
    >
      <div className="filmstrip__header">
        <span className="filmstrip__title">{strip.title}</span>
        <div className="filmstrip__actions">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            title={strip.folderTitle}
            onClick={(e) => onOpen({ folder: !e.altKey })}
          >
            {strip.folder}
          </button>
        </div>
      </div>

      {totalCount > 0 && (
        <div className="filmstrip__filter">
          <select
            className="field field--sm"
            value={filter}
            onChange={(e) => onFilterChange(e.target.value as FilmstripFilter)}
            aria-label={strip.show}
            title={strip.filterTitle}
          >
            {FILTER_IDS.map((id) => (
              <option key={id} value={id}>
                {filterLabel[id]}
              </option>
            ))}
          </select>
          <span className="filmstrip__count">
            {photos.length}/{totalCount}
          </span>
          <button
            type="button"
            className="btn btn--ghost btn--sm btn--icon filmstrip__layout"
            title={layout === 'list' ? strip.gridTitle : strip.listTitle}
            aria-label={layout === 'list' ? strip.grid : strip.list}
            aria-pressed={layout === 'grid'}
            onClick={toggleLayout}
          >
            {layout === 'list' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
                <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
                <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
                <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="5" y="4" width="14" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
                <rect x="5" y="13" width="14" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
              </svg>
            )}
          </button>
          {onClear && (
            <button
              type="button"
              className="btn btn--ghost btn--sm btn--icon filmstrip__clear"
              title={strip.clear}
              aria-label={strip.clear}
              onClick={onClear}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      <ul className="filmstrip__list">
        {totalCount === 0 && (
          <li>
            <button
              type="button"
              className="filmstrip__add"
              title={strip.openTitle}
              onClick={() => onOpen()}
            >
              <span className="filmstrip__add-tile" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <span className="filmstrip__add-label">{strip.addPhotos}</span>
            </button>
          </li>
        )}
        {totalCount > 0 && photos.length === 0 && (
          <li className="filmstrip__empty">{strip.noMatch}</li>
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
                aria-pressed={selected}
                title={photo.name}
                onPointerDown={(e) => {
                  if (e.pointerType === 'mouse') return
                  cancelPress()
                  const press = { id: photo.id, x: e.clientX, y: e.clientY, fired: false, timer: 0 }
                  press.timer = window.setTimeout(() => {
                    press.fired = true
                    navigator.vibrate?.(10)
                    onSelect(photo.id, { additive: true })
                  }, LONG_PRESS_MS)
                  pressRef.current = press
                }}
                onPointerMove={(e) => {
                  const press = pressRef.current
                  if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) cancelPress()
                }}
                onPointerUp={cancelPress}
                onPointerCancel={cancelPress}
                onContextMenu={(e) => {
                  if (pressRef.current?.id === photo.id) e.preventDefault()
                }}
                onClick={(e) => {
                  const press = pressRef.current
                  pressRef.current = null
                  if (press?.id === photo.id && press.fired) return
                  onSelect(photo.id, {
                    additive: e.metaKey || e.ctrlKey,
                    range: e.shiftKey,
                  })
                }}
              >
                <span className="filmstrip__thumb-wrap">
                  <img
                    src={photo.thumbnailUrl}
                    alt=""
                    className="filmstrip__thumb"
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                  />
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
