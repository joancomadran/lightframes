import { useCallback, useEffect, useRef, useState } from 'react'
import { AdSlot } from './components/AdSlot'
import { AdjustmentsPanel } from './components/AdjustmentsPanel'
import { CarouselStudio } from './components/CarouselStudio'
import { CollageStudio } from './components/CollageStudio'
import { ColorPanel } from './components/ColorPanel'
import { CropPanel } from './components/CropPanel'
import { EffectsPanel } from './components/EffectsPanel'
import { ConfirmDialog } from './components/ConfirmDialog'
import { ExportDialog } from './components/ExportDialog'
import { Filmstrip } from './components/Filmstrip'
import { GithubStar } from './components/GithubStar'
import type { HealTool } from './components/HealOverlay'
import { HealPanel } from './components/HealPanel'
import { HistogramPanel } from './components/HistogramPanel'
import { LocalAdjustPanel } from './components/LocalAdjustPanel'
import type { BrushSettings } from './components/MaskOverlay'
import { PresetsPanel } from './components/PresetsPanel'
import { PreviewCanvas, type PreviewApi, type Size } from './components/PreviewCanvas'
import { ShortcutsDialog } from './components/ShortcutsDialog'
import { Toast } from './components/Toast'
import { ToneCurvePanel } from './components/ToneCurvePanel'
import { Toolbar } from './components/Toolbar'
import { PANELS, useEditorSession, type PanelId } from './hooks/useEditorSession'
import { PHONE_QUERY, useMediaQuery } from './hooks/useMediaQuery'
import type { StudioApi, StudioFormat } from './hooks/useStudio'
import { createCarouselDoc, type CarouselDoc } from './lib/carousel'
import { createCollageDoc, type CollageDoc } from './lib/collage'
import { aspectRatioFor } from './lib/crop'
import type { ClippingStats, HistogramBins } from './lib/histogram'
import { isRawFile } from './lib/rawDecode'
import { DEFAULT_EDITS, type HealSpot } from './types/edits'

export type AppMode = 'edit' | 'collage'

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
  const [frameSize, setFrameSize] = useState<Size | null>(null)
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
  const toggleSpots = useCallback(() => setShowSpots((v) => !v), [])
  const previewApi = useRef<PreviewApi | null>(null)
  const phone = useMediaQuery(PHONE_QUERY)
  // Phones show the panels as a bottom sheet that can fold away to reveal the whole photo.
  const [sheetCollapsed, setSheetCollapsed] = useState(false)
  const sheetOpen = !phone || !sheetCollapsed
  // Any panel change (tab, shortcut, mask added…) unfolds the sheet again.
  const [sheetPanel, setSheetPanel] = useState(session.panelFocus)
  if (sheetPanel !== session.panelFocus) {
    setSheetPanel(session.panelFocus)
    setSheetCollapsed(false)
  }
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    tabsRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }, [session.panelFocus, phone])

  const selectPanel = (id: PanelId) => {
    if (phone && id === session.panelFocus) {
      setSheetCollapsed((v) => !v)
      return
    }
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

  return (
    <div className="app">
      <Toolbar
        mode={mode}
        onModeChange={changeMode}
        canExport={mode === 'collage' ? studioHasPhotos : canEdit}
        canEdit={canEdit}
        hasClipboard={Boolean(session.clipboard)}
        canUndo={session.canUndo}
        canRedo={session.canRedo}
        status={session.status}
        selectionCount={session.selectedIds.length}
        onOpen={session.handleOpen}
        onUndo={session.undo}
        onRedo={session.redo}
        onCopy={session.copyEdits}
        onPaste={session.pasteEdits}
        onSync={session.syncSelected}
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
          <Filmstrip
            photos={session.visiblePhotos}
            totalCount={session.photos.length}
            activeId={session.activeId}
            selectedIds={session.selectedIds}
            visible={session.filmstripVisible}
            filter={session.filmstripFilter}
            onFilterChange={session.setFilmstripFilter}
            onSelect={session.selectPhoto}
            onOpen={session.handleOpen}
            onSync={session.syncSelected}
            onClear={() => setClearOpen(true)}
          />

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
                  ? (rotate) => session.updateEdits({ rotate }, { commit: true })
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
                      aspect: aspectRatioFor(cropAspect.id, cropAspect.flipped, frameSize),
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

          {/* Phones skip the tool sheet until there is a photo: disabled sliders only crowd the welcome screen. */}
          {(!phone || canEdit) && (
          <aside
            className={sheetOpen ? 'sidebar' : 'sidebar sidebar--collapsed'}
            aria-label="Editor panels"
          >
            <button
              type="button"
              className="sheet-handle"
              aria-label={sheetOpen ? 'Hide tools' : 'Show tools'}
              aria-expanded={sheetOpen}
              onClick={() => setSheetCollapsed((v) => !v)}
            />
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
                  {label}
                </button>
              ))}
            </div>

            <div className="sidebar__scroll" hidden={!sheetOpen}>
              <HistogramPanel
                bins={histogram?.bins ?? null}
                clipping={histogram?.clipping ?? null}
                showClipping={session.showClipping}
                onToggleClipping={() => session.setShowClipping(!session.showClipping)}
              />

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
                  onBegin={begin}
                  onCommit={commit}
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
            </div>

            <AdSlot id="sidebar" height={250} />
            <div className="sidebar__github">
              <GithubStar />
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
