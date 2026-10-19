// Procedural score + foley for the promo, locked to src/cues.ts.
// Run: node scripts/music.ts  → public/music.wav (48 kHz, 16-bit stereo)
import { writeFileSync } from 'node:fs'
import { CLICKS, END, FPS, LOCKUP, LOGO, OUTRO, RAPID, RAPID_STEP, RAPID_WORDS, SHOW, WHOOSHES } from '../src/cues.ts'

const SR = 48000
const LEN = Math.ceil((END / FPS + 0.5) * SR)
const dryL = new Float32Array(LEN)
const dryR = new Float32Array(LEN)
const sendL = new Float32Array(LEN)
const sendR = new Float32Array(LEN)
const sec = (frame: number) => frame / FPS
const BEAT = 0.5
const TAU = Math.PI * 2

let seed = 1
const noise = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 2147483648 - 1
}
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12)

class Biquad {
  b0 = 1; b1 = 0; b2 = 0; a1 = 0; a2 = 0
  x1 = 0; x2 = 0; y1 = 0; y2 = 0
  set(type: 'lp' | 'hp' | 'bp', freq: number, q = 0.707) {
    const w = (TAU * Math.min(freq, SR * 0.45)) / SR
    const cs = Math.cos(w)
    const al = Math.sin(w) / (2 * q)
    let b0: number, b1: number, b2: number
    if (type === 'lp') [b0, b1, b2] = [(1 - cs) / 2, 1 - cs, (1 - cs) / 2]
    else if (type === 'hp') [b0, b1, b2] = [(1 + cs) / 2, -(1 + cs), (1 + cs) / 2]
    else [b0, b1, b2] = [al, 0, -al]
    const a0 = 1 + al
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0
    this.a1 = (-2 * cs) / a0; this.a2 = (1 - al) / a0
    return this
  }
  run(x: number) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y
    return y
  }
}

/** Render `fn` (local time → sample) from t0 for dur seconds into the buses. */
function voice(t0: number, dur: number, fn: (t: number, i: number) => number, gain: number, pan = 0, send = 0) {
  const s0 = Math.max(0, Math.floor(t0 * SR))
  const n = Math.min(LEN - s0, Math.floor(dur * SR))
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4)
  const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4)
  for (let i = 0; i < n; i++) {
    const v = fn(i / SR, i)
    dryL[s0 + i] += v * gl
    dryR[s0 + i] += v * gr
    if (send) {
      sendL[s0 + i] += v * gl * send
      sendR[s0 + i] += v * gr * send
    }
  }
}

