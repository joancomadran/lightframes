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
      <div className="panel__header">
        <h2 className="panel__title">Histogram</h2>
        <button
          type="button"
          className={showClipping ? 'btn btn--sm btn--accent' : 'btn btn--ghost btn--sm'}
          onClick={onToggleClipping}
          title="Toggle clipping overlay (J)"
        >
          Clip
        </button>
      </div>
      <canvas ref={canvasRef} className="histogram-canvas" aria-hidden="true" />
      <div className="histogram-stats">
        <span>Shadows {shadowPct}%</span>
        <span>Highlights {hiPct}%</span>
      </div>
    </section>
  )
}
