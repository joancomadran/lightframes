import { useRef, type PointerEvent as ReactPointerEvent } from 'react'
import type { CropRect } from '../types/edits'

/** On-screen rectangle (viewport px) the uncropped frame occupies. */
export type OverlayFrame = { left: number; top: number; width: number; height: number }

export type CropOverlayConfig = {
  crop: CropRect
  /** Locked pixel aspect (w / h), or null for free. */
  aspect: number | null
  onChange: (crop: CropRect) => void
  onBegin?: () => void
  onCommit?: () => void
}

type Handle = 'move' | 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const HANDLES: Exclude<Handle, 'move'>[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
const MIN_SIZE = 0.04

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/**
 * Resize a normalized crop by dragging one handle. `ratio` is the locked aspect
 * in normalized units (pixel aspect ÷ frame aspect), or null when free.
 */
function resizeCrop(
  start: CropRect,
  handle: Exclude<Handle, 'move'>,
  dx: number,
  dy: number,
  ratio: number | null,
): CropRect {
  const sx = handle.includes('w') ? -1 : handle.includes('e') ? 1 : 0
  const sy = handle.includes('n') ? -1 : handle.includes('s') ? 1 : 0
  let l = start.x
  let t = start.y
  let r = start.x + start.width
  let b = start.y + start.height

  if (ratio == null) {
    if (sx < 0) l = clamp(l + dx, 0, r - MIN_SIZE)
    if (sx > 0) r = clamp(r + dx, l + MIN_SIZE, 1)
    if (sy < 0) t = clamp(t + dy, 0, b - MIN_SIZE)
    if (sy > 0) b = clamp(b + dy, t + MIN_SIZE, 1)
    return { ...start, x: l, y: t, width: r - l, height: b - t }
  }

  const ax = sx < 0 ? r : sx > 0 ? l : (l + r) / 2
  const ay = sy < 0 ? b : sy > 0 ? t : (t + b) / 2
  let w = sx !== 0 ? start.width + sx * dx : start.width
  let h = sy !== 0 ? start.height + sy * dy : start.height
  if (sx !== 0 && sy !== 0) {
    if (w / ratio > h) h = w / ratio
    else w = h * ratio
  } else if (sx !== 0) {
    h = w / ratio
  } else {
    w = h * ratio
  }
  w = Math.max(MIN_SIZE, w)
  h = Math.max(MIN_SIZE, h)

  const maxW = sx < 0 ? ax : sx > 0 ? 1 - ax : 2 * Math.min(ax, 1 - ax)
  const maxH = sy < 0 ? ay : sy > 0 ? 1 - ay : 2 * Math.min(ay, 1 - ay)
  const fit = Math.min(1, maxW / w, maxH / h)
  w *= fit
  h *= fit

  const x = sx < 0 ? ax - w : sx > 0 ? ax : ax - w / 2
  const y = sy < 0 ? ay - h : sy > 0 ? ay : ay - h / 2
  return { ...start, x, y, width: w, height: h }
}

export function CropOverlay({ frame, config }: { frame: OverlayFrame; config: CropOverlayConfig }) {
  const { crop, aspect, onChange, onBegin, onCommit } = config
  const dragRef = useRef<{
    handle: Handle
    pointerId: number
    startX: number
    startY: number
    start: CropRect
  } | null>(null)

  const ratio = aspect != null && frame.height > 0 ? aspect / (frame.width / frame.height) : null

  const onPointerDown = (handle: Handle) => (e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0) return
    e.stopPropagation()
    onBegin?.()
    dragRef.current = {
      handle,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      start: { ...crop },
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId || frame.width <= 0) return
    const dx = (e.clientX - drag.startX) / frame.width
    const dy = (e.clientY - drag.startY) / frame.height
    const { start } = drag
    if (drag.handle === 'move') {
      onChange({
        ...start,
        x: clamp(start.x + dx, 0, 1 - start.width),
        y: clamp(start.y + dy, 0, 1 - start.height),
      })
    } else {
      onChange(resizeCrop(start, drag.handle, dx, dy, ratio))
    }
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId !== e.pointerId) return
    dragRef.current = null
    onCommit?.()
  }

  const box = {
    left: frame.left + crop.x * frame.width,
    top: frame.top + crop.y * frame.height,
    width: crop.width * frame.width,
    height: crop.height * frame.height,
  }

  return (
    <div
      className="crop-overlay__box"
      style={box}
      onPointerDown={onPointerDown('move')}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <span className="crop-overlay__thirds" aria-hidden="true" />
      {HANDLES.map((handle) => (
        <span
          key={handle}
          className={`crop-overlay__handle crop-overlay__handle--${handle}`}
          onPointerDown={onPointerDown(handle)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      ))}
    </div>
  )
}
