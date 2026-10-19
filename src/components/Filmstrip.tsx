import { useRef, useState } from 'react'
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
  onClear?: () => void
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
  onSync,
  onClear,
}: FilmstripProps) {
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
      aria-label="Filmstrip"
    >
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
          <button
            type="button"
            className="btn btn--ghost btn--sm btn--icon filmstrip__layout"
            title={layout === 'list' ? 'Show as 2-column grid' : 'Show as single column'}
            aria-label={layout === 'list' ? 'Show as grid' : 'Show as list'}
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
              title="Clear workspace"
              aria-label="Clear workspace"
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
              title="Open JPEG, PNG or RAW files"
              onClick={() => onOpen()}
            >
              <span className="filmstrip__add-tile" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <span className="filmstrip__add-label">Add photos</span>
            </button>
          </li>
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
                  <img src={photo.thumbnailUrl} alt="" className="filmstrip__thumb" draggable={false} />
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
