import { useEffect, useState, type ReactNode } from 'react'
import { PANELS, type PanelId } from '../hooks/useEditorSession'
import { PanelIcon } from './PanelIcon'

type PhoneDockProps = {
  activePanel: PanelId
  /** Whether the tool sheet under the photo is showing. */
  sheetOpen: boolean
  photoCount: number
  /** The filmstrip, shown in the tray the photos button unfolds. */
  filmstrip: ReactNode
  onSelectPanel: (id: PanelId) => void
}

/**
 * Phone controls floating over the photo: a photos button bottom-left that unfolds the filmstrip,
 * and a brush button bottom-right that opens the list of editing tools.
 */
export function PhoneDock({ activePanel, sheetOpen, photoCount, filmstrip, onSelectPanel }: PhoneDockProps) {
  const [open, setOpen] = useState<'tools' | 'photos' | null>(null)
  const toggle = (which: 'tools' | 'photos') => setOpen((v) => (v === which ? null : which))

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="phone-dock">
      {/* Any tap outside the tool list closes it instead of reaching the photo. */}
      {open === 'tools' && (
        <button type="button" className="phone-dock__scrim" aria-label="Close tools" onClick={() => setOpen(null)} />
      )}

      {open === 'photos' && <div className="phone-dock__tray">{filmstrip}</div>}

      {open === 'tools' && (
        <ul className="phone-dock__menu" aria-label="Editing tools">
          {PANELS.map(({ id, label }, index) => {
            const current = sheetOpen && id === activePanel
            return (
              <li key={id} style={{ animationDelay: `${(PANELS.length - 1 - index) * 18}ms` }}>
                <button
                  type="button"
                  className={current ? 'phone-dock__tool phone-dock__tool--active' : 'phone-dock__tool'}
                  aria-current={current || undefined}
                  onClick={() => {
                    setOpen(null)
                    onSelectPanel(id)
                  }}
                >
                  <span className="phone-dock__tool-label">{label}</span>
                  <span className="phone-dock__tool-icon">
                    <PanelIcon id={id} size={18} />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <button
        type="button"
        className={open === 'photos' ? 'phone-fab phone-fab--photos phone-fab--on' : 'phone-fab phone-fab--photos'}
        aria-label={open === 'photos' ? 'Hide photos' : 'Show photos'}
        aria-expanded={open === 'photos'}
        onClick={() => toggle('photos')}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 22H4a2 2 0 0 1-2-2V6" />
          <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18" />
          <circle cx="12" cy="8" r="2" />
          <rect width="16" height="16" x="6" y="2" rx="2" />
        </svg>
        {photoCount > 1 && <span className="phone-fab__count">{photoCount}</span>}
      </button>

      <button
        type="button"
        className={open === 'tools' ? 'phone-fab phone-fab--tools phone-fab--on' : 'phone-fab phone-fab--tools'}
        aria-label={open === 'tools' ? 'Close tools' : 'Editing tools'}
        aria-expanded={open === 'tools'}
        onClick={() => toggle('tools')}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {open === 'tools' ? (
            <path d="M18 6 6 18M6 6l12 12" />
          ) : (
            <>
              <path d="m14.622 17.897-10.68-2.913" />
              <path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z" />
              <path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15" />
            </>
          )}
        </svg>
      </button>
    </div>
  )
}
