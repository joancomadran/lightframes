import React from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Img } from 'remotion'
import { lerp } from '../anim'
import { C, F, img, PHOTOS, PRESETS, type Photo } from '../theme'
import { Icon, type PanelId } from './Icons'

/** Logical editor size; the camera scales it onto the 1920×1080 frame. */
export const EW = 1760
export const EH = 990
export const TB = 54
export const FS = 200
export const SB = 280
export const STAGE = { x: FS, y: TB, w: EW - FS - SB, h: EH - TB }
export const SIDE_X = EW - SB + 12
export const SIDE_W = SB - 24

/** Toolbar button centres, for the cursor. */
export const TOOLBAR = {
  edit: { x: 273, y: 27 },
  collage: { x: 354, y: 27 },
  open: { x: 827, y: 27 },
  copy: { x: 958, y: 27 },
  paste: { x: 998, y: 27 },
  export: { x: 1054, y: 27 },
}

export const TABS: { id: PanelId; label: string }[] = [
  { id: 'adjust', label: 'Adjust' },
  { id: 'color', label: 'Color' },
  { id: 'effects', label: 'Effects' },
  { id: 'curve', label: 'Curve' },
  { id: 'crop', label: 'Crop' },
  { id: 'heal', label: 'Retouch' },
  { id: 'local', label: 'Local' },
  { id: 'presets', label: 'Presets' },
]
export const tabCenter = (i: number) => ({ x: EW - SB + 35 + (i % 4) * 70, y: TB + 26 + Math.floor(i / 4) * 52 })

type SliderDef = { key: string; label: string; min: number; max: number; track?: string; group: number }
export const SLIDERS: SliderDef[] = [
  { key: 'exposure', label: 'Exposure', min: -2, max: 2, group: 0 },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100, group: 0 },
  { key: 'highlights', label: 'Highlights', min: -100, max: 100, group: 0 },
  { key: 'shadows', label: 'Shadows', min: -100, max: 100, group: 0 },
  { key: 'whites', label: 'Whites', min: -100, max: 100, group: 0 },
  { key: 'blacks', label: 'Blacks', min: -100, max: 100, group: 0 },
  { key: 'temperature', label: 'Temperature', min: -100, max: 100, group: 1, track: 'linear-gradient(90deg, #4a7fd4, #b9b9b0, #e6b84a)' },
  { key: 'tint', label: 'Tint', min: -100, max: 100, group: 1, track: 'linear-gradient(90deg, #4caf6a, #b9b9b0, #d45aa8)' },
  { key: 'vibrance', label: 'Vibrance', min: -100, max: 100, group: 1, track: 'linear-gradient(90deg, #7d827e, #6fa4d8)' },
  { key: 'saturation', label: 'Saturation', min: -100, max: 100, group: 1, track: 'linear-gradient(90deg, #7d827e, #e25555, #e6c84a, #4caf6a, #4a7fd4)' },
  { key: 'texture', label: 'Texture', min: -100, max: 100, group: 2 },
  { key: 'clarity', label: 'Clarity', min: -100, max: 100, group: 2 },
  { key: 'dehaze', label: 'Dehaze', min: -100, max: 100, group: 2, track: 'linear-gradient(90deg, #c9ccd0, #7d827e, #3d5d7a)' },
]
const PANEL_Y = 258
const GROUP_Y = [PANEL_Y, PANEL_Y + 196, PANEL_Y + 340]
const ROW = 25
const TRACK_X = SIDE_X + 98
const TRACK_W = SIDE_W - 98 - 50
export function sliderRow(key: string) {
  const i = SLIDERS.findIndex((s) => s.key === key)
  const s = SLIDERS[i]
  const inGroup = SLIDERS.slice(0, i).filter((o) => o.group === s.group).length
  return { def: s, y: GROUP_Y[s.group] + 38 + inGroup * ROW }
}
export function knobPos(key: string, v: number) {
  const { def, y } = sliderRow(key)
  return { x: TRACK_X + ((v - def.min) / (def.max - def.min)) * TRACK_W, y }
}

/** Preset grid cell centres (2 columns). */
export const PRESET_THUMB = 122
export const presetCenter = (i: number) => ({
  x: SIDE_X + (i % 2) * (PRESET_THUMB + 12) + PRESET_THUMB / 2,
  y: PANEL_Y + 56 + Math.floor(i / 2) * (PRESET_THUMB + 30) + PRESET_THUMB / 2,
})

