import type { CSSProperties } from 'react'

type AdSlotProps = {
  id: string
  height: number
  label?: string
}

// Always visible in dev so the layout can be checked; production opts in via the env flag.
const adsEnabled = import.meta.env.VITE_ADS_ENABLED === 'true' || import.meta.env.DEV

/** Reserved monetization region. Hidden in production unless VITE_ADS_ENABLED=true. No network. */
export function AdSlot({ id, height, label = 'Sponsored' }: AdSlotProps) {
  if (!adsEnabled) return null

  return (
    <aside
      className="ad-slot"
      data-ad-slot={id}
      style={{ '--ad-height': `${height}px` } as CSSProperties}
      aria-label={label}
    >
      <span className="ad-slot__label">{label}</span>
      <span className="ad-slot__hint">Ad slot reserved</span>
    </aside>
  )
}
