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
}

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
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="toolbar__brand">
        <span className="brand-mark" aria-hidden="true" />
        <h1 className="brand-name">Lightframes</h1>
      </div>

      <div className="toolbar__actions">
        <button
          type="button"
          className="btn"
          title="Open images. Hold Option/Alt to open a folder."
          onClick={(e) => onOpen({ folder: e.altKey })}
        >
          Open
        </button>
        <button
          type="button"
          className="btn btn--icon"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
          aria-label="Undo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 14 4 9l5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 9h10a6 6 0 0 1 0 12h-3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m15 14 5-5-5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 9H10a6 6 0 0 0 0 12h3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className="btn"
          onClick={onCopy}
          disabled={!canEdit}
          title="Copy edits (⌘C)"
        >
          Copy
        </button>
        <button
          type="button"
          className="btn"
          onClick={onPaste}
          disabled={!canEdit || !hasClipboard}
          title="Paste edits (⌘V)"
        >
          Paste
        </button>
        <button
          type="button"
          className="btn"
          onClick={onSync}
          disabled={!canEdit || selectionCount < 2}
          title="Sync active edits to selected photos (⌘S)"
        >
          Sync
        </button>
        <button
          type="button"
          className={compareMode ? 'btn btn--accent' : 'btn'}
          onClick={onToggleCompare}
          disabled={!canEdit}
          title="Before / after (\\)"
        >
          Before
        </button>
        <button type="button" className="btn btn--accent" onClick={onExport} disabled={!canEdit}>
          Export
        </button>
      </div>

      <p className="toolbar__status" role="status">
        {status}
      </p>
    </header>
  )
}