export const BG_MODES = ['Original', 'Remove', 'Color', 'Blur']
export const segCenter = (i: number, y: number, n = 4) => ({ x: SIDE_X + 3 + ((SIDE_W - 6) / n) * (i + 0.5), y })
export const BG_SEG_Y = PANEL_Y + 52
export const SWATCH_Y = PANEL_Y + 96
export const SWATCHES = ['#ffffff', '#f2efe9', '#111111', '#e8f0fe']
export const swatchCenter = (i: number) => ({ x: SIDE_X + 14 + i * 34, y: SWATCH_Y })

export type EditorProps = {
  /** Index into TABS; the underline slides from tabPrev as tabT goes 0→1. */
  tab: number
  /** Which panel body to show. */
  panel: PanelId
  activePhoto: number
  values: Record<string, number>
  presetPhoto: Photo
  presetActive: number
  bgMode: number
  swatch: number
  pressed?: string | null
  status?: string
  stage: ReactNode
  /** 0…1 entrance stagger; 1 = fully built. */
  build?: number
  histogram?: number
  modeSlide?: number
  tabPrev?: number
  tabT?: number
}

const T = (s: CSSProperties): CSSProperties => s

export function Editor(p: EditorProps) {
  const b = p.build ?? 1
  const enter = (delay: number, dx = 0, dy = 0): CSSProperties => {
    const t = Math.max(0, Math.min(1, (b - delay) / 0.35))
    const e = 1 - Math.pow(1 - t, 4)
    return { opacity: e, transform: `translate(${dx * (1 - e)}px, ${dy * (1 - e)}px)` }
  }
  return (
    <div
      style={{
        position: 'absolute',
        width: EW,
        height: EH,
        background: C.app,
        fontFamily: F.ui,
        color: C.text,
        overflow: 'hidden',
      }}
    >
      {/* Stage */}
      <div style={{ position: 'absolute', left: STAGE.x, top: STAGE.y, width: STAGE.w, height: STAGE.h, background: '#000', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, ...enter(0.25) }}>{p.stage}</div>
        <ViewBar style={enter(0.55, 0, 20)} />
      </div>
      <Toolbar {...p} enter={enter} />
      <Filmstrip active={p.activePhoto} enter={enter} />
      <Sidebar {...p} enter={enter} />
    </div>
  )
}

type Enter = (delay: number, dx?: number, dy?: number) => CSSProperties

