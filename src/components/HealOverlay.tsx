import {
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { frameToSource, framedSize, sourceToFrame, type HealGeometry } from '../lib/heal'
import type { HealMode, HealSpot } from '../types/edits'
import type { OverlayFrame } from './CropOverlay'

export type HealTool = {
  mode: HealMode
  /** Radius as a fraction of the photo's long edge. */
  size: number
  feather: number
  opacity: number
}

export type HealOverlayConfig = {
  spots: HealSpot[]
  selectedId: string | null
  tool: HealTool
  /** Off: no outlines, so the result can be judged; painting still works. */
  showOutlines: boolean
  onSelect: (id: string | null) => void
  onAdd: (spot: HealSpot) => void
  onChange: (id: string, patch: Partial<HealSpot>) => void
  onBegin?: () => void
  onCommit?: () => void
}

type Point = { x: number; y: number }

const stop = (e: ReactMouseEvent) => e.stopPropagation()

function centroid(points: number[]): Point {
  let x = 0
  let y = 0
  const n = points.length / 2
  for (let i = 0; i < points.length; i += 2) {
    x += points[i]!
    y += points[i + 1]!
  }
  return { x: x / n, y: y / n }
}

function pathData(points: Point[]): string {
  const [first, ...rest] = points
  if (!first) return ''
  // A lone point still needs a (tiny) segment for its round cap to draw a dot.
  if (rest.length === 0) return `M${first.x} ${first.y}l0.01 0`
  return `M${first.x} ${first.y}` + rest.map((p) => `L${p.x} ${p.y}`).join('')
}

/** Painted spot outlined, not filled, so the healed pixels stay visible underneath. */
function Outline({ id, d, radius, className }: { id: string; d: string; radius: number; className: string }) {
  const maskId = `heal-outline-${id}`
  return (
    <>
      <mask id={maskId} maskUnits="userSpaceOnUse" x="-10000" y="-10000" width="20000" height="20000">
        <rect x="-10000" y="-10000" width="20000" height="20000" fill="#fff" />
        <path d={d} stroke="#000" strokeWidth={Math.max(0, radius * 2 - 3)} className="heal-spot__cut" />
      </mask>
      <path d={d} strokeWidth={radius * 2} mask={`url(#${maskId})`} className={className} />
    </>
  )
}

/** Spot removal on the image: paint over something to remove it, drag the source outline to choose what replaces it. */
export function HealOverlay({
  frame,
  geometry,
  config,
  pickSource,
}: {
  frame: OverlayFrame
  geometry: HealGeometry
  config: HealOverlayConfig
  /** Best source for a freshly painted spot, from the preview's pixels. */
  pickSource: (spot: HealSpot) => { dx: number; dy: number } | null
}) {
  const { spots, selectedId, tool, showOutlines, onSelect, onAdd, onChange, onBegin, onCommit } = config
  const [cursor, setCursor] = useState<Point | null>(null)
  const [draft, setDraft] = useState<{ pointerId: number; points: number[] } | null>(null)
  const dragRef = useRef<{ id: string; pointerId: number; startX: number; startY: number; spot: HealSpot } | null>(null)

  const framed = framedSize(geometry)
  const longEdge = Math.max(geometry.width, geometry.height)
  const radiusFor = (size: number) => (size * longEdge * frame.width) / Math.max(1, framed.w)
  const toScreen = (x: number, y: number): Point => {
    const p = sourceToFrame(geometry, x, y)
    return { x: p.x * frame.width, y: p.y * frame.height }
  }
  const screenPath = (points: number[], dx = 0, dy = 0) => {
    const out: Point[] = []
    for (let i = 0; i < points.length; i += 2) out.push(toScreen(points[i]! + dx, points[i + 1]! + dy))
    return pathData(out)
  }
  const toSource = (e: ReactPointerEvent<Element>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return frameToSource(
      geometry,
      (e.clientX - rect.left) / Math.max(1, rect.width),
      (e.clientY - rect.top) / Math.max(1, rect.height),
    )
  }
  const toolRadius = radiusFor(tool.size)

  const finishDraft = (points: number[]) => {
    const spot: HealSpot = {
      id: crypto.randomUUID(),
      mode: tool.mode,
      points,
      size: tool.size,
      feather: tool.feather,
      opacity: tool.opacity,
      dx: 0,
      dy: 0,
    }
    // Removal is filled by the model: there is no source to pick.
    if (spot.mode === 'remove') {
      onAdd(spot)
      return
    }
    const source = pickSource(spot)
    if (source) {
      onAdd({ ...spot, ...source })
      return
    }
    // Nothing fits (a huge area?): start just beside it, towards the middle of the photo.
    const c = centroid(points)
    const shift = (tool.size * 3 * longEdge) / geometry.width
    onAdd({ ...spot, dx: c.x < 0.5 ? shift : -shift })
  }

  const beginSourceDrag = (spot: HealSpot) => (e: ReactPointerEvent<Element>) => {
    if (e.button !== 0) return
    e.stopPropagation()
    onBegin?.()
    dragRef.current = { id: spot.id, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, spot }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const dragSource = (e: ReactPointerEvent<Element>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId || frame.width <= 0) return
    const { spot } = drag
    const c = centroid(spot.points)
    const anchor = sourceToFrame(geometry, c.x + spot.dx, c.y + spot.dy)
    const moved = frameToSource(
      geometry,
      anchor.x + (e.clientX - drag.startX) / frame.width,
      anchor.y + (e.clientY - drag.startY) / frame.height,
    )
    onChange(spot.id, { dx: moved.x - c.x, dy: moved.y - c.y })
  }

  const endSourceDrag = (e: ReactPointerEvent<Element>) => {
    if (dragRef.current?.pointerId !== e.pointerId) return
    dragRef.current = null
    onCommit?.()
  }

  // The selected spot draws last so its handles sit on top.
  const ordered = showOutlines
    ? [...spots.filter((s) => s.id !== selectedId), ...spots.filter((s) => s.id === selectedId)]
    : []

  return (
    <div
      className="heal-overlay"
      style={{ left: frame.left, top: frame.top, width: frame.width, height: frame.height }}
      onPointerDown={(e) => {
        if (e.button !== 0) return
        e.stopPropagation()
        const p = toSource(e)
        setDraft({ pointerId: e.pointerId, points: [p.x, p.y] })
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top })
        if (!draft || draft.pointerId !== e.pointerId) return
        const pts = draft.points
        const last = toScreen(pts[pts.length - 2]!, pts[pts.length - 1]!)
        // Skip points closer than a fraction of the radius: smoother and cheaper.
        const dist = Math.hypot(e.clientX - rect.left - last.x, e.clientY - rect.top - last.y)
        if (dist < Math.max(2, toolRadius * 0.25)) return
        const p = toSource(e)
        setDraft({ ...draft, points: [...pts, p.x, p.y] })
      }}
      onPointerUp={(e) => {
        if (draft?.pointerId !== e.pointerId) return
        setDraft(null)
        finishDraft(draft.points)
      }}
      onPointerCancel={() => setDraft(null)}
      onPointerLeave={() => setCursor(null)}
      onDoubleClick={stop}
    >
      <svg className="heal-overlay__svg" aria-hidden="true">
        {ordered.map((spot) => {
          const selected = spot.id === selectedId
          const radius = radiusFor(spot.size)
          const target = screenPath(spot.points)
          const c = centroid(spot.points)
          const from = toScreen(c.x + spot.dx, c.y + spot.dy)
          const to = toScreen(c.x, c.y)
          const hasSource = selected && spot.mode !== 'remove'
          const source = hasSource ? screenPath(spot.points, spot.dx, spot.dy) : ''
          return (
            <g key={spot.id} className={selected ? 'heal-spot heal-spot--selected' : 'heal-spot'}>
              <Outline id={spot.id} d={target} radius={radius} className="heal-spot__outline" />
              <path
                d={target}
                strokeWidth={radius * 2}
                className="heal-spot__hit"
                onPointerDown={(e) => {
                  if (e.button !== 0) return
                  e.stopPropagation()
                  onSelect(spot.id)
                }}
              />
              {hasSource && (
                <>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="heal-spot__link" />
                  <Outline
                    id={`${spot.id}-source`}
                    d={source}
                    radius={radius}
                    className="heal-spot__outline heal-spot__outline--source"
                  />
                  <path
                    d={source}
                    strokeWidth={radius * 2}
                    className="heal-spot__hit heal-spot__hit--source"
                    onPointerDown={beginSourceDrag(spot)}
                    onPointerMove={dragSource}
                    onPointerUp={endSourceDrag}
                    onPointerCancel={endSourceDrag}
                  >
                    <title>Drag to choose where the fix comes from</title>
                  </path>
                </>
              )}
            </g>
          )
        })}
        {draft && <path d={screenPath(draft.points)} strokeWidth={toolRadius * 2} className="heal-draft" />}
      </svg>
      {cursor && !draft && (
        <>
          <span
            className="brush-cursor"
            style={{ left: cursor.x, top: cursor.y, width: toolRadius * 2, height: toolRadius * 2 }}
          />
          <span
            className="brush-cursor brush-cursor--inner"
            style={{
              left: cursor.x,
              top: cursor.y,
              width: toolRadius * 2 * (1 - tool.feather),
              height: toolRadius * 2 * (1 - tool.feather),
            }}
          />
        </>
      )}
    </div>
  )
}
