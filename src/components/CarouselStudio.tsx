import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { COARSE_QUERY, useMediaQuery } from '../hooks/useMediaQuery'
import {
  CAROUSEL_ASPECTS,
  CAROUSEL_TEMPLATES,
  MAX_CAROUSEL_SLIDES,
  MIN_CAROUSEL_SLIDES,
  carouselPhotos,
  createFrame,
  renderCarousel,
  templateFrames,
  type CarouselDoc,
  type CarouselFrame,
  type CarouselTemplateId,
} from '../lib/carousel'
import { MAX_ZOOM, MIN_ZOOM, aspectById, coverWindow } from '../lib/collage'
import type { PhotoSession } from '../types/edits'
import { AdSlot } from './AdSlot'
import { AspectPicker } from './AspectPicker'
import { Slider } from './Slider'
import {
  createExportLoader,
  PHOTO_MIME,
  slideFileName,
  useDevelopedPreviews,
  useSlideExport,
  type Notify,
  type Preview,
  type StudioApi,
  type StudioFormat,
} from '../hooks/useStudio'
import { ColorSwatches, ExportStatus, FormatSwitch, PhotoTray } from './StudioShared'

type CarouselStudioProps = {
  photos: PhotoSession[]
  doc: CarouselDoc
  onChange: (update: (doc: CarouselDoc) => CarouselDoc) => void
  onFormatChange: (format: StudioFormat) => void
  onOpen: () => void
  onNotify: Notify
  apiRef?: { current: StudioApi | null }
}

/** Screen distance (px) within which edges snap to slide cuts, centres and other photos. */
const SNAP_PX = 7
/** Smallest frame, in screen px. */
const MIN_FRAME_PX = 28
/** Room above the strip for the slide numbers. */
const LABEL_SPACE = 22

type Corner = 'nw' | 'ne' | 'sw' | 'se'
type Rect = { x: number; y: number; w: number; h: number }
type Guides = { x: number[]; y: number[] }

type Drag = {
  kind: 'move' | 'pan' | 'resize'
  corner?: Corner
  id: string
  startX: number
  startY: number
  start: CarouselFrame
  moved: boolean
}

/** Nearest snap line to any of `values`, as the offset to apply, if within `threshold`. */
function snapOffset(values: number[], lines: number[], threshold: number): { offset: number; line: number } | null {
  let best: { offset: number; line: number } | null = null
  for (const v of values) {
    for (const line of lines) {
      const offset = line - v
      if (Math.abs(offset) <= threshold && (!best || Math.abs(offset) < Math.abs(best.offset))) {
        best = { offset, line }
      }
    }
  }
  return best
}

/** The photo inside a frame box, cover-fit with the frame's focal point and zoom. */
function FrameImage({
  photo,
  preview,
  frame,
  w,
  h,
}: {
  photo: PhotoSession
  preview: Preview | undefined
  frame: CarouselFrame
  w: number
  h: number
}) {
  if (!preview) {
    return <img src={photo.thumbnailUrl} alt="" draggable={false} className="collage-cell__img collage-cell__img--loading" />
  }
  const win = coverWindow(preview.w, preview.h, w, h, { x: frame.fx, y: frame.fy, zoom: frame.zoom })
  return (
    <img
      src={preview.url}
      alt=""
      draggable={false}
      className="collage-cell__img"
      style={{
        left: -win.x * win.scale,
        top: -win.y * win.scale,
        width: preview.w * win.scale,
        height: preview.h * win.scale,
      }}
    />
  )
}

/** Read-only strip render, used by the swipe preview. */
function StripView({
  doc,
  slideW,
  slideH,
  photoById,
  previews,
}: {
  doc: CarouselDoc
  slideW: number
  slideH: number
  photoById: Map<string, PhotoSession>
  previews: Map<string, Preview>
}) {
  return (
    <div className="carousel-strip" style={{ width: slideW * doc.slideCount, height: slideH, background: doc.background }}>
      {doc.frames.map((f) => {
        const photo = photoById.get(f.photoId)
        if (!photo) return null
        const w = f.w * slideW
        const h = f.h * slideH
        return (
          <div key={f.id} className="carousel-frame" style={{ left: f.x * slideW, top: f.y * slideH, width: w, height: h }}>
            <FrameImage photo={photo} preview={previews.get(photo.id)} frame={f} w={w} h={h} />
          </div>
        )
      })}
    </div>
  )
}