function Btn({ children, primary, pressed, w, style }: { children: ReactNode; primary?: boolean; pressed?: boolean; w?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        height: 30,
        width: w,
        padding: w ? 0 : '0 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderRadius: 6,
        border: `1px solid ${primary ? C.accent : C.lineStrong}`,
        background: primary ? C.accent : C.elevated,
        color: primary ? C.accentInk : C.text,
        fontSize: 13.5,
        fontWeight: primary ? 600 : 500,
        transform: pressed ? 'scale(0.92)' : undefined,
        boxShadow: pressed ? `0 0 0 3px rgba(200,245,96,0.35)` : primary ? '0 0 18px rgba(200,245,96,0.18)' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function Toolbar(p: EditorProps & { enter: Enter }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: EW,
        height: TB,
        borderBottom: `1px solid ${C.line}`,
        background: 'linear-gradient(180deg, rgba(23,30,26,0.98), rgba(18,24,22,0.96))',
        ...p.enter(0, 0, -30),
      }}
    >
      <div style={{ position: 'absolute', left: 16, top: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
        <BrandBox />
        <span style={{ fontFamily: F.display, fontWeight: 700, fontSize: 29, letterSpacing: '-0.02em', lineHeight: 1 }}>Lightframes</span>
      </div>
      <ModeSwitch collage={false} slide={p.modeSlide ?? 0} pressed={p.pressed} />
      <div style={{ position: 'absolute', left: 797, top: 11, display: 'flex', alignItems: 'center' }}>
        <Btn w={60} pressed={p.pressed === 'open'}>Open</Btn>
        <Btn w={30} style={{ marginLeft: 8, opacity: 0.55, background: 'transparent' }}><Icon name="undo" size={15} /></Btn>
        <Btn w={30} style={{ marginLeft: 8, opacity: 0.55, background: 'transparent' }}><Icon name="redo" size={15} /></Btn>
        <Btn w={30} style={{ marginLeft: 10 }} pressed={p.pressed === 'copy'}><Icon name="copy" size={15} /></Btn>
        <Btn w={30} style={{ marginLeft: 10 }} pressed={p.pressed === 'paste'}><Icon name="paste" size={15} /></Btn>
        <Btn w={67} primary style={{ marginLeft: 8 }} pressed={p.pressed === 'export'}>Export</Btn>
        <Btn w={30} style={{ marginLeft: 8 }}><Icon name="keyboard" size={15} /></Btn>
      </div>
      <div style={{ position: 'absolute', right: 16, top: 19, fontSize: 13, color: C.muted }}>{p.status ?? 'Loaded 3 images'}</div>
    </div>
  )
}

function BrandBox() {
  return (
    <div
      style={{
        width: 26,
        height: 26,
        border: `2.5px solid ${C.accent}`,
        borderRadius: 3,
        boxShadow: `inset 0 0 0 3px ${C.app}`,
        background: `linear-gradient(135deg, transparent 45%, ${C.accent} 45% 55%, transparent 55%), linear-gradient(45deg, transparent 40%, rgba(200,245,96,0.35) 40% 60%, transparent 60%)`,
      }}
    />
  )
}

export function ModeSwitch({ collage, pressed, slide }: { collage: boolean; pressed?: string | null; slide?: number }) {
  const s = slide ?? (collage ? 1 : 0)
  return (
    <div
      style={{
        position: 'absolute',
        left: 234,
        top: 10,
        height: 34,
        width: 168,
        borderRadius: 999,
        border: `1px solid ${C.line}`,
        background: 'rgba(0,0,0,0.22)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          height: 26,
          left: lerp(3, 76, s),
          width: lerp(68, 88, s),
          borderRadius: 999,
          background: C.accent,
          transform: pressed === 'collage' || pressed === 'edit' ? 'scale(0.92)' : undefined,
        }}
      />
      {[
        { label: 'Edit', icon: 'sliders' as const, x: 3, w: 68, on: 1 - s },
        { label: 'Collage', icon: 'collage' as const, x: 76, w: 88, on: s },
      ].map((m) => (
        <div
          key={m.label}
          style={{
            position: 'absolute',
            left: m.x,
            top: 3,
            width: m.w,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: m.on > 0.5 ? C.accentInk : C.muted,
          }}
        >
          <Icon name={m.icon} size={15} />
          {m.label}
        </div>
      ))}
    </div>
  )
}

function Filmstrip({ active, enter }: { active: number; enter: Enter }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: TB,
        width: FS,
        height: EH - TB,
        borderRight: `1px solid ${C.line}`,
        background: C.panel,
        ...enter(0.1, -40, 0),
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 12px 0', fontSize: 11, letterSpacing: '0.1em', color: C.muted, fontWeight: 600 }}>
        <span>FILMSTRIP</span>
        <span style={{ letterSpacing: 0, fontWeight: 500, fontSize: 12 }}>Folder</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 8px 0', fontSize: 12, color: C.muted }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', border: `1px solid ${C.lineStrong}`, borderRadius: 6, color: C.text }}>
          All photos <Icon name="chevron" size={12} />
        </div>
        <span>3/3</span>
        <Icon name="grid" size={14} />
        <Icon name="trash" size={14} />
      </div>
      <div style={{ padding: '14px 8px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PHOTOS.map((ph, i) => (
          <div
            key={ph.id}
            style={{
              padding: 6,
              borderRadius: 6,
              border: `1.5px solid ${i === active ? C.accent : 'transparent'}`,
              background: i === active ? C.elevated : 'transparent',
              ...enter(0.2 + i * 0.08, -24, 0),
            }}
          >
            <Img src={img.orig(ph.id)} style={{ width: '100%', height: 126, objectFit: 'cover', borderRadius: 3, display: 'block' }} />
            <div style={{ fontSize: 11.5, marginTop: 6, color: i === active ? C.text : C.muted }}>{ph.id}.jpg</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Sidebar(p: EditorProps & { enter: Enter }) {
  const ti = p.tab
  const from = tabCenter(p.tabPrev ?? ti)
  const to = tabCenter(ti)
  const tt = p.tabT ?? 1
  const ux = lerp(from.x, to.x, tt) - 35
  const uy = lerp(from.y, to.y, tt) + 24
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: EW - SB,
          top: TB,
          width: SB,
          height: EH - TB,
          borderLeft: `1px solid ${C.line}`,
          background: C.panel,
          ...p.enter(0.1, 40, 0),
        }}
      />
      <div style={{ position: 'absolute', left: 0, top: 0, ...p.enter(0.18, 40, 0) }}>
        {TABS.map((t, i) => {
          const c = tabCenter(i)
          const on = ti === i
          return (
            <div
              key={t.id}
              style={T({
                position: 'absolute',
                left: c.x - 35,
                top: c.y - 26,
                width: 70,
                height: 52,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                fontSize: 11,
                fontWeight: 600,
                color: on ? C.text : C.muted,
              })}
            >
              <Icon name={t.id} size={16} color={on ? C.accent : 'currentColor'} />
              {t.label}
            </div>
          )
        })}
        <div style={{ position: 'absolute', left: ux, top: uy, width: 70, height: 2, background: C.accent, boxShadow: '0 0 10px rgba(200,245,96,0.6)' }} />
        <div style={{ position: 'absolute', left: EW - SB, top: TB + 104, width: SB, height: 1, background: C.line }} />
      </div>
      <Histogram x={SIDE_X} y={TB + 116} w={SIDE_W} h={70} t={p.histogram ?? 0} style={p.enter(0.3, 30, 0)} />
      <div style={{ position: 'absolute', left: 0, top: 0, ...p.enter(0.38, 30, 0) }}>
        {p.panel === 'adjust' && <AdjustPanel values={p.values} />}
        {p.panel === 'presets' && <PresetsPanel photo={p.presetPhoto} active={p.presetActive} />}
        {p.panel === 'heal' && <RetouchPanel mode={p.bgMode} swatch={p.swatch} />}
      </div>
    </>
  )
}

