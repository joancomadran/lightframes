import { useEffect, useState, type HTMLAttributes, type ReactNode } from 'react'

export type DockItem = {
  id: string
  label: string
  icon: ReactNode
  active?: boolean
  /** Set apart from the items above it. */
  extra?: boolean
  onSelect: () => void
}

type PhoneDockProps = {
  photoCount: number
  /** The photo list, shown in the tray the photos button unfolds. */
  filmstrip: ReactNode
  /** Floats over the stage alongside the buttons (the editor's histogram). */
  overlay?: ReactNode
  /** Brush button with a list of tools (editor), or a settings button that opens the sheet (studios). */
  action:
    | { kind: 'menu'; items: DockItem[] }
    | { kind: 'toggle'; label: string; open: boolean; onToggle: () => void }
  /** While a tool is open, a small button over the action one that leaves it. */
  exit?: { label: string; onExit: () => void } | null
}

const CLOSE_PATH = <path d="M18 6 6 18M6 6l12 12" />

const BRUSH_ICON = (
  <>
    <path d="m14.622 17.897-10.68-2.913" />
    <path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z" />
    <path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15" />
  </>
)

const SLIDERS_ICON = (
  <>
    <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" />
    <circle cx="15" cy="6" r="2" />
    <circle cx="9" cy="12" r="2" />
    <circle cx="17" cy="18" r="2" />
  </>
)

function DockIcon({ size = 22, children }: { size?: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

/**
 * Phone controls floating over the stage: a photos button bottom-left that unfolds the photo list,
 * and an action button bottom-right — the editor's list of tools, or a studio's settings sheet.
 */
export function PhoneDock({ photoCount, filmstrip, overlay, action, exit }: PhoneDockProps) {
  const [open, setOpen] = useState<'menu' | 'photos' | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const items = action.kind === 'menu' ? action.items : []
  const actionOn = action.kind === 'menu' ? open === 'menu' : action.open

  return (
    <div className="phone-dock">
      {overlay}

      {/* Any tap outside the tool list closes it instead of reaching the photo. */}
      {open === 'menu' && (
        <button type="button" className="phone-dock__scrim" aria-label="Close tools" onClick={() => setOpen(null)} />
      )}

      {open === 'photos' && <div className="phone-dock__tray">{filmstrip}</div>}

      {open === 'menu' && (
        <ul className="phone-dock__menu" aria-label="Editing tools">
          {items.map((item, index) => (
            <li
              key={item.id}
              className={item.extra ? 'phone-dock__menu-extra' : undefined}
              style={{ animationDelay: `${(items.length - 1 - index) * 18}ms` }}
            >
              <button
                type="button"
                className={item.active ? 'phone-dock__tool phone-dock__tool--active' : 'phone-dock__tool'}
                aria-current={item.active || undefined}
                onClick={() => {
                  setOpen(null)
                  item.onSelect()
                }}
              >
                <span className="phone-dock__tool-label">{item.label}</span>
                <span className="phone-dock__tool-icon">{item.icon}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className={open === 'photos' ? 'phone-fab phone-fab--photos phone-fab--on' : 'phone-fab phone-fab--photos'}
        aria-label={open === 'photos' ? 'Hide photos' : 'Show photos'}
        aria-expanded={open === 'photos'}
        onClick={() => setOpen((v) => (v === 'photos' ? null : 'photos'))}
      >
        <DockIcon>
          <path d="M18 22H4a2 2 0 0 1-2-2V6" />
          <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18" />
          <circle cx="12" cy="8" r="2" />
          <rect width="16" height="16" x="6" y="2" rx="2" />
        </DockIcon>
        {photoCount > 1 && <span className="phone-fab__count">{photoCount}</span>}
      </button>

      {/* The tool list unfolds from the same spot, so the exit button steps aside while it is open. */}
      {exit && open !== 'menu' && (
        <button
          type="button"
          className="phone-fab phone-fab--exit"
          aria-label={exit.label}
          title={exit.label}
          onClick={() => {
            setOpen(null)
            exit.onExit()
          }}
        >
          <DockIcon size={18}>{CLOSE_PATH}</DockIcon>
        </button>
      )}

      <button
        type="button"
        className={actionOn ? 'phone-fab phone-fab--tools phone-fab--on' : 'phone-fab phone-fab--tools'}
        aria-label={action.kind === 'menu' ? (actionOn ? 'Close tools' : 'Editing tools') : action.label}
        aria-expanded={actionOn}
        onClick={() => {
          if (action.kind === 'menu') {
            setOpen((v) => (v === 'menu' ? null : 'menu'))
          } else {
            setOpen(null)
            action.onToggle()
          }
        }}
      >
        <DockIcon>{actionOn ? CLOSE_PATH : action.kind === 'menu' ? BRUSH_ICON : SLIDERS_ICON}</DockIcon>
      </button>
    </div>
  )
}

/** The editor's histogram entry in the tools menu. */
export function HistogramIcon() {
  return (
    <DockIcon size={18}>
      <path d="M3 20h18" />
      <path d="M3 20c2-1 3-9 5-9s2.5 5 4 5 2-11 4-11 3 13 5 15" />
    </DockIcon>
  )
}

/** The studios' settings glyph, sized for a sheet title. */
export function SettingsIcon() {
  return <DockIcon size={16}>{SLIDERS_ICON}</DockIcon>
}

/** Top of a phone sheet: grabber, title and close button. Swipe handlers apply to the whole head. */
export function PhoneSheetHead({
  icon,
  title,
  onClose,
  ...swipe
}: { icon: ReactNode; title: ReactNode; onClose: () => void } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="sheet-head" {...swipe}>
      <button type="button" className="sheet-handle" aria-label="Hide tools" onClick={onClose} />
      <div className="sheet-head__row">
        <span className="sheet-head__title">
          {icon}
          {title}
        </span>
        <button
          type="button"
          className="btn btn--ghost btn--sm btn--icon sheet-head__close"
          aria-label="Close tools"
          title="Close"
          onClick={onClose}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {CLOSE_PATH}
          </svg>
        </button>
      </div>
    </div>
  )
}
