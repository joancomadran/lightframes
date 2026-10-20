import { useRef, useState, type MouseEvent, type PointerEvent } from 'react'

/** Vertical travel (px) that commits a fold or unfold. */
const COMMIT = 40
/** Movement before a touch counts as a swipe rather than a tap. */
const SLOP = 8

/**
 * Vertical swipe on the phone sheet's grabber and tab bar: down folds it, up unfolds it.
 * Taps still reach onClick; a finished swipe swallows the click it would otherwise fire.
 */
export function useSheetSwipe(open: boolean, setCollapsed: (collapsed: boolean) => void) {
  const start = useRef<{ x: number; y: number; id: number } | null>(null)
  const dragging = useRef(false)
  const swallowClick = useRef(false)
  const [offset, setOffset] = useState(0)

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse') return
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId }
    dragging.current = false
    swallowClick.current = false
  }

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const s = start.current
    if (!s || s.id !== e.pointerId) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (!dragging.current) {
      if (Math.abs(dy) < SLOP || Math.abs(dy) < Math.abs(dx)) return
      dragging.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    // Follow the finger down while open; folded, the content is hidden, so only a short lift.
    setOffset(open ? Math.max(0, dy) : Math.max(-24, Math.min(0, dy)))
  }

  const onPointerEnd = (e: PointerEvent<HTMLElement>) => {
    const s = start.current
    start.current = null
    if (!s || !dragging.current) return
    dragging.current = false
    swallowClick.current = true
    setOffset(0)
    const dy = e.clientY - s.y
    if (open && dy > COMMIT) setCollapsed(true)
    else if (!open && dy < -COMMIT) setCollapsed(false)
  }

  const onClickCapture = (e: MouseEvent<HTMLElement>) => {
    if (!swallowClick.current) return
    swallowClick.current = false
    e.preventDefault()
    e.stopPropagation()
  }

  return {
    offset,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
      onClickCapture,
    },
  }
}