/** A smooth RGB histogram; `t` morphs it from the flat original to the edited shape. */
function Histogram({ x, y, w, h, t, style }: { x: number; y: number; w: number; h: number; t: number; style?: CSSProperties }) {
  const N = 64
  const curve = (ch: number) => {
    const pts: string[] = []
    for (let i = 0; i <= N; i++) {
      const u = i / N
      const a = Math.exp(-((u - 0.18 - ch * 0.03) ** 2) / 0.006) * 0.9 + Math.exp(-((u - 0.42) ** 2) / 0.01) * 0.55 + Math.exp(-((u - 0.62 + ch * 0.02) ** 2) / 0.004) * 0.75
      const b2 = Math.exp(-((u - 0.3 - ch * 0.04) ** 2) / 0.02) * 0.7 + Math.exp(-((u - 0.58) ** 2) / 0.02) * 0.65 + Math.exp(-((u - 0.82 + ch * 0.03) ** 2) / 0.008) * 0.9
      const v = lerp(a, b2, t) * (0.9 + 0.1 * Math.sin(i * 1.7 + ch))
      pts.push(`${(u * w).toFixed(1)},${(h - 6 - Math.min(1, v) * (h - 14)).toFixed(1)}`)
    }
    return `M0,${h} L${pts.join(' L')} L${w},${h} Z`
  }
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 6, border: `1px solid ${C.line}`, background: 'rgba(0,0,0,0.25)', overflow: 'hidden', ...style }}>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen' }}>
        <path d={curve(0)} fill="rgba(230,80,80,0.55)" />
        <path d={curve(1)} fill="rgba(90,200,110,0.5)" />
        <path d={curve(2)} fill="rgba(80,130,240,0.55)" />
      </svg>
      <div style={{ position: 'absolute', right: 6, top: 6, fontSize: 9.5, padding: '2px 6px', border: `1px solid ${C.lineStrong}`, borderRadius: 999, color: C.muted }}>Clipping</div>
    </div>
  )
}

const GROUP_TITLES = ['Light', 'Color', 'Presence']
function GroupTitle({ y, title, right }: { y: number; title: string; right?: ReactNode }) {
  return (
    <div style={{ position: 'absolute', left: SIDE_X, top: y, width: SIDE_W, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted }}>{title}</span>
      <span style={{ display: 'flex', gap: 14, fontSize: 12, color: C.muted }}>{right}</span>
    </div>
  )
}

function fmt(def: SliderDef, v: number) {
  if (def.key === 'exposure') return (v > 0 ? '+' : '') + v.toFixed(2)
  const r = Math.round(v)
  return (r > 0 ? '+' : '') + r
}

