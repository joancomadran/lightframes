import type { CSSProperties } from 'react'
import { AMAZON_DISCLOSURE, SLOT_ADS, amazonUrl, type SlotAd } from '../lib/affiliate'

type AdSlotProps = {
  id: string
  height: number
  label?: string
}

// Empty placeholders are visible in dev so the layout can be checked; production opts in via the env flag.
const placeholdersEnabled = import.meta.env.VITE_ADS_ENABLED === 'true' || import.meta.env.DEV

/** Reserved monetization region: an affiliate card when the slot has a pick, else a placeholder. No network. */
export function AdSlot({ id, height, label = 'Sponsored' }: AdSlotProps) {
  const ad = SLOT_ADS[id]
  const style = { '--ad-height': `${height}px` } as CSSProperties

  if (ad) {
    return (
      <aside className="pick-slot pick-slot--affiliate" data-pick={id} style={style} aria-label={label}>
        <a
          className="pick-card"
          href={amazonUrl(ad)}
          target="_blank"
          rel="sponsored noopener noreferrer"
          title={AMAZON_DISCLOSURE}
        >
          <span className="pick-card__badge">Ad</span>
          <span className="pick-card__media">
            {ad.image ? <img src={ad.image} alt="" loading="lazy" /> : <ProductArt art={ad.art} />}
          </span>
          <span className="pick-card__body">
            <span className="pick-card__title">{ad.title}</span>
            <span className="pick-card__detail">{ad.detail}</span>
            <span className="pick-card__cta">{ad.cta} ↗</span>
          </span>
        </a>
      </aside>
    )
  }

  if (!placeholdersEnabled) return null
  return (
    <aside className="pick-slot" data-pick={id} style={style} aria-label={label}>
      <span className="pick-slot__label">{label}</span>
      <span className="pick-slot__hint">Ad slot reserved</span>
    </aside>
  )
}

/** Brand-free product drawings, so the card has a picture without hosting Amazon's images. */
function ProductArt({ art }: { art: SlotAd['art'] }) {
  if (art === 'ssd') {
    return (
      <svg viewBox="0 0 80 100" aria-hidden="true">
        <defs>
          <linearGradient id="pick-ssd-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6d7c93" />
            <stop offset="1" stopColor="#2b3442" />
          </linearGradient>
          <linearGradient id="pick-ssd-band" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c3ccd9" />
            <stop offset="0.5" stopColor="#8e9bb0" />
            <stop offset="1" stopColor="#6f7c92" />
          </linearGradient>
        </defs>
        <rect x="8" y="22" width="64" height="56" rx="9" fill="url(#pick-ssd-body)" />
        <rect x="26" y="22" width="28" height="56" fill="url(#pick-ssd-band)" />
        <rect x="8" y="22" width="64" height="56" rx="9" fill="none" stroke="rgba(255,255,255,0.18)" />
        <rect x="72" y="44" width="3" height="12" rx="1.5" fill="#151a21" />
        <circle cx="16" cy="30" r="1.6" fill="#c8f560" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 80 100" aria-hidden="true">
      <defs>
        <linearGradient id="pick-sd-label" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e7b84a" />
          <stop offset="1" stopColor="#c0392b" />
        </linearGradient>
      </defs>
      <path d="M18 6h34l12 12v76H18z" fill="#1d1f22" stroke="rgba(255,255,255,0.2)" />
      {[22, 28, 34, 40, 46].map((x) => (
        <rect key={x} x={x} y="10" width="3.5" height="11" rx="1" fill="#d9b25a" />
      ))}
      <rect x="15" y="30" width="3" height="12" rx="1" fill="#9aa0a6" />
      <rect x="18" y="44" width="46" height="34" fill="url(#pick-sd-label)" />
      <text x="41" y="63" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">
        128GB
      </text>
      <text x="41" y="73" textAnchor="middle" fontSize="6.5" fontWeight="600" fill="rgba(255,255,255,0.85)" fontFamily="system-ui, sans-serif">
        PRO · V30
      </text>
    </svg>
  )
}
