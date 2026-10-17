import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  computeHistogram,
  drawClippingOverlay,
  type ClippingStats,
  type HistogramBins,
} from '../lib/histogram'
import { renderEditedImage } from '../lib/imageProcessing'
import { stepRotate, type EditParams } from '../types/edits'

type PreviewCanvasProps = {
  src: string | null
  edits: EditParams
  name?: string
  compareMode?: boolean
  showClipping?: boolean
  scrubbing?: boolean
  onRotate?: (next: EditParams['rotate']) => void
  onHistogram?: (bins: HistogramBins, clipping: ClippingStats) => void
}

type Size = { w: number; h: number }
type Pan = { x: number; y: number }

const MIN_ZOOM = 0.1
const MAX_ZOOM = 8
const ZOOM_STEP = 1.25
const PREVIEW_FAST = 960
const PREVIEW_IDLE = 1800

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function fitScaleFor(content: Size, viewport: Size): number {
  if (content.w <= 0 || content.h <= 0 || viewport.w <= 0 || viewport.h <= 0) {
    return 1
  }
  return Math.min(viewport.w / content.w, viewport.h / content.h)
}

function panAfterZoom(args: {
  prevZoom: number
  nextZoom: number
  prevPan: Pan
  content: Size
  viewport: Size
  anchorX: number
  anchorY: number
}): Pan {
  const fit = fitScaleFor(args.content, args.viewport)
  const prevScale = fit * args.prevZoom
  const nextScale = fit * args.nextZoom
  if (prevScale <= 0 || nextScale <= 0) return args.prevPan

  const prevTx =
    (args.viewport.w - args.content.w * prevScale) / 2 + args.prevPan.x
  const prevTy =
    (args.viewport.h - args.content.h * prevScale) / 2 + args.prevPan.y
  const ix = (args.anchorX - prevTx) / prevScale
  const iy = (args.anchorY - prevTy) / prevScale
  const nextTx = args.anchorX - ix * nextScale
  const nextTy = args.anchorY - iy * nextScale

  return {
    x: nextTx - (args.viewport.w - args.content.w * nextScale) / 2,
    y: nextTy - (args.viewport.h - args.content.h * nextScale) / 2,
  }
}

