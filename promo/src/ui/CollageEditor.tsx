import React from 'react'
import type { CSSProperties } from 'react'
import { Img } from 'remotion'
import { lerp } from '../anim'
import { C, F, img, PHOTOS } from '../theme'
import { EH, EW, FS, ModeSwitch, SB, Segmented, SIDE_W, SIDE_X, STAGE, TB } from './Editor'
import { Icon } from './Icons'

export const ASPECTS = [
  { r: '9:16', n: 'Story', a: 9 / 16 },
  { r: '3:4', n: 'Tall', a: 3 / 4 },
  { r: '4:5', n: 'Portrait', a: 4 / 5 },
  { r: '1:1', n: 'Square', a: 1 },
  { r: '4:3', n: 'Classic', a: 4 / 3 },
  { r: '3:2', n: 'Photo', a: 3 / 2 },
  { r: '16:9', n: 'Widescreen', a: 16 / 9 },
  { r: '1.91:1', n: 'Landscape', a: 1.91 },
]
const SIZE_PX: Record<string, string> = { '9:16': '1080 × 1920', '4:5': '1080 × 1350', '1:1': '1080 × 1080' }

const ASPECT_Y = TB + 96
export const aspectCenter = (i: number) => ({ x: SIDE_X + (i % 4) * 65 + 30, y: ASPECT_Y + Math.floor(i / 4) * 74 + 34 })
const LAYOUT_Y = ASPECT_Y + 196
export const layoutCenter = (n: number) => ({ x: SIDE_X + 14 + (n - 1) * 28, y: LAYOUT_Y + 60 })
export const FORMAT_Y = TB + 50
export const formatCenter = (i: number) => ({ x: SIDE_X + 3 + ((SIDE_W - 6) / 2) * (i + 0.5), y: FORMAT_Y })

