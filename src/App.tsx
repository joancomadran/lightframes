import { useCallback, useEffect, useRef, useState } from 'react'
import { AdSlot } from './components/AdSlot'
import { AdjustmentsPanel } from './components/AdjustmentsPanel'
import { CropPanel } from './components/CropPanel'
import { ExportDialog } from './components/ExportDialog'
import { Filmstrip } from './components/Filmstrip'
import { HistogramPanel } from './components/HistogramPanel'
import { LocalAdjustPanel } from './components/LocalAdjustPanel'
import { PresetsPanel } from './components/PresetsPanel'
import { PreviewCanvas, type Size } from './components/PreviewCanvas'
import { Toast } from './components/Toast'
import { ToneCurvePanel } from './components/ToneCurvePanel'
import { Toolbar } from './components/Toolbar'
import { useEditorSession } from './hooks/useEditorSession'
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
  const [selectedRadialId, setSelectedRadialId] = useState<string | null>(null)

  // Select a radial as soon as it is added; fall back to the last one if the selection disappears.
  const radialIds = edits.localAdjustments.map((r) => r.id)
  const radialKey = radialIds.join('|')
  const prevRadialIds = useRef<string[]>(radialIds)
  useEffect(() => {
    const prev = prevRadialIds.current
    prevRadialIds.current = radialIds
    const added = radialIds.find((id) => !prev.includes(id))
    if (added) setSelectedRadialId(added)
    else if (!selectedRadialId || !radialIds.includes(selectedRadialId)) {
      setSelectedRadialId(radialIds[radialIds.length - 1] ?? null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radialKey])

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
      />

      <div
        className={
          session.filmstripVisible
            ? 'workspace'
            : 'workspace workspace--no-filmstrip'
        }
      >
        <Filmstrip
          photos={session.photos}
          activeId={session.activeId}
          selectedIds={session.selectedIds}
          visible={session.filmstripVisible}
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
            radialOverlay={
              canEdit && session.panelFocus === 'local'
                ? {
                    items: edits.localAdjustments,
                    selectedId: selectedRadialId,
                    onSelect: setSelectedRadialId,
                    onChange: session.updateRadial,
                    onBegin: begin,
                    onCommit: commit,
                  }
                : null
            }
          />
        </main>

        <aside className="sidebar" aria-label="Editor panels">
          <div className="panel-tabs" role="tablist" aria-label="Panels">
            {(
              [
                ['adjust', 'Adjust'],
                ['curve', 'Curve'],
                ['crop', 'Crop'],
                ['local', 'Local'],
                ['presets', 'Presets'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={session.panelFocus === id}
                className={
                  session.panelFocus === id ? 'panel-tab panel-tab--active' : 'panel-tab'
                }
                onClick={() => {
                  session.setPanelFocus(id)
                  if (id === 'crop') session.setCropMode(true)
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="sidebar__scroll">
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
                onChange={session.updateEdits}
                onReset={session.resetEdits}
                onBegin={begin}
                onCommit={commit}
              />
            )}

            {session.panelFocus === 'curve' && (
              <ToneCurvePanel
                edits={edits}
                disabled={!canEdit}
                histogram={histogram?.bins.lum ?? null}
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
                selectedId={selectedRadialId}
                onSelect={setSelectedRadialId}
                onAdd={session.addRadial}
                onUpdate={session.updateRadial}
                onRemove={session.removeRadial}
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

      <Toast toast={session.toast} onDismiss={session.dismissToast} />
    </div>
  )
}
