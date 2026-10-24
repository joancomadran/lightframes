import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { AppLoader } from './AppMark'

type ToolbarProps = {
  mode: ToolbarMode
  onModeChange: (mode: ToolbarMode) => void
  canExport: boolean
  canEdit: boolean
  canPaste: boolean
  canUndo: boolean
  canRedo: boolean
  status: string
  selectionCount: number
  onOpen: (opts?: { folder?: boolean }) => void
  onUndo: () => void
  onRedo: () => void
  onCopy: () => void
  onPaste: () => void
  onExport: () => void
  onShowShortcuts: () => void
  onClearWorkspace: () => void
}

type ToolbarMode = 'edit' | 'collage'

const MODES: { id: ToolbarMode; label: string; title: string; icon: ReactNode }[] = [
  {
    id: 'edit',
    label: 'Edit',
    title: 'Develop and retouch photos',
    icon: (
      <>
        <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" />
        <circle cx="15" cy="6" r="2" />
        <circle cx="9" cy="12" r="2" />
        <circle cx="17" cy="18" r="2" />
      </>
    ),
  },
  {
    id: 'collage',
    label: 'Collage',
    title: 'Instagram collages',
    icon: (
      <>
        <rect x="3" y="3" width="8" height="18" rx="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" />
      </>
    ),
  },
]

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
  mode,
  onModeChange,
  canExport,
  canEdit,
  canPaste,
  canUndo,
  canRedo,
  status,
  selectionCount,
  onOpen,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onExport,
  onShowShortcuts,
  onClearWorkspace,
}: ToolbarProps) {
  const editing = mode === 'edit'
  const { state: installState, install } = useInstallPrompt()
  const [menuOpen, setMenuOpen] = useState(false)
  // The launch hint duplicates the empty state, so the compact status chip skips it.
  const [initialStatus] = useState(status)
  // Every in-progress message ("Restoring 3 images…", "Exporting…") carries an ellipsis.
  const busy = status.includes('…')
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
    <header className={editing && !canEdit ? 'toolbar toolbar--empty' : 'toolbar'}>
      <div className="toolbar__brand">
        <span className="brand-mark" aria-hidden="true" />
        <h1 className="brand-name">Lightframes</h1>
        <div className="mode-switch" role="tablist" aria-label="Mode">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              className={mode === m.id ? 'mode-switch__btn mode-switch__btn--active' : 'mode-switch__btn'}
              title={m.title}
              onClick={() => onModeChange(m.id)}
            >
              <svg {...iconProps} width={16} height={16}>
                {m.icon}
              </svg>
              <span className="mode-switch__label">{m.label}</span>
            </button>
          ))}
        </div>
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
        {editing && (
          <>
            <span className="toolbar__group toolbar__history">
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
            <span className="toolbar__group toolbar__secondary">
              <button
                type="button"
                className="btn btn--icon"
                onClick={onCopy}
                disabled={!canEdit}
                title="Copy edits (⌘C)"
                aria-label="Copy edits"
              >
                <svg {...iconProps}>
                  <rect x="8" y="8" width="13" height="13" rx="2" />
                  <path d="M4 16a2 2 0 0 1-1-1.73V5a2 2 0 0 1 2-2h9.27A2 2 0 0 1 16 4" />
                </svg>
              </button>
              <button
                type="button"
                className="btn btn--icon"
                onClick={onPaste}
                disabled={!canEdit || !canPaste}
                title="Paste edits to the selection, choosing which settings (⌘V)"
                aria-label="Paste edits"
              >
                <svg {...iconProps}>
                  <rect x="8" y="2" width="8" height="4" rx="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                </svg>
              </button>
            </span>

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
                    disabled={!canEdit || !canPaste}
                    onClick={menuAction(onPaste)}
                  >
                    Paste edits…
                    {selectionCount > 1 && <span className="menu__hint">{selectionCount}</span>}
                  </button>
                  <a
                    role="menuitem"
                    className="menu__item"
                    href="https://github.com/joancomadran/lightframes"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMenuOpen(false)}
                  >
                    Star on GitHub
                    <svg className="menu__star" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M8 .25a.75.75 0 0 1 .67.42l1.88 3.8 4.2.61a.75.75 0 0 1 .41 1.28l-3.04 2.96.72 4.18a.75.75 0 0 1-1.09.79L8 12.31l-3.75 1.98a.75.75 0 0 1-1.09-.79l.72-4.18L.84 6.36a.75.75 0 0 1 .41-1.28l4.2-.61L7.33.67A.75.75 0 0 1 8 .25z" />
                    </svg>
                  </a>
                  {installState.kind === 'prompt' && (
                    <button
                      type="button"
                      role="menuitem"
                      className="menu__item"
                      onClick={menuAction(() => void install())}
                    >
                      Install app
                    </button>
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    className="menu__item menu__item--danger"
                    disabled={!canEdit}
                    onClick={menuAction(onClearWorkspace)}
                  >
                    Clear workspace…
                  </button>
                  <p className="menu__note">Long-press thumbnails to select several photos.</p>
                </div>
              )}
            </div>
          </>
        )}

        <button type="button" className="btn btn--accent" onClick={onExport} disabled={!canExport}>
          Export
        </button>
        <button
          type="button"
          className="btn btn--icon toolbar__secondary toolbar__keyboard"
          hidden={!editing}
          onClick={onShowShortcuts}
          title="Keyboard shortcuts (?)"
          aria-label="Keyboard shortcuts"
        >
          <svg {...iconProps}>
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M7 15h10" />
          </svg>
        </button>
      </div>

      <p
        key={status}
        className={[
          'toolbar__status',
          status === initialStatus && 'toolbar__status--initial',
          busy && 'toolbar__status--busy',
        ].filter(Boolean).join(' ')}
        role="status"
        aria-busy={busy}
      >
        {busy && <AppLoader />}
        <span className="toolbar__status-text">{status}</span>
      </p>
    </header>
  )
}
