import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { createDefaultToneCurve, type EditParams, type ToneCurve } from '../types/edits'

type ToneCurvePanelProps = {
  edits: EditParams
  disabled?: boolean
  onChange: (patch: Partial<EditParams>) => void
  onBegin?: () => void
  onCommit?: () => void
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

export function ToneCurvePanel({
  edits,
  disabled,
  onChange,
  onBegin,
  onCommit,
}: ToneCurvePanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragIndex = useRef<number | null>(null)
  const curve = edits.toneCurve

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const size = 200
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#121816'
    ctx.fillRect(0, 0, size, size)
    ctx.strokeStyle = 'rgba(200, 245, 96, 0.12)'
    for (let i = 1; i < 4; i++) {
      const p = (i / 4) * size
      ctx.beginPath()
      ctx.moveTo(p, 0)
      ctx.lineTo(p, size)
      ctx.moveTo(0, p)
      ctx.lineTo(size, p)
      ctx.stroke()
    }

    const points = curve.points
    ctx.strokeStyle = '#c8f560'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i < points.length; i++) {
      const p = points[i]!
      const x = p.x * size
      const y = (1 - p.y) * size
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    for (const p of points) {
      ctx.fillStyle = '#e8efe4'
      ctx.beginPath()
      ctx.arc(p.x * size, (1 - p.y) * size, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [curve])

  const pointFromEvent = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: clamp01((e.clientX - rect.left) / rect.width),
      y: clamp01(1 - (e.clientY - rect.top) / rect.height),
    }
  }

  const nearestIndex = (x: number, y: number) => {
    let best = 0
    let bestDist = Infinity
    curve.points.forEach((p, i) => {
      const d = (p.x - x) ** 2 + (p.y - y) ** 2
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    return bestDist < 0.02 ? best : -1
  }

  const setCurve = (next: ToneCurve) => onChange({ toneCurve: next })

  return (
    <section className="panel" aria-label="Tone curve">
      <div className="panel__header">
        <h2 className="panel__title">Tone curve</h2>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          disabled={disabled}
          onClick={() => {
            onBegin?.()
            setCurve(createDefaultToneCurve())
            onCommit?.()
          }}
        >
          Linear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="curve-canvas"
        aria-label="Master tone curve"
        onPointerDown={(e) => {
          if (disabled) return
          onBegin?.()
          const pt = pointFromEvent(e)
          let idx = nearestIndex(pt.x, pt.y)
          if (idx < 0) {
            const points = [...curve.points, pt].sort((a, b) => a.x - b.x)
            setCurve({ points })
            idx = points.findIndex((p) => p.x === pt.x && p.y === pt.y)
          }
          dragIndex.current = idx
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (disabled || dragIndex.current === null) return
          const pt = pointFromEvent(e)
          const idx = dragIndex.current
          const points = curve.points.map((p, i) => {
            if (i !== idx) return p
            if (i === 0) return { x: 0, y: pt.y }
            if (i === curve.points.length - 1) return { x: 1, y: pt.y }
            const minX = curve.points[i - 1]!.x + 0.01
            const maxX = curve.points[i + 1]!.x - 0.01
            return { x: Math.min(maxX, Math.max(minX, pt.x)), y: pt.y }
          })
          setCurve({ points })
        }}
        onPointerUp={(e) => {
          if (dragIndex.current !== null) {
            dragIndex.current = null
            onCommit?.()
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              e.currentTarget.releasePointerCapture(e.pointerId)
            }
          }
        }}
      />
      <p className="field-hint">Drag points · click to add · Linear resets</p>
    </section>
  )
}
