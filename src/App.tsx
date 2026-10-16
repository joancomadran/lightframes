import { AdjustmentsPanel } from './components/AdjustmentsPanel'
import { Filmstrip } from './components/Filmstrip'
import { PresetsPanel } from './components/PresetsPanel'
import { PreviewCanvas } from './components/PreviewCanvas'
import { Toolbar } from './components/Toolbar'
import { useEditorSession } from './hooks/useEditorSession'
import { DEFAULT_EDITS } from './types/edits'

export default function App() {
  const session = useEditorSession()
  const canEdit = Boolean(session.activePhoto)

  return (
    <div className="app">
      <Toolbar
        canEdit={canEdit}
        hasClipboard={Boolean(session.clipboard)}
        status={session.status}
        onOpen={session.handleOpen}
        onCopy={session.copyEdits}
        onPaste={session.pasteEdits}
        onExport={session.exportJpeg}
      />

      <div className="workspace">
        <Filmstrip
          photos={session.photos}
          activeId={session.activeId}
          onSelect={session.selectPhoto}
          onOpen={session.handleOpen}
        />

        <main className="stage">
          <PreviewCanvas
            src={session.activePhoto?.objectUrl ?? null}
            edits={session.activePhoto?.edits ?? DEFAULT_EDITS}
            name={session.activePhoto?.name}
          />
        </main>

        <aside className="sidebar" aria-label="Editor panels">
          <AdjustmentsPanel
            edits={session.activePhoto?.edits ?? DEFAULT_EDITS}
            disabled={!canEdit}
            onChange={session.updateEdits}
            onReset={session.resetEdits}
          />
          <PresetsPanel
            presets={session.presets}
            disabled={!canEdit}
            onSave={session.savePreset}
            onApply={session.applyPreset}
            onDelete={session.deletePreset}
            onExport={session.exportPreset}
            onImport={session.importPreset}
          />
        </aside>
      </div>
    </div>
  )
}
