import { useEditorLang } from '../hooks/useEditorLang'
import type { BasicEditKey, EditParams } from '../types/edits'
import { SliderGroup } from './AdjustmentsPanel'

type EffectsPanelProps = {
  edits: EditParams
  disabled?: boolean
  onChange: (patch: Partial<EditParams>, opts?: { commit?: boolean }) => void
  onBegin?: () => void
  onCommit?: () => void
}

const GROUPS: { id: 'vignette' | 'grain' | 'detail'; keys: BasicEditKey[] }[] = [
  { id: 'vignette', keys: ['vignette', 'vignetteMidpoint'] },
  { id: 'grain', keys: ['grain', 'grainSize'] },
  { id: 'detail', keys: ['sharpening', 'noiseReduction', 'colorNoiseReduction'] },
]

export function EffectsPanel(props: EffectsPanelProps) {
  const { copy } = useEditorLang()
  return (
    <section className="panel" aria-label={copy.panels.effects}>
      {GROUPS.map((group) => (
        <div key={group.id} className="adjust-group">
          <div className="adjust-group__header">
            <h3 className="adjust-group__title">{copy.panels[group.id]}</h3>
          </div>
          <SliderGroup keys={group.keys} {...props} />
        </div>
      ))}
      <p className="field-hint">Sharpening and noise reduction are easiest to judge at 100% zoom.</p>
    </section>
  )
}