// ——— Instruments ———
const kicks: number[] = []
function kick(t0: number, g = 1) {
  kicks.push(t0)
  let ph = 0
  voice(t0, 0.55, (t) => {
    ph += (TAU * (44 + 130 * Math.exp(-t / 0.032))) / SR
    const body = Math.sin(ph) * Math.exp(-t / 0.32)
    const click = noise() * Math.exp(-t / 0.0025) * 0.35
    return Math.tanh((body + click) * 1.8) * 0.8
  }, 0.95 * g)
}
function clap(t0: number, g = 1, pan = 0) {
  const bp = new Biquad().set('bp', 1400, 0.8)
  const hp = new Biquad().set('hp', 500)
  voice(t0, 0.45, (t) => {
    let e = Math.exp(-t / 0.13) * 0.8
    for (const d of [0, 0.011, 0.023]) if (t >= d) e += Math.exp(-(t - d) / 0.005)
    return hp.run(bp.run(noise())) * e * 1.6
  }, 0.33 * g, pan, 0.5)
}
function snare(t0: number, g = 1) {
  const bp = new Biquad().set('bp', 2200, 0.7)
  let ph = 0
  voice(t0, 0.25, (t) => {
    ph += (TAU * (190 + 60 * Math.exp(-t / 0.01))) / SR
    return (bp.run(noise()) * 1.4 * Math.exp(-t / 0.07) + Math.sin(ph) * 0.5 * Math.exp(-t / 0.04))
  }, 0.28 * g, 0, 0.35)
}
function hat(t0: number, open = false, g = 1, pan = 0.15) {
  const hp = new Biquad().set('hp', 8000, 0.9)
  voice(t0, open ? 0.3 : 0.08, (t) => hp.run(noise()) * Math.exp(-t / (open ? 0.11 : 0.022)), (open ? 0.11 : 0.12) * g, pan)
}
function bass(m: number, t0: number, dur: number, g = 1) {
  const lp = new Biquad().set('lp', 260, 0.9)
  const f = mtof(m)
  let ph = 0
  voice(t0, dur + 0.05, (t) => {
    ph += f / SR
    const saw = 2 * (ph % 1) - 1
    const env = Math.min(1, t / 0.004) * (t > dur ? Math.exp(-(t - dur) / 0.012) : 1)
    return (Math.sin(TAU * ph) * 0.8 + lp.run(saw) * 0.55) * env
  }, 0.36 * g)
}
function pad(notes: number[], t0: number, dur: number, g = 1, cutoff = 1500) {
  notes.forEach((m, k) => {
    for (const [d, pan] of [[-0.11, -0.7], [0, 0], [0.11, 0.7]] as const) {
      const lp = new Biquad()
      const f = mtof(m + d)
      let ph = Math.random()
      voice(t0, dur + 1.2, (t, i) => {
        ph += f / SR
        if (i % 64 === 0) lp.set('lp', cutoff + 500 * Math.sin(TAU * 0.25 * (t0 + t)) + 200 * k, 0.8)
        const a = Math.min(1, t / 0.35) * (t > dur ? Math.exp(-(t - dur) / 0.45) : 1)
        return lp.run(2 * (ph % 1) - 1) * a
      }, (0.05 * g) / notes.length * 4, pan, 0.35)
    }
  })
}
function pluck(m: number, t0: number, g = 1, pan = 0) {
  const lp = new Biquad()
  const f = mtof(m)
  let ph = 0
  voice(t0, 0.9, (t, i) => {
    ph += f / SR
    if (i % 32 === 0) lp.set('lp', 300 + 5200 * Math.exp(-t / 0.06), 1.2)
    const sq = (ph % 1 < 0.5 ? 1 : -1) * 0.6 + (2 * (ph % 1) - 1) * 0.4
    return lp.run(sq) * Math.exp(-t / 0.22)
  }, 0.1 * g, pan, 0.55)
}
function riser(t0: number, dur: number, g = 1) {
  const bp = new Biquad()
  let ph = 0
  voice(t0, dur, (t, i) => {
    const u = t / dur
    if (i % 32 === 0) bp.set('bp', 300 * Math.pow(30, u), 1.4)
    ph += (180 * Math.pow(6, u)) / SR
    return (bp.run(noise()) * 1.4 + Math.sin(TAU * ph) * 0.12) * u * u
  }, 0.3 * g, 0, 0.4)
}
function impact(t0: number, g = 1) {
  let ph = 0
  const lp = new Biquad().set('lp', 900)
  voice(t0, 3, (t) => {
    ph += (TAU * (30 + 40 * Math.exp(-t / 0.08))) / SR
    return Math.tanh(Math.sin(ph) * 1.6 * Math.exp(-t / 1.1)) * 0.9 + lp.run(noise()) * Math.exp(-t / 0.35) * 0.9
  }, 0.75 * g, 0, 0.8)
}
function whoosh(t0: number, g = 1) {
  const bp = new Biquad()
  const dur = 0.5
  voice(t0 - 0.12, dur, (t, i) => {
    const u = t / dur
    if (i % 32 === 0) bp.set('bp', 500 + 3500 * Math.sin(Math.PI * u), 1.1)
    return bp.run(noise()) * Math.pow(Math.sin(Math.PI * u), 2) * 1.8
  }, 0.22 * g, 0, 0.3)
}
function tick(t0: number, g = 1) {
  const hp = new Biquad().set('hp', 3000)
  voice(t0, 0.06, (t) => Math.sin(TAU * 2600 * t) * Math.exp(-t / 0.01) * 0.6 + hp.run(noise()) * Math.exp(-t / 0.003), 0.16 * g, 0.1)
}

// ——— Arrangement ———
const tShow = sec(SHOW)
const tRapid = sec(RAPID)
const tOutro = sec(OUTRO)
const tLock = sec(LOCKUP)
const tEnd = sec(END)
const tLogo = sec(LOGO)

// Am7 · Fmaj7 · Cmaj7 · G(add9), one chord per 2 s bar.
const CHORDS = [
  [57, 60, 64, 67],
  [53, 57, 60, 64],
  [55, 60, 64, 71],
  [55, 59, 62, 69],
]
const ROOTS = [33, 29, 36, 31]
const BREAK = [sec(SHOW + 1680), sec(SHOW + 1800)] // upscale: drums out

