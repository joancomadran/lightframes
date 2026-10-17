import { useSyncExternalStore } from 'react'

/** Phone (portrait) layout: single column with a bottom tool sheet. Keep in sync with index.css. */
export const PHONE_QUERY = '(max-width: 767px) and (min-height: 501px)'
/** Touch-first device (no precise pointer, no hover). */
export const COARSE_QUERY = '(pointer: coarse)'

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
