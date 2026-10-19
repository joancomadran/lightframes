import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { ease, prog } from "../anim";
import { END, LOCKUP, OUTRO } from "../cues";
import { Chip } from "../fx/Caption";
import { Flash, Void } from "../fx/Finish";
import { AppMark } from "../ui/AppMark";
import { C, F, img } from "../theme";

function Privacy({ f }: { f: number }) {
  const out = prog(f, LOCKUP - OUTRO - 18, LOCKUP - OUTRO, ease.in);
  const draw = prog(f, 4, 40, ease.inOut);
  const check = prog(f, 30, 48, ease.out);
  const words = ["No uploads.", "No account.", "No cloud."];
  const title = [..."100% private."];
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity: 1 - out,
        filter: `blur(${out * 12}px)`,
        transform: `scale(${1 + out * 0.05})`,
      }}
    >
      <svg
        width="150"
        height="150"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          overflow: "visible",
          filter: "drop-shadow(0 0 30px rgba(200,245,96,0.45))",
        }}
      >
        <path
          d="M12 2.5 4 5.6v6.2c0 4.6 3.4 8.6 8 9.7 4.6-1.1 8-5.1 8-9.7V5.6z"
          stroke={C.accent}
          strokeWidth="1.2"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - draw}
          strokeLinejoin="round"
        />
        <path
          d="m8.4 12.2 2.5 2.5 4.8-5.2"
          stroke={C.accent}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - check}
        />
      </svg>
      <div
        style={{
          display: "flex",
          marginTop: 40,
          fontFamily: F.display,
          fontWeight: 800,
          fontSize: 176,
          letterSpacing: "-0.05em",
          lineHeight: 1,
        }}
      >
        {title.map((ch, i) => {
          const t = prog(f, 10 + i * 1.4, 32 + i * 1.4, ease.out);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                overflow: "hidden",
                paddingBottom: 24,
                marginBottom: -24,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  whiteSpace: "pre",
                  transform: `translateY(${(1 - t) * 110}%)`,
                  color: i < 4 ? C.accent : C.text,
                }}
              >
                {ch}
              </span>
            </span>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 36, marginTop: 36 }}>
        {words.map((w, i) => {
          const t = prog(f, 40 + i * 10, 62 + i * 10, ease.out);
          return (
            <span
              key={w}
              style={{
                fontFamily: F.ui,
                fontWeight: 600,
                fontSize: 38,
                color: C.muted,
                opacity: t,
                transform: `translateY(${(1 - t) * 20}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

function Lockup({ f }: { f: number }) {
  const word = [..."Lightframes"];
  const end = END - LOCKUP;
  const fade = prog(f, end - 26, end, ease.inOut);
  const tag = prog(f, 36, 60, ease.out);
  const url = prog(f, 54, 76, ease.back);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity: 1 - fade,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 36,
          transform: `scale(${1 + 0.04 * Math.exp(-f / 8)})`,
        }}
      >
        <AppMark size={156} t={f * 1.2} glow={0.5 + 0.5 * Math.exp(-f / 24)} />
        <div
          style={{
            display: "flex",
            paddingBottom: 22,
            marginBottom: -22,
            overflow: "hidden",
          }}
        >
          {word.map((ch, i) => {
            const t = prog(f, 10 + i * 1.5, 34 + i * 1.5, ease.out);
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  fontFamily: F.display,
                  fontWeight: 700,
                  fontSize: 158,
                  letterSpacing: "-0.035em",
                  lineHeight: 1,
                  color: C.text,
                  transform: `translateY(${(1 - t) * 105}%)`,
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
          marginTop: 36,
          fontFamily: F.ui,
          fontSize: 36,
          fontWeight: 500,
          color: C.muted,
          opacity: tag,
          transform: `translateY(${(1 - tag) * 16}px)`,
        }}
      >
        The free open source photo editor that{" "}
        <span style={{ color: C.accent }}>stays on your device.</span>
      </div>
      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: 50,
          alignItems: "center",
        }}
      >
        <Chip t={url} accent>
          <span style={{ fontSize: 26, padding: "2px 6px" }}>
            lightframes.si
          </span>
        </Chip>
        {["Free", "Open source", "Works offline"].map((s, i) => (
          <Chip key={s} t={prog(f, 66 + i * 6, 86 + i * 6, ease.out)}>
            {s}
          </Chip>
        ))}
      </div>
    </AbsoluteFill>
  );
}

/** Slow photo strip drifting behind the privacy beat. */
function Backdrop({ f }: { f: number }) {
  const srcs = [
    img.hero("pagoda"),
    img.hero("twelve-apostles"),
    img.hero("opera-night"),
    img.preset("pagoda", "b-w-noir"),
    img.hero("twelve-apostles"),
    img.preset("opera-night", "warm-film"),
  ];
  return (
    <AbsoluteFill
      style={{
        opacity: 0.16,
        transform: `translateX(${-f * 1.2}px) rotate(-6deg) scale(1.3)`,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 30,
          position: "absolute",
          top: 220,
          left: -200,
        }}
      >
        {srcs.concat(srcs).map((s, i) => (
          <Img
            key={i}
            src={s}
            style={{
              width: 420,
              height: 560,
              objectFit: "cover",
              borderRadius: 14,
              filter: "grayscale(0.3)",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
}

export function Outro() {
  const f = useCurrentFrame();
  const lock = LOCKUP - OUTRO;
  return (
    <AbsoluteFill style={{ background: C.void, overflow: "hidden" }}>
      <Void f={f + 2700} intensity={1.4} />
      {f < lock && <Backdrop f={f} />}
      {f < lock && <Privacy f={f} />}
      {f >= lock && <Lockup f={f - lock} />}
      <Flash t={f} strength={0.8} len={20} />
      <Flash t={f - lock} strength={0.35} len={16} />
    </AbsoluteFill>
  );
}
