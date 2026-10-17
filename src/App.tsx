import { useCallback, useEffect, useRef, useState } from 'react'
import { AdSlot } from './components/AdSlot'
import { AdjustmentsPanel } from './components/AdjustmentsPanel'
import { ColorPanel } from './components/ColorPanel'
import { CropPanel } from './components/CropPanel'
import { EffectsPanel } from './components/EffectsPanel'
import { ExportDialog } from './components/ExportDialog'
import { Filmstrip } from './components/Filmstrip'
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
import { aspectRatioFor } from './lib/crop'
import type { ClippingStats, HistogramBins } from './lib/histogram'
import { isRawFile } from './lib/rawDecode'
import { DEFAULT_EDITS } from './types/edits'

export default function App() {
  const session = useEditorSession()
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
  const [brush, setBrush] = useState<BrushSettings>({ size: 0.05, feather: 0.6, flow: 1, erase: false })
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
        canEdit={canEdit}
        hasClipboard={Boolean(session.clipboard)}
        canUndo={session.canUndo}
        canRedo={session.canRedo}
        compareMode={session.compareMode}
        status={session.status}
        selectionCount={session.selectedIds.length}
        onOpen={session.handleOpen}
        onUndo={session.undo}
        onRedo={session.redo}
        onCopy={session.copyEdits}
        onPaste={session.pasteEdits}
        onSync={session.syncSelected}
        onToggleCompare={() => session.setCompareMode(!session.compareMode)}
        onExport={() => session.setExportOpen(true)}
        onShowShortcuts={() => setShortcutsOpen(true)}
      />

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
                onIntensityChange={session.setPresetIntensity}
                onDelete={session.deletePreset}
                onExport={session.exportPreset}
                onExportAll={session.exportAllPresets}
                onImport={session.importPreset}
              />
            )}
          </div>

          <AdSlot id="sidebar" height={250} />
        </aside>
      </div>

      <ExportDialog
        open={session.exportOpen}
        initial={session.exportOptions}
        selectionCount={Math.max(1, session.selectedIds.length)}
        onClose={() => session.setExportOpen(false)}
        onExport={session.runExport}
      />

      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      <Toast toast={session.toast} onDismiss={session.dismissToast} />
    </div>
  )
}