export function PreviewCanvas({
  src,
  edits,
  name,
  compareMode = false,
  showClipping = false,
  scrubbing = false,
  onRotate,
  onHistogram,
}: PreviewCanvasProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const clipRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const frameRef = useRef(0)
  const idleTimerRef = useRef(0)
  const viewRef = useRef({
    zoom: 1,
    pan: { x: 0, y: 0 },
    content: { w: 0, h: 0 },
    viewport: { w: 0, h: 0 },
  })
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 })
  const [contentSize, setContentSize] = useState<Size>({ w: 0, h: 0 })
  const [viewportSize, setViewportSize] = useState<Size>({ w: 0, h: 0 })
  const [maxEdge, setMaxEdge] = useState(PREVIEW_IDLE)

  viewRef.current = {
    zoom,
    pan,
    content: contentSize,
    viewport: viewportSize,
  }

  const fitScale = fitScaleFor(contentSize, viewportSize)
  const scale = fitScale * zoom
  const tx = (viewportSize.w - contentSize.w * scale) / 2 + pan.x
  const ty = (viewportSize.h - contentSize.h * scale) / 2 + pan.y

  const resetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const applyZoom = useCallback((nextZoom: number, anchorX: number, anchorY: number) => {
    const view = viewRef.current
    const z = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM)
    const nextPan = panAfterZoom({
      prevZoom: view.zoom,
      nextZoom: z,
      prevPan: view.pan,
      content: view.content,
      viewport: view.viewport,
      anchorX,
      anchorY,
    })
    setZoom(z)
    setPan(nextPan)
  }, [])

  const zoomBy = useCallback(
    (factor: number) => {
      const view = viewRef.current
      applyZoom(view.zoom * factor, view.viewport.w / 2, view.viewport.h / 2)
    },
    [applyZoom],
  )

  useEffect(() => {
    if (scrubbing) {
      setMaxEdge(PREVIEW_FAST)
      window.clearTimeout(idleTimerRef.current)
      return
    }
    window.clearTimeout(idleTimerRef.current)
    idleTimerRef.current = window.setTimeout(() => setMaxEdge(PREVIEW_IDLE), 180)
    return () => window.clearTimeout(idleTimerRef.current)
  }, [scrubbing, edits])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setViewportSize({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [src])

  useEffect(() => {
    if (!src) {
      imageRef.current = null
      setContentSize({ w: 0, h: 0 })
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx?.clearRect(0, 0, canvas.width, canvas.height)
        canvas.width = 0
        canvas.height = 0
      }
      return
    }

    let cancelled = false
    resetView()
    const img = new Image()
    img.src = src
    img.decode().then(() => {
      if (cancelled) return
      imageRef.current = img
      const canvas = canvasRef.current
      if (!canvas) return
      const imageData = renderEditedImage(img, edits, canvas, {
        maxEdge,
        bypassColor: compareMode,
      })
      setContentSize({ w: canvas.width, h: canvas.height })
      if (imageData && onHistogram) {
        const { bins, clipping } = computeHistogram(imageData)
        onHistogram(bins, clipping)
      }
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, resetView])

  useEffect(() => {
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      const img = imageRef.current
      const canvas = canvasRef.current
      if (!img || !canvas || !src) return
      const imageData = renderEditedImage(img, edits, canvas, {
        maxEdge,
        bypassColor: compareMode,
      })
      setContentSize({ w: canvas.width, h: canvas.height })
      if (imageData && onHistogram && !compareMode) {
        const { bins, clipping } = computeHistogram(imageData)
        onHistogram(bins, clipping)
      }
      const clipCanvas = clipRef.current
      if (clipCanvas) {
        if (showClipping && imageData && !compareMode) {
          drawClippingOverlay(clipCanvas, imageData)
        } else {
          clipCanvas.width = 0
          clipCanvas.height = 0
        }
      }
    })
    return () => cancelAnimationFrame(frameRef.current)
  }, [edits, src, maxEdge, compareMode, showClipping, onHistogram])

  const rotate = edits.rotate ?? 0
  useEffect(() => {
    if (!src) return
    resetView()
  }, [rotate, src, resetView])

  useEffect(() => {
    const el = viewportRef.current
    if (!el || !src) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const factor = e.deltaY > 0 ? 1 / ZOOM_STEP : ZOOM_STEP
      applyZoom(
        viewRef.current.zoom * factor,
        e.clientX - rect.left,
        e.clientY - rect.top,
      )
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [src, applyZoom])

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !src) return
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: pan.x,
      originY: pan.y,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    setPan({
      x: drag.originX + (e.clientX - drag.startX),
      y: drag.originY + (e.clientY - drag.startY),
    })
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    }
  }

  const onDoubleClick = () => {
    const view = viewRef.current
    const fitted =
      Math.abs(view.zoom - 1) < 0.02 &&
      Math.abs(view.pan.x) < 1 &&
      Math.abs(view.pan.y) < 1
    if (fitted) {
      const fit = fitScaleFor(view.content, view.viewport)
      applyZoom(fit > 0 ? 1 / fit : 1, view.viewport.w / 2, view.viewport.h / 2)
    } else {
      resetView()
    }
  }

  if (!src) {
    return (
      <div className="preview preview--empty">
        <p className="preview__empty-title">Drop light into a frame</p>
        <p className="preview__empty-copy">
          Open JPEG, PNG, or camera RAW files to preview edits live on the canvas.
        </p>
      </div>
    )
  }

  const zoomPercent = Math.round(zoom * 100)

  return (
    <div className="preview">
      {compareMode && <div className="preview__badge">Before</div>}
      <div
        ref={viewportRef}
        className="preview__viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
      >
        <div
          className="preview__world"
          style={{
            width: contentSize.w || undefined,
            height: contentSize.h || undefined,
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          }}
        >
          <canvas
            ref={canvasRef}
            className="preview__canvas"
            aria-label={name ?? 'Preview'}
          />
          <canvas
            ref={clipRef}
            className="preview__clip"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="preview__controls" role="toolbar" aria-label="View and rotate">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          disabled={!onRotate}
          onClick={() => onRotate?.(stepRotate(edits.rotate ?? 0, -90))}
          title="Rotate left"
          aria-label="Rotate left"
        >
          ↺
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          disabled={!onRotate}
          onClick={() => onRotate?.(stepRotate(edits.rotate ?? 0, 90))}
          title="Rotate right"
          aria-label="Rotate right"
        >
          ↻
        </button>
        <span className="preview__controls-sep" aria-hidden="true" />
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => zoomBy(1 / ZOOM_STEP)}
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm preview__zoom-label"
          onClick={resetView}
          title="Fit to view"
        >
          {zoomPercent}%
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => zoomBy(ZOOM_STEP)}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={resetView}
          title="Fit entire image"
        >
          Fit
        </button>
      </div>
    </div>
  )
}
