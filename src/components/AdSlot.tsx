type AdSlotProps = {
  id: string
  height: number
  label?: string
}

const adsEnabled = import.meta.env.VITE_ADS_ENABLED === 'true'

/** Reserved monetization region. Hidden unless VITE_ADS_ENABLED=true. No network. */
export function AdSlot({ id, height, label = 'Sponsored' }: AdSlotProps) {
  if (!adsEnabled) return null

  return (
    <aside
      className="ad-slot"
      data-ad-slot={id}
      style={{ minHeight: height }}
      aria-label={label}
    >
      <span className="ad-slot__label">{label}</span>
      <span className="ad-slot__hint">Ad slot reserved</span>
    </aside>
  )
}
