import { useEffect, useRef, useState } from 'react'

type ToolbarProps = {
  canEdit: boolean
  hasClipboard: boolean
  canUndo: boolean
  canRedo: boolean
  compareMode: boolean
  status: string
  selectionCount: number
  onOpen: (opts?: { folder?: boolean }) => void
  onUndo: () => void
  onRedo: () => void
  onCopy: () => void
  onPaste: () => void
  onSync: () => void
  onToggleCompare: () => void
  onExport: () => void
  onShowShortcuts: () => void
}

const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

export function Toolbar({
  canEdit,
  hasClipboard,
  canUndo,
  canRedo,
  compareMode,
  status,
  selectionCount,
  onOpen,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onSync,
  onToggleCompare,
  onExport,
  onShowShortcuts,
}: ToolbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  // The launch hint duplicates the empty state, so the compact status chip skips it.
  const [initialStatus] = useState(status)
  const menuRef = useRef<HTMLDivElement>(null)

  // The overflow menu closes on any outside press or Escape.
  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const menuAction = (action: () => void) => () => {
    setMenuOpen(false)
    action()
  }

  return (
    <header className="toolbar">
      <div className="toolbar__brand">
        <span className="brand-mark" aria-hidden="true" />
        <h1 className="brand-name">Lightframes</h1>
      </div>

      <div className="toolbar__actions">
        <button
          type="button"
          className="btn btn--labelled"
          title="Open images. Hold Option/Alt to open a folder."
          onClick={(e) => onOpen({ folder: e.altKey })}
        >
          <svg {...iconProps} className="btn__icon">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="btn__label">Open</span>
        </button>
        <span className="toolbar__group">
          <button
            type="button"
            className="btn btn--icon"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (⌘Z)"
            aria-label="Undo"
          >
            <svg {...iconProps}>
              <path d="M9 14 4 9l5-5" />
              <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
            </svg>
          </button>
          <button
            type="button"
            className="btn btn--icon"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (⇧⌘Z)"
            aria-label="Redo"
          >
            <svg {...iconProps}>
              <path d="m15 14 5-5-5-5" />
              <path d="M20 9H10a6 6 0 0 0 0 12h3" />
            </svg>
          </button>
        </span>
        <button
          type="button"
          className="btn toolbar__secondary"
          onClick={onCopy}
          disabled={!canEdit}
          title="Copy edits (⌘C)"
        >
          Copy
        </button>
        <button
          type="button"
          className="btn toolbar__secondary"
          onClick={onPaste}
          disabled={!canEdit || !hasClipboard}
          title="Paste edits (⌘V)"
        >
          Paste
        </button>
        <button
          type="button"
          className="btn toolbar__secondary"
          onClick={onSync}
          disabled={!canEdit || selectionCount < 2}
          title="Sync active edits to selected photos (⌘S)"
        >
          Sync
        </button>
        <button
          type="button"
          className={compareMode ? 'btn btn--labelled btn--accent' : 'btn btn--labelled'}
          onClick={onToggleCompare}
          disabled={!canEdit}
          title="Before / after (\\)"
          aria-pressed={compareMode}
        >
          <svg {...iconProps} className="btn__icon">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M12 4v16" />
          </svg>
          <span className="btn__label">Before</span>
        </button>

        <div className="toolbar__more" ref={menuRef}>
          <button
            type="button"
            className="btn btn--icon"
            aria-label="More actions"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg {...iconProps}>
              <circle cx="5" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="19" cy="12" r="1" fill="currentColor" />
            </svg>
          </button>
          {menuOpen && (
            <div className="menu" role="menu" aria-label="More actions">
              <button
                type="button"
                role="menuitem"
                className="menu__item"
                disabled={!canEdit}
                onClick={menuAction(onCopy)}
              >
                Copy edits
              </button>
              <button
                type="button"
                role="menuitem"
                className="menu__item"
                disabled={!canEdit || !hasClipboard}
                onClick={menuAction(onPaste)}
              >
                Paste edits
              </button>
              <button
                type="button"
                role="menuitem"
                className="menu__item"
                disabled={!canEdit || selectionCount < 2}
                onClick={menuAction(onSync)}
              >
                Sync to selection
                {selectionCount > 1 && <span className="menu__hint">{selectionCount}</span>}
              </button>
              <p className="menu__note">Long-press thumbnails to select several photos.</p>
            </div>
          )}
        </div>

        <button type="button" className="btn btn--accent" onClick={onExport} disabled={!canEdit}>
          Export
        </button>
        <button
          type="button"
          className="btn btn--icon toolbar__secondary toolbar__keyboard"
          onClick={onShowShortcuts}
          title="Keyboard shortcuts (?)"
          aria-label="Keyboard shortcuts"
        >
          ?
        </button>
      </div>

      <p
        key={status}
        className={status === initialStatus ? 'toolbar__status toolbar__status--initial' : 'toolbar__status'}
        role="status"
      >
        {status}
      </p>
    </header>
  )
}
