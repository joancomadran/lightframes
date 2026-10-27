import { useEffect, useRef } from 'react'
import { drawHistogram, type ClippingStats, type HistogramBins } from '../lib/histogram'

type HistogramPanelProps = {
  bins: HistogramBins | null
  clipping: ClippingStats | null
  showClipping: boolean
  onToggleClipping: () => void
  /** Floating on the photo (phones): shows a button that hides it. */
  onHide?: () => void
}

export function HistogramPanel({
  bins,
  clipping,
  showClipping,
  onToggleClipping,
  onHide,
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
    <section
      className={onHide ? 'panel histogram-panel histogram-panel--floating' : 'panel histogram-panel'}
      aria-label="Histogram"
    >
      <div className="histogram-frame">
        {onHide && (
          <button type="button" className="histogram-hide" onClick={onHide} aria-label="Hide histogram" title="Hide histogram">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
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
          aria-describedby="histogram-clip-tip"
        >
          Clipping
        </button>
        <span id="histogram-clip-tip" role="tooltip" className="histogram-clip__tip">
          Highlights the parts of the photo that have lost detail: <strong className="histogram-clip__hi">red</strong>{' '}
          for highlights blown to pure white, <strong className="histogram-clip__lo">blue</strong> for shadows
          crushed to pure black. <kbd>J</kbd> toggles it.
        </span>
      </div>
    </section>
  )
}