// Intro: drone, phrase hits, riser into the logo.
bass(33, 0, tLogo - 0.05, 0.55)
pad([45, 52], 0, tLogo, 0.8, 600)
for (let k = 0; k < 3; k++) {
  kick(k * 1.0, 0.75)
  tick(k * 1.0 + 0.5, 0.8)
}
for (let t = 0; t < tLogo - 0.01; t += 0.25) hat(t, false, 0.55)
riser(0.6, tLogo - 0.6, 1)
impact(tLogo, 1.1)
pad(CHORDS[0], tLogo, tShow - tLogo, 1.2, 900)
// Snare roll + riser into the drop.
for (let t = tShow - 1.0, step = 0.125; t < tShow - 0.02; t += step) {
  snare(t, 0.4 + 0.6 * (1 - (tShow - t)))
  if (t > tShow - 0.5) step = 0.0625
}
riser(tShow - 2, 2, 0.8)

// Groove.
for (let b = 0; tShow + b * BEAT < tRapid - 0.001; b++) {
  const t = tShow + b * BEAT
  const inBreak = t >= BREAK[0] && t < BREAK[1]
  const bar = Math.floor(b / 4)
  if (!inBreak) {
    kick(t)
    if (b % 2 === 1) clap(t)
    hat(t + BEAT / 2, b % 4 === 3, 1, b % 2 ? 0.25 : -0.15)
    if (bar >= 2) hat(t + BEAT / 4, false, 0.45, -0.3)
  } else {
    hat(t + BEAT / 2, false, 0.5)
  }
  if (b % 4 === 0) {
    const ci = bar % 4
    pad(CHORDS[ci], t, 2, inBreak ? 1.4 : 1)
    // Offbeat bass: the root on every eighth that isn't a kick.
    for (let e = 0; e < 8; e++) {
      const te = t + e * 0.25
      if (e % 2 === 1 || inBreak) bass(ROOTS[ci] + (e === 7 ? 12 : 0), te, 0.2, inBreak ? 0.6 : 1)
    }
    // Arpeggio from the third bar on.
    if (bar >= 2 && !inBreak) {
      const ns = CHORDS[ci]
      const order = [0, 2, 1, 3, 2, 1, 3, 2]
      order.forEach((o, k) => pluck(ns[o] + 12, t + k * 0.25, k % 2 ? 0.7 : 1, k % 2 ? 0.4 : -0.4))
    }
  }
}
// Fills before each section change.
for (const f of [SHOW + 600, SHOW + 960, SHOW + 1320]) {
  const t = sec(f)
  for (let k = 0; k < 4; k++) snare(t - 0.25 + k * 0.0625, 0.5 + k * 0.15)
}
riser(BREAK[0], BREAK[1] - BREAK[0], 0.7)
impact(BREAK[1], 0.55)

// Rapid fire: 16ths, a rising pluck per card, a riser into the outro.
for (let b = 0; tRapid + b * BEAT < tOutro - 0.001; b++) {
  const t = tRapid + b * BEAT
  kick(t)
  if (b % 2 === 1 || b >= 6) clap(t, b >= 6 ? 0.8 : 1)
  for (let s = 1; s < 4; s++) hat(t + s * 0.125, s === 2, s === 2 ? 1 : 0.6)
  if (b % 4 === 0) {
    pad(CHORDS[(b / 4 + 1) % 4], t, 2, 1.1, 2200)
    for (let e = 0; e < 8; e++) if (e % 2 === 1) bass(ROOTS[(b / 4 + 1) % 4], t + e * 0.25, 0.2)
  }
}
const scale = [69, 71, 72, 74, 76, 77, 79, 81]
RAPID_WORDS.forEach((_, i) => {
  const t = tRapid + sec(i * RAPID_STEP)
  pluck(scale[i % 8] + (i >= 8 ? 12 : 0), t, 1.1, i % 2 ? 0.35 : -0.35)
  tick(t, 0.7)
})
for (let t = tOutro - 1, step = 0.125; t < tOutro - 0.02; t += step) {
  snare(t, 0.5 + 0.5 * (1 - (tOutro - t)))
  if (t > tOutro - 0.5) step = 0.0625
}
riser(tOutro - 2, 2, 1)

