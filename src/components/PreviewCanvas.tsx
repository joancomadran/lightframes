import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  computeHistogram,
  drawClippingOverlay,
  type ClippingStats,
  type HistogramBins,
} from '../lib/histogram'
import {
  computeAutoTone,
  computeAutoWhiteBalance,
  computeMaskPreview,
  prepareBase,
  sampleBaseLinear,
  whiteBalanceForNeutral,
  type BaseImage,
  type RenderSource,
} from '../lib/imageProcessing'
import { loadRawPreview } from '../lib/rawDecode'
import { developBase } from '../lib/renderPipeline'
import { stepRotate, type EditParams, type LocalAdjustment } from '../types/edits'
import { COARSE_QUERY, useMediaQuery } from '../hooks/useMediaQuery'
import { CropOverlay, type CropOverlayConfig } from './CropOverlay'
import { MaskOverlay, type MaskOverlayConfig } from './MaskOverlay'

/** What the panels can ask of the preview (it owns the pixels the auto tools read). */
export type PreviewApi = {
  autoTone: () => ReturnType<typeof computeAutoTone> | null
  autoWhiteBalance: () => ReturnType<typeof computeAutoWhiteBalance> | null
}

type WhiteBalance = { temperature: number; tint: number }

type PreviewCanvasProps = {
  src: string | null
  /** RAW original: developed from sensor data; `src` is only the fallback. */
  rawFile?: Blob | null
  edits: EditParams
  name?: string
  compareMode?: boolean
  /** Before / after slider over the image. */
  split?: boolean
  onToggleSplit?: () => void
  showClipping?: boolean
  scrubbing?: boolean
  onRotate?: (next: EditParams['rotate']) => void
  onHistogram?: (bins: HistogramBins, clipping: ClippingStats) => void
  /** When set, show the uncropped frame with an editable crop box. */
  cropOverlay?: CropOverlayConfig | null
  /** When set, draw editable local masks (and the brush) over the image. */
  maskOverlay?: MaskOverlayConfig | null
  /** Mask to tint red over the image (mask overlay, O). */
  maskTint?: LocalAdjustment | null
  /** While set, clicking the image picks a neutral point for white balance. */
  onPickWhiteBalance?: ((wb: WhiteBalance) => void) | null
  apiRef?: { current: PreviewApi | null }
  /** Full-resolution size of the uncropped (rotated + straightened) frame. */
  onFrameSize?: (size: Size) => void
  /** Shown as the primary action of the empty state. */
  onOpen?: () => void
}

export type Size = { w: number; h: number }
type Pan = { x: number; y: number }

const MIN_ZOOM = 0.1
const MAX_ZOOM = 8
const ZOOM_STEP = 1.25
/** How long a finger rests on the photo before it shows the unedited version. */
const HOLD_MS = 280
// iPhone Safari only supports fullscreen for <video>.
const canFullscreen = typeof document !== 'undefined' && Boolean(document.fullscreenEnabled)
const PREVIEW_FAST = 960
const PREVIEW_IDLE = 1800
const BACKGROUND_KEY = 'lightframes:preview-background'

type PreviewBackground = 'black' | 'white'

function loadBackground(): PreviewBackground {
  try {
    return localStorage.getItem(BACKGROUND_KEY) === 'white' ? 'white' : 'black'
  } catch {
    return 'black'
  }
}

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

/** Pixel size of the original, before any preview downscaling. */
function sourceSize(source: RenderSource): Size {
  if ('kind' in source) {
    return { w: source.fullWidth ?? source.width, h: source.fullHeight ?? source.height }
  }
  if (source instanceof HTMLImageElement) return { w: source.naturalWidth, h: source.naturalHeight }
  return { w: source.width, h: source.height }
}

