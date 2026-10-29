import { useCallback, useEffect, useRef, useState } from 'react'
import { AdSlot } from './components/AdSlot'
import { AdjustmentsPanel } from './components/AdjustmentsPanel'
import { BackgroundPanel } from './components/BackgroundPanel'
import { CarouselStudio } from './components/CarouselStudio'
import { CollageStudio } from './components/CollageStudio'
import { ColorPanel } from './components/ColorPanel'
import { CropPanel } from './components/CropPanel'
import { EffectsPanel } from './components/EffectsPanel'
import { ConfirmDialog } from './components/ConfirmDialog'
import { ExportDialog } from './components/ExportDialog'
import { Filmstrip } from './components/Filmstrip'
import { DonateButton } from './components/DonateButton'
import { GithubStar } from './components/GithubStar'
import type { HealTool } from './components/HealOverlay'
import type { RefineTool } from './components/RefineOverlay'
import { HealPanel } from './components/HealPanel'
import { HistogramPanel } from './components/HistogramPanel'
import type { LiquifyTool } from './components/LiquifyOverlay'
import { LiquifyPanel } from './components/LiquifyPanel'
import { LocalAdjustPanel } from './components/LocalAdjustPanel'
import type { BrushSettings } from './components/MaskOverlay'
import { PanelIcon } from './components/PanelIcon'
import { PasteDialog } from './components/PasteDialog'
import { HistogramIcon, PhoneDock, PhoneSheetHead } from './components/PhoneDock'
import { PresetsPanel } from './components/PresetsPanel'
import { PreviewCanvas, type PreviewApi } from './components/PreviewCanvas'
import { ShortcutsDialog } from './components/ShortcutsDialog'
import { Toast } from './components/Toast'
import { ToneCurvePanel } from './components/ToneCurvePanel'
import { Toolbar } from './components/Toolbar'
import { PANELS, useEditorSession, type PanelId } from './hooks/useEditorSession'
import { PHONE_QUERY, useMediaQuery } from './hooks/useMediaQuery'
import { useSheetSwipe } from './hooks/useSheetSwipe'
import type { StudioApi, StudioFormat } from './hooks/useStudio'
import { createCarouselDoc, type CarouselDoc } from './lib/carousel'
import { createCollageDoc, type CollageDoc } from './lib/collage'
import { aspectRatioFor, fitCropInImage, type FrameSize } from './lib/crop'
import type { ClippingStats, HistogramBins } from './lib/histogram'
import { isRawFile } from './lib/rawDecode'
import { DEFAULT_EDITS, type HealSpot, type LiquifyStroke } from './types/edits'

export type AppMode = 'edit' | 'collage'

const HISTOGRAM_KEY = 'lightframes:phone-histogram'

function loadHistogramHidden(): boolean {
  try {
    return localStorage.getItem(HISTOGRAM_KEY) === 'hidden'
  } catch {
    return false
  }
}

