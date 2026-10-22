import { useEffect } from 'react'
import { AMAZON_DISCLOSURE, GEAR, amazonUrl } from '../lib/affiliate'

type GearDialogProps = {
  open: boolean
  onClose: () => void
}

/** Affiliate picks for photographers. Plain outbound links: nothing loads from Amazon until a click. */
export function GearDialog({ open, onClose }: GearDialogProps) {
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
    <div className="modal" role="dialog" aria-modal="true" aria-label="Recommended gear">
      <button type="button" className="modal__backdrop" aria-label="Close" onClick={onClose} />
      <div className="modal__card modal__card--wide">
        <div className="panel__header">
          <h2 className="panel__title">Recommended gear</h2>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="gear">
          {GEAR.map((group) => (
            <section key={group.title} className="gear__section">
              <h3 className="adjust-group__title">{group.title}</h3>
              <ul className="gear__list">
                {group.items.map((item) => (
                  <li key={item.title}>
                    <a
                      className="gear__item"
                      href={amazonUrl(item)}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                    >
                      <span className="gear__title">{item.title}</span>
                      <span className="gear__detail">{item.detail}</span>
                      <span className="gear__go" aria-hidden="true">
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="gear__note">Affiliate links to Amazon.es. {AMAZON_DISCLOSURE}</p>
      </div>
    </div>
  )
}
