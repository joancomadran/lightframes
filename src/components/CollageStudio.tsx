import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { COARSE_QUERY, PHONE_QUERY, useMediaQuery } from '../hooks/useMediaQuery'
import { useSheetSwipe } from '../hooks/useSheetSwipe'
import {
  COLLAGE_ASPECTS,
  COLLAGE_LAYOUTS,
  MAX_COLLAGE_PHOTOS,
  MAX_SLIDES,
  MAX_ZOOM,
  MIN_ZOOM,
  aspectById,
  borderWidth,
  cellRects,
  coverWindow,
  createSlide,
  emptyCell,
  layoutById,
  renderCollageSlide,
  visibleCells,
  type CollageCell,
  type CollageDoc,
  type CollageLayout,
  type CollageSlide,
} from '../lib/collage'
import type { PhotoSession } from '../types/edits'
import { AdSlot } from './AdSlot'
import { AspectPicker } from './AspectPicker'
import { CollageExportControls } from './CollageExportControls'
import {
  loadCollageExportSettings,
  resolveCollageOutputSize,
  type CollageExportSettings,
} from '../lib/collageExport'
import { PhoneDock, PhoneSheetHead, SettingsIcon } from './PhoneDock'
import { Slider } from './Slider'
import { useEditorLang } from '../hooks/useEditorLang'
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
import { uid } from '../lib/uid'

type CollageStudioProps = {
  photos: PhotoSession[]
  doc: CollageDoc
  onChange: (update: (doc: CollageDoc) => CollageDoc) => void
  onFormatChange: (format: StudioFormat) => void
  /** Opens the file picker; resolves with the photos it added. */
  onOpen: () => Promise<PhotoSession[]>
  onNotify: Notify
  apiRef?: { current: StudioApi | null }
}

function LayoutIcon({ layout, ratio }: { layout: CollageLayout; ratio: number }) {
  const w = 24
  const h = 24 / ratio
  return (
    <svg width="22" height={22 / ratio} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      {cellRects(layout, w, h, 1.6, true).map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} rx="0.8" fill="currentColor" />
      ))}
    </svg>
  )
}

/** Small read-only render of a slide for the slide strip. */
function SlideThumb({
  slide,
  doc,
  ratio,
  photoById,
  previews,
}: {
  slide: CollageSlide
  doc: CollageDoc
  ratio: number
  photoById: Map<string, PhotoSession>
  previews: Map<string, Preview>
}) {
  const W = 100
  const H = 100 / ratio
  const rects = cellRects(layoutById(slide.layoutId), W, H, borderWidth(doc.border, W), doc.border.outer)
  const cells = visibleCells(slide)
  return (
    <span
      className="collage-thumb"
      style={{ aspectRatio: `${ratio}`, background: doc.border.enabled ? doc.border.color : '#000' }}
    >
      {rects.map((r, i) => {
        const cell = cells[i]!
        const photo = cell.photoId ? photoById.get(cell.photoId) : undefined
        const src = photo ? (previews.get(photo.id)?.url ?? photo.thumbnailUrl) : null
        return (
          <span
            key={i}
            className="collage-thumb__cell"
            style={{ left: `${r.x}%`, top: `${(r.y / H) * 100}%`, width: `${r.w}%`, height: `${(r.h / H) * 100}%` }}
          >
            {src && (
              <img
                src={src}
                alt=""
                draggable={false}
                style={{ objectPosition: `${cell.x * 100}% ${cell.y * 100}%` }}
              />
            )}
          </span>
        )
      })}
    </span>
  )
}

type Drag = {
  slideId: string
  index: number
  startX: number
  startY: number
  start: CollageCell
  cellW: number
  cellH: number
  preview: Preview | undefined
}

