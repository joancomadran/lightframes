import React from "react";
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { ease, keys, lerp, prog, rand, stepAt, type Key } from "../anim";
import { L, PRESET_CLICKS } from "../cues";
import { Caption, Chip, Hi } from "../fx/Caption";
import { Flash, Void } from "../fx/Finish";
import { C, F, img, PHOTOS, PRESETS, type Photo } from "../theme";
import {
  ASPECTS,
  aspectCenter,
  CollageEditor,
  formatCenter,
  layoutCenter,
} from "../ui/CollageEditor";
import { Cursor, type CursorKey } from "../ui/Cursor";
import {
  BG_SEG_Y,
  Editor,
  EH,
  EW,
  fitInStage,
  knobPos,
  presetCenter,
  segCenter,
  STAGE,
  swatchCenter,
  SWATCHES,
  tabCenter,
  TOOLBAR,
} from "../ui/Editor";
import { Icon } from "../ui/Icons";

type Cam = {
  cx: number;
  cy: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  ty: number;
};
const FULL = 1920 / EW;
const c = (
  cx: number,
  cy: number,
  z: number,
  extra: Partial<Cam> = {},
): Cam => ({ cx, cy, z, rx: 0, ry: 0, rz: 0, ty: 0, ...extra });

const CAM: Key<Cam>[] = [
  { f: 0, v: c(880, 495, 0.5, { rx: 34, ry: -24, rz: 7, ty: 300 }) },
  { f: 120, v: c(880, 495, 0.7, { ty: 92 }), e: ease.out },
  { f: 205, v: c(880, 495, 0.72, { ty: 92 }), e: ease.inOut },
  { f: 250, v: c(1098, 470, 1.45), e: ease.inOutStrong },
  { f: 474, v: c(1128, 478, 1.52), e: ease.inOut },
  { f: 510, v: c(840, 520, 1.12), e: ease.inOutStrong },
  { f: 604, v: c(846, 520, 1.16), e: ease.inOut },
  { f: 636, v: c(958, 250, 1.8), e: ease.inOutStrong },
  { f: 668, v: c(950, 256, 1.86), e: ease.inOut },
  { f: 700, v: c(880, 495, 0.92), e: ease.inOutStrong },
  { f: 952, v: c(880, 495, 0.92) },
  { f: 985, v: c(1054, 500, 1.36), e: ease.out },
  { f: 1240, v: c(1084, 560, 1.42), e: ease.inOut },
  { f: 1300, v: c(1084, 560, 1.42) },
  { f: 1340, v: c(1098, 470, 1.45), e: ease.inOutStrong },
  { f: 1660, v: c(1120, 476, 1.5), e: ease.inOut },
  { f: 1692, v: c(1120, 476, 1.5) },
  { f: 1796, v: c(1120, 476, 1.5) },
  { f: 1826, v: c(330, 280, 1.9), e: ease.inOutStrong },
  { f: 1846, v: c(334, 282, 1.94), e: ease.inOut },
  { f: 1880, v: c(880, 495, FULL), e: ease.inOutStrong },
  { f: 2160, v: c(880, 495, FULL) },
];

/** Slider drags in the Adjust section: [key, target, start]. */
const DRAGS: [string, number, number][] = [
  ["exposure", 0.25, L.sliders],
  ["contrast", 28, L.sliders + 30],
  ["highlights", -75, L.sliders + 60],
  ["shadows", 80, L.sliders + 90],
  ["temperature", 12, L.sliders + 120],
  ["vibrance", 60, L.sliders + 150],
  ["clarity", 32, L.sliders + 180],
];
/** Sliders that follow along without the cursor: [key, target, rides with]. */
const FOLLOW: [string, number, string][] = [
  ["whites", 18, "highlights"],
  ["blacks", -18, "shadows"],
  ["saturation", 12, "vibrance"],
  ["dehaze", 32, "clarity"],
];
const dragT = (L0: number, start: number) =>
  prog(L0, start + 9, start + 26, ease.inOut);

function sliderValues(f: number) {
  const v: Record<string, number> = {};
  for (const [k, target, s] of DRAGS) v[k] = target * dragT(f, s);
  for (const [k, target, ride] of FOLLOW) {
    const s = DRAGS.find((d) => d[0] === ride)![2];
    v[k] = target * dragT(f, s);
  }
  return v;
}
const editMix = (f: number) =>
  DRAGS.reduce((a, [, , s]) => a + dragT(f, s), 0) / DRAGS.length;

