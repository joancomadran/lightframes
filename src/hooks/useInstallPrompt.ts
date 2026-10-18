import { useCallback, useSyncExternalStore } from 'react'

/** Chromium's install event; not in the DOM typings yet. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** Browsers with no install prompt but a manual route: Safari on iOS and on macOS. */
export type ManualInstall = 'ios' | 'mac-safari'

export type InstallState =
  | { kind: 'prompt' }
  | { kind: 'manual'; platform: ManualInstall }
  | { kind: 'none' }

let deferred: BeforeInstallPromptEvent | null = null
let installed = false
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((fn) => fn())

// Listen at import time: Chromium can fire the event before React mounts.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as BeforeInstallPromptEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    installed = true
    notify()
  })
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function manualPlatform(): ManualInstall | null {
  const ua = navigator.userAgent
  // iPadOS reports itself as a Mac; touch support gives it away.
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Macintosh/.test(ua) && /Safari\//.test(ua) && !/Chrome|Chromium|Edg|OPR|Firefox/.test(ua)) {
    return 'mac-safari'
  }
  return null
}

let snapshot: InstallState = { kind: 'none' }

function getSnapshot(): InstallState {
  const platform = manualPlatform()
  const next: InstallState =
    installed || isStandalone()
      ? { kind: 'none' }
      : deferred
        ? { kind: 'prompt' }
        : platform
          ? { kind: 'manual', platform }
          : { kind: 'none' }
  // Keep the same object while nothing changed, as useSyncExternalStore requires.
  if (next.kind !== snapshot.kind || (next.kind === 'manual' && snapshot.kind === 'manual' && next.platform !== snapshot.platform)) {
    snapshot = next
  }
  return snapshot
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  return () => listeners.delete(onChange)
}

/** Whether the app can be installed here, and how. */
export function useInstallPrompt() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => snapshot)

  const install = useCallback(async () => {
    const event = deferred
    if (!event) return
    // The event can only prompt once.
    deferred = null
    try {
      await event.prompt()
    } catch {
      // Refused (e.g. no user gesture): keep the event so the button can try again.
      deferred = event
      notify()
      return
    }
    const { outcome } = await event.userChoice
    if (outcome === 'accepted') installed = true
    notify()
  }, [])

  return { state, install }
}
