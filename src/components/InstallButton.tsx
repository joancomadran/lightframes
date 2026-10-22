import { useEffect, useId, useRef, useState } from 'react'
import { useInstallPrompt, type ManualInstall } from '../hooks/useInstallPrompt'

const MANUAL_STEPS: Record<ManualInstall, string> = {
  ios: 'Tap the Share button, then “Add to Home Screen”. Lightframes opens in its own window, and editing works offline after it has loaded.',
  'mac-safari': 'In Safari, choose File → Add to Dock. Lightframes opens in its own window, and editing works offline after it has loaded.',
}

/**
 * "Install app" pill: opens the browser's install prompt where there is one,
 * otherwise explains the manual steps. Renders nothing once installed or where
 * installing isn't possible. Shares the privacy badge's popover styles.
 */
export function InstallButton() {
  const { state, install } = useInstallPrompt()
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

  if (state.kind === 'none') return null

  const manual = state.kind === 'manual'
  return (
    <span
      className={['privacy', 'privacy--center', 'install', open ? 'privacy--open' : ''].filter(Boolean).join(' ')}
      ref={ref}
    >
      <button
        type="button"
        className="btn btn--ghost btn--sm install__btn"
        aria-describedby={manual ? tipId : undefined}
        aria-expanded={manual ? open : undefined}
        title={manual ? undefined : 'Install Lightframes as an app — editing works offline after it has loaded, in its own window'}
        onClick={() => (manual ? setOpen((v) => !v) : void install())}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5" />
          <path d="M5 21h14" />
        </svg>
        Install app
      </button>
      {manual && (
        <span id={tipId} role="tooltip" className="privacy__tip">
          {MANUAL_STEPS[state.platform]}
        </span>
      )}
    </span>
  )
}