// Outro.
impact(tOutro, 1.2)
pad(CHORDS[1], tOutro, tLock - tOutro, 1.4, 1200)
bass(29, tOutro, tLock - tOutro - 0.05, 0.6)
for (let t = tOutro; t < tLock - 0.01; t += 0.5) hat(t + 0.25, false, 0.4)
impact(tLock, 0.6)
pad([57, 60, 64, 71], tLock, tEnd - tLock - 1.2, 1.5, 1600)
bass(33, tLock, tEnd - tLock - 1.2, 0.6)
;[0, 0.75, 1.5].forEach((d, k) => pluck([76, 79, 83][k], tLock + 0.75 + d, 0.9, k - 1))

// Foley.
CLICKS.forEach((f) => tick(sec(f)))
WHOOSHES.forEach((f) => whoosh(sec(f)))

// ——— Sidechain, reverb, master ———
const duck = new Float32Array(LEN).fill(1)
for (const k of kicks) {
  const s0 = Math.floor(k * SR)
  for (let i = 0; i < SR * 0.4 && s0 + i < LEN; i++) {
    const d = 1 - 0.6 * Math.exp(-i / SR / 0.09)
    duck[s0 + i] = Math.min(duck[s0 + i], d)
  }
}

function reverb(input: Float32Array, spread: number) {
  const out = new Float32Array(LEN)
  const combs = [1557, 1617, 1491, 1422, 1277, 1356].map((d) => Math.round((d + spread) * 1.09))
  for (const d of combs) {
    const buf = new Float32Array(d)
    let idx = 0
    let lp = 0
    for (let i = 0; i < LEN; i++) {
      const y = buf[idx]
      lp = y * 0.6 + lp * 0.4
      buf[idx] = input[i] + lp * 0.84
      out[i] += y / combs.length
      idx = (idx + 1) % d
    }
  }
  for (const d of [556, 441, 341].map((x) => Math.round((x + spread) * 1.09))) {
    const buf = new Float32Array(d)
    let idx = 0
    for (let i = 0; i < LEN; i++) {
      const b = buf[idx]
      const y = -out[i] * 0.5 + b
      buf[idx] = out[i] + b * 0.5
      out[i] = y
      idx = (idx + 1) % d
    }
  }
  return out
}
const wetL = reverb(sendL, 0)
const wetR = reverb(sendR, 23)

const outL = new Float32Array(LEN)
const outR = new Float32Array(LEN)
// Scale the raw mix so its peak sits at 1.1 before a gentle tanh: transients
// round off, the body of the mix stays linear.
let raw = 0
for (let i = 0; i < LEN; i++) {
  raw = Math.max(raw, Math.abs(dryL[i] * duck[i] + wetL[i] * 0.55), Math.abs(dryR[i] * duck[i] + wetR[i] * 0.55))
}
const pre = 1.1 / raw
let peak = 0
for (let i = 0; i < LEN; i++) {
  const fadeOut = Math.min(1, Math.max(0, (tEnd - i / SR) / 1.4))
  const l = Math.tanh((dryL[i] * duck[i] + wetL[i] * 0.55) * pre) * fadeOut
  const r = Math.tanh((dryR[i] * duck[i] + wetR[i] * 0.55) * pre) * fadeOut
  outL[i] = l
  outR[i] = r
  peak = Math.max(peak, Math.abs(l), Math.abs(r))
}
const norm = 0.89 / peak
const data = Buffer.alloc(44 + LEN * 4)
data.write('RIFF', 0)
data.writeUInt32LE(36 + LEN * 4, 4)
data.write('WAVEfmt ', 8)
data.writeUInt32LE(16, 16)
data.writeUInt16LE(1, 20)
data.writeUInt16LE(2, 22)
data.writeUInt32LE(SR, 24)
data.writeUInt32LE(SR * 4, 28)
data.writeUInt16LE(4, 32)
data.writeUInt16LE(16, 34)
data.write('data', 36)
data.writeUInt32LE(LEN * 4, 40)
for (let i = 0; i < LEN; i++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, outL[i] * norm)) * 32767), 44 + i * 4)
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, outR[i] * norm)) * 32767), 46 + i * 4)
}
writeFileSync('public/music.wav', data)
console.log(`public/music.wav  ${(LEN / SR).toFixed(1)} s  peak ${peak.toFixed(2)}`)