export default function App() {
  const [mode, setMode] = useState<AppMode>('edit')
  const modeRef = useRef(mode)
  useEffect(() => {
    modeRef.current = mode
  })
  const session = useEditorSession({ keyboard: mode === 'edit' })
  const [collage, setCollage] = useState<CollageDoc | null>(null)
  const [carousel, setCarousel] = useState<CarouselDoc | null>(null)
  const [studioFormat, setStudioFormat] = useState<StudioFormat>('collage')
  const studioApi = useRef<StudioApi | null>(null)
  const canEdit = Boolean(session.activePhoto)
  const edits = session.activePhoto?.edits ?? DEFAULT_EDITS
  const [histogram, setHistogram] = useState<{
    bins: HistogramBins
    clipping: ClippingStats
  } | null>(null)
  const [scrubbing, setScrubbing] = useState(false)
  const [cropAspect, setCropAspect] = useState({ id: 'free', flipped: false })
  const [frameSize, setFrameSize] = useState<FrameSize | null>(null)
  const [selectedMaskId, setSelectedMaskId] = useState<string | null>(null)
  const [pickingWhiteBalance, setPickingWhiteBalance] = useState(false)
  const [showMaskTint, setShowMaskTint] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)
  const closeClear = useCallback(() => setClearOpen(false), [])
  const [brush, setBrush] = useState<BrushSettings>({ size: 0.05, feather: 0.6, flow: 1, erase: false })
  const [healTool, setHealTool] = useState<HealTool>({ mode: 'heal', size: 0.015, feather: 0.3, opacity: 1 })
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null)
  const [showSpots, setShowSpots] = useState(true)
  const [refineTool, setRefineTool] = useState<RefineTool | null>(null)
  const [liquifyTool, setLiquifyTool] = useState<LiquifyTool>({ mode: 'push', size: 0.08, strength: 0.5 })
  /** The strokes before the one being painted. */
  const liquifyBase = useRef<LiquifyStroke[]>([])
  // The refine brush only makes sense while the background is being replaced.
  const refining =
    canEdit && session.panelFocus === 'heal' && edits.background.mode !== 'original' ? refineTool : null
  const toggleSpots = useCallback(() => setShowSpots((v) => !v), [])
  // The brush shows at its size on the photo while the size slider moves, then fades out.
  const [sizePreview, setSizePreview] = useState(false)
  const sizePreviewTimer = useRef(0)
  const previewBrushSize = useCallback(() => {
    setSizePreview(true)
    window.clearTimeout(sizePreviewTimer.current)
    sizePreviewTimer.current = window.setTimeout(() => setSizePreview(false), 700)
  }, [])
  const previewApi = useRef<PreviewApi | null>(null)
  const phone = useMediaQuery(PHONE_QUERY)
  // Phones keep the photo full-size until a tool is picked from the floating menu; its panel then
  // opens as a sheet under the photo and can be closed again.
  const [sheetCollapsed, setSheetCollapsed] = useState(true)
  const sheetOpen = !phone || !sheetCollapsed
  // Any panel change (tab, shortcut, mask added…) unfolds the sheet again.
  const [sheetPanel, setSheetPanel] = useState(session.panelFocus)
  if (sheetPanel !== session.panelFocus) {
    setSheetPanel(session.panelFocus)
    setSheetCollapsed(false)
  }
  const sheetSwipe = useSheetSwipe(sheetOpen, setSheetCollapsed)
  // Phones float the histogram over the photo; hidden, it waits in the tools menu.
  const [histogramHidden, setHistogramHidden] = useState(loadHistogramHidden)
  const changeHistogramHidden = (hidden: boolean) => {
    setHistogramHidden(hidden)
    try {
      localStorage.setItem(HISTOGRAM_KEY, hidden ? 'hidden' : 'shown')
    } catch {
      // Storage unavailable — keep the choice for this session only.
    }
  }
  const swipe = phone ? sheetSwipe.handlers : undefined
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    tabsRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }, [session.panelFocus, phone])

  // Tools that take over touches on the photo: closing their sheet alone would leave them armed.
  const photoTool =
    session.panelFocus === 'heal' ||
    session.panelFocus === 'liquify' ||
    session.panelFocus === 'local' ||
    (session.panelFocus === 'crop' && session.cropMode)
  // Plain panels close from their sheet; these also need a way out once it is folded.
  const exitTool = () => {
    session.setCropMode(false)
    session.setPanelFocus('adjust')
    // Keep the sheet folded: the panel change would otherwise unfold it again.
    setSheetPanel('adjust')
    setSheetCollapsed(true)
  }

  const selectPanel = (id: PanelId) => {
    if (phone) setSheetCollapsed(false)
    session.setPanelFocus(id)
    if (id === 'crop') session.setCropMode(true)
  }

  // Select a mask as soon as it is added; fall back to the last one if the selection disappears.
  const maskIds = edits.localAdjustments.map((r) => r.id)
  const maskKey = maskIds.join('|')
  const prevMaskIds = useRef<string[]>(maskIds)
  useEffect(() => {
    const prev = prevMaskIds.current
    prevMaskIds.current = maskIds
    const added = maskIds.find((id) => !prev.includes(id))
    if (added) setSelectedMaskId(added)
    else if (!selectedMaskId || !maskIds.includes(selectedMaskId)) {
      setSelectedMaskId(maskIds[maskIds.length - 1] ?? null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maskKey])
  const selectedMask = edits.localAdjustments.find((m) => m.id === selectedMaskId) ?? null
  const selectedSpot = edits.heal.some((s) => s.id === selectedSpotId) ? selectedSpotId : null

  const setHeal = (heal: HealSpot[], opts?: { commit?: boolean }) => session.updateEdits({ heal }, opts)
  const updateSpot = (id: string, patch: Partial<HealSpot>, opts?: { commit?: boolean }) => {
    const spot = edits.heal.find((s) => s.id === id)
    if (!spot) return
    let next = { ...spot, ...patch, id }
    // A removal has no source to copy from: switching it to heal / clone needs one.
    if (spot.mode === 'remove' && next.mode !== 'remove') {
      next = { ...next, ...previewApi.current?.healSource(next) }
    }
    setHeal(
      edits.heal.map((s) => (s.id === id ? next : s)),
      opts,
    )
  }
  const removeSpot = (id: string) => setHeal(edits.heal.filter((s) => s.id !== id), { commit: true })
  const newSpotSource = (id: string) => {
    const spot = edits.heal.find((s) => s.id === id)
    const source = spot ? previewApi.current?.healSource(spot, true) : null
    if (source) updateSpot(id, source, { commit: true })
  }

  const autoTone = () => {
    const values = previewApi.current?.autoTone()
    if (values) session.updateEdits(values, { commit: true })
  }
  const autoWhiteBalance = () => {
    const values = previewApi.current?.autoWhiteBalance()
    if (values) session.updateEdits(values, { commit: true })
  }

  // App-level keys: W picker, O mask tint, ? shortcuts, Esc cancels the picker.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        e.metaKey ||
        e.ctrlKey ||
        (target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable))
      ) {
        return
      }
      if (modeRef.current !== 'edit') return
      if (e.key === '?') {
        e.preventDefault()
        setShortcutsOpen((v) => !v)
      } else if (e.key === 'Escape') {
        setPickingWhiteBalance(false)
      } else if (e.key.toLowerCase() === 'w' && !e.altKey) {
        e.preventDefault()
        setPickingWhiteBalance((v) => !v)
      } else if (e.key.toLowerCase() === 'o' && !e.altKey) {
        e.preventDefault()
        setShowMaskTint((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // A studio's first visit starts from the filmstrip selection (or the photo being edited).
  const startingPhotos = () => {
    const selected = session.photos.filter((p) => session.selectedIds.includes(p.id)).map((p) => p.id)
    return selected.length > 1 ? selected : session.activeId ? [session.activeId] : []
  }

  const openStudio = (format: StudioFormat) => {
    if (format === 'collage' && !collage) setCollage(createCollageDoc(startingPhotos()))
    if (format === 'carousel' && !carousel) {
      // Carry over the collage's photos when there are some.
      const fromCollage = [
        ...new Set(collage?.slides.flatMap((s) => s.cells.flatMap((c) => (c.photoId ? [c.photoId] : []))) ?? []),
      ]
      setCarousel(
        createCarouselDoc(fromCollage.length > 0 ? fromCollage.slice(0, 9) : startingPhotos(), collage?.aspect ?? '4:5'),
      )
    }
    setStudioFormat(format)
  }

  const changeMode = (next: AppMode) => {
    if (next === 'collage') openStudio(studioFormat)
    setMode(next)
  }

  const updateCollage = useCallback((update: (doc: CollageDoc) => CollageDoc) => {
    setCollage((doc) => (doc ? update(doc) : doc))
  }, [])

  const updateCarousel = useCallback((update: (doc: CarouselDoc) => CarouselDoc) => {
    setCarousel((doc) => (doc ? update(doc) : doc))
  }, [])

  const hasPhoto = (id: string | null) => id !== null && session.photos.some((p) => p.id === id)
  const studioHasPhotos =
    studioFormat === 'collage'
      ? Boolean(collage?.slides.some((s) => s.cells.some((c) => hasPhoto(c.photoId))))
      : Boolean(carousel?.frames.some((f) => hasPhoto(f.photoId)))

  const onHistogram = useCallback((bins: HistogramBins, clipping: ClippingStats) => {
    setHistogram({ bins, clipping })
  }, [])

  const begin = () => {
    setScrubbing(true)
    session.beginEdit()
  }
  const commit = () => {
    setScrubbing(false)
    session.commitEdit()
  }

  const histogramPanel = (
    <HistogramPanel
      bins={histogram?.bins ?? null}
      clipping={histogram?.clipping ?? null}
      showClipping={session.showClipping}
      onToggleClipping={() => session.setShowClipping(!session.showClipping)}
      onHide={phone ? () => changeHistogramHidden(true) : undefined}
    />
  )

  // Phones show it in the photos tray of the floating dock instead of a column.
  const filmstrip = (
    <Filmstrip
      photos={session.visiblePhotos}
      totalCount={session.photos.length}
      activeId={session.activeId}
      selectedIds={session.selectedIds}
      visible={phone || session.filmstripVisible}
      filter={session.filmstripFilter}
      onFilterChange={session.setFilmstripFilter}
      onSelect={session.selectPhoto}
      onOpen={session.handleOpen}
      onClear={() => setClearOpen(true)}
    />
  )

  return (
    <div className="app">
      <Toolbar
        mode={mode}
        onModeChange={changeMode}
        canExport={mode === 'collage' ? studioHasPhotos : canEdit}
        canEdit={canEdit}
        canPaste={Boolean(session.pastePlan?.targets.length)}
        canUndo={session.canUndo}
        canRedo={session.canRedo}
        status={session.status}
        selectionCount={session.selectedIds.length}
        onOpen={session.handleOpen}
        onUndo={session.undo}
        onRedo={session.redo}
        onCopy={session.copyEdits}
        onPaste={session.openPaste}
        onExport={() =>
          mode === 'collage' ? studioApi.current?.exportSlides() : session.setExportOpen(true)
        }
        onShowShortcuts={() => setShortcutsOpen(true)}
        onClearWorkspace={() => setClearOpen(true)}
      />

      {mode === 'collage' && studioFormat === 'carousel' && carousel ? (
        <CarouselStudio
          photos={session.photos}
          doc={carousel}
          onChange={updateCarousel}
          onFormatChange={openStudio}
          onOpen={() => session.handleOpen()}
          onNotify={session.showToast}
          apiRef={studioApi}
        />
      ) : mode === 'collage' && collage ? (
        <CollageStudio
          photos={session.photos}
          doc={collage}
          onChange={updateCollage}
          onFormatChange={openStudio}
          onOpen={() => session.handleOpen()}
          onNotify={session.showToast}
          apiRef={studioApi}
        />
      ) : (
        <div
          className={
            session.filmstripVisible
              ? 'workspace'
              : 'workspace workspace--no-filmstrip'
          }
        >
          {!phone && filmstrip}

          <main className="stage">
            <PreviewCanvas
              src={session.activePhoto?.objectUrl ?? null}
              rawFile={
                session.activePhoto && isRawFile(session.activePhoto.file)
                  ? session.activePhoto.file
                  : null
              }
              edits={edits}
              name={session.activePhoto?.name}
              compareMode={session.compareMode}
              split={session.splitMode}
              onToggleSplit={canEdit ? session.toggleSplit : undefined}
              showClipping={session.showClipping}
              scrubbing={scrubbing}
              onRotate={
                canEdit
                  ? (rotate) => {
                      // A quarter turn swaps the image's sides inside the straightened frame.
                      const turned = (rotate - edits.rotate) % 180 !== 0
                      const image = frameSize && (turned ? { w: frameSize.image.h, h: frameSize.image.w } : frameSize.image)
                      const crop = image ? fitCropInImage(edits.crop, image) : edits.crop
                      session.updateEdits({ rotate, crop }, { commit: true })
                    }
                  : undefined
              }
              onHistogram={onHistogram}
              onFrameSize={setFrameSize}
              onOpen={() => session.handleOpen()}
              onOpenSamples={session.openSamples}
              cropOverlay={
                canEdit && session.panelFocus === 'crop' && session.cropMode
                  ? {
                      crop: edits.crop,
                      aspect: aspectRatioFor(cropAspect.id, cropAspect.flipped, frameSize?.image ?? null),
                      image: frameSize?.image ?? null,
                      onChange: (crop) => session.updateEdits({ crop }),
                      onBegin: begin,
                      onCommit: commit,
                    }
                  : null
              }
              maskOverlay={
                canEdit && session.panelFocus === 'local'
                  ? {
                      items: edits.localAdjustments,
                      selectedId: selectedMaskId,
                      brush,
                      onSelect: setSelectedMaskId,
                      onChange: session.updateLocal,
                      onBegin: begin,
                      onCommit: commit,
                    }
                  : null
              }
              healOverlay={
                canEdit && session.panelFocus === 'heal'
                  ? {
                      spots: edits.heal,
                      selectedId: selectedSpot,
                      tool: healTool,
                      showOutlines: showSpots,
                      sizePreview,
                      onSelect: setSelectedSpotId,
                      onAdd: (spot) => {
                        setHeal([...edits.heal, spot], { commit: true })
                        setSelectedSpotId(spot.id)
                      },
                      onChange: updateSpot,
                      onBegin: begin,
                      onCommit: commit,
                    }
                  : null
              }
              liquifyOverlay={
                canEdit && session.panelFocus === 'liquify'
                  ? {
                      tool: liquifyTool,
                      sizePreview,
                      onBegin: () => {
                        liquifyBase.current = edits.liquify
                        begin()
                      },
                      onChange: (stroke) => session.updateEdits({ liquify: [...liquifyBase.current, stroke] }),
                      onCommit: commit,
                    }
                  : null
              }
              refineOverlay={
                refining
                  ? {
                      tool: refining,
                      onStroke: (stroke) =>
                        session.updateEdits(
                          { background: { ...edits.background, refine: [...edits.background.refine, stroke] } },
                          { commit: true },
                        ),
                    }
                  : null
              }
              maskTint={canEdit && session.panelFocus === 'local' && showMaskTint ? selectedMask : null}
              onPickWhiteBalance={
                canEdit && pickingWhiteBalance
                  ? (wb) => {
                      session.updateEdits(wb, { commit: true })
                      setPickingWhiteBalance(false)
                    }
                  : null
              }
              apiRef={previewApi}
            />
          </main>

          {phone && canEdit && (
            <PhoneDock
              photoCount={session.photos.length}
              filmstrip={filmstrip}
              overlay={histogramHidden ? null : histogramPanel}
              exit={
                photoTool
                  ? { label: `Close ${PANELS.find((p) => p.id === session.panelFocus)?.label ?? 'tool'}`, onExit: exitTool }
                  : null
              }
              action={{
                kind: 'menu',
                items: [
                  ...PANELS.map(({ id, label }) => ({
                    id,
                    label,
                    icon: <PanelIcon id={id} size={18} />,
                    active: sheetOpen && id === session.panelFocus,
                    onSelect: () => selectPanel(id),
                  })),
                  // A hidden histogram comes back from the tools menu.
                  ...(histogramHidden
                    ? [
                        {
                          id: 'histogram',
                          label: 'Histogram',
                          icon: <HistogramIcon />,
                          extra: true,
                          onSelect: () => changeHistogramHidden(false),
                        },
                      ]
                    : []),
                ],
              }}
            />
          )}

          {/* Phones show the tool sheet only once a tool is picked: until then the photo gets the whole screen. */}
          {(!phone || (canEdit && sheetOpen)) && (
          <aside
            className={sheetSwipe.offset !== 0 ? 'sidebar sidebar--dragging' : 'sidebar'}
            style={sheetSwipe.offset ? { transform: `translateY(${sheetSwipe.offset}px)` } : undefined}
            aria-label="Editor panels"
          >
            {phone && (
              <PhoneSheetHead
                icon={<PanelIcon id={session.panelFocus} />}
                title={PANELS.find((p) => p.id === session.panelFocus)?.label}
                onClose={() => setSheetCollapsed(true)}
                {...swipe}
              />
            )}
            {!phone && (
            <div className="panel-tabs" role="tablist" aria-label="Panels" ref={tabsRef}>
              {PANELS.map(({ id, label }, index) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={session.panelFocus === id}
                  className={
                    session.panelFocus === id ? 'panel-tab panel-tab--active' : 'panel-tab'
                  }
                  title={`${label} (⇧${index + 1})`}
                  onClick={() => selectPanel(id)}
                >
                  <PanelIcon id={id} />
                  <span className="panel-tab__label">{label}</span>
                </button>
              ))}
            </div>
            )}

            <div className="sidebar__scroll">
              {!phone && histogramPanel}

              {session.panelFocus === 'adjust' && (
                <AdjustmentsPanel
                  edits={edits}
                  disabled={!canEdit}
                  pickingWhiteBalance={pickingWhiteBalance}
                  onChange={session.updateEdits}
                  onReset={session.resetEdits}
                  onAutoTone={autoTone}
                  onAutoWhiteBalance={autoWhiteBalance}
                  onTogglePicker={() => setPickingWhiteBalance((v) => !v)}
                  onBegin={begin}
                  onCommit={commit}
                />
              )}

              {session.panelFocus === 'color' && (
                <ColorPanel
                  edits={edits}
                  disabled={!canEdit}
                  onChange={session.updateEdits}
                  onBegin={begin}
                  onCommit={commit}
                />
              )}

              {session.panelFocus === 'effects' && (
                <EffectsPanel
                  edits={edits}
                  disabled={!canEdit}
                  onChange={session.updateEdits}
                  onBegin={begin}
                  onCommit={commit}
                />
              )}

              {session.panelFocus === 'curve' && (
                <ToneCurvePanel
                  edits={edits}
                  disabled={!canEdit}
                  histogram={histogram?.bins ?? null}
                  onChange={session.updateEdits}
                  onBegin={begin}
                  onCommit={commit}
                />
              )}

              {session.panelFocus === 'crop' && (
                <CropPanel
                  edits={edits}
                  disabled={!canEdit}
                  cropMode={session.cropMode}
                  onToggleCropMode={() => session.setCropMode(!session.cropMode)}
                  aspectId={cropAspect.id}
                  aspectFlipped={cropAspect.flipped}
                  onAspectChange={(id, flipped) => setCropAspect({ id, flipped })}
                  frameSize={frameSize}
                  onChange={session.updateEdits}
                  onBegin={begin}
                  onCommit={commit}
                />
              )}

              {session.panelFocus === 'heal' && (
                <BackgroundPanel
                  background={edits.background}
                  disabled={!canEdit}
                  onChange={(background, opts) => session.updateEdits({ background }, opts)}
                  onBegin={begin}
                  onCommit={commit}
                  refine={refining}
                  onRefineChange={setRefineTool}
                />
              )}

              {session.panelFocus === 'heal' && (
                <HealPanel
                  spots={edits.heal}
                  disabled={!canEdit}
                  selectedId={selectedSpot}
                  tool={healTool}
                  showOutlines={showSpots}
                  onToggleOutlines={toggleSpots}
                  onToolChange={setHealTool}
                  onSelect={setSelectedSpotId}
                  onUpdate={updateSpot}
                  onRemove={removeSpot}
                  onClear={() => setHeal([], { commit: true })}
                  onNewSource={newSpotSource}
                  onSizePreview={previewBrushSize}
                  onBegin={begin}
                  onCommit={commit}
                />
              )}

              {session.panelFocus === 'liquify' && (
                <LiquifyPanel
                  strokeCount={edits.liquify.length}
                  disabled={!canEdit}
                  tool={liquifyTool}
                  onToolChange={setLiquifyTool}
                  onClear={() => session.updateEdits({ liquify: [] }, { commit: true })}
                  onSizePreview={previewBrushSize}
                />
              )}

              {session.panelFocus === 'local' && (
                <LocalAdjustPanel
                  edits={edits}
                  disabled={!canEdit}
                  selectedId={selectedMaskId}
                  brush={brush}
                  showOverlay={showMaskTint}
                  onSelect={setSelectedMaskId}
                  onAdd={session.addLocal}
                  onAddTeeth={() => {
                    session.addLocal('brush', { name: 'Teeth', whiten: 60 })
                    // Teeth are small: start with a small, soft brush.
                    setBrush({ size: 0.012, feather: 0.5, flow: 1, erase: false })
                  }}
                  onAddBackground={() => session.addLocal('subject', { name: 'Background', invert: true })}
                  onUpdate={session.updateLocal}
                  onRemove={session.removeLocal}
                  onBrushChange={setBrush}
                  onToggleOverlay={() => setShowMaskTint((v) => !v)}
                  onBegin={begin}
                  onCommit={commit}
                />
              )}

              {session.panelFocus === 'presets' && (
                <PresetsPanel
                  presets={session.presets}
                  previewSrc={session.activePhoto?.objectUrl ?? null}
                  previewGeometry={
                    session.activePhoto
                      ? { rotate: session.activePhoto.edits.rotate, crop: session.activePhoto.edits.crop }
                      : null
                  }
                  selectedPresetId={session.selectedPresetId}
                  intensity={session.presetIntensity}
                  disabled={!canEdit}
                  onSave={session.savePreset}
                  onUpdateSelected={session.updateSelectedPreset}
                  onApply={session.applyPreset}
                  onRemove={session.removePreset}
                  onIntensityChange={session.setPresetIntensity}
                  onDelete={session.deletePreset}
                  onExport={session.exportPreset}
                  onExportAll={session.exportAllPresets}
                  onImport={session.importPreset}
                />
              )}

              {/* Phones hide the sidebar footer, so the ad and support links close each panel instead. */}
              {phone && (
                <div className="sheet-extras">
                  <AdSlot id="sidebar" height={96} />
                  <div className="sheet-extras__links">
                    <GithubStar />
                    <DonateButton />
                  </div>
                </div>
              )}
            </div>

            <AdSlot id="sidebar" height={250} />
            <div className="sidebar__github">
              <GithubStar />
              <DonateButton compact />
            </div>
          </aside>
          )}
        </div>
      )}

      <ExportDialog
        open={session.exportOpen}
        initial={session.exportOptions}
        selectionCount={Math.max(1, session.selectedIds.length)}
        onClose={() => session.setExportOpen(false)}
        onExport={session.runExport}
      />

      <PasteDialog
        open={session.pasteOpen}
        sourceName={session.pastePlan?.source.name ?? ''}
        targetCount={session.pastePlan?.targets.length ?? 0}
        initial={session.pasteGroupIds}
        onPaste={session.pasteEdits}
        onCancel={session.closePaste}
      />

      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      <ConfirmDialog
        open={clearOpen}
        title="Clear workspace?"
        confirmLabel={`Remove ${session.photos.length} photo${session.photos.length === 1 ? '' : 's'}`}
        onCancel={closeClear}
        onConfirm={() => {
          session.clearWorkspace()
          setCollage(null)
          setCarousel(null)
          closeClear()
        }}
      >
        <p>
          This removes all {session.photos.length} open photo{session.photos.length === 1 ? '' : 's'}, their
          edits and the undo history. It can't be undone.
        </p>
        <p className="confirm__note">Your original files and your presets are not affected.</p>
      </ConfirmDialog>

      <Toast toast={session.toast} onDismiss={session.dismissToast} />
    </div>
  )
}
