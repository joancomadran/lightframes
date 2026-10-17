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
        <button type="button" className="btn" onClick={onUndo} disabled={!canUndo}>
          Undo
        </button>
        <button type="button" className="btn" onClick={onRedo} disabled={!canRedo}>
          Redo
        </button>
        <button type="button" className="btn" onClick={onCopy} disabled={!canEdit}>
          Copy
        </button>
        <button
          type="button"
          className="btn"
          onClick={onPaste}
          disabled={!canEdit || !hasClipboard}
        >
          Paste
        </button>
        <button
          type="button"
          className="btn"
          onClick={onSync}
          disabled={!canEdit || selectionCount < 2}
          title="Sync active edits to selected photos"
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
