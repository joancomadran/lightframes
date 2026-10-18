import { useEffect, useId, useRef, useState } from 'react'

type PrivacyBadgeProps = {
  /** Shown next to the shield as a pill; icon-only when omitted. */
  label?: string
  /** Where the note opens: above the badge's right edge, or centred over it. */
  align?: 'end' | 'center'
}

// Hover or focus reveals the note; touch devices toggle it with a tap.
export function PrivacyBadge({ label, align = 'end' }: PrivacyBadgeProps) {
  const tipId = useId()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <span
      className={['privacy', open ? 'privacy--open' : '', align === 'center' ? 'privacy--center' : '']
        .filter(Boolean)
        .join(' ')}
      ref={ref}
    >
      <button
        type="button"
        className={
          label ? 'btn btn--ghost btn--sm privacy__btn privacy__pill' : 'btn btn--ghost btn--sm btn--icon privacy__btn'
        }
        aria-label={label ? undefined : 'Privacy'}
        aria-describedby={tipId}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        {label && <span>{label}</span>}
      </button>
      <span id={tipId} role="tooltip" className="privacy__tip">
        Your photos never leave your device. Everything is processed right in your browser — nothing is
        uploaded to any server.
      </span>
    </span>
  )
}
