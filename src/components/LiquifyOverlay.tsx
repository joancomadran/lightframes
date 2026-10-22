import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { frameToSource, framedSize, sourceToFrame, type HealGeometry } from '../lib/heal'
import type { LiquifyMode, LiquifyStroke } from '../types/edits'
import type { OverlayFrame } from './CropOverlay'

export type LiquifyTool = {
  mode: LiquifyMode
  /** Radius as a fraction of the photo's long edge. */
  size: number
  strength: number
}

export type LiquifyOverlayConfig = {
  tool: LiquifyTool
  /** While true, draw the brush at its size in the middle of the view (the size slider is moving). */
  sizePreview: boolean
  /** The brush went down: a stroke starts. */
  onBegin: () => void
  /** The stroke being painted, every time it grows. */
  onChange: (stroke: LiquifyStroke) => void
  /** The brush lifted. */
  onCommit: () => void
}

/** Bloat, pinch, twirl and restore keep working while the brush is held still: one point per tick. */
const TICK_MS = 33

const stop = (e: ReactMouseEvent) => e.stopPropagation()

/** Alt flips a brush to its opposite, as in other editors. */
function altMode(mode: LiquifyMode): LiquifyMode {
  if (mode === 'bloat') return 'pinch'
  if (mode === 'pinch') return 'bloat'
  if (mode === 'twirl') return 'twirlLeft'
  if (mode === 'twirlLeft') return 'twirl'
  return mode
}

/** Five decimals is well under a pixel and keeps saved strokes small. */
const round = (v: number) => Math.round(v * 1e5) / 1e5

/** Liquify brush over the image: drag to push, hold to bloat, pinch or twirl. */
export function LiquifyOverlay({
  frame,
  viewport,
  geometry,
  config,
}: {
  frame: OverlayFrame
  /** Visible area, in the same coordinates as `frame`. */
  viewport: { w: number; h: number }
  /** Orientation and crop only: strokes are recorded on the photo as it looks, warps included. */
  geometry: HealGeometry
  config: LiquifyOverlayConfig
}) {
  const { tool, sizePreview } = config
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const [painting, setPainting] = useState(false)
  const strokeRef = useRef<{ pointerId: number; stroke: LiquifyStroke; latest: { x: number; y: number } } | null>(null)
  const configRef = useRef(config)
  useLayoutEffect(() => {
    configRef.current = config
  })

  const radius = (tool.size * Math.max(geometry.width, geometry.height) * frame.width) / Math.max(1, framedSize(geometry).w)

  const toSource = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const p = frameToSource(
      geometry,
      (e.clientX - rect.left) / Math.max(1, rect.width),
      (e.clientY - rect.top) / Math.max(1, rect.height),
    )
    return { x: round(p.x), y: round(p.y) }
  }

  const grow = (p: { x: number; y: number }) => {
    const current = strokeRef.current
    if (!current) return
    current.stroke = { ...current.stroke, points: [...current.stroke.points, p.x, p.y] }
    configRef.current.onChange(current.stroke)
  }

  // While a timed brush is down, add the brush's latest position every tick.
  useEffect(() => {
    if (!painting || tool.mode === 'push') return
    const timer = window.setInterval(() => {
      const current = strokeRef.current
      if (current) grow(current.latest)
    }, TICK_MS)
    return () => window.clearInterval(timer)
  }, [painting, tool.mode])

  const finish = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (strokeRef.current?.pointerId !== e.pointerId) return
    strokeRef.current = null
    setPainting(false)
    configRef.current.onCommit()
  }

  return (
    <div
      className="heal-overlay"
      style={{ left: frame.left, top: frame.top, width: frame.width, height: frame.height }}
      onPointerDown={(e) => {
        if (e.button !== 0 || strokeRef.current) return
        e.stopPropagation()
        e.currentTarget.setPointerCapture(e.pointerId)
        const p = toSource(e)
        const stroke: LiquifyStroke = {
          mode: e.altKey ? altMode(tool.mode) : tool.mode,
          points: [p.x, p.y],
          size: tool.size,
          strength: tool.strength,
        }
        strokeRef.current = { pointerId: e.pointerId, stroke, latest: p }
        setPainting(true)
        config.onBegin()
        config.onChange(stroke)
      }}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const local = { x: e.clientX - rect.left, y: e.clientY - rect.top }
        setCursor(local)
        const current = strokeRef.current
        if (!current || current.pointerId !== e.pointerId) return
        current.latest = toSource(e)
        if (current.stroke.mode !== 'push') return
        const pts = current.stroke.points
        const last = sourceToFrame(geometry, pts[pts.length - 2]!, pts[pts.length - 1]!)
        // Skip points closer than a fraction of the radius: the warp fills in between anyway.
        if (Math.hypot(local.x - last.x * frame.width, local.y - last.y * frame.height) < Math.max(2, radius * 0.1)) return
        grow(current.latest)
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
      onPointerLeave={() => setCursor(null)}
      onDoubleClick={stop}
    >
      {sizePreview && !painting && (
        <span
          className="brush-cursor brush-cursor--preview"
          style={{
            left: Math.min(frame.width, Math.max(0, viewport.w / 2 - frame.left)),
            top: Math.min(frame.height, Math.max(0, viewport.h / 2 - frame.top)),
            width: radius * 2,
            height: radius * 2,
          }}
        />
      )}
      {cursor && !sizePreview && (
        <>
          <span
            className="brush-cursor"
            style={{ left: cursor.x, top: cursor.y, width: radius * 2, height: radius * 2 }}
          />
          <span className="brush-cursor brush-cursor--dot" style={{ left: cursor.x, top: cursor.y }} />
        </>
      )}
    </div>
  )
}
