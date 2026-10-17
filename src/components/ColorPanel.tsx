import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import {
  GRADE_ZONES,
  createDefaultColorGrading,
  isNeutralColorGrading,
  type EditParams,
  type GradeZone,
  type GradeZoneId,
} from '../types/edits'
import { HslControls } from './HslPanel'
import { Slider } from './Slider'

type EditChange = (patch: Partial<EditParams>, opts?: { commit?: boolean }) => void

type ColorPanelProps = {
  edits: EditParams
  disabled?: boolean
  onChange: EditChange
  onBegin?: () => void
  onCommit?: () => void
}

const ZONE_LABELS: Record<GradeZoneId, string> = {
  shadows: 'Shadows',
  midtones: 'Mids',
  highlights: 'Highs',
  global: 'Global',
}

const HUE_TRACK =
  'linear-gradient(90deg, hsl(0 80% 55%), hsl(60 80% 55%), hsl(120 80% 55%), hsl(180 80% 55%), hsl(240 80% 55%), hsl(300 80% 55%), hsl(360 80% 55%))'

/** Hue around the ring (0° at 3 o'clock, clockwise), saturation from the centre out. */
function ColorWheel({
  zone,
  disabled,
  onChange,
  onBegin,
  onCommit,
  onReset,
}: {
  zone: GradeZone
  disabled?: boolean
  onChange: (zone: GradeZone) => void
  onBegin?: () => void
  onCommit?: () => void
  onReset: () => void
}) {
  const dragging = useRef(false)

  const pick = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    const radius = rect.width / 2
    const hue = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360
    const saturation = Math.min(100, (Math.hypot(dx, dy) / radius) * 100)
    onChange({ ...zone, hue: Math.round(hue), saturation: Math.round(saturation) })
  }

  const angle = (zone.hue * Math.PI) / 180
  const r = zone.saturation / 100
  const puckX = 50 + Math.cos(angle) * r * 50
  const puckY = 50 + Math.sin(angle) * r * 50

  return (
    <div
      className={disabled ? 'color-wheel color-wheel--disabled' : 'color-wheel'}
      role="slider"
      aria-label="Hue and saturation"
      aria-valuetext={`Hue ${zone.hue}°, saturation ${zone.saturation}`}
      title="Drag to pick a tint · double-click to reset"
      onPointerDown={(e) => {
        if (disabled || e.button !== 0) return
        dragging.current = true
        onBegin?.()
        e.currentTarget.setPointerCapture(e.pointerId)
        pick(e)
      }}
      onPointerMove={(e) => {
        if (dragging.current) pick(e)
      }}
      onPointerUp={() => {
        if (!dragging.current) return
        dragging.current = false
        onCommit?.()
      }}
      onDoubleClick={() => {
        if (!disabled) onReset()
      }}
    >
      <span
        className="color-wheel__puck"
        style={{
          left: `${puckX}%`,
          top: `${puckY}%`,
          background: zone.saturation > 0 ? `hsl(${zone.hue} 80% 55%)` : '#9aa39b',
        }}
      />
    </div>
  )
}

function ColorGradingControls({ edits, disabled, onChange, onBegin, onCommit }: ColorPanelProps) {
  const [zoneId, setZoneId] = useState<GradeZoneId>('midtones')
  const grading = edits.colorGrading
  const zone = grading[zoneId]
  const setZone = (next: GradeZone, opts?: { commit?: boolean }) =>
    onChange({ colorGrading: { ...grading, [zoneId]: next } }, opts)

  return (
    <div className="adjust-group">
      <div className="adjust-group__header">
        <h3 className="adjust-group__title">Color grading</h3>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          disabled={disabled || isNeutralColorGrading(grading)}
          onClick={() => onChange({ colorGrading: createDefaultColorGrading() }, { commit: true })}
          title="Reset every wheel"
        >
          Reset
        </button>
      </div>

      <div className="segmented segmented--zones" role="tablist" aria-label="Tonal range">
        {GRADE_ZONES.map((item) => {
          const z = grading[item.id]
          const active = item.id === zoneId
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={item.label}
              className={active ? 'segmented__btn segmented__btn--active' : 'segmented__btn'}
              disabled={disabled}
              onClick={() => setZoneId(item.id)}
            >
              {z.saturation > 0 && (
                <span className="grade-dot" style={{ background: `hsl(${z.hue} 75% 55%)` }} aria-hidden="true" />
              )}
              {ZONE_LABELS[item.id]}
            </button>
          )
        })}
      </div>

      <div className="grade-body">
        <ColorWheel
          zone={zone}
          disabled={disabled}
          onChange={(next) => setZone(next)}
          onBegin={onBegin}
          onCommit={onCommit}
          onReset={() => setZone({ hue: 0, saturation: 0, luminance: 0 }, { commit: true })}
        />
        <div className="grade-sliders">
          <Slider
            label="Hue"
            value={zone.hue}
            min={0}
            max={360}
            step={1}
            defaultValue={0}
            track={HUE_TRACK}
            disabled={disabled}
            format={(v) => `${Math.round(v)}°`}
            onChange={(hue, opts) => setZone({ ...zone, hue }, opts)}
            onBegin={onBegin}
            onCommit={onCommit}
          />
          <Slider
            label="Saturation"
            value={zone.saturation}
            min={0}
            max={100}
            step={1}
            defaultValue={0}
            track={`linear-gradient(90deg, hsl(${zone.hue} 0% 50%), hsl(${zone.hue} 85% 55%))`}
            disabled={disabled}
            onChange={(saturation, opts) => setZone({ ...zone, saturation }, opts)}
            onBegin={onBegin}
            onCommit={onCommit}
          />
          <Slider
            label="Luminance"
            value={zone.luminance}
            min={-100}
            max={100}
            step={1}
            defaultValue={0}
            track="linear-gradient(90deg, #111, #7d827e, #f2f2ee)"
            disabled={disabled}
            onChange={(luminance, opts) => setZone({ ...zone, luminance }, opts)}
            onBegin={onBegin}
            onCommit={onCommit}
          />
        </div>
      </div>

      <Slider
        label="Blending"
        value={grading.blending}
        min={0}
        max={100}
        step={1}
        defaultValue={50}
        disabled={disabled}
        onChange={(blending, opts) => onChange({ colorGrading: { ...grading, blending } }, opts)}
        onBegin={onBegin}
        onCommit={onCommit}
      />
      <Slider
        label="Balance"
        value={grading.balance}
        min={-100}
        max={100}
        step={1}
        defaultValue={0}
        disabled={disabled}
        onChange={(balance, opts) => onChange({ colorGrading: { ...grading, balance } }, opts)}
        onBegin={onBegin}
        onCommit={onCommit}
      />
    </div>
  )
}

export function ColorPanel(props: ColorPanelProps) {
  return (
    <section className="panel" aria-label="Color">
      <HslControls {...props} />
      <ColorGradingControls {...props} />
    </section>
  )
}