function AdjustPanel({ values }: { values: Record<string, number> }) {
  return (
    <>
      {GROUP_TITLES.map((t, g) => (
        <div key={t}>
          <GroupTitle y={GROUP_Y[g] + 10} title={t} right={g === 0 ? <><span>Auto</span><span>Reset all</span></> : g === 1 ? <><Icon name="eyedrop" size={13} /><span>Auto</span></> : null} />
          {g > 0 && <div style={{ position: 'absolute', left: SIDE_X, top: GROUP_Y[g] - 4, width: SIDE_W, height: 1, background: C.lineSoft }} />}
        </div>
      ))}
      {SLIDERS.map((s) => {
        const { y } = sliderRow(s.key)
        const v = values[s.key] ?? 0
        const k = knobPos(s.key, v)
        const edited = Math.abs(v) > 0.001
        const zero = TRACK_X + ((0 - s.min) / (s.max - s.min)) * TRACK_W
        return (
          <div key={s.key}>
            <div style={{ position: 'absolute', left: SIDE_X, top: y - 9, fontSize: 12.5, color: edited ? C.text : C.muted }}>{s.label}</div>
            <div style={{ position: 'absolute', left: TRACK_X, top: y - 1.5, width: TRACK_W, height: 3, borderRadius: 3, background: s.track ?? 'rgba(232,239,228,0.14)' }} />
            {!s.track && edited && (
              <div style={{ position: 'absolute', left: Math.min(zero, k.x), top: y - 1.5, width: Math.abs(k.x - zero), height: 3, borderRadius: 3, background: C.accent, opacity: 0.85 }} />
            )}
            <div
              style={{
                position: 'absolute',
                left: k.x - 6.5,
                top: y - 6.5,
                width: 13,
                height: 13,
                borderRadius: 99,
                background: C.text,
                border: `2px solid ${C.panel}`,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.45)',
              }}
            />
            <div style={{ position: 'absolute', left: SIDE_X + SIDE_W - 50, width: 50, top: y - 9, fontSize: 12.5, textAlign: 'right', color: edited ? C.accent : C.muted, fontVariantNumeric: 'tabular-nums' }}>
              {fmt(s, v)}
            </div>
          </div>
        )
      })}
    </>
  )
}

function PresetsPanel({ photo, active }: { photo: Photo; active: number }) {
  return (
    <>
      <GroupTitle y={PANEL_Y + 10} title="Presets" right={<><span>Import</span><span style={{ opacity: 0.6 }}>Backup</span></>} />
      <div style={{ position: 'absolute', left: SIDE_X, top: PANEL_Y + 32, width: SIDE_W, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted }}>
        <span>Filters</span>
        <span>15</span>
      </div>
      {PRESETS.map((pr, i) => {
        const c = presetCenter(i)
        const on = i === active
        return (
          <div key={pr.id} style={{ position: 'absolute', left: c.x - PRESET_THUMB / 2, top: c.y - PRESET_THUMB / 2 }}>
            <div
              style={{
                width: PRESET_THUMB,
                height: PRESET_THUMB,
                borderRadius: 6,
                overflow: 'hidden',
                outline: `2px solid ${on ? C.accent : 'transparent'}`,
                outlineOffset: -2,
                boxShadow: on ? '0 0 22px rgba(200,245,96,0.35)' : undefined,
              }}
            >
              <Img src={img.preset(photo, pr.id)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ fontSize: 12, marginTop: 6, color: on ? C.accent : C.text }}>{pr.name}</div>
          </div>
        )
      })}
    </>
  )
}

/** Segmented control with a sliding active pill (float index). */
export function Segmented({ x, y, w, items, active, h = 30 }: { x: number; y: number; w: number; items: string[]; active: number; h?: number }) {
  const n = items.length
  const cw = (w - 6) / n
  return (
    <div style={{ position: 'absolute', left: x, top: y - h / 2, width: w, height: h, borderRadius: 6, border: `1px solid ${C.line}`, background: 'rgba(0,0,0,0.18)' }}>
      <div style={{ position: 'absolute', top: 2, left: 2 + active * cw, width: cw, height: h - 6, borderRadius: 4, background: C.accent }} />
      {items.map((it, i) => (
        <div
          key={it}
          style={{
            position: 'absolute',
            top: 2,
            left: 2 + i * cw,
            width: cw,
            height: h - 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12.5,
            fontWeight: Math.abs(active - i) < 0.5 ? 600 : 500,
            color: Math.abs(active - i) < 0.5 ? C.accentInk : C.text,
          }}
        >
          {it}
        </div>
      ))}
    </div>
  )
}