export function PreviewCanvas({
  src,
  rawFile = null,
  edits,
  name,
  compareMode = false,
  split = false,
  onToggleSplit,
  showClipping = false,
  scrubbing = false,
  onRotate,
  onHistogram,
  cropOverlay = null,
  maskOverlay = null,
  maskTint = null,
  onPickWhiteBalance = null,
  apiRef,
  onFrameSize,
  onOpen,
}: PreviewCanvasProps) {
  const coarsePointer = useMediaQuery(COARSE_QUERY)
  const rootRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const clipRef = useRef<HTMLCanvasElement>(null)
  const beforeRef = useRef<HTMLCanvasElement>(null)
  const tintRef = useRef<HTMLCanvasElement>(null)
  const baseCacheRef = useRef<{ source: RenderSource; key: string; base: BaseImage } | null>(null)
  /** Which base was drawn into which "before" canvas (it remounts every time the split opens). */
  const beforeCacheRef = useRef<{ base: BaseImage; canvas: HTMLCanvasElement } | null>(null)
  const renderStateRef = useRef({ busy: false, dirty: false })
  const sourceRef = useRef<RenderSource | null>(null)
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
  // Touch gestures: every active pointer (viewport coords), the pinch baseline and the last tap.
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  // Touch and hold shows the unedited photo until the finger lifts.
  const holdRef = useRef<{ timer: number; x: number; y: number; fired: boolean } | null>(null)
  const [holding, setHolding] = useState(false)
  /** Bases currently drawn on the main and the "before" canvas: the before layer only shows once they match. */
  const [renderedBase, setRenderedBase] = useState<BaseImage | null>(null)
  const [beforeBase, setBeforeBase] = useState<BaseImage | null>(null)
  const pinchRef = useRef<{
    dist: number
    mid: { x: number; y: number }
    zoom: number
    pan: Pan
  } | null>(null)
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null)

  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 })
  const [contentSize, setContentSize] = useState<Size>({ w: 0, h: 0 })
  const [viewportSize, setViewportSize] = useState<Size>({ w: 0, h: 0 })
  const [maxEdge, setMaxEdge] = useState(PREVIEW_IDLE)
  const [background, setBackground] = useState<PreviewBackground>(loadBackground)
  const [fullscreen, setFullscreen] = useState(false)
  const [sourceVersion, setSourceVersion] = useState(0)
  /** The `src` whose pixels are loaded; a RAW is still developing until it matches. */
  const [readySrc, setReadySrc] = useState<string | null>(null)
  const developingRaw = Boolean(rawFile) && readySrc !== src
  const [splitPos, setSplitPos] = useState(0.5)

  const cropActive = cropOverlay != null
  // While cropping, render the whole frame (keeping straighten) so the box can move freely.
  const renderEdits = useMemo<EditParams>(
    () =>
      cropActive
        ? { ...edits, crop: { x: 0, y: 0, width: 1, height: 1, straighten: edits.crop.straighten } }
        : edits,
    [edits, cropActive],
  )
  const frameSizeRef = useRef<Size>({ w: 0, h: 0 })
  const splitActive = split && !compareMode && !cropActive
  // Everything the async render loop reads, refreshed every render.
  const latestRef = useRef({ renderEdits, edits, maxEdge, compareMode, showClipping, splitActive, onHistogram })
  useLayoutEffect(() => {
    latestRef.current = { renderEdits, edits, maxEdge, compareMode, showClipping, splitActive, onHistogram }
  })

  useLayoutEffect(() => {
    viewRef.current = { zoom, pan, content: contentSize, viewport: viewportSize }
  })

  // A new photo, rotation or crop mode re-fits the view (state adjusted during render).
  const viewKey = `${src}|${edits.rotate ?? 0}|${cropActive}`
  const [fittedKey, setFittedKey] = useState(viewKey)
  if (viewKey !== fittedKey) {
    setFittedKey(viewKey)
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Drop to the fast preview size while a slider moves; the idle size returns after a pause.
  if (scrubbing && maxEdge !== PREVIEW_FAST) setMaxEdge(PREVIEW_FAST)

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

  const onFrameSizeRef = useRef(onFrameSize)
  useLayoutEffect(() => {
    onFrameSizeRef.current = onFrameSize
  })
  const reportFrameSize = useCallback((source: RenderSource) => {
    const onFrameSize = onFrameSizeRef.current
    if (!onFrameSize) return
    const { edits } = latestRef.current
    const turn = edits.rotate ?? 0
    const quarter = turn === 90 || turn === 270
    const size = sourceSize(source)
    const ow = quarter ? size.h : size.w
    const oh = quarter ? size.w : size.h
    const rad = (edits.crop.straighten * Math.PI) / 180
    const cos = Math.abs(Math.cos(rad))
    const sin = Math.abs(Math.sin(rad))
    const next = { w: Math.round(ow * cos + oh * sin), h: Math.round(ow * sin + oh * cos) }
    const prev = frameSizeRef.current
    if (prev.w === next.w && prev.h === next.h) return
    frameSizeRef.current = next
    onFrameSize(next)
  }, [])

  const getBase = useCallback((source: RenderSource, renderEdits: EditParams, maxEdge: number) => {
    const c = renderEdits.crop
    const key = `${maxEdge}|${renderEdits.rotate}|${c.x},${c.y},${c.width},${c.height},${c.straighten}`
    const cached = baseCacheRef.current
    if (cached && cached.source === source && cached.key === key) return cached.base
    const base = prepareBase(source, renderEdits, maxEdge)
    if (base) baseCacheRef.current = { source, key, base }
    return base
  }, [])

  /**
   * Render loop: at most one develop in flight; edits that arrive meanwhile
   * mark it dirty and it runs again with the latest settings.
   */
  const renderNow = useCallback(async () => {
    const state = renderStateRef.current
    if (state.busy) {
      state.dirty = true
      return
    }
    state.busy = true
    try {
      do {
        state.dirty = false
        const source = sourceRef.current
        const canvas = canvasRef.current
        if (!source || !canvas) break
        const { renderEdits, maxEdge, compareMode, showClipping, splitActive, onHistogram } =
          latestRef.current
        reportFrameSize(source)
        const base = getBase(source, renderEdits, maxEdge)
        if (!base) break
        const imageData = await developBase(base, renderEdits, { bypass: compareMode })
        if (sourceRef.current !== source) break

        canvas.width = base.width
        canvas.height = base.height
        canvas.getContext('2d')?.putImageData(imageData, 0, 0)
        setContentSize({ w: base.width, h: base.height })
        setRenderedBase(base)
        if (onHistogram && !compareMode) {
          const { bins, clipping } = computeHistogram(imageData)
          onHistogram(bins, clipping)
        }
        const clipCanvas = clipRef.current
        if (clipCanvas) {
          if (showClipping && !compareMode) {
            drawClippingOverlay(clipCanvas, imageData)
          } else {
            clipCanvas.width = 0
            clipCanvas.height = 0
          }
        }

        const beforeCanvas = beforeRef.current
        const beforeCache = beforeCacheRef.current
        if (
          splitActive &&
          beforeCanvas &&
          (beforeCache?.base !== base || beforeCache.canvas !== beforeCanvas)
        ) {
          const before = await developBase(base, renderEdits, { bypass: true })
          beforeCanvas.width = base.width
          beforeCanvas.height = base.height
          beforeCanvas.getContext('2d')?.putImageData(before, 0, 0)
          beforeCacheRef.current = { base, canvas: beforeCanvas }
          setBeforeBase(base)
        }
      } while (state.dirty)
    } finally {
      state.busy = false
    }
  }, [getBase, reportFrameSize])

  const pickBase = () => baseCacheRef.current?.base ?? null

  /** Draw the unedited photo onto the "before" canvas for the base on screen, unless it is already there. */
  const renderBefore = useCallback(async () => {
    const canvas = beforeRef.current
    const base = baseCacheRef.current?.base
    if (!canvas || !base) return
    const cached = beforeCacheRef.current
    if (cached?.base !== base || cached.canvas !== canvas) {
      const before = await developBase(base, latestRef.current.renderEdits, { bypass: true })
      if (baseCacheRef.current?.base !== base) return
      canvas.width = base.width
      canvas.height = base.height
      canvas.getContext('2d')?.putImageData(before, 0, 0)
      beforeCacheRef.current = { base, canvas }
    }
    setBeforeBase(base)
  }, [])

  useEffect(() => {
    if (holding) void renderBefore()
  }, [holding, renderBefore])

  const cancelHold = () => {
    if (holdRef.current) window.clearTimeout(holdRef.current.timer)
    holdRef.current = null
    setHolding(false)
  }

  useEffect(() => {
    if (!apiRef) return
    apiRef.current = {
      autoTone: () => {
        const base = pickBase()
        return base ? computeAutoTone(base, latestRef.current.edits) : null
      },
      autoWhiteBalance: () => {
        const base = pickBase()
        return base ? computeAutoWhiteBalance(base) : null
      },
    }
    return () => {
      apiRef.current = null
    }
  }, [apiRef])

  const toggleBackground = useCallback(() => {
    setBackground((prev) => {
      const next = prev === 'black' ? 'white' : 'black'
      try {
        localStorage.setItem(BACKGROUND_KEY, next)
      } catch {
        // Storage unavailable — keep the choice for this session only.
      }
      return next
    })
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!canFullscreen) return
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void rootRef.current?.requestFullscreen()
    }
  }, [])

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === rootRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => {
    if (!src) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        (target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable))
      ) {
        return
      }
      const key = e.key.toLowerCase()
      if (key === 'f') {
        e.preventDefault()
        toggleFullscreen()
      } else if (key === 'b') {
        e.preventDefault()
        toggleBackground()
      } else if (key === 'y') {
        e.preventDefault()
        onToggleSplit?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [src, toggleFullscreen, toggleBackground, onToggleSplit])

  useEffect(() => {
    window.clearTimeout(idleTimerRef.current)
    if (scrubbing) return
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
      sourceRef.current = null
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
    sourceRef.current = null
    // Rendering happens in the effect below once the source is ready.
    const showSource = (source: RenderSource) => {
      if (cancelled) return
      sourceRef.current = source
      setSourceVersion((v) => v + 1)
      setReadySrc(src)
    }
    const loadImage = () => {
      const img = new Image()
      img.src = src
      return img.decode().then(() => showSource(img))
    }

    if (rawFile) {
      loadRawPreview(rawFile)
        .then(showSource)
        // LibRaw could not develop this file: fall back to the embedded JPEG.
        .catch(loadImage)
        .catch(() => {
          if (!cancelled) setReadySrc(src)
        })
    } else {
      void loadImage()
    }

    return () => {
      cancelled = true
    }
  }, [src, rawFile])

  useEffect(() => {
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => void renderNow())
    return () => cancelAnimationFrame(frameRef.current)
  }, [renderEdits, src, sourceVersion, maxEdge, compareMode, showClipping, splitActive, onHistogram, renderNow])

  // Red mask tint: a small grid of the selected mask's weights, scaled up by CSS.
  useEffect(() => {
    const canvas = tintRef.current
    if (!canvas) return
    if (!maskTint || contentSize.w === 0) {
      canvas.width = 0
      canvas.height = 0
      return
    }
    const scale = 360 / Math.max(contentSize.w, contentSize.h)
    const w = Math.max(1, Math.round(contentSize.w * scale))
    const h = Math.max(1, Math.round(contentSize.h * scale))
    const weights = computeMaskPreview(maskTint, w, h, contentSize.w, contentSize.h)
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = ctx.createImageData(w, h)
    for (let k = 0, i = 0; k < weights.length; k++, i += 4) {
      img.data[i] = 255
      img.data[i + 1] = 48
      img.data[i + 2] = 64
      img.data[i + 3] = weights[k]! * 150
    }
    ctx.putImageData(img, 0, 0)
  }, [maskTint, contentSize.w, contentSize.h])

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

  const localPoint = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startPinch = () => {
    const [a, b] = [...pointersRef.current.values()]
    if (!a || !b) return
    dragRef.current = null
    pinchRef.current = {
      dist: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      zoom: viewRef.current.zoom,
      pan: viewRef.current.pan,
    }
  }

  const startDrag = (pointerId: number, clientX: number, clientY: number) => {
    const { pan: current } = viewRef.current
    dragRef.current = { pointerId, startX: clientX, startY: clientY, originX: current.x, originY: current.y }
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !src) return
    if (onPickWhiteBalance) {
      const base = pickBase()
      const rect = e.currentTarget.getBoundingClientRect()
      const x = Math.floor((e.clientX - rect.left - tx) / scale)
      const y = Math.floor((e.clientY - rect.top - ty) / scale)
      if (base && x >= 0 && y >= 0 && x < base.width && y < base.height) {
        onPickWhiteBalance(whiteBalanceForNeutral(sampleBaseLinear(base, x, y)))
      }
      return
    }
    pointersRef.current.set(e.pointerId, localPoint(e))
    e.currentTarget.setPointerCapture(e.pointerId)
    if (pointersRef.current.size === 2) {
      cancelHold()
      startPinch()
      lastTapRef.current = null
    } else if (pointersRef.current.size === 1) {
      startDrag(e.pointerId, e.clientX, e.clientY)
      if (e.pointerType === 'touch' && !compareMode && !cropActive && !maskOverlay) {
        const hold = { timer: 0, x: e.clientX, y: e.clientY, fired: false }
        hold.timer = window.setTimeout(() => {
          hold.fired = true
          navigator.vibrate?.(8)
          setHolding(true)
        }, HOLD_MS)
        holdRef.current = hold
      }
    }
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return
    pointersRef.current.set(e.pointerId, localPoint(e))

    const pinch = pinchRef.current
    if (pinch) {
      const [a, b] = [...pointersRef.current.values()]
      if (!a || !b) return
      const view = viewRef.current
      const z = clamp((pinch.zoom * Math.hypot(b.x - a.x, b.y - a.y)) / pinch.dist, MIN_ZOOM, MAX_ZOOM)
      const zoomed = panAfterZoom({
        prevZoom: pinch.zoom,
        nextZoom: z,
        prevPan: pinch.pan,
        content: view.content,
        viewport: view.viewport,
        anchorX: pinch.mid.x,
        anchorY: pinch.mid.y,
      })
      setZoom(z)
      setPan({
        x: zoomed.x + (a.x + b.x) / 2 - pinch.mid.x,
        y: zoomed.y + (a.y + b.y) / 2 - pinch.mid.y,
      })
      return
    }

    const hold = holdRef.current
    if (hold) {
      // Holding shows the before view; moving first means the finger wants to pan.
      if (hold.fired) return
      if (Math.hypot(e.clientX - hold.x, e.clientY - hold.y) > 8) cancelHold()
    }

    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    setPan({
      x: drag.originX + (e.clientX - drag.startX),
      y: drag.originY + (e.clientY - drag.startY),
    })
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.delete(e.pointerId)) return
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    const held = holdRef.current?.fired ?? false
    cancelHold()
    if (held) {
      dragRef.current = null
      lastTapRef.current = null
      return
    }

    if (pinchRef.current) {
      // Lifting one finger of a pinch keeps panning with the other.
      pinchRef.current = null
      const [rest] = [...pointersRef.current.entries()]
      if (rest) {
        const rect = e.currentTarget.getBoundingClientRect()
        startDrag(rest[0], rest[1].x + rect.left, rest[1].y + rect.top)
      }
      return
    }

    const drag = dragRef.current
    dragRef.current = null
    // Browsers don't reliably synthesize dblclick for touch, so detect a double tap here.
    if (e.pointerType !== 'touch' || e.type === 'pointercancel' || !drag) return
    if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 8) return
    const now = e.timeStamp
    const last = lastTapRef.current
    if (last && now - last.time < 320 && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 32) {
      lastTapRef.current = null
      const point = localPoint(e)
      toggleZoom(point.x, point.y)
    } else {
      lastTapRef.current = { time: now, x: e.clientX, y: e.clientY }
    }
  }

  // Fit ↔ 100%: zooms in around the given point, or back out to fit.
  const toggleZoom = (anchorX: number, anchorY: number) => {
    const view = viewRef.current
    const fitted =
      Math.abs(view.zoom - 1) < 0.02 &&
      Math.abs(view.pan.x) < 1 &&
      Math.abs(view.pan.y) < 1
    if (fitted) {
      const fit = fitScaleFor(view.content, view.viewport)
      applyZoom(fit > 0 ? 1 / fit : 1, anchorX, anchorY)
    } else {
      resetView()
    }
  }

  const onDoubleClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    // Touch double taps are handled in onPointerUp.
    if (coarsePointer) return
    const rect = e.currentTarget.getBoundingClientRect()
    toggleZoom(e.clientX - rect.left, e.clientY - rect.top)
  }

  if (!src) {
    return (
      <div className="preview preview--empty">
        <p className="preview__empty-title">Drop light into a frame</p>
        <p className="preview__empty-copy">
          Open JPEG, PNG, or camera RAW files to preview edits live on the canvas.
        </p>
        {onOpen && (
          <button type="button" className="btn btn--accent btn--lg preview__empty-cta" onClick={onOpen}>
            Open photos
          </button>
        )}
      </div>
    )
  }

  const zoomPercent = Math.round(zoom * 100)
  const overlayFrame = {
    left: tx,
    top: ty,
    width: contentSize.w * scale,
    height: contentSize.h * scale,
  }
  const splitX = tx + splitPos * contentSize.w * scale
  const holdingBefore = holding && beforeBase !== null && beforeBase === renderedBase

  return (
    <div
      ref={rootRef}
      className={`preview preview--bg-${background}${fullscreen ? ' preview--fullscreen' : ''}`}
    >
      {developingRaw ? (
        <div className="preview__badge">Developing RAW…</div>
      ) : (
        (compareMode || holdingBefore) && <div className="preview__badge">Before</div>
      )}
      {onPickWhiteBalance && (
        <div className="preview__badge preview__badge--tool">
          {coarsePointer ? 'Tap a neutral grey or white area' : 'Click a neutral grey or white area · Esc to cancel'}
        </div>
      )}
      <div
        ref={viewportRef}
        className={onPickWhiteBalance ? 'preview__viewport preview__viewport--picker' : 'preview__viewport'}
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
          {/* Stays mounted so the unedited render survives between split and hold views. */}
          <canvas
            ref={beforeRef}
            className="preview__canvas preview__canvas--before"
            aria-hidden="true"
            hidden={!splitActive && !holdingBefore}
          />
          <canvas
            ref={canvasRef}
            className="preview__canvas"
            aria-label={name ?? 'Preview'}
            style={
              holdingBefore
                ? { opacity: 0 }
                : splitActive
                  ? { clipPath: `inset(0 0 0 ${splitPos * 100}%)` }
                  : undefined
            }
          />
          <canvas
            ref={clipRef}
            className="preview__clip"
            aria-hidden="true"
          />
          <canvas ref={tintRef} className="preview__tint" aria-hidden="true" />
        </div>
        {splitActive && contentSize.w > 0 && (
          <div
            className="split-divider"
            style={{ left: splitX, top: overlayFrame.top, height: overlayFrame.height }}
            onPointerDown={(e) => {
              e.stopPropagation()
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              if (!e.currentTarget.hasPointerCapture(e.pointerId) || overlayFrame.width <= 0) return
              const rect = viewportRef.current?.getBoundingClientRect()
              if (!rect) return
              setSplitPos(clamp((e.clientX - rect.left - tx) / overlayFrame.width, 0, 1))
            }}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <span className="split-divider__label split-divider__label--before">Before</span>
            <span className="split-divider__label split-divider__label--after">After</span>
            <span className="split-divider__grip" aria-hidden="true" />
          </div>
        )}
        {cropOverlay && contentSize.w > 0 && (
          <CropOverlay frame={overlayFrame} config={cropOverlay} />
        )}
        {maskOverlay && !compareMode && !onPickWhiteBalance && contentSize.w > 0 && (
          <MaskOverlay frame={overlayFrame} config={maskOverlay} />
        )}
      </div>

      <div className="preview__controls" role="toolbar" aria-label="View and rotate">
        <button
          type="button"
          className="btn btn--ghost btn--sm btn--icon preview__ctl--secondary"
          disabled={!onRotate}
          onClick={() => onRotate?.(stepRotate(edits.rotate ?? 0, -90))}
          title="Rotate left"
          aria-label="Rotate left"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M2.5 12a9.5 9.5 0 1 0 3.2-7.1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M2.5 5.5v4.2h4.2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm btn--icon preview__ctl--secondary"
          disabled={!onRotate}
          onClick={() => onRotate?.(stepRotate(edits.rotate ?? 0, 90))}
          title="Rotate right"
          aria-label="Rotate right"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M21.5 12a9.5 9.5 0 1 1-3.2-7.1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M21.5 5.5v4.2h-4.2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className="preview__controls-sep preview__ctl--secondary" aria-hidden="true" />
        <button
          type="button"
          className="btn btn--ghost btn--sm preview__ctl--secondary"
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
          className="btn btn--ghost btn--sm preview__ctl--secondary"
          onClick={() => zoomBy(ZOOM_STEP)}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm preview__ctl--secondary"
          onClick={resetView}
          title="Fit entire image"
        >
          Fit
        </button>
        <span className="preview__controls-sep" aria-hidden="true" />
        <button
          type="button"
          className={splitActive ? 'btn btn--ghost btn--sm btn--icon btn--on' : 'btn btn--ghost btn--sm btn--icon'}
          onClick={onToggleSplit}
          disabled={!onToggleSplit || cropActive}
          title="Before / after split (Y)"
          aria-label="Before / after split"
          aria-pressed={splitActive}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M12 4v16" stroke="currentColor" strokeWidth="2" />
            <path d="M3 4h9v16H5a2 2 0 0 1-2-2V4Z" fill="currentColor" opacity="0.35" />
          </svg>
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm btn--icon"
          onClick={toggleBackground}
          title={`Background: ${background} (B)`}
          aria-label={`Switch to ${background === 'black' ? 'white' : 'black'} background`}
        >
          <span
            className={`preview__bg-swatch preview__bg-swatch--${background}`}
            aria-hidden="true"
          />
        </button>
        {canFullscreen && (
          <button
            type="button"
            className="btn btn--ghost btn--sm btn--icon"
            onClick={toggleFullscreen}
            title={fullscreen ? 'Exit full screen (F / Esc)' : 'Full screen (F)'}
            aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
            aria-pressed={fullscreen}
          >
            {fullscreen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
