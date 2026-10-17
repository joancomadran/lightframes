type ToolbarProps = {
  canEdit: boolean
  hasClipboard: boolean
  status: string
  onOpen: (opts?: { folder?: boolean }) => void
  onCopy: () => void
  onPaste: () => void
  onExport: () => void
}

export function Toolbar({
  canEdit,
  hasClipboard,
  status,
  onOpen,
  onCopy,
  onPaste,
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
          Open images
        </button>
        <button type="button" className="btn" onClick={onCopy} disabled={!canEdit}>
          Copy edits
        </button>
        <button
          type="button"
          className="btn"
          onClick={onPaste}
          disabled={!canEdit || !hasClipboard}
        >
          Paste edits
        </button>
        <button type="button" className="btn btn--accent" onClick={onExport} disabled={!canEdit}>
          Export JPEG
        </button>
      </div>

      <p className="toolbar__status" role="status">
        {status}
      </p>
    </header>
  )
}
