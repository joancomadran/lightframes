import { useRef, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import type { RadialAdjustment } from '../types/edits'
import type { OverlayFrame } from './CropOverlay'

export type RadialOverlayConfig = {
  items: RadialAdjustment[]
  selectedId: string | null
  onSelect: (id: string) => void
  onChange: (id: string, patch: Partial<RadialAdjustment>) => void
  onBegin?: () => void
  onCommit?: () => void
}

type Handle = 'move' | 'rx' | 'ry'

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function RadialOverlay({ frame, config }: { frame: OverlayFrame; config: RadialOverlayConfig }) {
  const { items, selectedId, onSelect, onChange, onBegin, onCommit } = config
  const dragRef = useRef<{
    id: string
    handle: Handle
    pointerId: number
    startX: number
    startY: number
    start: RadialAdjustment
  } | null>(null)

  const onPointerDown =
    (item: RadialAdjustment, handle: Handle) => (e: ReactPointerEvent<HTMLElement>) => {
      if (e.button !== 0) return
      e.stopPropagation()
      onSelect(item.id)
      onBegin?.()
      dragRef.current = {
        id: item.id,
        handle,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        start: { ...item },
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
      onChange(drag.id, { cx: clamp(start.cx + dx, 0, 1), cy: clamp(start.cy + dy, 0, 1) })
    } else if (drag.handle === 'rx') {
      onChange(drag.id, { radiusX: clamp(start.radiusX + dx, 0.03, 1.5) })
    } else {
      onChange(drag.id, { radiusY: clamp(start.radiusY + dy, 0.03, 1.5) })
    }
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId !== e.pointerId) return
    dragRef.current = null
    onCommit?.()
  }

  const dragProps = {
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onDoubleClick: (e: ReactMouseEvent) => e.stopPropagation(),
  }

  return (
    <>
      {items.map((item) => {
        const selected = item.id === selectedId
        const cx = frame.left + item.cx * frame.width
        const cy = frame.top + item.cy * frame.height
        const rx = item.radiusX * frame.width
        const ry = item.radiusY * frame.height
        const inner = 1 - Math.min(0.95, Math.max(0.01, item.feather))
        return (
          <div
            key={item.id}
            className={selected ? 'radial-overlay radial-overlay--selected' : 'radial-overlay'}
          >
            <span
              className="radial-overlay__ring"
              style={{ left: cx - rx, top: cy - ry, width: rx * 2, height: ry * 2 }}
            />
            {selected && (
              <span
                className="radial-overlay__ring radial-overlay__ring--inner"
                style={{
                  left: cx - rx * inner,
                  top: cy - ry * inner,
                  width: rx * 2 * inner,
                  height: ry * 2 * inner,
                }}
              />
            )}
            <span
              className="radial-overlay__pin"
              style={{ left: cx, top: cy }}
              title="Drag to move"
              onPointerDown={onPointerDown(item, 'move')}
              {...dragProps}
            />
            {selected && (
              <>
                <span
                  className="radial-overlay__handle radial-overlay__handle--x"
                  style={{ left: cx + rx, top: cy }}
                  title="Drag to resize width"
                  onPointerDown={onPointerDown(item, 'rx')}
                  {...dragProps}
                />
                <span
                  className="radial-overlay__handle radial-overlay__handle--y"
                  style={{ left: cx, top: cy + ry }}
                  title="Drag to resize height"
                  onPointerDown={onPointerDown(item, 'ry')}
                  {...dragProps}
                />
              </>
            )}
          </div>
        )
      })}
    </>
  )
}
