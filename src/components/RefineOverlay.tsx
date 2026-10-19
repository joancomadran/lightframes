import { useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { frameToSource, framedSize, sourceToFrame, type HealGeometry } from '../lib/heal'
import type { CutoutStroke } from '../types/edits'
import type { OverlayFrame } from './CropOverlay'

export type RefineTool = {
  /** Keep paints the subject back in; erase removes what shouldn't be there. */
  keep: boolean
  /** Radius as a fraction of the photo's long edge. */
  size: number
}

export type RefineOverlayConfig = {
  tool: RefineTool
  onStroke: (stroke: CutoutStroke) => void
}

const stop = (e: ReactMouseEvent) => e.stopPropagation()

/** Brush for fixing the background cutout by hand: paint to keep or erase. */
export function RefineOverlay({
  frame,
  geometry,
  config,
}: {
  frame: OverlayFrame
  geometry: HealGeometry
  config: RefineOverlayConfig
}) {
  const { tool, onStroke } = config
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const [draft, setDraft] = useState<{ pointerId: number; points: number[] } | null>(null)
  const radius = (tool.size * Math.max(geometry.width, geometry.height) * frame.width) / Math.max(1, framedSize(geometry).w)

  const toSource = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return frameToSource(
      geometry,
      (e.clientX - rect.left) / Math.max(1, rect.width),
      (e.clientY - rect.top) / Math.max(1, rect.height),
    )
  }
  const screenPath = (points: number[]) => {
    const out: string[] = []
    for (let i = 0; i < points.length; i += 2) {
      const p = sourceToFrame(geometry, points[i]!, points[i + 1]!)
      out.push(`${i === 0 ? 'M' : 'L'}${p.x * frame.width} ${p.y * frame.height}`)
    }
    // A lone point still needs a (tiny) segment for its round cap to draw a dot.
    return points.length === 2 ? `${out[0]}l0.01 0` : out.join('')
  }
  const className = tool.keep ? 'refine-draft refine-draft--keep' : 'refine-draft refine-draft--erase'

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
        const local = { x: e.clientX - rect.left, y: e.clientY - rect.top }
        setCursor(local)
        if (!draft || draft.pointerId !== e.pointerId) return
        const pts = draft.points
        const last = sourceToFrame(geometry, pts[pts.length - 2]!, pts[pts.length - 1]!)
        // Skip points closer than a fraction of the radius: smoother and cheaper.
        if (Math.hypot(local.x - last.x * frame.width, local.y - last.y * frame.height) < Math.max(2, radius * 0.25)) return
        const p = toSource(e)
        setDraft({ ...draft, points: [...pts, p.x, p.y] })
      }}
      onPointerUp={(e) => {
        if (draft?.pointerId !== e.pointerId) return
        setDraft(null)
        onStroke({ points: draft.points, size: tool.size, keep: tool.keep })
      }}
      onPointerCancel={() => setDraft(null)}
      onPointerLeave={() => setCursor(null)}
      onDoubleClick={stop}
    >
      <svg className="heal-overlay__svg" aria-hidden="true">
        {draft && <path d={screenPath(draft.points)} strokeWidth={radius * 2} className={className} />}
      </svg>
      {cursor && (
        <span
          className={tool.keep ? 'brush-cursor' : 'brush-cursor brush-cursor--erase'}
          style={{ left: cursor.x, top: cursor.y, width: radius * 2, height: radius * 2 }}
        />
      )}
    </div>
  )
}
