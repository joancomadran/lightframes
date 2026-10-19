import { useEffect } from 'react'

type ShortcutsDialogProps = {
  open: boolean
  onClose: () => void
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const MOD = isMac ? '⌘' : 'Ctrl'

const SECTIONS: { title: string; items: [string, string][] }[] = [
  {
    title: 'Edit',
    items: [
      [`${MOD} Z`, 'Undo'],
      [`⇧ ${MOD} Z`, 'Redo'],
      [`${MOD} C`, 'Copy edits'],
      [`${MOD} V`, 'Paste edits to selection (choose settings)'],
      [`${MOD} E`, 'Export'],
      ['W', 'White balance picker'],
      ['R', 'Crop'],
      ['Q', 'Retouch: spots & background'],
      ['H', 'Show / hide spot outlines'],
    ],
  },
  {
    title: 'Masks',
    items: [
      ['M', 'New linear mask'],
      ['⇧ M', 'New radial mask'],
      ['K', 'New brush mask'],
      ['⇧ K', 'New subject mask (AI)'],
      ['O', 'Show / hide mask tint'],
      ['Alt + drag', 'Erase while brushing'],
    ],
  },
  {
    title: 'View',
    items: [
      ['\\', 'Before (whole image)'],
      ['Y', 'Before / after split'],
      ['J', 'Clipping overlay'],
      ['F', 'Full screen'],
      ['B', 'Black / white background'],
      ['G', 'Show / hide filmstrip'],
      ['⇧ 1 … 8', 'Switch panel'],
    ],
  },
  {
    title: 'Library',
    items: [
      ['1 … 5', 'Rate stars'],
      ['0', 'Clear rating'],
      ['P / X / U', 'Pick / reject / unflag'],
      ['[ ]  or  ↑ ↓', 'Previous / next photo'],
      [`${MOD} A`, 'Select all'],
      ['?', 'This list'],
    ],
  },
]

export function ShortcutsDialog({ open, onClose }: ShortcutsDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <button type="button" className="modal__backdrop" aria-label="Close" onClick={onClose} />
      <div className="modal__card modal__card--wide">
        <div className="panel__header">
          <h2 className="panel__title">Keyboard shortcuts</h2>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="shortcuts">
          {SECTIONS.map((section) => (
            <section key={section.title} className="shortcuts__section">
              <h3 className="adjust-group__title">{section.title}</h3>
              <dl className="shortcuts__list">
                {section.items.map(([keys, label]) => (
                  <div key={keys} className="shortcuts__row">
                    <dt>
                      <kbd>{keys}</kbd>
                    </dt>
                    <dd>{label}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
