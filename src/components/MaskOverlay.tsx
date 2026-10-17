import {
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import type {
  BrushAdjustment,
  BrushStroke,
  LinearAdjustment,
  LocalAdjustment,
  LocalAdjustmentPatch,
  RadialAdjustment,
} from '../types/edits'
import type { OverlayFrame } from './CropOverlay'

export type BrushSettings = {
  /** Radius as a fraction of the image width. */
  size: number
  feather: number
  flow: number
  erase: boolean
}

export type MaskOverlayConfig = {
  items: LocalAdjustment[]
  selectedId: string | null
  brush: BrushSettings
  onSelect: (id: string) => void
  onChange: (id: string, patch: LocalAdjustmentPatch) => void
  onBegin?: () => void
  onCommit?: () => void
}

type DragHandle = 'move' | 'rx' | 'ry' | 'p1' | 'p2'

type Drag = {
  id: string
  handle: DragHandle
  pointerId: number
  startX: number
  startY: number
  start: LocalAdjustment
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

const stop = (e: ReactMouseEvent) => e.stopPropagation()

/** Editable on-image handles for radial and linear masks, and the brush for brush masks. */
export function MaskOverlay({ frame, config }: { frame: OverlayFrame; config: MaskOverlayConfig }) {
  const { items, selectedId, onSelect, onChange, onBegin, onCommit } = config
  const dragRef = useRef<Drag | null>(null)
  const selected = items.find((item) => item.id === selectedId) ?? null

  const beginDrag = (item: LocalAdjustment, handle: DragHandle) => (e: ReactPointerEvent<Element>) => {
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

  const onDragMove = (e: ReactPointerEvent<Element>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId || frame.width <= 0) return
    const dx = (e.clientX - drag.startX) / frame.width
    const dy = (e.clientY - drag.startY) / frame.height
    const start = drag.start
    if (start.type === 'radial') {
      if (drag.handle === 'move') {
        onChange(drag.id, { cx: clamp(start.cx + dx, 0, 1), cy: clamp(start.cy + dy, 0, 1) })
      } else if (drag.handle === 'rx') {
        onChange(drag.id, { radiusX: clamp(start.radiusX + dx, 0.03, 1.5) })
      } else if (drag.handle === 'ry') {
        onChange(drag.id, { radiusY: clamp(start.radiusY + dy, 0.03, 1.5) })
      }
    } else if (start.type === 'linear') {
      if (drag.handle === 'move') {
        onChange(drag.id, {
          x1: start.x1 + dx,
          y1: start.y1 + dy,
          x2: start.x2 + dx,
          y2: start.y2 + dy,
        })
      } else if (drag.handle === 'p1') {
        onChange(drag.id, { x1: start.x1 + dx, y1: start.y1 + dy })
      } else if (drag.handle === 'p2') {
        onChange(drag.id, { x2: start.x2 + dx, y2: start.y2 + dy })
      }
    }
  }

  const endDrag = (e: ReactPointerEvent<Element>) => {
    if (dragRef.current?.pointerId !== e.pointerId) return
    dragRef.current = null
    onCommit?.()
  }

  const dragProps = {
    onPointerMove: onDragMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onDoubleClick: stop,
  }

  return (
    <>
      {items.map((item) => {
        if (item.type === 'radial') {
          return (
            <RadialHandles
              key={item.id}
              item={item}
              selected={item.id === selectedId}
              frame={frame}
              beginDrag={beginDrag}
              dragProps={dragProps}
            />
          )
        }
        if (item.type === 'linear') {
          return (
            <LinearHandles
              key={item.id}
              item={item}
              selected={item.id === selectedId}
              frame={frame}
              beginDrag={beginDrag}
              dragProps={dragProps}
            />
          )
        }
        return null
      })}
      {selected?.type === 'brush' && <BrushPainter frame={frame} mask={selected} config={config} />}
    </>
  )
}

type HandleProps<T> = {
  item: T
  selected: boolean
  frame: OverlayFrame
  beginDrag: (item: LocalAdjustment, handle: DragHandle) => (e: ReactPointerEvent<Element>) => void
  dragProps: {
    onPointerMove: (e: ReactPointerEvent<Element>) => void
    onPointerUp: (e: ReactPointerEvent<Element>) => void
    onPointerCancel: (e: ReactPointerEvent<Element>) => void
    onDoubleClick: (e: ReactMouseEvent) => void
  }
}

function RadialHandles({ item, selected, frame, beginDrag, dragProps }: HandleProps<RadialAdjustment>) {
  const cx = frame.left + item.cx * frame.width
  const cy = frame.top + item.cy * frame.height
  const rx = item.radiusX * frame.width
  const ry = item.radiusY * frame.height
  const inner = 1 - Math.min(0.95, Math.max(0.01, item.feather))
  return (
    <div className={selected ? 'mask-overlay mask-overlay--selected' : 'mask-overlay'}>
      <span
        className={item.invert ? 'mask-overlay__ring mask-overlay__ring--invert' : 'mask-overlay__ring'}
        style={{ left: cx - rx, top: cy - ry, width: rx * 2, height: ry * 2 }}
      />
      {selected && (
        <span
          className="mask-overlay__ring mask-overlay__ring--inner"
          style={{ left: cx - rx * inner, top: cy - ry * inner, width: rx * 2 * inner, height: ry * 2 * inner }}
        />
      )}
      <span
        className="mask-overlay__pin"
        style={{ left: cx, top: cy }}
        title="Drag to move"
        onPointerDown={beginDrag(item, 'move')}
        {...dragProps}
      />
      {selected && (
        <>
          <span
            className="mask-overlay__handle mask-overlay__handle--ew"
            style={{ left: cx + rx, top: cy }}
            title="Drag to resize width"
            onPointerDown={beginDrag(item, 'rx')}
            {...dragProps}
          />
          <span
            className="mask-overlay__handle mask-overlay__handle--ns"
            style={{ left: cx, top: cy + ry }}
            title="Drag to resize height"
            onPointerDown={beginDrag(item, 'ry')}
            {...dragProps}
          />
        </>
      )}
    </div>
  )
}

/** Very long line through (x, y) perpendicular to (dx, dy); the viewport clips it. */
function perpendicular(x: number, y: number, dx: number, dy: number) {
  const len = Math.hypot(dx, dy) || 1
  const px = (-dy / len) * 4000
  const py = (dx / len) * 4000
  return { x1: x - px, y1: y - py, x2: x + px, y2: y + py }
}

function LinearHandles({ item, selected, frame, beginDrag, dragProps }: HandleProps<LinearAdjustment>) {
  const ax = frame.left + item.x1 * frame.width
  const ay = frame.top + item.y1 * frame.height
  const bx = frame.left + item.x2 * frame.width
  const by = frame.top + item.y2 * frame.height
  const dx = bx - ax
  const dy = by - ay
  const lines = [
    perpendicular(ax, ay, dx, dy),
    perpendicular((ax + bx) / 2, (ay + by) / 2, dx, dy),
    perpendicular(bx, by, dx, dy),
  ]
  return (
    <div className={selected ? 'mask-overlay mask-overlay--selected' : 'mask-overlay'}>
      <svg className="mask-overlay__svg" aria-hidden="true">
        {lines.map((line, i) => (
          <line
            key={i}
            {...line}
            className={i === 1 ? 'mask-overlay__line mask-overlay__line--mid' : 'mask-overlay__line'}
          />
        ))}
        {selected && <line x1={ax} y1={ay} x2={bx} y2={by} className="mask-overlay__line mask-overlay__line--axis" />}
      </svg>
      <span
        className="mask-overlay__pin"
        style={{ left: (ax + bx) / 2, top: (ay + by) / 2 }}
        title="Drag to move"
        onPointerDown={beginDrag(item, 'move')}
        {...dragProps}
      />
      {selected && (
        <>
          <span
            className="mask-overlay__handle mask-overlay__handle--start"
            style={{ left: ax, top: ay }}
            title="Full effect starts here"
            onPointerDown={beginDrag(item, 'p1')}
            {...dragProps}
          />
          <span
            className="mask-overlay__handle"
            style={{ left: bx, top: by }}
            title="Effect fades out here"
            onPointerDown={beginDrag(item, 'p2')}
            {...dragProps}
          />
        </>
      )}
    </div>
  )
}

/** Paint strokes onto a brush mask; Alt erases. Shows the brush outline under the pointer. */
function BrushPainter({
  frame,
  mask,
  config,
}: {
  frame: OverlayFrame
  mask: BrushAdjustment
  config: MaskOverlayConfig
}) {
  const { brush, onChange, onBegin, onCommit } = config
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const paintRef = useRef<{ pointerId: number; base: BrushStroke[]; stroke: BrushStroke } | null>(null)
  const radiusPx = brush.size * frame.width

  const toImage = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / Math.max(1, rect.width),
      y: (e.clientY - rect.top) / Math.max(1, rect.height),
      px: e.clientX - rect.left,
      py: e.clientY - rect.top,
    }
  }

  return (
    <div
      className="brush-overlay"
      style={{ left: frame.left, top: frame.top, width: frame.width, height: frame.height }}
      onPointerDown={(e) => {
        if (e.button !== 0) return
        e.stopPropagation()
        const p = toImage(e)
        onBegin?.()
        const stroke: BrushStroke = {
          points: [p.x, p.y],
          size: brush.size,
          feather: brush.feather,
          flow: brush.flow,
          erase: brush.erase || e.altKey,
        }
        paintRef.current = { pointerId: e.pointerId, base: mask.strokes, stroke }
        onChange(mask.id, { strokes: [...mask.strokes, stroke] })
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        const p = toImage(e)
        setCursor({ x: p.px, y: p.py })
        const paint = paintRef.current
        if (!paint || paint.pointerId !== e.pointerId) return
        const pts = paint.stroke.points
        const lastX = pts[pts.length - 2]! * frame.width
        const lastY = pts[pts.length - 1]! * frame.height
        // Skip points closer than a fraction of the radius: smoother and cheaper.
        if (Math.hypot(p.px - lastX, p.py - lastY) < Math.max(2, radiusPx * 0.2)) return
        const stroke = { ...paint.stroke, points: [...pts, p.x, p.y] }
        paint.stroke = stroke
        onChange(mask.id, { strokes: [...paint.base, stroke] })
      }}
      onPointerUp={(e) => {
        if (paintRef.current?.pointerId !== e.pointerId) return
        paintRef.current = null
        onCommit?.()
      }}
      onPointerCancel={() => {
        if (paintRef.current) onCommit?.()
        paintRef.current = null
      }}
      onPointerLeave={() => setCursor(null)}
      onDoubleClick={stop}
    >
      {cursor && (
        <>
          <span
            className={brush.erase ? 'brush-cursor brush-cursor--erase' : 'brush-cursor'}
            style={{ left: cursor.x, top: cursor.y, width: radiusPx * 2, height: radiusPx * 2 }}
          />
          <span
            className="brush-cursor brush-cursor--inner"
            style={{
              left: cursor.x,
              top: cursor.y,
              width: radiusPx * 2 * (1 - brush.feather),
              height: radiusPx * 2 * (1 - brush.feather),
            }}
          />
        </>
      )}
    </div>
  )
}