function cursorPath(): { path: CursorKey[]; clicks: number[] } {
  const path: CursorKey[] = [
    { f: 0, v: { x: 1300, y: 900 } },
    { f: L.sliders - 20, v: { x: 1250, y: 700 } },
  ];
  for (const [k, target, s] of DRAGS) {
    const a = knobPos(k, 0);
    const b = knobPos(k, target);
    path.push({ f: s + 8, v: a }, { f: s + 26, v: b, e: ease.inOut });
  }
  path.push({ f: L.compare - 4, v: { x: 1200, y: 760 } });
  // Batch: copy edits.
  path.push(
    { f: L.batch + 20, v: { x: 1080, y: 200 } },
    { f: L.copyClick - 2, v: TOOLBAR.copy, e: ease.inOut },
    { f: L.wall - 4, v: { x: 1000, y: 160 } },
  );
  // Presets.
  path.push(
    { f: L.presets + 14, v: { x: 1380, y: 300 } },
    { f: L.presetsTab - 2, v: tabCenter(7), e: ease.inOut },
  );
  PRESET_CLICKS.forEach((cf, i) =>
    path.push({ f: cf - 3, v: presetCenter(i), e: ease.inOut }),
  );
  // Retouch / background.
  path.push({ f: L.retouchTab - 2, v: tabCenter(5), e: ease.inOut });
  path.push({ f: L.removeClick - 2, v: segCenter(1, BG_SEG_Y), e: ease.inOut });
  path.push({ f: L.removeClick + 20, v: { x: 1560, y: 520 } });
  path.push({ f: L.colorClick - 2, v: segCenter(2, BG_SEG_Y), e: ease.inOut });
  L.swatchClicks.forEach((cf, i) =>
    path.push({ f: cf - 3, v: swatchCenter(i + 1), e: ease.inOut }),
  );
  path.push({ f: L.blurClick - 2, v: segCenter(3, BG_SEG_Y), e: ease.inOut });
  path.push({ f: L.blurClick + 30, v: { x: 1600, y: 600 } });
  // Collage.
  path.push(
    { f: L.collage + 10, v: { x: 500, y: 200 } },
    { f: L.collageClick - 2, v: TOOLBAR.collage, e: ease.inOut },
  );
  path.push({ f: L.collageClick + 30, v: { x: 900, y: 300 } });
  L.layoutAt
    .slice(1)
    .forEach((cf, i) =>
      path.push({ f: cf - 3, v: layoutCenter(i + 2), e: ease.inOut }),
    );
  path.push(
    { f: L.aspectAt[0] - 3, v: aspectCenter(3), e: ease.inOut },
    { f: L.aspectAt[1] - 3, v: aspectCenter(0), e: ease.inOut },
  );
  path.push(
    { f: L.carouselClick - 3, v: formatCenter(1), e: ease.inOut },
    { f: L.end, v: { x: 1500, y: 400 } },
  );
  const clicks = [
    L.copyClick,
    L.presetsTab,
    ...PRESET_CLICKS,
    L.retouchTab,
    L.removeClick,
    L.colorClick,
    ...L.swatchClicks,
    L.blurClick,
    L.collageClick,
    ...L.layoutAt.slice(1),
    ...L.aspectAt,
    L.carouselClick,
  ];
  return { path, clicks };
}
const CURSOR = cursorPath();

/** A photo fitted into the stage with stacked layers. */
function StagePhoto({
  photo,
  children,
  scale = 1,
}: {
  photo: Photo;
  children: ReactNode;
  scale?: number;
}) {
  const ph = PHOTOS.find((p) => p.id === photo)!;
  const r = fitInStage(ph.w, ph.h);
  return (
    <div
      style={{
        position: "absolute",
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        overflow: "hidden",
        transform: `scale(${scale})`,
      }}
    >
      {children}
    </div>
  );
}
const fill: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

