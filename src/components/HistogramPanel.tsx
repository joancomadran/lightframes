import { useEffect, useRef } from 'react'
import { drawHistogram, type ClippingStats, type HistogramBins } from '../lib/histogram'

type HistogramPanelProps = {
  bins: HistogramBins | null
  clipping: ClippingStats | null
  showClipping: boolean
  onToggleClipping: () => void
}

export function HistogramPanel({
  bins,
  clipping,
  showClipping,
  onToggleClipping,
}: HistogramPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !bins) return
    drawHistogram(canvas, bins)
  }, [bins])

  const shadowPct = clipping
    ? ((clipping.shadowPixels / Math.max(1, clipping.totalPixels)) * 100).toFixed(1)
    : '0.0'
  const hiPct = clipping
    ? ((clipping.highlightPixels / Math.max(1, clipping.totalPixels)) * 100).toFixed(1)
    : '0.0'

  return (
    <section className="panel histogram-panel" aria-label="Histogram">
      <div className="histogram-frame">
        <canvas ref={canvasRef} className="histogram-canvas" aria-hidden="true" />
        <span className="histogram-stat histogram-stat--shadows" title="Pixels clipped to black">
          ◀ {shadowPct}%
        </span>
        <span className="histogram-stat histogram-stat--highlights" title="Pixels clipped to white">
          {hiPct}% ▶
        </span>
        <button
          type="button"
          className={
            showClipping ? 'histogram-clip histogram-clip--active' : 'histogram-clip'
          }
          onClick={onToggleClipping}
          aria-pressed={showClipping}
          title="Show clipped pixels on the image (J)"
        >
          Clipping
        </button>
      </div>
    </section>
  )
}
