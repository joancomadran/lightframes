import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { evaluateToneCurve } from '../lib/imageProcessing'
import {
  createDefaultToneCurve,
  type CurvePoint,
  type EditParams,
  type ToneCurve,
} from '../types/edits'

type ToneCurvePanelProps = {
  edits: EditParams
  disabled?: boolean
  /** Luminance histogram drawn behind the curve. */
  histogram?: Uint32Array | null
  onChange: (patch: Partial<EditParams>, opts?: { commit?: boolean }) => void
  onBegin?: () => void
  onCommit?: () => void
}

const CURVE_PRESETS: { id: string; label: string; points: CurvePoint[] }[] = [
  { id: 'linear', label: 'Linear', points: createDefaultToneCurve().points },
  {
    id: 'medium',
    label: 'Medium',
    points: [
      { x: 0, y: 0 },
      { x: 0.25, y: 0.21 },
      { x: 0.75, y: 0.79 },
      { x: 1, y: 1 },
    ],
  },
  {
    id: 'strong',
    label: 'Strong',
    points: [
      { x: 0, y: 0 },
      { x: 0.25, y: 0.16 },
      { x: 0.75, y: 0.84 },
      { x: 1, y: 1 },
    ],
  },
  {
    id: 'matte',
    label: 'Matte',
    points: [
      { x: 0, y: 0.1 },
      { x: 0.25, y: 0.26 },
      { x: 0.75, y: 0.76 },
      { x: 1, y: 0.95 },
    ],
  },
]

/** Hit radius for grabbing a point, in CSS pixels. */
const HIT_RADIUS = 10

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

function samePoints(a: CurvePoint[], b: CurvePoint[]): boolean {
  return (
    a.length === b.length &&
    a.every((p, i) => Math.abs(p.x - b[i]!.x) < 0.001 && Math.abs(p.y - b[i]!.y) < 0.001)
  )
}

export function ToneCurvePanel({
  edits,
  disabled,
  histogram,
  onChange,
  onBegin,
  onCommit,
}: ToneCurvePanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragIndex = useRef<number | null>(null)
  const [size, setSize] = useState(0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const curve = edits.toneCurve
  const activePreset = CURVE_PRESETS.find((p) => samePoints(p.points, curve.points))?.id

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0
      setSize(Math.round(width))
    })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || size <= 0) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.fillStyle = '#121816'
    ctx.fillRect(0, 0, size, size)

    if (histogram && histogram.length > 0) {
      // sqrt scaling keeps midtones visible next to clipped spikes.
      let max = 1
      for (let i = 1; i < histogram.length - 1; i++) max = Math.max(max, histogram[i]!)
      const scale = 1 / Math.sqrt(max)
      ctx.fillStyle = 'rgba(232, 239, 228, 0.09)'
      ctx.beginPath()
      ctx.moveTo(0, size)
      for (let i = 0; i < histogram.length; i++) {
        const x = (i / (histogram.length - 1)) * size
        const h = Math.min(1, Math.sqrt(histogram[i]!) * scale) * size * 0.9
        ctx.lineTo(x, size - h)
      }
      ctx.lineTo(size, size)
      ctx.closePath()
      ctx.fill()
    }

    ctx.strokeStyle = 'rgba(200, 245, 96, 0.1)'
    ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) {
      const p = Math.round((i / 4) * size) + 0.5
      ctx.beginPath()
      ctx.moveTo(p, 0)
      ctx.lineTo(p, size)
      ctx.moveTo(0, p)
      ctx.lineTo(size, p)
      ctx.stroke()
    }

    ctx.setLineDash([3, 4])
    ctx.strokeStyle = 'rgba(232, 239, 228, 0.18)'
    ctx.beginPath()
    ctx.moveTo(0, size)
    ctx.lineTo(size, 0)
    ctx.stroke()
    ctx.setLineDash([])

    const evaluate = evaluateToneCurve(curve)
    ctx.strokeStyle = '#c8f560'
    ctx.lineWidth = 1.75
    ctx.beginPath()
    for (let px = 0; px <= size; px++) {
      const y = (1 - evaluate(px / size)) * size
      if (px === 0) ctx.moveTo(px, y)
      else ctx.lineTo(px, y)
    }
    ctx.stroke()

    curve.points.forEach((p, i) => {
      const x = clamp01(p.x) * size
      const y = (1 - clamp01(p.y)) * size
      const active = i === activeIndex
      ctx.beginPath()
      ctx.arc(x, y, active ? 5 : 4, 0, Math.PI * 2)
      ctx.fillStyle = active ? '#c8f560' : '#121816'
      ctx.fill()
      ctx.lineWidth = 1.5
      ctx.strokeStyle = active ? '#c8f560' : '#e8efe4'
      ctx.stroke()
    })
  }, [curve, size, histogram, activeIndex])

  const pointFromEvent = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return {
      x: clamp01((e.clientX - rect.left) / rect.width),
      y: clamp01(1 - (e.clientY - rect.top) / rect.height),
    }
  }

  const hitIndex = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    let best = -1
    let bestDist = HIT_RADIUS
    curve.points.forEach((p, i) => {
      const d = Math.hypot(p.x * rect.width - mx, (1 - p.y) * rect.height - my)
      if (d <= bestDist) {
        bestDist = d
        best = i
      }
    })
    return best
  }

  const setCurve = (next: ToneCurve, opts?: { commit?: boolean }) =>
    onChange({ toneCurve: next }, opts)

  const active = activeIndex !== null ? curve.points[activeIndex] : undefined

  return (
    <section className="panel" aria-label="Tone curve">
      <div className="adjust-group__header">
        <h3 className="adjust-group__title">Tone curve</h3>
      </div>

      <div className="segmented" role="group" aria-label="Curve presets">
        {CURVE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={
              activePreset === preset.id ? 'segmented__btn segmented__btn--active' : 'segmented__btn'
            }
            aria-pressed={activePreset === preset.id}
            disabled={disabled}
            onClick={() =>
              setCurve({ points: preset.points.map((p) => ({ ...p })) }, { commit: true })
            }
          >
            {preset.label}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        className={disabled ? 'curve-canvas curve-canvas--disabled' : 'curve-canvas'}
        aria-label="Master tone curve"
        onPointerDown={(e) => {
          if (disabled) return
          onBegin?.()
          let idx = hitIndex(e)
          if (idx < 0) {
            const pt = pointFromEvent(e)
            const points = [...curve.points, pt].sort((a, b) => a.x - b.x)
            setCurve({ points })
            idx = points.indexOf(pt)
          }
          dragIndex.current = idx
          setActiveIndex(idx)
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (disabled) return
          if (dragIndex.current === null) {
            const idx = hitIndex(e)
            setActiveIndex(idx >= 0 ? idx : null)
            return
          }
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
        onPointerLeave={() => {
          if (dragIndex.current === null) setActiveIndex(null)
        }}
        onDoubleClick={(e) => {
          if (disabled) return
          const idx = hitIndex(e)
          if (idx <= 0 || idx >= curve.points.length - 1) return
          setCurve({ points: curve.points.filter((_, i) => i !== idx) }, { commit: true })
          setActiveIndex(null)
        }}
      />

      <div className="curve-readout">
        {active ? (
          <>
            <span>
              In <strong>{Math.round(active.x * 255)}</strong>
            </span>
            <span>
              Out <strong>{Math.round(active.y * 255)}</strong>
            </span>
          </>
        ) : (
          <span>Click to add · drag to shape · double-click a point to remove</span>
        )}
      </div>
    </section>
  )
}
