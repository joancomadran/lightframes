/** Amazon.es Associates tag. Swap for a dedicated tracking ID (e.g. lightframes-21) to split stats per site. */
export const AMAZON_TAG = 'devcoma-21'

/** Disclosure text required by the Amazon.es Associates operating agreement. */
export const AMAZON_DISCLOSURE =
  'Como Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables.'

export type GearItem = {
  title: string
  detail: string
  /** Amazon.es search query, or a product path such as "dp/B0XXXXXXX" once a specific pick is chosen. */
  query?: string
  path?: string
}

export type GearGroup = {
  title: string
  items: GearItem[]
}

export const GEAR: GearGroup[] = [
  {
    title: 'Storage & backup',
    items: [
      { title: 'Fast SD cards', detail: 'V30 / UHS-II for RAW bursts', query: 'tarjeta SD V30 128GB' },
      { title: 'Portable SSD', detail: 'Back up a shoot on the go', query: 'SSD externo portátil 1TB' },
      { title: 'USB-C card reader', detail: 'Import straight to laptop or phone', query: 'lector tarjetas SD USB-C' },
    ],
  },
  {
    title: 'Editing',
    items: [
      { title: 'Monitor calibrator', detail: 'Colours that match the print', query: 'calibrador de monitor' },
      { title: 'Photo printer', detail: 'Print your favourite edits', query: 'impresora fotográfica' },
    ],
  },
  {
    title: 'Shooting',
    items: [
      { title: '50mm f/1.8 prime', detail: 'The classic first lens', query: 'objetivo 50mm f1.8' },
      { title: 'Travel tripod', detail: 'Long exposures & night shots', query: 'trípode de viaje cámara' },
      { title: 'Sensor cleaning kit', detail: 'Fewer spots to retouch', query: 'kit limpieza sensor cámara' },
    ],
  },
]

export function amazonUrl(item: GearItem): string {
  const url = item.path
    ? new URL(item.path, 'https://www.amazon.es/')
    : new URL(`https://www.amazon.es/s?k=${encodeURIComponent(item.query ?? item.title)}`)
  url.searchParams.set('tag', AMAZON_TAG)
  return url.toString()
}

export type SlotAd = GearItem & {
  /** Drawn product illustration, used until `image` is set. */
  art: 'ssd' | 'sd'
  /** Official product image URL (e.g. from the Amazon PA-API). Amazon images may not be self-hosted. */
  image?: string
  cta: string
}

/** One affiliate pick per reserved ad slot, keyed by AdSlot id. */
export const SLOT_ADS: Record<string, SlotAd> = {
  sidebar: {
    title: 'Samsung T7 portable SSD',
    detail: 'Back up every shoot. 1 TB, pocket-sized.',
    query: 'Samsung T7 SSD portátil 1TB',
    art: 'ssd',
    cta: 'See on Amazon',
  },
  filmstrip: {
    title: 'SanDisk Extreme PRO',
    detail: 'Fast SD cards for RAW bursts',
    query: 'SanDisk Extreme PRO SDXC 128GB',
    art: 'sd',
    cta: 'Amazon',
  },
}