function TemplateIcon({ id, ratio }: { id: CarouselTemplateId; ratio: number }) {
  const n = 3
  const sw = 14
  const sh = sw / ratio
  const frames = templateFrames(id, ['a', 'b', 'c', 'd', 'e', 'f'], n, ratio)
  return (
    <svg width={sw * n} height={sh} viewBox={`0 0 ${sw * n} ${sh}`} aria-hidden="true">
      <rect x="0" y="0" width={sw * n} height={sh} rx="1" fill="currentColor" opacity="0.15" />
      {frames.map((f) => (
        <rect
          key={f.id}
          x={f.x * sw + 0.4}
          y={f.y * sh + 0.4}
          width={Math.max(0.5, f.w * sw - 0.8)}
          height={Math.max(0.5, f.h * sh - 0.8)}
          rx="0.6"
          fill="currentColor"
        />
      ))}
      {Array.from({ length: n - 1 }, (_, k) => (
        <line
          key={k}
          x1={(k + 1) * sw}
          x2={(k + 1) * sw}
          y1="0"
          y2={sh}
          stroke="var(--bg-panel)"
          strokeWidth="0.8"
          strokeDasharray="1.5 1.2"
        />
      ))}
    </svg>
  )
}

/** Instagram-style swipe through the slides, to check the seams before posting. */
function SwipePreview({
  doc,
  photoById,
  previews,
  onClose,
}: {
  doc: CarouselDoc
  photoById: Map<string, PhotoSession>
  previews: Map<string, Preview>
  onClose: () => void
}) {
  const aspect = aspectById(doc.aspect)
  const ratio = aspect.width / aspect.height
  const [index, setIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const [slideW, setSlideW] = useState(0)

  useLayoutEffect(() => {
    const el = trackRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => entry && setSlideW(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      const el = trackRef.current
      if (!el || slideW === 0) return
      if (e.key === 'ArrowRight') el.scrollBy({ left: slideW, behavior: 'smooth' })
      if (e.key === 'ArrowLeft') el.scrollBy({ left: -slideW, behavior: 'smooth' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, slideW])

  const go = (k: number) => trackRef.current?.scrollTo({ left: k * slideW, behavior: 'smooth' })

  return (
    <div className="modal carousel-preview" role="dialog" aria-modal="true" aria-label="Carousel preview" onClick={onClose}>
      <div className="carousel-preview__card" onClick={(e) => e.stopPropagation()}>
        <div className="carousel-preview__header">
          <span className="carousel-preview__title">Preview</span>
          <span className="field-row__count">
            {index + 1}/{doc.slideCount}
          </span>
          <button type="button" className="btn btn--ghost btn--sm btn--icon" onClick={onClose} aria-label="Close preview">
            ✕
          </button>
        </div>
        <div
          ref={trackRef}
          className="carousel-preview__track"
          style={{ aspectRatio: `${ratio}` }}
          onScroll={(e) => slideW > 0 && setIndex(Math.round(e.currentTarget.scrollLeft / slideW))}
        >
          {Array.from({ length: doc.slideCount }, (_, k) => (
            <div key={k} className="carousel-preview__slide" aria-label={`Slide ${k + 1}`}>
              {slideW > 0 && (
                <div style={{ transform: `translateX(${-k * slideW}px)` }}>
                  <StripView doc={doc} slideW={slideW} slideH={slideW / ratio} photoById={photoById} previews={previews} />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="carousel-preview__nav">
          <button
            type="button"
            className="btn btn--ghost btn--sm btn--icon"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <div className="carousel-preview__dots" aria-hidden="true">
            {Array.from({ length: doc.slideCount }, (_, k) => (
              <span key={k} className={k === index ? 'carousel-preview__dot carousel-preview__dot--on' : 'carousel-preview__dot'} />
            ))}
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--sm btn--icon"
            onClick={() => go(index + 1)}
            disabled={index >= doc.slideCount - 1}
            aria-label="Next slide"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}

export function CarouselStudio({ photos, doc, onChange, onFormatChange, onOpen, onNotify, apiRef }: CarouselStudioProps) {
  const coarsePointer = useMediaQuery(COARSE_QUERY)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reframe, setReframe] = useState(false)
  const [guides, setGuides] = useState<Guides>({ x: [], y: [] })
  const [dropping, setDropping] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<Drag | null>(null)
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 })
  const { progress, ready, run, share, save } = useSlideExport(onNotify, coarsePointer)

  const aspect = aspectById(doc.aspect)
  const ratio = aspect.width / aspect.height
  const n = doc.slideCount
  const photoById = useMemo(() => new Map(photos.map((p) => [p.id, p])), [photos])
  const frames = doc.frames.filter((f) => photoById.has(f.photoId))
  const usedIds = frames.map((f) => f.photoId)
  const usedSet = new Set(usedIds)
  const previews = useDevelopedPreviews(photos, usedIds)
  const selected = frames.find((f) => f.id === selectedId) ?? null
  if (selectedId !== null && !selected) setSelectedId(null)
  if (reframe && !selected) setReframe(false)

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return
      setStageSize({ w: entry.contentRect.width, h: entry.contentRect.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // The whole strip when slides stay a workable size; otherwise it scrolls sideways.
  const pad = coarsePointer ? 12 : 24
  const availH = Math.max(0, stageSize.h - pad * 2 - LABEL_SPACE)
  const availW = Math.max(0, stageSize.w - pad * 2)
  const fitAll = Math.min(availH, availW / (n * ratio))
  const minSlideW = Math.min(availW, coarsePointer ? 150 : 190)
  const slideH = Math.max(fitAll, Math.min(availH, minSlideW / ratio))
  const slideW = slideH * ratio
  const stripW = slideW * n

  const updateFrame = useCallback(
    (id: string, patch: Partial<CarouselFrame>) => {
      onChange((d) => ({ ...d, frames: d.frames.map((f) => (f.id === id ? { ...f, ...patch } : f)) }))
    },
    [onChange],
  )

  const removeFrame = useCallback(
    (id: string) => {
      onChange((d) => {
        const removed = d.frames.find((f) => f.id === id)
        const frames = d.frames.filter((f) => f.id !== id)
        // Removing a photo's last frame takes it out of the carousel entirely.
        const pool =
          removed && !frames.some((f) => f.photoId === removed.photoId)
            ? d.pool.filter((p) => p !== removed.photoId)
            : d.pool
        return { ...d, frames, pool }
      })
      setSelectedId(null)
    },
    [onChange],
  )

  /** The slide closest to the middle of the visible part of the strip. */
  const visibleSlide = () => {
    const el = scrollRef.current
    if (!el || slideW === 0) return 0
    const middle = el.scrollLeft + el.clientWidth / 2 - pad
    return Math.min(n - 1, Math.max(0, Math.floor(middle / slideW)))
  }

  const addFrame = (photoId: string, center?: { x: number; y: number }) => {
    const preview = previews.get(photoId)
    // Natural aspect when the developed preview is known, else a portrait 4:5 box.
    const photoAspect = preview ? preview.w / preview.h : 0.8
    let h = 0.7
    let w = (h * photoAspect) / ratio
    if (w > 1.6) {
      w = 1.6
      h = (w * ratio) / photoAspect
    }
    const cx = center?.x ?? visibleSlide() + 0.5
    const cy = center?.y ?? 0.5
    const frame = createFrame(photoId, cx - w / 2, Math.min(1 - h, Math.max(0, cy - h / 2)), w, h)
    onChange((d) => ({
      ...d,
      frames: [...d.frames, frame],
      pool: d.pool.includes(photoId) ? d.pool : [...d.pool, photoId],
    }))
    setSelectedId(frame.id)
    setReframe(false)
  }

  const applyTemplate = (id: CarouselTemplateId) => {
    const inUse = carouselPhotos(doc).filter((id) => photoById.has(id))
    const ids = inUse.length > 0 ? inUse : photos.map((p) => p.id)
    if (ids.length === 0) {
      onNotify('Add photos first', 'error')
      return
    }
    onChange((d) => ({ ...d, frames: templateFrames(id, ids, d.slideCount, ratio), pool: ids }))
    setSelectedId(null)
  }

  const fillSlide = () => {
    if (!selected) return
    const k = Math.min(n - 1, Math.max(0, Math.floor(selected.x + selected.w / 2)))
    updateFrame(selected.id, { x: k, y: 0, w: 1, h: 1 })
  }

  const restack = (toTop: boolean) => {
    if (!selected) return
    onChange((d) => {
      const rest = d.frames.filter((f) => f.id !== selected.id)
      const moved = d.frames.find((f) => f.id === selected.id)!
      return { ...d, frames: toTop ? [...rest, moved] : [moved, ...rest] }
    })
  }

  // Snap lines in screen px: slide edges and centres, the strip's middle row, and the other photos.
  const snapLines = (exceptId: string): Guides => {
    const x: number[] = []
    for (let k = 0; k <= n; k++) x.push(k * slideW)
    for (let k = 0; k < n; k++) x.push((k + 0.5) * slideW)
    const y = [0, slideH / 2, slideH]
    for (const f of frames) {
      if (f.id === exceptId) continue
      x.push(f.x * slideW, (f.x + f.w / 2) * slideW, (f.x + f.w) * slideW)
      y.push(f.y * slideH, (f.y + f.h / 2) * slideH, (f.y + f.h) * slideH)
    }
    return { x, y }
  }

  const onFramePointerDown = (e: ReactPointerEvent<HTMLElement>, frame: CarouselFrame, corner?: Corner) => {
    e.stopPropagation()
    setSelectedId(frame.id)
    if (frame.id !== selectedId) setReframe(false)
    e.currentTarget.setPointerCapture(e.pointerId)
    const kind = corner ? 'resize' : reframe && frame.id === selectedId ? 'pan' : 'move'
    dragRef.current = { kind, corner, id: frame.id, startX: e.clientX, startY: e.clientY, start: frame, moved: false }
  }

  const onFramePointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || slideW === 0) return
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY
    if (!drag.moved && Math.hypot(dx, dy) < 2) return
    drag.moved = true
    const s = drag.start
    const startPx: Rect = { x: s.x * slideW, y: s.y * slideH, w: s.w * slideW, h: s.h * slideH }

    if (drag.kind === 'pan') {
      const preview = previews.get(s.photoId)
      if (!preview) return
      const win = coverWindow(preview.w, preview.h, startPx.w, startPx.h, { x: s.fx, y: s.fy, zoom: s.zoom })
      const overflowX = preview.w * win.scale - startPx.w
      const overflowY = preview.h * win.scale - startPx.h
      const clamp = (v: number) => Math.min(1, Math.max(0, v))
      updateFrame(drag.id, {
        fx: overflowX > 0.5 ? clamp(s.fx - dx / overflowX) : s.fx,
        fy: overflowY > 0.5 ? clamp(s.fy - dy / overflowY) : s.fy,
      })
      return
    }

    const lines = snapLines(drag.id)
    const shown: Guides = { x: [], y: [] }
    let next: Rect

    if (drag.kind === 'move') {
      next = { ...startPx, x: startPx.x + dx, y: startPx.y + dy }
      if (!e.altKey) {
        const sx = snapOffset([next.x, next.x + next.w / 2, next.x + next.w], lines.x, SNAP_PX)
        const sy = snapOffset([next.y, next.y + next.h / 2, next.y + next.h], lines.y, SNAP_PX)
        if (sx) {
          next.x += sx.offset
          shown.x.push(sx.line)
        }
        if (sy) {
          next.y += sy.offset
          shown.y.push(sy.line)
        }
      }
    } else {
      // Resize from a corner; the opposite corner stays put.
      const c = drag.corner!
      let left = startPx.x
      let top = startPx.y
      let right = startPx.x + startPx.w
      let bottom = startPx.y + startPx.h
      if (c.includes('w')) left += dx
      else right += dx
      if (c.includes('n')) top += dy
      else bottom += dy
      if (!e.altKey) {
        const movingX = c.includes('w') ? left : right
        const movingY = c.includes('n') ? top : bottom
        const sx = snapOffset([movingX], lines.x, SNAP_PX)
        const sy = snapOffset([movingY], lines.y, SNAP_PX)
        if (sx) {
          if (c.includes('w')) left += sx.offset
          else right += sx.offset
          shown.x.push(sx.line)
        }
        if (sy) {
          if (c.includes('n')) top += sy.offset
          else bottom += sy.offset
          shown.y.push(sy.line)
        }
      }
      if (right - left < MIN_FRAME_PX) {
        if (c.includes('w')) left = right - MIN_FRAME_PX
        else right = left + MIN_FRAME_PX
      }
      if (bottom - top < MIN_FRAME_PX) {
        if (c.includes('n')) top = bottom - MIN_FRAME_PX
        else bottom = top + MIN_FRAME_PX
      }
      next = { x: left, y: top, w: right - left, h: bottom - top }
    }

    setGuides(shown)
    updateFrame(drag.id, { x: next.x / slideW, y: next.y / slideH, w: next.w / slideW, h: next.h / slideH })
  }

  const onFramePointerUp = () => {
    dragRef.current = null
    setGuides({ x: [], y: [] })
  }

  // Wheel zooms the photo inside the selected frame (React's wheel listener is passive).
  const wheelRef = useRef<(e: WheelEvent) => void>(() => {})
  useLayoutEffect(() => {
    wheelRef.current = (e: WheelEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-frame-id]')
      const frame = el ? frames.find((f) => f.id === el.dataset.frameId) : undefined
      if (!frame || frame.id !== selectedId) return
      e.preventDefault()
      const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, frame.zoom * Math.exp(-e.deltaY * 0.002)))
      updateFrame(frame.id, { zoom })
    }
  })
  useEffect(() => {
    const el = stripRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => wheelRef.current(e)
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      if (previewOpen) return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        removeFrame(selectedId)
      } else if (e.key === 'Escape') {
        if (reframe) setReframe(false)
        else setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, reframe, previewOpen, removeFrame])

  const exportSlides = useCallback(() => {
    const current: CarouselDoc = { ...doc, frames: doc.frames.filter((f) => photoById.has(f.photoId)) }
    if (current.frames.length === 0) {
      onNotify('Add photos to the carousel first', 'error')
      return
    }
    void run(async (onProgress) => {
      const blobs = await renderCarousel({ doc: current, getPhoto: createExportLoader(photoById), onProgress })
      return blobs.map((blob, i) => new File([blob], slideFileName('carousel', i, blobs.length), { type: 'image/jpeg' }))
    })
  }, [doc, photoById, onNotify, run])

  useEffect(() => {
    if (!apiRef) return
    apiRef.current = { exportSlides }
    return () => {
      apiRef.current = null
    }
  }, [apiRef, exportSlides])

  const stripPoint = (clientX: number, clientY: number) => {
    const rect = stripRef.current?.getBoundingClientRect()
    if (!rect || slideW === 0) return undefined
    return { x: (clientX - rect.left) / slideW, y: (clientY - rect.top) / slideH }
  }

  const corners: Corner[] = ['nw', 'ne', 'sw', 'se']

  return (
    <div className="workspace collage">
      <PhotoTray
        photos={photos}
        usedIds={usedSet}
        onPick={(id) => addFrame(id)}
        onOpen={onOpen}
        pickTitle="Add to the slide in view"
      />

      <main className="stage collage-main carousel-main">
        <div
          ref={scrollRef}
          className="carousel-scroll"
          onClick={(e) => {
            // A click (not a scroll) on the empty canvas clears the selection.
            if (!(e.target as HTMLElement).closest('[data-frame-id], .carousel-handle')) setSelectedId(null)
          }}
        >
          <div className="carousel-canvas" style={{ width: stripW + pad * 2, padding: `${LABEL_SPACE}px ${pad}px ${pad}px` }}>
            <div className="carousel-labels" style={{ width: stripW }} aria-hidden="true">
              {Array.from({ length: n }, (_, k) => (
                <span key={k} style={{ width: slideW }}>
                  {k + 1}
                </span>
              ))}
            </div>
            <div
              ref={stripRef}
              className={dropping ? 'carousel-strip carousel-strip--drop' : 'carousel-strip'}
              style={{ width: stripW, height: slideH, background: doc.background }}
              onDragOver={(e) => {
                if (!e.dataTransfer.types.includes(PHOTO_MIME)) return
                e.preventDefault()
                setDropping(true)
              }}
              onDragLeave={() => setDropping(false)}
              onDrop={(e) => {
                setDropping(false)
                const id = e.dataTransfer.getData(PHOTO_MIME)
                if (!id) return
                e.preventDefault()
                addFrame(id, stripPoint(e.clientX, e.clientY))
              }}
            >
              <div className="carousel-clip">
                {frames.map((f) => {
                  const photo = photoById.get(f.photoId)!
                  const w = f.w * slideW
                  const h = f.h * slideH
                  const isSelected = f.id === selectedId
                  const classes = ['carousel-frame', 'carousel-frame--edit']
                  if (isSelected) classes.push('carousel-frame--selected')
                  if (isSelected && reframe) classes.push('carousel-frame--reframe')
                  return (
                    <div
                      key={f.id}
                      data-frame-id={f.id}
                      className={classes.join(' ')}
                      style={{ left: f.x * slideW, top: f.y * slideH, width: w, height: h }}
                      onPointerDown={(e) => onFramePointerDown(e, f)}
                      onPointerMove={onFramePointerMove}
                      onPointerUp={onFramePointerUp}
                      onPointerCancel={onFramePointerUp}
                      onDoubleClick={() => setReframe((v) => !v)}
                    >
                      <FrameImage photo={photo} preview={previews.get(photo.id)} frame={f} w={w} h={h} />
                    </div>
                  )
                })}
              </div>

              {/* Cuts between slides, over the photos so seams stay visible while arranging. */}
              {Array.from({ length: n - 1 }, (_, k) => (
                <span key={k} className="carousel-cut" style={{ left: (k + 1) * slideW }} aria-hidden="true" />
              ))}
              {guides.x.map((x, i) => (
                <span key={`x${i}`} className="carousel-guide carousel-guide--x" style={{ left: x }} aria-hidden="true" />
              ))}
              {guides.y.map((y, i) => (
                <span key={`y${i}`} className="carousel-guide carousel-guide--y" style={{ top: y }} aria-hidden="true" />
              ))}

              {/* Handles sit outside the frames' clipping, on top of everything. */}
              {selected && !reframe && (
                <div
                  className="carousel-handles"
                  style={{
                    left: selected.x * slideW,
                    top: selected.y * slideH,
                    width: selected.w * slideW,
                    height: selected.h * slideH,
                  }}
                >
                  {corners.map((c) => (
                    <span
                      key={c}
                      className={`carousel-handle carousel-handle--${c}`}
                      onPointerDown={(e) => onFramePointerDown(e, selected, c)}
                      onPointerMove={onFramePointerMove}
                      onPointerUp={onFramePointerUp}
                      onPointerCancel={onFramePointerUp}
                    />
                  ))}
                </div>
              )}

              {frames.length === 0 && (
                <p className="carousel-empty">
                  {coarsePointer ? 'Tap photos below to place them' : 'Drop photos here, or click them in the list'}
                </p>
              )}
            </div>
          </div>
        </div>

        <ExportStatus progress={progress} ready={ready} onSave={save} onShare={() => void share()} />
      </main>

      <aside className="sidebar" aria-label="Carousel settings">
        <div className="sidebar__scroll">
          <section className="panel" aria-label="Carousel settings">
            <FormatSwitch format="carousel" onChange={onFormatChange} />

            <div className="adjust-group">
              <div className="adjust-group__header">
                <h3 className="adjust-group__title">Size</h3>
                <span className="field-row__count">
                  {n} × {aspect.width} × {aspect.height}
                </span>
              </div>
              <AspectPicker
                aspects={CAROUSEL_ASPECTS}
                value={doc.aspect}
                onChange={(aspect) => onChange((d) => ({ ...d, aspect }))}
              />
              <Slider
                label="Slides"
                value={n}
                min={MIN_CAROUSEL_SLIDES}
                max={MAX_CAROUSEL_SLIDES}
                step={1}
                onChange={(slideCount) => onChange((d) => ({ ...d, slideCount }))}
              />
            </div>

            <div className="adjust-group">
              <div className="adjust-group__header">
                <h3 className="adjust-group__title">Layout</h3>
              </div>
              <div className="carousel-templates" role="group" aria-label="Start from a layout">
                {CAROUSEL_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="collage-layouts__btn"
                    title={t.hint}
                    onClick={() => applyTemplate(t.id)}
                  >
                    <TemplateIcon id={t.id} ratio={ratio} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
              <p className="field-hint">Rearranges the carousel's photos.</p>
            </div>

            <div className="adjust-group">
              <div className="adjust-group__header">
                <h3 className="adjust-group__title">Background</h3>
              </div>
              <div className="field-row">
                <span>Color</span>
                <ColorSwatches
                  value={doc.background}
                  label="Background colour"
                  onChange={(background) => onChange((d) => ({ ...d, background }))}
                />
              </div>
            </div>

            <div className="adjust-group">
              <div className="adjust-group__header">
                <h3 className="adjust-group__title">Photo</h3>
                {selected && (
                  <button type="button" className="link-btn" onClick={() => removeFrame(selected.id)}>
                    Remove
                  </button>
                )}
              </div>
              {selected ? (
                <>
                  <Slider
                    label="Zoom"
                    value={Math.round(selected.zoom * 100)}
                    min={MIN_ZOOM * 100}
                    max={MAX_ZOOM * 100}
                    step={1}
                    defaultValue={100}
                    format={(v) => `${v}%`}
                    onChange={(v) => updateFrame(selected.id, { zoom: v / 100 })}
                  />
                  <div className="carousel-photo-actions">
                    <button
                      type="button"
                      className={reframe ? 'btn btn--sm btn--accent' : 'btn btn--sm'}
                      onClick={() => setReframe((v) => !v)}
                      aria-pressed={reframe}
                      title="Drag the photo inside its frame (double-click a photo)"
                    >
                      {reframe ? 'Done' : 'Reframe'}
                    </button>
                    <button type="button" className="btn btn--sm" onClick={fillSlide} title="Fill the slide it sits on">
                      Fill slide
                    </button>
                    <button
                      type="button"
                      className="btn btn--sm btn--icon"
                      onClick={() => restack(true)}
                      title="Bring to front"
                      aria-label="Bring to front"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="8" y="3" width="13" height="13" rx="2" fill="currentColor" />
                        <path d="M5 8H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-1" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="btn btn--sm btn--icon"
                      onClick={() => restack(false)}
                      title="Send to back"
                      aria-label="Send to back"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="8" y="3" width="13" height="13" rx="2" />
                        <path d="M5 8H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-1" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                  <p className="field-hint collage-photo-name">{photoById.get(selected.photoId)?.name}</p>
                </>
              ) : (
                <p className="field-hint">Select a photo on the strip to size, reframe or remove it.</p>
              )}
              <p className="field-hint">
                {coarsePointer
                  ? 'Drag to move, corners to resize. Edges snap to the slide cuts.'
                  : 'Drag to move, corners to resize; edges snap to the slide cuts (hold Alt to place freely). Delete removes.'}
              </p>
            </div>

            <div className="adjust-group carousel-export">
              <button type="button" className="btn" onClick={() => setPreviewOpen(true)} disabled={frames.length === 0}>
                Preview swipe
              </button>
              <button
                type="button"
                className="btn btn--accent"
                onClick={exportSlides}
                disabled={Boolean(progress) || frames.length === 0}
              >
                {progress ? 'Rendering…' : `Export ${n} slides`}
              </button>
              <p className="field-hint">
                JPEG, {aspect.width} × {aspect.height} px per slide. Post them in order for a seamless swipe.
              </p>
            </div>
          </section>
        </div>

        <AdSlot id="sidebar" height={250} />
      </aside>

      {previewOpen && (
        <SwipePreview
          doc={{ ...doc, frames }}
          photoById={photoById}
          previews={previews}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  )
}