type Rect = { x: number; y: number; w: number; h: number }
const LAYOUTS: Rect[][] = [
  [{ x: 0, y: 0, w: 1, h: 1 }],
  [
    { x: 0, y: 0, w: 0.5, h: 1 },
    { x: 0.5, y: 0, w: 0.5, h: 1 },
  ],
  [
    { x: 0, y: 0, w: 0.5, h: 1 },
    { x: 0.5, y: 0, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
  ],
  [
    { x: 0, y: 0, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0, w: 0.5, h: 0.5 },
    { x: 0, y: 0.5, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
  ],
]
const CELL_IMG = [img.hero('pagoda'), img.hero('twelve-apostles'), img.hero('opera-night'), img.preset('twelve-apostles', 'b-w-noir')]

export type CollageProps = {
  /** Layout index (0…3) and 0…1 progress of the morph into it from the previous one. */
  layout: number
  layoutT: number
  /** Aspect ratio as a number (animated) and the highlighted tile index. */
  aspect: number
  aspectIdx: number
  /** 0 = collage, 1 = carousel (float slides the segmented pill). */
  format: number
  carouselT: number
  modeSlide: number
  pressed?: string | null
}

const cellAt = (layout: number, i: number): Rect | null => LAYOUTS[layout][i] ?? null

export function CollageEditor(p: CollageProps) {
  return (
    <div style={{ position: 'absolute', width: EW, height: EH, background: C.app, fontFamily: F.ui, color: C.text, overflow: 'hidden' }}>
      <Stage {...p} />
      <TopBar modeSlide={p.modeSlide} pressed={p.pressed} />
      <PhotosColumn count={p.layout + 1} />
      <Side {...p} />
    </div>
  )
}

function TopBar({ modeSlide, pressed }: { modeSlide: number; pressed?: string | null }) {
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: EW, height: TB, borderBottom: `1px solid ${C.line}`, background: 'linear-gradient(180deg, rgba(23,30,26,0.98), rgba(18,24,22,0.96))' }}>
      <div style={{ position: 'absolute', left: 16, top: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
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
        <span style={{ fontFamily: F.display, fontWeight: 700, fontSize: 29, letterSpacing: '-0.02em', lineHeight: 1 }}>Lightframes</span>
      </div>
      <ModeSwitch collage slide={modeSlide} pressed={pressed} />
      <div style={{ position: 'absolute', left: 878, top: 11, display: 'flex', gap: 8 }}>
        <div style={{ height: 30, padding: '0 14px', display: 'flex', alignItems: 'center', borderRadius: 6, border: `1px solid ${C.lineStrong}`, background: C.elevated, fontSize: 13.5, fontWeight: 500 }}>Open</div>
        <div style={{ height: 30, padding: '0 14px', display: 'flex', alignItems: 'center', borderRadius: 6, background: C.accent, color: C.accentInk, fontSize: 13.5, fontWeight: 600 }}>Export</div>
      </div>
      <div style={{ position: 'absolute', right: 16, top: 19, fontSize: 13, color: C.muted }}>Loaded 3 images</div>
    </div>
  )
}

function PhotosColumn({ count }: { count: number }) {
  return (
    <div style={{ position: 'absolute', left: 0, top: TB, width: FS, height: EH - TB, borderRight: `1px solid ${C.line}`, background: C.panel }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 12px 0', fontSize: 11, letterSpacing: '0.1em', color: C.muted, fontWeight: 600 }}>
        <span>PHOTOS</span>
        <span style={{ letterSpacing: 0, fontWeight: 500, fontSize: 12 }}>Add</span>
      </div>
      <div style={{ padding: '16px 14px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {PHOTOS.map((ph, i) => (
          <div key={ph.id} style={{ position: 'relative' }}>
            <Img src={img.orig(ph.id)} style={{ width: '100%', height: 126, objectFit: 'cover', borderRadius: 3, display: 'block' }} />
            {i < count && (
              <div style={{ position: 'absolute', right: 6, top: 6, width: 20, height: 20, borderRadius: 99, background: C.accent, color: C.accentInk, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={13} stroke={2.6} />
              </div>
            )}
            <div style={{ fontSize: 11.5, marginTop: 6, color: C.muted }}>{ph.id}.jpg</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Stage(p: CollageProps) {
  const stripH = 82
  const areaH = STAGE.h - stripH
  const fmt = p.carouselT
  // Collage frame, fitted into the area above the slide strip.
  const maxW = STAGE.w - 160
  const maxH = areaH - 70
  let fw = maxH * p.aspect
  let fh = maxH
  if (fw > maxW) {
    fw = maxW
    fh = maxW / p.aspect
  }
  const fx = (STAGE.w - fw) / 2
  const fy = (areaH - fh) / 2
  const border = fw * 0.015
  const cells = [0, 1, 2, 3].map((i) => {
    const to = cellAt(p.layout, i)
    const from = cellAt(Math.max(0, p.layout - (p.layoutT < 1 ? 1 : 0)), i) ?? (to ? { x: to.x + to.w / 2, y: to.y + to.h / 2, w: 0, h: 0 } : null)
    if (!to || !from) return null
    const t = p.layoutT
    return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t), w: lerp(from.w, to.w, t), h: lerp(from.h, to.h, t) }
  })

  return (
    <div
      style={{
        position: 'absolute',
        left: STAGE.x,
        top: STAGE.y,
        width: STAGE.w,
        height: STAGE.h,
        overflow: 'hidden',
        background: `linear-gradient(rgba(232,239,228,0.025) 1px, transparent 1px) 0 0/32px 32px, linear-gradient(90deg, rgba(232,239,228,0.025) 1px, transparent 1px) 0 0/32px 32px, ${C.app}`,
      }}
    >
      {/* Collage */}
      <div style={{ position: 'absolute', left: fx, top: fy, width: fw, height: fh, background: '#fff', boxShadow: '0 30px 80px rgba(0,0,0,0.55)', opacity: 1 - fmt, transform: `scale(${1 - fmt * 0.08})` }}>
        {cells.map((c, i) =>
          c ? (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: border + c.x * (fw - border) ,
                top: border + c.y * (fh - border),
                width: Math.max(0, c.w * (fw - border) - border),
                height: Math.max(0, c.h * (fh - border) - border),
                overflow: 'hidden',
                background: '#ddd',
              }}
            >
              <Img src={CELL_IMG[i]} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          ) : null,
        )}
      </div>
      {fmt > 0 && <Carousel t={fmt} areaH={areaH} />}
      {/* Slide strip */}
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: STAGE.w, height: stripH, borderTop: `1px solid ${C.line}`, background: C.panel, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px' }}>
        {Array.from({ length: fmt > 0.5 ? 3 : 1 }, (_, i) => (
          <div key={i} style={{ width: 48, height: 60, borderRadius: 4, border: `2px solid ${i === 0 ? C.accent : C.lineStrong}`, overflow: 'hidden', position: 'relative' }}>
            <Img src={img.hero(PHOTOS[i].id)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <span style={{ position: 'absolute', left: 3, bottom: 2, fontSize: 9, fontWeight: 700, background: 'rgba(0,0,0,0.6)', padding: '0 3px', borderRadius: 2 }}>{i + 1}</span>
          </div>
        ))}
        <div style={{ width: 48, height: 60, borderRadius: 4, border: `1px dashed ${C.lineStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>
          <Icon name="plus" size={16} />
        </div>
      </div>
    </div>
  )
}

/** Three 4:5 slides with a panorama straddling the first cut. */
function Carousel({ t, areaH }: { t: number; areaH: number }) {
  const sw = Math.min((STAGE.w - 140) / 3, (areaH - 150) * 0.8)
  const sh = sw / 0.8
  const total = sw * 3
  const x0 = (STAGE.w - total) / 2
  const y0 = (areaH - sh) / 2
  const reveal = (i: number) => Math.max(0, Math.min(1, t * 3 - i * 0.6))
  return (
    <div style={{ position: 'absolute', left: x0, top: y0, width: total, height: sh, opacity: Math.min(1, t * 2.5), transform: `translateX(${(1 - t) * 120}px)` }}>
      <div style={{ position: 'absolute', inset: 0, background: '#f2efe9', boxShadow: '0 30px 80px rgba(0,0,0,0.55)' }} />
      <div style={{ position: 'absolute', left: sw * 0.08, top: sh * 0.12, width: sw * 1.84, height: sh * 0.76, overflow: 'hidden', opacity: reveal(0) }}>
        <Img src={img.hero('twelve-apostles')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ position: 'absolute', left: sw * 2.12, top: sh * 0.08, width: sw * 0.8, height: sh * 0.84, overflow: 'hidden', opacity: reveal(1) }}>
        <Img src={img.hero('pagoda')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      {[1, 2].map((i) => (
        <div key={i} style={{ position: 'absolute', left: sw * i - 1, top: -16, width: 0, height: sh + 32, borderLeft: `2px dashed ${C.accent}`, opacity: 0.85 * reveal(1) }} />
      ))}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: 'absolute', left: sw * i + 10, top: -36, fontSize: 14, fontWeight: 600, color: C.muted }}>
          Slide {i + 1}
        </div>
      ))}
    </div>
  )
}

function Side(p: CollageProps) {
  const label = (y: number, text: string, right?: string, style?: CSSProperties) => (
    <div style={{ position: 'absolute', left: SIDE_X, top: y, width: SIDE_W, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', ...style }}>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted }}>{text}</span>
      {right && <span style={{ fontSize: 17, fontWeight: 500 }}>{right}</span>}
    </div>
  )
  const n = p.layout + 1
  return (
    <>
      <div style={{ position: 'absolute', left: EW - SB, top: TB, width: SB, height: EH - TB, borderLeft: `1px solid ${C.line}`, background: C.panel }} />
      {label(TB + 16, 'Format')}
      <Segmented x={SIDE_X} y={FORMAT_Y + 4} w={SIDE_W} items={['Collage', 'Carousel']} active={p.format} h={32} />
      {label(ASPECT_Y - 4 + 10, 'Size', p.format > 0.5 ? '1080 × 1350' : SIZE_PX[ASPECTS[p.aspectIdx].r] ?? '1080 × 1350', { top: ASPECT_Y - 30 + 10 })}
      {ASPECTS.map((a, i) => {
        const c = aspectCenter(i)
        const on = i === p.aspectIdx
        const iw = a.a >= 1 ? 18 : 18 * a.a
        const ih = a.a >= 1 ? 18 / a.a : 18
        return (
          <div
            key={a.r}
            style={{
              position: 'absolute',
              left: c.x - 30,
              top: c.y - 34,
              width: 60,
              height: 68,
              borderRadius: 6,
              border: `1.5px solid ${on ? C.accent : C.line}`,
              background: on ? 'rgba(200,245,96,0.08)' : 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
            }}
          >
            <div style={{ width: iw, height: ih, border: `1.5px solid ${on ? C.accent : C.text}`, borderRadius: 2, background: on ? 'rgba(200,245,96,0.35)' : 'transparent', marginBottom: 3 }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>{a.r}</span>
            <span style={{ fontSize: 9.5, color: C.muted }}>{a.n}</span>
          </div>
        )
      })}
      {label(LAYOUT_Y + 6, 'Layout · Slide 1')}
      <div style={{ position: 'absolute', left: SIDE_X, top: LAYOUT_Y + 30, fontSize: 12.5, color: C.muted }}>Photos</div>
      {Array.from({ length: 9 }, (_, i) => {
        const c = layoutCenter(i + 1)
        const on = i + 1 === n
        return (
          <div key={i} style={{ position: 'absolute', left: c.x - 12, top: c.y - 12, width: 24, height: 24, borderRadius: 4, background: on ? C.accent : 'transparent', color: on ? C.accentInk : C.text, fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {i + 1}
          </div>
        )
      })}
      <div style={{ position: 'absolute', left: SIDE_X, top: LAYOUT_Y + 84, width: SIDE_W, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted }}>
        <span>
          {n} photo{n > 1 ? 's' : ''} · 1 slide
        </span>
        <span>Fill empty</span>
      </div>
      <div style={{ position: 'absolute', left: SIDE_X, top: LAYOUT_Y + 114, width: SIDE_W, height: 1, background: C.lineSoft }} />
      {label(LAYOUT_Y + 130, 'Border')}
      <div style={{ position: 'absolute', left: SIDE_X, top: LAYOUT_Y + 160, width: SIDE_W, display: 'flex', alignItems: 'center', gap: 12, fontSize: 12.5, color: C.muted }}>
        <span style={{ width: 90 }}>Width</span>
        <div style={{ flex: 1, height: 3, borderRadius: 3, background: 'rgba(232,239,228,0.14)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '22%', top: -5, width: 13, height: 13, borderRadius: 99, background: C.text, border: `2px solid ${C.panel}` }} />
        </div>
        <span style={{ width: 40, textAlign: 'right' }}>1.5%</span>
      </div>
      <div style={{ position: 'absolute', left: SIDE_X, top: LAYOUT_Y + 194, width: SIDE_W, display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: C.muted }}>
        <span style={{ width: 90 }}>Color</span>
        {['#fff', '#000', '#f2efe9', '#1e2822'].map((c, i) => (
          <span key={c} style={{ width: 20, height: 20, borderRadius: 99, background: c, boxShadow: i === 0 ? `0 0 0 2px ${C.panel}, 0 0 0 3.5px ${C.accent}` : `0 0 0 1px ${C.lineStrong}` }} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: SIDE_X, top: LAYOUT_Y + 250, width: SIDE_W, height: 40, borderRadius: 6, background: C.accent, color: C.accentInk, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Export {p.format > 0.5 ? 'carousel' : 'collage'}
      </div>
      <div style={{ position: 'absolute', left: SIDE_X, top: LAYOUT_Y + 300, fontSize: 12, color: C.muted }}>JPEG, 1080 × 1350 px per slide.</div>
    </>
  )
}
