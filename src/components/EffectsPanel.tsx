import type { BasicEditKey, EditParams } from '../types/edits'
import { SliderGroup } from './AdjustmentsPanel'

type EffectsPanelProps = {
  edits: EditParams
  disabled?: boolean
  onChange: (patch: Partial<EditParams>, opts?: { commit?: boolean }) => void
  onBegin?: () => void
  onCommit?: () => void
}

const GROUPS: { title: string; keys: BasicEditKey[] }[] = [
  { title: 'Vignette', keys: ['vignette', 'vignetteMidpoint'] },
  { title: 'Grain', keys: ['grain', 'grainSize'] },
  { title: 'Detail', keys: ['sharpening', 'noiseReduction', 'colorNoiseReduction'] },
]

export function EffectsPanel(props: EffectsPanelProps) {
  return (
    <section className="panel" aria-label="Effects">
      {GROUPS.map((group) => (
        <div key={group.title} className="adjust-group">
          <div className="adjust-group__header">
            <h3 className="adjust-group__title">{group.title}</h3>
          </div>
          <SliderGroup keys={group.keys} {...props} />
        </div>
      ))}
      <p className="field-hint">Sharpening and noise reduction are easiest to judge at 100% zoom.</p>
    </section>
  )
}