function RetouchPanel({ mode, swatch }: { mode: number; swatch: number }) {
  const showSw = mode > 1.5 && mode < 2.5
  const spotY = PANEL_Y + (showSw ? 170 : 140)
  return (
    <>
      <GroupTitle y={PANEL_Y + 10} title="Background" />
      <Segmented x={SIDE_X} y={BG_SEG_Y} w={SIDE_W} items={BG_MODES} active={mode} />
      {showSw ? (
        <div style={{ position: 'absolute', left: SIDE_X, top: SWATCH_Y - 12, display: 'flex', gap: 10 }}>
          {SWATCHES.map((s, i) => (
            <div
              key={s}
              style={{
                width: 24,
                height: 24,
                borderRadius: 99,
                background: s,
                boxShadow: i === swatch ? `0 0 0 2px ${C.panel}, 0 0 0 4px ${C.accent}` : `0 0 0 1px ${C.lineStrong}`,
              }}
            />
          ))}
        </div>
      ) : (
        <div style={{ position: 'absolute', left: SIDE_X, top: PANEL_Y + 74, width: SIDE_W, fontSize: 11.5, lineHeight: 1.4, color: C.muted }}>
          Cut the subject out in one click. Runs on your device; your photo is never uploaded.
        </div>
      )}
      <div style={{ position: 'absolute', left: SIDE_X, top: spotY - 20, width: SIDE_W, height: 1, background: C.lineSoft }} />
      <GroupTitle y={spotY} title="Spot removal" />
      <Segmented x={SIDE_X} y={spotY + 42} w={SIDE_W} items={['Heal', 'Clone', 'Remove']} active={0} />
      {[
        ['Size', '1.5', 0.25],
        ['Feather', '30%', 0.3],
        ['Opacity', '100%', 1],
      ].map(([l, v, t], i) => {
        const y = spotY + 82 + i * 26
        return (
          <div key={l as string}>
            <div style={{ position: 'absolute', left: SIDE_X, top: y - 9, fontSize: 12.5, color: C.muted }}>{l}</div>
            <div style={{ position: 'absolute', left: TRACK_X, top: y - 1.5, width: TRACK_W, height: 3, borderRadius: 3, background: 'rgba(232,239,228,0.14)' }} />
            <div style={{ position: 'absolute', left: TRACK_X + (t as number) * TRACK_W - 6.5, top: y - 6.5, width: 13, height: 13, borderRadius: 99, background: C.text, border: `2px solid ${C.panel}` }} />
            <div style={{ position: 'absolute', left: SIDE_X + SIDE_W - 50, width: 50, top: y - 9, fontSize: 12.5, textAlign: 'right', color: C.muted }}>{v}</div>
          </div>
        )
      })}
    </>
  )
}

function ViewBar({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute',
        right: 14,
        bottom: 14,
        height: 40,
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        borderRadius: 8,
        border: `1px solid ${C.line}`,
        background: 'rgba(23,30,26,0.92)',
        color: C.text,
        fontSize: 12.5,
        ...style,
      }}
    >
      <Icon name="rotL" size={15} />
      <Icon name="rotR" size={15} />
      <span style={{ width: 1, height: 18, background: C.lineStrong }} />
      <span style={{ color: C.muted }}>−</span>
      <span>100%</span>
      <span style={{ color: C.muted }}>+</span>
      <span>Fit</span>
      <span style={{ width: 1, height: 18, background: C.lineStrong }} />
      <Icon name="compare" size={15} />
      <Icon name="circle" size={15} />
      <Icon name="expand" size={15} />
      <span style={{ width: 1, height: 18, background: C.lineStrong }} />
      <Icon name="shield" size={16} color={C.accent} />
    </div>
  )
}

/** Fit a photo of w×h into the stage, like the app's Fit view (with a small margin). */
export function fitInStage(w: number, h: number, margin = 0) {
  const s = Math.min((STAGE.w - margin * 2) / w, (STAGE.h - margin * 2) / h)
  const pw = w * s
  const ph = h * s
  return { x: (STAGE.w - pw) / 2, y: (STAGE.h - ph) / 2, w: pw, h: ph }
}
