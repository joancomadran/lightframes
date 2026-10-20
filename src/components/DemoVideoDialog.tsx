import { useEffect } from 'react'

type DemoVideoDialogProps = {
  open: boolean
  onClose: () => void
}

/** Promo video, served from /public/video and only fetched once the dialog opens. */
export function DemoVideoDialog({ open, onClose }: DemoVideoDialogProps) {
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
    <div className="modal" role="dialog" aria-modal="true" aria-label="Lightframes demo video">
      <button type="button" className="modal__backdrop" aria-label="Close" onClick={onClose} />
      <div className="modal__card modal__card--video">
        <div className="panel__header">
          <h2 className="panel__title">Lightframes in 50 seconds</h2>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Close
          </button>
        </div>
        <video
          className="demo-video"
          src="/video/promo.mp4"
          poster="/video/promo-poster.jpg"
          controls
          autoPlay
          playsInline
        />
      </div>
    </div>
  )
}
