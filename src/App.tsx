import { useCallback, useState } from 'react'
import { AdjustmentsPanel } from './components/AdjustmentsPanel'
import { CropPanel } from './components/CropPanel'
import { ExportDialog } from './components/ExportDialog'
import { Filmstrip } from './components/Filmstrip'
import { HistogramPanel } from './components/HistogramPanel'
import { LocalAdjustPanel } from './components/LocalAdjustPanel'
import { PresetsPanel } from './components/PresetsPanel'
import { PreviewCanvas } from './components/PreviewCanvas'
import { ToneCurvePanel } from './components/ToneCurvePanel'
import { Toolbar } from './components/Toolbar'
import { useEditorSession } from './hooks/useEditorSession'
import type { ClippingStats, HistogramBins } from './lib/histogram'
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
          />
        </main>

        <aside className="sidebar" aria-label="Editor panels">
          <div className="panel-tabs" role="tablist" aria-label="Panels">
            {(
              [
                ['adjust', '1 Adjust'],
                ['curve', '2 Curve'],
                ['crop', '3 Crop'],
                ['local', '4 Local'],
                ['presets', '5 Presets'],
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
              onChange={session.updateEdits}
              onBegin={begin}
              onCommit={commit}
            />
          )}

          {session.panelFocus === 'local' && (
            <LocalAdjustPanel
              edits={edits}
              disabled={!canEdit}
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
              onImport={session.importPreset}
            />
          )}
        </aside>
      </div>

      <ExportDialog
        open={session.exportOpen}
        initial={session.exportOptions}
        selectionCount={Math.max(1, session.selectedIds.length)}
        onClose={() => session.setExportOpen(false)}
        onExport={session.runExport}
      />
    </div>
  )
}