export function CollageStudio({ photos, doc, onChange, onFormatChange, onOpen, onNotify, apiRef }: CollageStudioProps) {
  const coarsePointer = useMediaQuery(COARSE_QUERY)
  // Phones give the canvas the whole screen; photos and settings open from floating buttons.
  const phone = useMediaQuery(PHONE_QUERY)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsSwipe = useSheetSwipe(true, (collapsed) => setSettingsOpen(!collapsed))
  const [activeSlideId, setActiveSlideId] = useState(doc.slides[0]?.id ?? '')
  const [selectedCell, setSelectedCell] = useState<number | null>(null)
  const [dropTarget, setDropTarget] = useState<number | null>(null)
  const { progress, ready, run, share, save } = useSlideExport(onNotify, coarsePointer)
  const { strings: tx } = useEditorLang()
  const [exportSettings, setExportSettings] = useState<CollageExportSettings>(loadCollageExportSettings)
  const stageRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<Drag | null>(null)
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 })

  const slideIndex = Math.max(0, doc.slides.findIndex((s) => s.id === activeSlideId))
  const slide = doc.slides[slideIndex]!
  const layout = layoutById(slide.layoutId)
  const cells = visibleCells(slide)
  const aspect = aspectById(doc.aspect)
  const ratio = aspect.width / aspect.height
  const photoById = useMemo(() => new Map(photos.map((p) => [p.id, p])), [photos])

  const usedIds = doc.slides.flatMap((s) => visibleCells(s).flatMap((c) => (c.photoId ? [c.photoId] : [])))
  const usedSet = new Set(usedIds)
  const previews = useDevelopedPreviews(photos, usedIds)
  const filledCount = usedIds.filter((id) => photoById.has(id)).length
  const exportableCount = doc.slides.filter((s) =>
    visibleCells(s).some((c) => c.photoId && photoById.has(c.photoId)),
  ).length

  // Keep a valid slide and cell selected as slides and layouts change.
  if (doc.slides[slideIndex]!.id !== activeSlideId) setActiveSlideId(doc.slides[slideIndex]!.id)
  if (selectedCell !== null && selectedCell >= cells.length) setSelectedCell(null)

  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return
      setStageSize({ w: entry.contentRect.width, h: entry.contentRect.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // The slide frame: as large as fits, keeping the chosen aspect.
  const frameW = Math.max(0, Math.min(stageSize.w, stageSize.h * ratio))
  const frameH = frameW / ratio
  const rects = cellRects(layout, frameW, frameH, borderWidth(doc.border, frameW), doc.border.outer)

  const updateSlide = useCallback(
    (slideId: string, update: (slide: CollageSlide) => CollageSlide) => {
      onChange((d) => ({ ...d, slides: d.slides.map((s) => (s.id === slideId ? update(s) : s)) }))
    },
    [onChange],
  )

  const updateCell = useCallback(
    (slideId: string, index: number, patch: Partial<CollageCell>) => {
      updateSlide(slideId, (s) => {
        const next = visibleCells(s).map((c, i) => (i === index ? { ...c, ...patch } : c))
        return { ...s, cells: [...next, ...s.cells.slice(next.length)] }
      })
    },
    [updateSlide],
  )

  const placePhoto = (photoId: string, index?: number) => {
    const target = index ?? selectedCell ?? cells.findIndex((c) => !c.photoId || !photoById.has(c.photoId))
    if (target < 0) {
      onNotify('Every cell is full — select one to replace its photo', 'error')
      return
    }
    updateCell(slide.id, target, emptyCell(photoId))
    // Move on to the next empty cell so tapping photos fills the slide in order.
    const nextEmpty = cells.findIndex((c, i) => i !== target && (!c.photoId || !photoById.has(c.photoId)))
    setSelectedCell(nextEmpty >= 0 ? nextEmpty : target)
  }

  /** The empty cell's +: open files straight into it, overflow into the next empty cells. */
  const openIntoCell = async (index: number) => {
    const added = await onOpen()
    if (added.length === 0) return
    const targets = [
      index,
      ...cells.flatMap((c, i) => (i !== index && (!c.photoId || !photoById.has(c.photoId)) ? [i] : [])),
    ]
    updateSlide(slide.id, (s) => {
      const next = visibleCells(s).slice()
      added.slice(0, targets.length).forEach((photo, k) => {
        next[targets[k]!] = emptyCell(photo.id)
      })
      return { ...s, cells: [...next, ...s.cells.slice(next.length)] }
    })
    setSelectedCell(index)
  }

  const swapCells = (a: number, b: number, restoreA: CollageCell) => {
    updateSlide(slide.id, (s) => {
      const next = visibleCells(s)
      const cellB = next[b]!
      next[b] = restoreA
      next[a] = cellB
      return { ...s, cells: [...next, ...s.cells.slice(next.length)] }
    })
    setSelectedCell(b)
  }

  const cellIndexAt = (clientX: number, clientY: number): number | null => {
    const el = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>('[data-cell-index]')
    if (!el || !frameRef.current?.contains(el)) return null
    return Number(el.dataset.cellIndex)
  }

  const setCount = (count: number) => {
    const next = COLLAGE_LAYOUTS[count]![0]!
    updateSlide(slide.id, (s) => ({ ...s, layoutId: next.id }))
  }

  const setLayout = (id: string) => updateSlide(slide.id, (s) => ({ ...s, layoutId: id }))

  const addSlide = () => {
    if (doc.slides.length >= MAX_SLIDES) return
    const next = createSlide(slide.layoutId)
    onChange((d) => {
      const slides = [...d.slides]
      slides.splice(slideIndex + 1, 0, next)
      return { ...d, slides }
    })
    setActiveSlideId(next.id)
    setSelectedCell(0)
  }

  const duplicateSlide = () => {
    if (doc.slides.length >= MAX_SLIDES) return
    const copy: CollageSlide = { ...slide, id: uid(), cells: slide.cells.map((c) => ({ ...c })) }
    onChange((d) => {
      const slides = [...d.slides]
      slides.splice(slideIndex + 1, 0, copy)
      return { ...d, slides }
    })
    setActiveSlideId(copy.id)
  }

  const removeSlide = () => {
    if (doc.slides.length <= 1) {
      updateSlide(slide.id, (s) => ({ ...s, cells: [] }))
      return
    }
    const neighbour = doc.slides[slideIndex + 1] ?? doc.slides[slideIndex - 1]!
    onChange((d) => ({ ...d, slides: d.slides.filter((s) => s.id !== slide.id) }))
    setActiveSlideId(neighbour.id)
    setSelectedCell(null)
  }

  const moveSlide = (delta: number) => {
    const to = slideIndex + delta
    if (to < 0 || to >= doc.slides.length) return
    onChange((d) => {
      const slides = [...d.slides]
      const [moved] = slides.splice(slideIndex, 1)
      slides.splice(to, 0, moved!)
      return { ...d, slides }
    })
  }

  const fillEmpty = () => {
    const unused = photos.filter((p) => !usedSet.has(p.id)).map((p) => p.id)
    if (unused.length === 0) return
    onChange((d) => {
      // The updater may run twice (strict mode), so it must not consume `unused`.
      let n = 0
      return {
        ...d,
        slides: d.slides.map((s) => {
          const next = visibleCells(s).map((c) =>
            (!c.photoId || !photoById.has(c.photoId)) && n < unused.length ? emptyCell(unused[n++]!) : c,
          )
          return { ...s, cells: [...next, ...s.cells.slice(next.length)] }
        }),
      }
    })
  }

  // Wheel zooms the photo under the pointer (React's wheel listener is passive).
  const wheelRef = useRef<(e: WheelEvent) => void>(() => {})
  useLayoutEffect(() => {
    wheelRef.current = (e: WheelEvent) => {
      const index = cellIndexAt(e.clientX, e.clientY)
      if (index === null) return
      const cell = cells[index]
      if (!cell?.photoId) return
      e.preventDefault()
      const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, cell.zoom * Math.exp(-e.deltaY * 0.002)))
      updateCell(slide.id, index, { zoom })
      setSelectedCell(index)
    }
  })
  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => wheelRef.current(e)
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const slideHasPhotos = visibleCells(slide).some((c) => c.photoId && photoById.has(c.photoId))

  const renderExportFiles = useCallback(
    async (slides: CollageSlide[], onProgress: (done: number, total: number) => void) => {
      const getPhoto = createExportLoader(photoById)
      const size = await resolveCollageOutputSize(doc, slides, exportSettings.preset, getPhoto)
      if (size.clamped) onNotify(tx.canvasLimited)
      const files: File[] = []
      for (let i = 0; i < slides.length; i++) {
        onProgress(i, slides.length)
        const blob = await renderCollageSlide({
          doc,
          slide: slides[i]!,
          getPhoto,
          width: size.width,
          height: size.height,
          quality: exportSettings.quality,
        })
        files.push(new File([blob], slideFileName('collage', i, slides.length), { type: 'image/jpeg' }))
      }
      return files
    },
    [doc, exportSettings, onNotify, photoById, tx.canvasLimited],
  )

  const exportSlides = useCallback(
    (onlyCurrent = false) => {
      if (onlyCurrent) {
        if (!slideHasPhotos) {
          onNotify(tx.slideEmpty, 'error')
          return
        }
        void run((onProgress) => renderExportFiles([slide], onProgress), {
          onSuccess: (files) => onNotify(files.length > 1 ? tx.exportedZip(files.length) : tx.exportedOne),
        })
        return
      }
      const slides = doc.slides.filter((s) =>
        visibleCells(s).some((c) => c.photoId && photoById.has(c.photoId)),
      )
      if (slides.length === 0) {
        onNotify(tx.addPhotosFirst, 'error')
        return
      }
      void run((onProgress) => renderExportFiles(slides, onProgress), {
        onSuccess: (files) => onNotify(files.length > 1 ? tx.exportedZip(files.length) : tx.exportedOne),
      })
    },
    [doc, onNotify, photoById, renderExportFiles, run, slide, slideHasPhotos, tx],
  )

  useEffect(() => {
    if (!apiRef) return
    apiRef.current = { exportSlides: () => exportSlides(false) }
    return () => {
      apiRef.current = null
    }
  }, [apiRef, exportSlides])

  const selected = selectedCell !== null ? cells[selectedCell] : undefined
  const selectedPhoto = selected?.photoId ? photoById.get(selected.photoId) : undefined
  const count = layout.cells.length
  const borderPct = Math.round(doc.border.size * 1000) / 10

  const tray = (
    <PhotoTray
      photos={photos}
      usedIds={usedSet}
      onPick={(id) => placePhoto(id)}
      onOpen={onOpen}
      pickTitle={selectedCell !== null ? `Place in cell ${selectedCell + 1}` : 'Add to the next empty cell'}
    />
  )

  return (
    <div className="workspace collage">
      {!phone && tray}

      <main className="stage collage-main">
        <div ref={stageRef} className="collage-stage">
          <div
            ref={frameRef}
            className="collage-frame"
            style={{
              width: frameW,
              height: frameH,
              background: doc.border.enabled ? doc.border.color : '#000',
            }}
          >
            {rects.map((r, i) => {
              const cell = cells[i]!
              const photo = cell.photoId ? photoById.get(cell.photoId) : undefined
              const preview = photo ? previews.get(photo.id) : undefined
              const win = preview ? coverWindow(preview.w, preview.h, r.w, r.h, cell) : null
              const classes = ['collage-cell']
              if (!photo) classes.push('collage-cell--empty')
              if (selectedCell === i) classes.push('collage-cell--selected')
              if (dropTarget === i) classes.push('collage-cell--drop')
              return (
                <div
                  key={i}
                  data-cell-index={i}
                  className={classes.join(' ')}
                  style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
                  onPointerDown={(e) => {
                    setSelectedCell(i)
                    if (!photo) return
                    e.currentTarget.setPointerCapture(e.pointerId)
                    dragRef.current = {
                      slideId: slide.id,
                      index: i,
                      startX: e.clientX,
                      startY: e.clientY,
                      start: cell,
                      cellW: r.w,
                      cellH: r.h,
                      preview,
                    }
                  }}
                  onPointerMove={(e) => {
                    const drag = dragRef.current
                    if (!drag || drag.index !== i) return
                    const over = cellIndexAt(e.clientX, e.clientY)
                    setDropTarget(over !== null && over !== i ? over : null)
                    if (!drag.preview) return
                    const w = coverWindow(drag.preview.w, drag.preview.h, drag.cellW, drag.cellH, drag.start)
                    const overflowX = drag.preview.w * w.scale - drag.cellW
                    const overflowY = drag.preview.h * w.scale - drag.cellH
                    const clamp = (v: number) => Math.min(1, Math.max(0, v))
                    updateCell(drag.slideId, i, {
                      x: overflowX > 0.5 ? clamp(drag.start.x - (e.clientX - drag.startX) / overflowX) : drag.start.x,
                      y: overflowY > 0.5 ? clamp(drag.start.y - (e.clientY - drag.startY) / overflowY) : drag.start.y,
                    })
                  }}
                  onPointerUp={(e) => {
                    const drag = dragRef.current
                    dragRef.current = null
                    setDropTarget(null)
                    if (!drag || drag.index !== i) return
                    // Released over another cell: the two photos trade places.
                    const over = cellIndexAt(e.clientX, e.clientY)
                    if (over !== null && over !== i) swapCells(i, over, drag.start)
                  }}
                  onPointerCancel={() => {
                    dragRef.current = null
                    setDropTarget(null)
                  }}
                  onDragOver={(e) => {
                    if (!e.dataTransfer.types.includes(PHOTO_MIME)) return
                    e.preventDefault()
                    setDropTarget(i)
                  }}
                  onDragLeave={() => setDropTarget((t) => (t === i ? null : t))}
                  onDrop={(e) => {
                    const id = e.dataTransfer.getData(PHOTO_MIME)
                    setDropTarget(null)
                    if (!id) return
                    e.preventDefault()
                    updateCell(slide.id, i, emptyCell(id))
                    setSelectedCell(i)
                  }}
                >
                  {photo && win && preview ? (
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
                  ) : photo ? (
                    <img
                      src={photo.thumbnailUrl}
                      alt=""
                      draggable={false}
                      className="collage-cell__img collage-cell__img--loading"
                    />
                  ) : (
                    <span className="collage-cell__hint">
                      <button
                        type="button"
                        className="collage-cell__add"
                        title="Open photos into this cell"
                        aria-label={`Open photos into cell ${i + 1}`}
                        onClick={() => void openIntoCell(i)}
                      >
                        +
                      </button>
                      {r.w > 90 && <span>{coarsePointer ? 'Tap a photo' : 'Drop or pick a photo'}</span>}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="collage-slides" role="toolbar" aria-label="Slides">
          <ol className="collage-slides__list">
            {doc.slides.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={s.id === slide.id ? 'collage-slides__item collage-slides__item--active' : 'collage-slides__item'}
                  onClick={() => {
                    setActiveSlideId(s.id)
                    setSelectedCell(null)
                  }}
                  aria-label={`Slide ${i + 1}`}
                  aria-current={s.id === slide.id}
                >
                  <SlideThumb slide={s} doc={doc} ratio={ratio} photoById={photoById} previews={previews} />
                  <span className="collage-slides__num">{i + 1}</span>
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="collage-slides__add"
                onClick={addSlide}
                disabled={doc.slides.length >= MAX_SLIDES}
                title="Add slide"
                aria-label="Add slide"
                style={{ aspectRatio: `${ratio}` } as CSSProperties}
              >
                +
              </button>
            </li>
          </ol>
          <div className="btn-group collage-slides__actions">
            <button
              type="button"
              className="btn btn--ghost btn--sm btn--icon"
              onClick={() => moveSlide(-1)}
              disabled={slideIndex === 0}
              title="Move slide left"
              aria-label="Move slide left"
            >
              ‹
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm btn--icon"
              onClick={() => moveSlide(1)}
              disabled={slideIndex === doc.slides.length - 1}
              title="Move slide right"
              aria-label="Move slide right"
            >
              ›
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm btn--icon"
              onClick={duplicateSlide}
              disabled={doc.slides.length >= MAX_SLIDES}
              title="Duplicate slide"
              aria-label="Duplicate slide"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="8" y="8" width="13" height="13" rx="2" />
                <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm btn--icon"
              onClick={removeSlide}
              title={doc.slides.length > 1 ? 'Delete slide' : 'Clear slide'}
              aria-label={doc.slides.length > 1 ? 'Delete slide' : 'Clear slide'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
              </svg>
            </button>
          </div>
        </div>

        <ExportStatus progress={progress} ready={ready} onSave={save} onShare={() => void share()} />

        {phone && (
          <PhoneDock
            photoCount={photos.length}
            filmstrip={tray}
            action={{
              kind: 'toggle',
              label: settingsOpen ? 'Close settings' : 'Collage settings',
              open: settingsOpen,
              onToggle: () => setSettingsOpen((v) => !v),
            }}
          />
        )}
      </main>

      {(!phone || settingsOpen) && (
      <aside
        className={settingsSwipe.offset !== 0 ? 'sidebar sidebar--dragging' : 'sidebar'}
        style={settingsSwipe.offset ? { transform: `translateY(${settingsSwipe.offset}px)` } : undefined}
        aria-label="Collage settings"
      >
        {phone && (
          <PhoneSheetHead
            icon={<SettingsIcon />}
            title="Collage"
            onClose={() => setSettingsOpen(false)}
            {...settingsSwipe.handlers}
          />
        )}
        <div className="sidebar__scroll">
          <section className="panel" aria-label="Collage settings">
            <FormatSwitch format="collage" onChange={onFormatChange} />

            <div className="adjust-group">
              <div className="adjust-group__header">
                <h3 className="adjust-group__title">Size</h3>
                <span className="field-row__count">
                  {aspect.width} × {aspect.height}
                </span>
              </div>
              <AspectPicker
                aspects={COLLAGE_ASPECTS}
                value={doc.aspect}
                onChange={(aspect) => onChange((d) => ({ ...d, aspect }))}
              />
            </div>

            <div className="adjust-group">
              <div className="adjust-group__header">
                <h3 className="adjust-group__title">
                  Layout <span className="adjust-group__sub">· slide {slideIndex + 1}</span>
                </h3>
              </div>
              <div className="field-row">
                <span>Photos</span>
              </div>
              <div className="segmented" role="group" aria-label="Photos per slide">
                {Array.from({ length: MAX_COLLAGE_PHOTOS }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={n === count ? 'segmented__btn segmented__btn--active' : 'segmented__btn'}
                    aria-pressed={n === count}
                    onClick={() => setCount(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {COLLAGE_LAYOUTS[count]!.length > 1 && (
                <div className="collage-layouts" role="group" aria-label="Layout">
                  {COLLAGE_LAYOUTS[count]!.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      className={l.id === layout.id ? 'collage-layouts__btn collage-layouts__btn--active' : 'collage-layouts__btn'}
                      aria-pressed={l.id === layout.id}
                      title={l.label}
                      aria-label={l.label}
                      onClick={() => setLayout(l.id)}
                    >
                      <LayoutIcon layout={l} ratio={ratio} />
                    </button>
                  ))}
                </div>
              )}
              <div className="crop-info">
                <span>
                  {filledCount} photo{filledCount === 1 ? '' : 's'} · {doc.slides.length} slide
                  {doc.slides.length === 1 ? '' : 's'}
                </span>
                <button
                  type="button"
                  className="link-btn"
                  onClick={fillEmpty}
                  disabled={photos.every((p) => usedSet.has(p.id))}
                  title="Fill empty cells with photos not in the collage yet"
                >
                  Fill empty
                </button>
              </div>
            </div>

            <div className="adjust-group">
              <div className="adjust-group__header">
                <h3 className="adjust-group__title">Border</h3>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={doc.border.enabled}
                    onChange={(e) => onChange((d) => ({ ...d, border: { ...d.border, enabled: e.target.checked } }))}
                  />
                  <span>Show</span>
                </label>
              </div>
              {doc.border.enabled && (
                <>
                  <Slider
                    label="Width"
                    value={borderPct}
                    min={0.5}
                    max={6}
                    step={0.1}
                    defaultValue={1.5}
                    format={(v) => `${v.toFixed(1)}%`}
                    onChange={(v) => onChange((d) => ({ ...d, border: { ...d.border, size: v / 100 } }))}
                  />
                  <div className="field-row">
                    <span>Color</span>
                    <ColorSwatches
                      value={doc.border.color}
                      label="Border colour"
                      onChange={(color) => onChange((d) => ({ ...d, border: { ...d.border, color } }))}
                    />
                  </div>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={doc.border.outer}
                      onChange={(e) => onChange((d) => ({ ...d, border: { ...d.border, outer: e.target.checked } }))}
                    />
                    <span>Outer edge</span>
                  </label>
                </>
              )}
            </div>

            <div className="adjust-group">
              <div className="adjust-group__header">
                <h3 className="adjust-group__title">
                  Photo{selectedCell !== null && <span className="adjust-group__sub"> · cell {selectedCell + 1}</span>}
                </h3>
                {selected && selectedPhoto && (
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => updateCell(slide.id, selectedCell!, { photoId: null })}
                  >
                    Remove
                  </button>
                )}
              </div>
              {selected && selectedPhoto ? (
                <>
                  <Slider
                    label="Zoom"
                    value={Math.round(selected.zoom * 100)}
                    min={MIN_ZOOM * 100}
                    max={MAX_ZOOM * 100}
                    step={1}
                    defaultValue={100}
                    format={(v) => `${v}%`}
                    onChange={(v) => updateCell(slide.id, selectedCell!, { zoom: v / 100 })}
                  />
                  <div className="crop-info">
                    <span className="collage-photo-name">{selectedPhoto.name}</span>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => updateCell(slide.id, selectedCell!, { x: 0.5, y: 0.5, zoom: 1 })}
                    >
                      Reset framing
                    </button>
                  </div>
                </>
              ) : (
                <p className="field-hint">
                  {selectedCell !== null
                    ? `Pick a photo for cell ${selectedCell + 1}.`
                    : 'Select a cell, then pick a photo.'}
                </p>
              )}
              <p className="field-hint">
                {coarsePointer
                  ? 'Drag a photo to reframe it; drop it on another cell to swap.'
                  : 'Drag to reframe, scroll to zoom, drop on another cell to swap. Drag photos in from the list.'}
              </p>
            </div>

            <CollageExportControls
              doc={doc}
              settings={exportSettings}
              onChange={setExportSettings}
              strings={tx}
              disabled={Boolean(progress)}
            />

            <div className="adjust-group">
              <div className="btn-group" style={{ flexWrap: 'wrap' }}>
                {exportableCount > 1 && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => exportSlides(true)}
                    disabled={Boolean(progress) || !slideHasPhotos}
                  >
                    {progress ? tx.rendering : tx.exportThis}
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn--accent"
                  onClick={() => exportSlides(false)}
                  disabled={Boolean(progress) || filledCount === 0}
                >
                  {progress
                    ? tx.rendering
                    : exportableCount > 1
                      ? tx.exportAll
                      : tx.exportCollage}
                </button>
              </div>
            </div>
          </section>
        </div>

        <AdSlot id="sidebar" height={250} />
      </aside>
      )}
    </div>
  )
}
