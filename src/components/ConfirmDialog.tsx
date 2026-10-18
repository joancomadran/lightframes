import { useEffect, type ReactNode } from 'react'

type ConfirmDialogProps = {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

/** Destructive-action confirmation; Cancel holds focus so Enter never confirms by accident. */
export function ConfirmDialog({ open, title, children, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null
  return (
    <div className="modal" role="alertdialog" aria-modal="true" aria-label={title}>
      <button type="button" className="modal__backdrop" aria-label="Cancel" onClick={onCancel} />
      <div className="modal__card">
        <h2 className="panel__title">{title}</h2>
        <div className="confirm__body">{children}</div>
        <div className="modal__actions">
          <button type="button" className="btn" autoFocus onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
