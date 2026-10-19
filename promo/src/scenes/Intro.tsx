import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ease, prog } from "../anim";
import { LOGO, SHOW } from "../cues";
import { Flash, Void } from "../fx/Finish";
import { AppMark } from "../ui/AppMark";
import { C, F, img } from "../theme";

const PHRASES = [
  {
    text: "Your photos.",
    fill: "image" as const,
    hud: "ISO 100   ƒ/8   1/320s",
  },
  {
    text: "Your device.",
    fill: "white" as const,
    hud: "LOCAL   NO CLOUD   OFFLINE",
  },
  { text: "Zero uploads.", fill: "accent" as const, hud: "0 BYTES SENT" },
];

function Phrase({
  f,
  text,
  fill,
}: {
  f: number;
  text: string;
  fill: "image" | "white" | "accent";
}) {
  const chars = [...text];
  const out = prog(f, 50, 60, ease.in);
  const zoom = 1.08 - 0.08 * prog(f, 0, 60, ease.outSoft);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          fontFamily: F.display,
          fontWeight: 800,
          fontSize: 236,
          letterSpacing: "-0.05em",
          lineHeight: 1,
          transform: `scale(${zoom + out * 0.06})`,
          filter: `blur(${out * 14}px)`,
          opacity: 1 - out,
        }}
      >
        {chars.map((ch, i) => {
          const t = prog(f, i * 1.3, 18 + i * 1.3, ease.out);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                overflow: t < 1 ? "hidden" : "visible",
                paddingBottom: 30,
                marginBottom: -30,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  whiteSpace: "pre",
                  transform: `translateY(${(1 - t) * 110}%) rotate(${(1 - t) * 8}deg)`,
                  ...(fill === "image"
                    ? {
                        backgroundImage: `url(${img.hero("pagoda")})`,
                        backgroundSize: "1920px auto",
                        backgroundPosition: `${-i * 120 + 300}px ${-560 + f * 1.6}px`,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        WebkitTextStroke: "1.5px rgba(232,239,228,0.25)",
                      }
                    : {
                        color: fill === "accent" ? C.accent : C.text,
                        textShadow:
                          fill === "accent"
                            ? "0 0 60px rgba(200,245,96,0.35)"
                            : undefined,
                      }),
                }}
              >
                {ch}
              </span>
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

/** Viewfinder brackets and a camera-style readout. */
function Hud({ f, text }: { f: number; text: string }) {
  const t = prog(f, 0, 24, ease.out);
  const inset = 70 + (1 - t) * 60;
  const arm = 46;
  const corner = (x: "left" | "right", y: "top" | "bottom") => (
    <div
      style={{
        position: "absolute",
        [x]: inset,
        [y]: inset,
        width: arm,
        height: arm,
        [`border${y === "top" ? "Top" : "Bottom"}`]: `2px solid rgba(232,239,228,0.55)`,
        [`border${x === "left" ? "Left" : "Right"}`]: `2px solid rgba(232,239,228,0.55)`,
        opacity: t,
      }}
    />
  );
  return (
    <AbsoluteFill>
      {corner("left", "top")}
      {corner("right", "top")}
      {corner("left", "bottom")}
      {corner("right", "bottom")}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 22,
          height: 22,
          marginLeft: -11,
          marginTop: -11,
          opacity: 0.25 * t,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 10,
            top: 0,
            width: 2,
            height: 22,
            background: C.text,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 10,
            width: 22,
            height: 2,
            background: C.text,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: inset + 6,
          textAlign: "center",
          fontFamily: F.ui,
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: "0.32em",
          color: "rgba(232,239,228,0.6)",
          opacity: t,
        }}
      >
        {text}
      </div>
      <div
        style={{
          position: "absolute",
          right: inset + 8,
          top: inset + 8,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: F.ui,
          fontWeight: 700,
          fontSize: 17,
          letterSpacing: "0.2em",
          color: C.accent,
          opacity: t,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 9,
            background: C.accent,
            boxShadow: "0 0 12px #c8f560",
            opacity: Math.floor(f / 15) % 2 ? 0.35 : 1,
          }}
        />
        RAW
      </div>
    </AbsoluteFill>
  );
}

function Logo({ f }: { f: number }) {
  const word = [..."Lightframes"];
  const exit = prog(f, SHOW - LOGO - 22, SHOW - LOGO, ease.in);
  const punch = 1 + 0.05 * Math.exp(-f / 7);
  const tag = prog(f, 44, 70, ease.out);
  const glow = 0.4 + 0.6 * Math.exp(-f / 30);
  const shift = prog(f, 8, 34, ease.inOutStrong);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${punch * (1 - exit * 0.12)})`,
          opacity: 1 - exit,
          filter: `blur(${exit * 16}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 34 * shift }}>
          <div style={{ transform: `translateX(${(1 - shift) * 0}px)` }}>
            <AppMark size={150} t={f * 1.1} glow={glow} />
          </div>
          <div
            style={{
              display: "flex",
              overflow: "hidden",
              maxWidth: `${shift * 1000}px`,
              paddingBottom: 20,
              marginBottom: -20,
            }}
          >
            {word.map((ch, i) => {
              const t = prog(f, 14 + i * 1.6, 38 + i * 1.6, ease.out);
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    fontFamily: F.display,
                    fontWeight: 700,
                    fontSize: 148,
                    letterSpacing: "-0.035em",
                    color: C.text,
                    lineHeight: 1,
                    transform: `translateY(${(1 - t) * 100}%)`,
                    opacity: t,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        </div>
        <div
          style={{
            marginTop: 34,
            fontFamily: F.ui,
            fontSize: 32,
            fontWeight: 500,
            color: C.muted,
            opacity: tag,
            transform: `translateY(${(1 - tag) * 18}px)`,
            letterSpacing: "0.01em",
          }}
        >
          The free open source photo editor that{" "}
          <span style={{ color: C.text }}>stays on your device.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

export function Intro() {
  const f = useCurrentFrame();
  const pi = Math.min(2, Math.floor(f / 60));
  return (
    <AbsoluteFill style={{ background: C.void, overflow: "hidden" }}>
      <Void f={f} intensity={f < LOGO ? 0.6 : 1.3} />
      {f < LOGO && (
        <>
          <Hud f={f} text={PHRASES[pi].hud} />
          <Phrase
            key={pi}
            f={f - pi * 60}
            text={PHRASES[pi].text}
            fill={PHRASES[pi].fill}
          />
          <Flash t={f - pi * 60} strength={pi === 0 ? 0 : 0.18} len={10} />
        </>
      )}
      {f >= LOGO && <Logo f={f - LOGO} />}
      <Flash t={f - LOGO} strength={0.85} len={22} />
    </AbsoluteFill>
  );
}