function AdjustStage({ f }: { f: number }) {
  const m = editMix(f);
  const split = f < L.compare ? 0 : keysSplit(f);
  return (
    <StagePhoto photo="pagoda">
      <Img src={img.orig("pagoda")} style={fill} />
      <Img src={img.hero("pagoda")} style={{ ...fill, opacity: m }} />
      {split > 0.004 && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: `inset(0 ${100 - split * 100}% 0 0)`,
            }}
          >
            <Img src={img.orig("pagoda")} style={fill} />
          </div>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${split * 100}%`,
              width: 3,
              marginLeft: -1.5,
              background: C.accent,
              boxShadow: "0 0 18px rgba(200,245,96,0.8)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${split * 100}%`,
              width: 34,
              height: 34,
              margin: "-17px 0 0 -17px",
              borderRadius: 99,
              background: C.accent,
              boxShadow: "0 0 0 6px rgba(200,245,96,0.25)",
            }}
          />
          <Pill
            style={{
              left: 18,
              top: 18,
              opacity:
                prog(f, L.compare + 30, L.compare + 44) *
                (1 - prog(f, L.batch, L.batch + 14)),
            }}
          >
            Before
          </Pill>
          <Pill
            accent
            style={{
              right: 18,
              top: 18,
              opacity:
                prog(f, L.compare + 30, L.compare + 44) *
                (1 - prog(f, L.batch, L.batch + 14)),
            }}
          >
            After
          </Pill>
        </>
      )}
    </StagePhoto>
  );
}
function keysSplit(f: number) {
  return keys(f, [
    { f: L.compare + 6, v: { s: 0.999 } },
    { f: L.compare + 40, v: { s: 0.28 }, e: ease.inOutStrong },
    { f: L.compare + 78, v: { s: 0.62 }, e: ease.inOut },
    { f: L.compare + 110, v: { s: 0.5 }, e: ease.inOut },
    { f: L.batch + 6, v: { s: 0.5 } },
    { f: L.batch + 34, v: { s: 0 }, e: ease.inOutStrong },
  ]).s;
}

