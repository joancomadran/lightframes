import { useEffect, useState } from 'react'
import { DEFAULT_PASTE_GROUPS, PASTE_GROUPS, type PasteGroupId } from '../lib/pasteEdits'

type PasteDialogProps = {
  open: boolean
  sourceName: string
  targetCount: number
  initial: PasteGroupId[]
  onPaste: (groups: PasteGroupId[]) => void
  onCancel: () => void
}

/** Pick which groups of settings to paste onto the target photos, like Lightroom's Sync Settings. */
export function PasteDialog({ open, ...props }: PasteDialogProps) {
  // Mounted per opening, so the choices start from the last ones used.
  return open ? <PasteDialogCard {...props} /> : null
}

function PasteDialogCard({ sourceName, targetCount, initial, onPaste, onCancel }: Omit<PasteDialogProps, 'open'>) {
  const [groups, setGroups] = useState(initial)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const toggle = (id: PasteGroupId) =>
    setGroups((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]))
  const allOn = groups.length === PASTE_GROUPS.length

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Paste edits">
      <button type="button" className="modal__backdrop" aria-label="Cancel" onClick={onCancel} />
      <form
        className="modal__card"
        onSubmit={(e) => {
          e.preventDefault()
          if (groups.length > 0) onPaste(groups)
        }}
      >
        <h2 className="panel__title">Paste edits</h2>
        <p className="paste__summary">
          From <strong>{sourceName}</strong> to {targetCount} photo{targetCount === 1 ? '' : 's'}
        </p>
        <div className="paste__groups">
          {PASTE_GROUPS.map((group) => (
            <label key={group.id} className="check paste__check">
              <input type="checkbox" checked={groups.includes(group.id)} onChange={() => toggle(group.id)} />
              {group.label}
            </label>
          ))}
        </div>
        <div className="paste__quick">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setGroups(allOn ? [] : PASTE_GROUPS.map((g) => g.id))}
          >
            {allOn ? 'None' : 'All'}
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setGroups(DEFAULT_PASTE_GROUPS)}>
            Defaults
          </button>
        </div>
        <div className="modal__actions">
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn--accent" autoFocus disabled={groups.length === 0}>
            Paste
          </button>
        </div>
      </form>
    </div>
  )
}