function Pill({
  children,
  accent,
  style,
}: {
  children: ReactNode;
  accent?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        position: "absolute",
        padding: "6px 14px",
        borderRadius: 99,
        fontFamily: F.ui,
        fontWeight: 600,
        fontSize: 15,
        background: accent ? C.accent : "rgba(12,16,14,0.75)",
        color: accent ? C.accentInk : C.text,
        border: accent ? "none" : `1px solid ${C.lineStrong}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function PresetStage({ f }: { f: number }) {
  const i = stepAt(f, PRESET_CLICKS);
  const src = (k: number) =>
    k < 0
      ? img.hero("twelve-apostles")
      : img.preset("twelve-apostles", PRESETS[k].id);
  const since = i < 0 ? 99 : f - PRESET_CLICKS[i];
  const punch = 1 + 0.025 * Math.exp(-since / 6);
  return (
    <>
      <StagePhoto photo="twelve-apostles" scale={punch}>
        <Img src={src(i - 1)} style={fill} />
        <Img src={src(i)} style={{ ...fill, opacity: prog(since, 0, 6) }} />
      </StagePhoto>
      {i >= 0 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 150,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            key={i}
            style={{
              padding: "10px 22px",
              borderRadius: 99,
              background: "rgba(12,16,14,0.78)",
              border: `1px solid ${C.line}`,
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: 30,
              letterSpacing: "-0.01em",
              color: C.text,
              transform: `translateY(${(1 - prog(since, 0, 10)) * 18}px)`,
              opacity: prog(since, 0, 8),
            }}
          >
            {PRESETS[i].name}
          </div>
        </div>
      )}
    </>
  );
}

const checker: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "repeating-conic-gradient(#3b403d 0% 25%, #2a2f2c 0% 50%) 0 0 / 22px 22px",
};

function AiStage({ f }: { f: number }) {
  const scanStart = L.removeClick + 6;
  const scan = prog(f, scanStart, scanStart + 70, ease.inOut);
  const removing = f >= scanStart;
  const colorOn = f >= L.colorClick;
  const blurOn = f >= L.blurClick;
  const sw = colorOn ? Math.max(0, stepAt(f, L.swatchClicks) + 1) : 0;
  const swSince = f - (sw > 0 ? L.swatchClicks[sw - 1] : L.colorClick);
  const prevSw = Math.max(0, sw - 1);
  const wipe = prog(swSince, 0, 18, ease.out);
  const blur = prog(f, L.blurClick, L.blurClick + 26, ease.out) * 16;
  return (
    <StagePhoto photo="pagoda">
      {!removing && <Img src={img.hero("pagoda")} style={fill} />}
      {removing && !colorOn && <div style={checker} />}
      {colorOn && !blurOn && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: sw === 0 ? SWATCHES[0] : SWATCHES[prevSw],
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: SWATCHES[sw],
              clipPath: `circle(${wipe * 130}% at 72% 58%)`,
            }}
          />
        </>
      )}
      {blurOn && (
        <Img
          src={img.hero("pagoda")}
          style={{
            ...fill,
            filter: `blur(${blur}px) brightness(${1 - blur * 0.008})`,
            transform: "scale(1.06)",
          }}
        />
      )}
      {removing && <Img src={img.cutout} style={fill} />}
      {removing && scan < 1 && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: `inset(${scan * 100}% 0 0 0)`,
            }}
          >
            <Img src={img.hero("pagoda")} style={fill} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: `${scan * 100}%`,
              height: 3,
              marginTop: -1.5,
              background: C.accent,
              boxShadow:
                "0 0 24px 6px rgba(200,245,96,0.55), 0 0 80px 20px rgba(200,245,96,0.18)",
            }}
          />
        </>
      )}
      {f >= L.removeClick && f < scanStart + 90 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 20,
            display: "flex",
            justifyContent: "center",
            opacity:
              prog(f, L.removeClick, L.removeClick + 8) *
              (1 - prog(f, scanStart + 76, scanStart + 90)),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 14px",
              borderRadius: 99,
              background: "rgba(12,16,14,0.82)",
              border: `1px solid ${C.line}`,
              fontFamily: F.ui,
              fontSize: 14,
              fontWeight: 600,
              color: C.text,
            }}
          >
            <Icon name="shield" size={15} color={C.accent} />
            {scan < 1
              ? "Finding the subject on your device…"
              : "Done — nothing left your device"}
          </div>
        </div>
      )}
    </StagePhoto>
  );
}

/** The batch wall: 24 photos, then the paste ripple. Screen space. */
function Wall({ f }: { f: number }) {
  const cols = 6;
  const rows = 4;
  const size = 166;
  const gap = 14;
  const x0 = 1920 - 110 - (cols * size + (cols - 1) * gap);
  const y0 = (1080 - (rows * size + (rows - 1) * gap)) / 2 + 10;
  const exit = prog(f, L.presets - 14, L.presets + 2, ease.in);
  const dim = prog(f, L.exportDlg, L.exportDlg + 16);
  const done = Math.min(
    24,
    Math.max(0, Math.floor((f - L.pasteClick - 6) / 2.6)),
  );
  return (
    <AbsoluteFill style={{ opacity: 1 - exit }}>
      {Array.from({ length: 24 }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const d = Math.hypot(col - 2.5, row - 1.5);
        const t = prog(f, L.wall + d * 4, L.wall + 26 + d * 4, ease.out);
        const pt = L.pasteClick + 6 + (col + row) * 5;
        const flip = prog(f, pt, pt + 10, ease.inOut);
        const bump = Math.sin(
          Math.min(1, Math.max(0, (f - pt) / 16)) * Math.PI,
        );
        const ph = PHOTOS[(i * 7) % 3].id;
        const zoom = 1.15 + rand(i + 3) * 0.9;
        const ox = 20 + rand(i) * 60;
        const oy = 20 + rand(i + 9) * 60;
        const imgStyle: CSSProperties = {
          ...fill,
          transform: `scale(${zoom})`,
          transformOrigin: `${ox}% ${oy}%`,
        };
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x0 + col * (size + gap),
              top: y0 + row * (size + gap),
              width: size,
              height: size,
              borderRadius: 8,
              overflow: "hidden",
              opacity: t * (1 - dim * 0.65),
              transform: `translateY(${(1 - t) * 40}px) scale(${(0.7 + 0.3 * t) * (1 + bump * 0.06)}) rotate(${(1 - t) * (rand(i) - 0.5) * 16}deg)`,
              boxShadow:
                bump > 0.05
                  ? `0 0 0 ${2 + bump * 2}px rgba(200,245,96,${bump}), 0 10px 30px rgba(0,0,0,0.5)`
                  : "0 10px 30px rgba(0,0,0,0.5)",
              background: C.elevated,
            }}
          >
            <Img src={img.orig(ph)} style={imgStyle} />
            <Img src={img.hero(ph)} style={{ ...imgStyle, opacity: flip }} />
          </div>
        );
      })}
      {/* Paste button + counter, under the caption */}
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 640,
          opacity: prog(f, L.wall + 40, L.wall + 56) * (1 - dim),
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "18px 30px",
            borderRadius: 10,
            background: C.accent,
            color: C.accentInk,
            fontFamily: F.ui,
            fontWeight: 700,
            fontSize: 26,
            transform: `scale(${f >= L.pasteClick - 3 && f < L.pasteClick + 6 ? 0.94 : 1})`,
            boxShadow: "0 0 40px rgba(200,245,96,0.3)",
          }}
        >
          <Icon name="paste" size={24} stroke={2.2} />
          {done >= 24
            ? "Pasted to 24 photos"
            : done > 0
              ? `Pasting… ${done}/24`
              : "Paste to 24 photos"}
        </div>
      </div>
      <Cursor
        f={f}
        path={[
          { f: L.wall + 20, v: { x: 700, y: 980 } },
          { f: L.pasteClick - 3, v: { x: 330, y: 674 }, e: ease.inOut },
          { f: L.pasteClick + 40, v: { x: 520, y: 820 }, e: ease.inOut },
        ]}
        clicks={[L.pasteClick]}
        opacity={1 - dim}
      />
    </AbsoluteFill>
  );
}

function ExportDialog({ f }: { f: number }) {
  const t = prog(f, L.exportDlg, L.exportDlg + 20, ease.out);
  const out = prog(f, L.presets - 16, L.presets, ease.in);
  if (t <= 0 || out >= 1) return null;
  const pr = prog(f, L.exportClick + 4, L.exportClick + 48, ease.inOut);
  const doneT = prog(f, L.exportClick + 48, L.exportClick + 56);
  const sizes = [
    ["Original", "Full resolution"],
    ["Web", "2048 px long edge"],
    ["IG 4:5", "1080 × 1350"],
    ["IG 1:1", "1080 × 1080"],
    ["Story", "1080 × 1920"],
  ];
  const row = (label: string, right: ReactNode) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 15,
        color: C.muted,
        height: 36,
      }}
    >
      <span>{label}</span>
      {right}
    </div>
  );
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: 760,
          padding: "24px 26px",
          borderRadius: 14,
          background: C.panel,
          border: `1px solid ${C.line}`,
          boxShadow: "0 40px 120px rgba(0,0,0,0.7)",
          fontFamily: F.ui,
          color: C.text,
          opacity: t * (1 - out),
          transform: `translateY(${(1 - t) * 40}px) scale(${(0.94 + 0.06 * t) * (1 - out * 0.06)})`,
          filter: `blur(${out * 10}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.1em",
            color: C.muted,
            paddingBottom: 16,
            borderBottom: `1px solid ${C.lineSoft}`,
          }}
        >
          <span>EXPORT · 24 PHOTOS</span>
          <span style={{ letterSpacing: 0, fontWeight: 500 }}>Close</span>
        </div>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            letterSpacing: "0.1em",
            color: C.muted,
            margin: "18px 0 10px",
          }}
        >
          SIZE
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {sizes.map(([a, b], i) => (
            <div
              key={a}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 8,
                textAlign: "center",
                border: `1.5px solid ${i === 1 ? C.accent : C.lineStrong}`,
                background: i === 1 ? "rgba(200,245,96,0.08)" : C.elevated,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 600 }}>{a}</div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>
                {b}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          {row(
            "AI upscale",
            <div
              style={{
                display: "flex",
                gap: 4,
                padding: 3,
                border: `1px solid ${C.line}`,
                borderRadius: 6,
              }}
            >
              {["Off", "2×", "4×"].map((s, i) => (
                <span
                  key={s}
                  style={{
                    padding: "3px 10px",
                    borderRadius: 4,
                    fontSize: 13.5,
                    fontWeight: 600,
                    background: i === 0 ? C.accent : "transparent",
                    color: i === 0 ? C.accentInk : C.text,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>,
          )}
          {row(
            "Format",
            <span
              style={{
                color: C.text,
                padding: "4px 12px",
                border: `1px solid ${C.lineStrong}`,
                borderRadius: 6,
                width: 340,
              }}
            >
              JPEG
            </span>,
          )}
          {row(
            "Filename",
            <span
              style={{
                color: C.text,
                padding: "4px 12px",
                border: `1px solid ${C.lineStrong}`,
                borderRadius: 6,
                width: 340,
              }}
            >
              {"{name}-edited"}
            </span>,
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 12,
            marginTop: 18,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 8,
              borderRadius: 8,
              background: C.elevated,
              overflow: "hidden",
              opacity: pr > 0 ? 1 : 0,
            }}
          >
            <div
              style={{
                width: `${pr * 100}%`,
                height: "100%",
                background: C.accent,
                boxShadow: "0 0 14px rgba(200,245,96,0.7)",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 14,
              color: C.muted,
              width: 150,
              textAlign: "right",
              opacity: pr > 0 ? 1 : 0,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {doneT > 0 ? "24 exported" : `${Math.round(pr * 24)} / 24`}
          </div>
          <div
            style={{
              height: 40,
              minWidth: 118,
              padding: "0 18px",
              borderRadius: 7,
              background: C.accent,
              color: C.accentInk,
              fontWeight: 700,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transform: `scale(${f >= L.exportClick - 3 && f < L.exportClick + 6 ? 0.93 : 1})`,
            }}
          >
            {doneT > 0 ? (
              <>
                <Icon name="check" size={18} stroke={2.8} /> Done
              </>
            ) : (
              "Export"
            )}
          </div>
        </div>
      </div>
      <Cursor
        f={f}
        path={[
          { f: L.exportDlg + 4, v: { x: 1100, y: 860 } },
          { f: L.exportClick - 3, v: { x: 1254, y: 680 }, e: ease.inOut },
          { f: L.exportClick + 50, v: { x: 1340, y: 840 }, e: ease.inOut },
        ]}
        clicks={[L.exportClick]}
        opacity={1 - out}
      />
    </AbsoluteFill>
  );
}

/** Fullscreen upscale comparison. */
function Upscale({ f }: { f: number }) {
  const t0 = L.upscale;
  const t = prog(f, t0, t0 + 24, ease.out);
  const out = prog(f, L.collage - 12, L.collage, ease.in);
  if (t <= 0 || out >= 1) return null;
  const split = keys(f, [
    { f: t0 + 18, v: { s: 0 } },
    { f: t0 + 58, v: { s: 0.5 }, e: ease.inOutStrong },
  ]).s;
  const S = 820;
  // The detail crop is 500 px from (780, 420) of the 1366×2048 render.
  const k = S / 500;
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <AbsoluteFill style={{ background: "rgba(12,16,14,0.94)", opacity: t }} />
      <Caption
        f={f - t0 - 6}
        dur={L.collage - t0 - 4}
        kicker="On-device AI"
        lines={["Upscale", <Hi key="h">up to 4×.</Hi>]}
        size={110}
        sub="Sharper exports from small files."
        style={{ left: 110, top: 360 }}
      />
      <div
        style={{
          position: "absolute",
          right: 120,
          top: (1080 - S) / 2,
          width: S,
          height: S,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 40px 120px rgba(0,0,0,0.7)",
          border: `1px solid ${C.line}`,
          transform: `scale(${0.82 + 0.18 * t})`,
          opacity: t,
        }}
      >
        <Img
          src={img.hero("pagoda")}
          style={{
            position: "absolute",
            left: -780 * k,
            top: -420 * k,
            width: 1366 * k,
            height: 2048 * k,
            maxWidth: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: `inset(0 0 0 ${split * 100}%)`,
          }}
        >
          <Img
            src={img.detailLo}
            style={{ ...fill, imageRendering: "pixelated" }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${split * 100}%`,
            width: 3,
            marginLeft: -1.5,
            background: C.accent,
            boxShadow: "0 0 18px rgba(200,245,96,0.8)",
          }}
        />
        <Pill
          accent
          style={{
            left: 18,
            top: 18,
            fontSize: 18,
            opacity: prog(f, t0 + 50, t0 + 62),
          }}
        >
          AI upscale 4×
        </Pill>
        <Pill
          style={{
            right: 18,
            top: 18,
            fontSize: 18,
            opacity: prog(f, t0 + 50, t0 + 62),
          }}
        >
          Original
        </Pill>
      </div>
    </AbsoluteFill>
  );
}

/** Directional blur that follows camera speed. */
function camBlur(f: number) {
  const a = keys(f, CAM);
  const b = keys(f - 1, CAM);
  const vx = Math.abs(a.cx - b.cx) * a.z;
  const vy = Math.abs(a.cy - b.cy) * a.z + Math.abs(a.ty - b.ty);
  const vz = Math.abs(a.z - b.z) * 900;
  return {
    x: Math.min(14, vx * 0.18 + vz * 0.08),
    y: Math.min(14, vy * 0.18 + vz * 0.08),
  };
}

export function EditorShow() {
  const f = useCurrentFrame();
  const cam = keys(f, CAM);
  const blur = camBlur(f);
  const windowed = 1 - prog(f, 205, 250, ease.inOut);
  const inCollage = f >= L.collageClick + 10;
  const collageMix = prog(
    f,
    L.collageClick + 10,
    L.collageClick + 30,
    ease.inOut,
  );
  const wallOn = f >= L.wall - 10 && f < L.presets + 4;
  const editorFade = wallOn
    ? 1 -
      prog(f, L.wall - 4, L.wall + 20) * 0.94 +
      prog(f, L.presets - 14, L.presets + 4) * 0.94
    : 1;

  // Which part of the edit flow is on stage.
  const panelTab = f < L.presetsTab ? 0 : f < L.retouchTab ? 7 : 5;
  const tabPrev = f < L.presetsTab ? 0 : f < L.retouchTab ? 0 : 7;
  const tabStart = f < L.retouchTab ? L.presetsTab : L.retouchTab;
  const tabT = prog(f, tabStart, tabStart + 12, ease.inOut);
  const panel = panelTab === 0 ? "adjust" : panelTab === 7 ? "presets" : "heal";
  const activePhoto = f < L.presets ? 0 : f < L.ai ? 1 : 0;
  const bgMode = keys(f, [
    { f: L.removeClick, v: { m: 0 } },
    { f: L.removeClick + 10, v: { m: 1 }, e: ease.out },
    { f: L.colorClick, v: { m: 1 } },
    { f: L.colorClick + 10, v: { m: 2 }, e: ease.out },
    { f: L.blurClick, v: { m: 2 } },
    { f: L.blurClick + 10, v: { m: 3 }, e: ease.out },
  ]).m;
  const swatch = Math.max(0, stepAt(f, L.swatchClicks) + 1);
  const pressed =
    Math.abs(f - L.copyClick) < 5
      ? "copy"
      : Math.abs(f - L.collageClick) < 5
        ? "collage"
        : null;

  const stage =
    f < L.presets ? (
      <AdjustStage f={f} />
    ) : f < L.ai ? (
      <PresetStage f={f} />
    ) : (
      <AiStage f={f} />
    );

  const layoutIdx = Math.max(0, stepAt(f, L.layoutAt));
  const layoutT =
    layoutIdx === 0
      ? 1
      : prog(f, L.layoutAt[layoutIdx], L.layoutAt[layoutIdx] + 16, ease.out);
  const aspectStep = stepAt(f, L.aspectAt);
  const aspects = [2, 3, 0];
  const aspectIdx = aspects[aspectStep + 1];
  const aspect = keys(f, [
    { f: L.aspectAt[0], v: { a: ASPECTS[2].a } },
    { f: L.aspectAt[0] + 18, v: { a: ASPECTS[3].a }, e: ease.out },
    { f: L.aspectAt[1], v: { a: ASPECTS[3].a } },
    { f: L.aspectAt[1] + 18, v: { a: ASPECTS[0].a }, e: ease.out },
  ]).a;
  const carouselT = prog(
    f,
    L.carouselClick + 2,
    L.carouselClick + 40,
    ease.out,
  );
  const format = prog(f, L.carouselClick, L.carouselClick + 10, ease.out);
  const modeSlide = prog(f, L.collageClick, L.collageClick + 12, ease.inOut);

  const camTransform = `translate(960px, ${540 + cam.ty}px) perspective(2600px) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg) rotateZ(${cam.rz}deg) scale(${cam.z}) translate(${-cam.cx}px, ${-cam.cy}px)`;
  const radius = 16 * windowed;
  const camBlurOn = blur.x + blur.y > 0.4;

  return (
    <AbsoluteFill style={{ background: C.void, overflow: "hidden" }}>
      <Void f={f + 300} />
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="camblur" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur
            stdDeviation={`${blur.x.toFixed(2)} ${blur.y.toFixed(2)}`}
          />
        </filter>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: EW,
          height: EH,
          transformOrigin: "0 0",
          transform: camTransform,
          filter: camBlurOn ? "url(#camblur)" : undefined,
          opacity: editorFade,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            overflow: "hidden",
            boxShadow:
              windowed > 0
                ? `0 0 0 1px rgba(200,245,96,${0.2 * windowed}), 0 80px 160px rgba(0,0,0,${0.7 * windowed}), 0 0 120px rgba(200,245,96,${0.08 * windowed})`
                : undefined,
          }}
        >
          {!inCollage || collageMix < 1 ? (
            <Editor
              tab={panelTab}
              tabPrev={tabPrev}
              tabT={tabT}
              panel={panel}
              activePhoto={activePhoto}
              values={sliderValues(f)}
              presetPhoto="twelve-apostles"
              presetActive={stepAt(f, PRESET_CLICKS)}
              bgMode={bgMode}
              swatch={swatch}
              pressed={pressed}
              modeSlide={modeSlide}
              stage={stage}
              build={prog(f, 4, 150, ease.linear)}
              histogram={f < L.presets ? editMix(f) : 1}
            />
          ) : null}
          {inCollage && (
            <div
              style={{ position: "absolute", inset: 0, opacity: collageMix }}
            >
              <CollageEditor
                layout={layoutIdx}
                layoutT={layoutT}
                aspect={aspect}
                aspectIdx={aspectIdx}
                format={format}
                carouselT={carouselT}
                modeSlide={1}
              />
            </div>
          )}
          {f > L.sliders - 30 && !wallOn && (
            <Cursor f={f} path={CURSOR.path} clicks={CURSOR.clicks} />
          )}
          {f >= L.batch + 50 && f < L.wall + 10 && <CopiedToast f={f} />}
        </div>
      </div>

      {/* Screen-space overlays */}
      <Scrim f={f} />
      <Caption
        f={f - 24}
        dur={190}
        kicker="Lightframes"
        lines={[
          "A complete photo editor.",
          <span key="a">
            Right in your <Hi>browser.</Hi>
          </span>,
        ]}
        size={74}
        align="center"
        style={{ left: 0, right: 0, top: 54 }}
      />
      <Caption
        f={f - (L.adjust + 30)}
        dur={200}
        kicker="01 · Adjust"
        lines={["Every slider.", <Hi key="h">Live.</Hi>]}
        size={112}
        style={{ left: 110, bottom: 96 }}
      />
      {wallOn && <Wall f={f} />}
      <Caption
        f={f - (L.wall + 8)}
        dur={L.exportDlg - L.wall - 4}
        kicker="02 · Batch"
        lines={["Edit one.", <Hi key="h">Paste to all.</Hi>]}
        size={104}
        style={{ left: 110, top: 340 }}
      />
      <ExportDialog f={f} />
      <Caption
        f={f - (L.presets + 34)}
        dur={250}
        kicker="03 · Presets"
        lines={["Gallery of looks.", <Hi key="h">One click.</Hi>]}
        size={112}
        style={{ left: 110, bottom: 168 }}
      />
      <div
        style={{
          position: "absolute",
          left: 110,
          bottom: 96,
          display: "flex",
          gap: 12,
        }}
      >
        {["Import XMP", ".cube LUTs", "Save and create your own"].map(
          (s, i) => (
            <Chip
              key={s}
              t={
                prog(
                  f,
                  L.presets + 80 + i * 6,
                  L.presets + 100 + i * 6,
                  ease.out,
                ) *
                (1 - prog(f, L.presets + 268, L.presets + 284))
              }
            >
              {s}
            </Chip>
          ),
        )}
      </div>
      <Caption
        f={f - (L.ai + 52)}
        dur={262}
        kicker="04 · Nothing uploaded"
        lines={["Remove backgrounds.", <Hi key="h">On-device AI.</Hi>]}
        size={96}
        style={{ left: 110, bottom: 96 }}
      />
      <Upscale f={f} />
      <Caption
        f={f - (L.collage + 84)}
        dur={L.end - L.collage - 84}
        kicker="05 · Collage & carousel"
        lines={["Collages & carousels.", <Hi key="h">Ready to post.</Hi>]}
        size={88}
        style={{ left: 110, bottom: 84 }}
      />
      <Flash t={f - L.presets} strength={0.25} len={12} />
      <Flash t={f - L.upscale} strength={0.2} len={12} />
    </AbsoluteFill>
  );
}

function CopiedToast({ f }: { f: number }) {
  const t = prog(f, L.copyClick + 2, L.copyClick + 14, ease.out);
  return (
    <div
      style={{
        position: "absolute",
        left: STAGE.x + STAGE.w / 2,
        top: 86,
        transform: `translate(-50%, ${(1 - t) * -12}px)`,
        opacity: t,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          borderRadius: 8,
          background: C.elevated,
          border: `1px solid ${C.line}`,
          fontFamily: F.ui,
          fontSize: 14,
          fontWeight: 600,
          color: C.text,
          boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
        }}
      >
        <Icon name="check" size={15} color={C.accent} stroke={2.6} />
        Edits copied · 13 settings
      </div>
    </div>
  );
}

/** Darkens the frame edge behind captions. */
function Scrim({ f }: { f: number }) {
  const on = (a: number, b: number) =>
    prog(f, a, a + 20) * (1 - prog(f, b - 20, b));
  const bottom = Math.max(
    on(L.adjust + 20, L.adjust + 236),
    on(L.presets + 20, L.presets + 290),
    on(L.ai + 40, L.ai + 320),
    on(L.collage + 70, L.end + 20),
  );
  const left = on(L.wall, L.exportDlg + 10);
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(0deg, rgba(8,11,9,0.92) 0%, rgba(8,11,9,0.65) 30%, transparent 58%)",
          opacity: bottom,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(8,11,9,0.85) 0%, transparent 45%)",
          opacity: left,
        }}
      />
    </>
  );
}
