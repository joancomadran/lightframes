import type { Lut3D } from '../types/edits'

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

/**
 * Parse an IRIDAS / Adobe `.cube` 3D LUT.
 * Data order: R varies fastest, then G, then B.
 */
export function parseCubeLut(text: string): Lut3D {
  const lines = text.split(/\r?\n/)
  let size = 0
  let title: string | undefined
  const data: number[] = []
  let domainMin = [0, 0, 0]
  let domainMax = [1, 1, 1]

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || line.startsWith('//')) continue

    const upper = line.toUpperCase()
    if (upper.startsWith('TITLE')) {
      const m = line.match(/TITLE\s+"([^"]*)"/i) ?? line.match(/TITLE\s+(\S+)/i)
      if (m?.[1]) title = m[1]
      continue
    }
    if (upper.startsWith('LUT_3D_SIZE')) {
      const n = Number(line.split(/\s+/)[1])
      if (!Number.isInteger(n) || n < 2 || n > 128) {
        throw new Error(`Unsupported LUT_3D_SIZE: ${line}`)
      }
      size = n
      continue
    }
    if (upper.startsWith('LUT_1D_SIZE')) {
      throw new Error('1D CUBE LUTs are not supported; use a 3D .cube')
    }
    if (upper.startsWith('DOMAIN_MIN')) {
      const parts = line.split(/\s+/).slice(1).map(Number)
      if (parts.length >= 3 && parts.every((n) => Number.isFinite(n))) {
        domainMin = [parts[0]!, parts[1]!, parts[2]!]
      }
      continue
    }
    if (upper.startsWith('DOMAIN_MAX')) {
      const parts = line.split(/\s+/).slice(1).map(Number)
      if (parts.length >= 3 && parts.every((n) => Number.isFinite(n))) {
        domainMax = [parts[0]!, parts[1]!, parts[2]!]
      }
      continue
    }
    if (/^[A-Za-z_]/.test(line)) continue

    const nums = line.split(/\s+/).map(Number)
    if (nums.length < 3 || nums.slice(0, 3).some((n) => !Number.isFinite(n))) {
      throw new Error(`Invalid CUBE data line: ${line}`)
    }
    data.push(nums[0]!, nums[1]!, nums[2]!)
  }

  if (size < 2) throw new Error('CUBE missing LUT_3D_SIZE')
  const expected = size * size * size * 3
  if (data.length !== expected) {
    throw new Error(`CUBE expected ${expected / 3} RGB samples, got ${data.length / 3}`)
  }

  // Normalize domain to 0–1 sample space when non-standard
  const needsDomain =
    domainMin[0] !== 0 ||
    domainMin[1] !== 0 ||
    domainMin[2] !== 0 ||
    domainMax[0] !== 1 ||
    domainMax[1] !== 1 ||
    domainMax[2] !== 1
  if (needsDomain) {
    const dr = domainMax[0]! - domainMin[0]! || 1
    const dg = domainMax[1]! - domainMin[1]! || 1
    const db = domainMax[2]! - domainMin[2]! || 1
    for (let i = 0; i < data.length; i += 3) {
      data[i] = (data[i]! - domainMin[0]!) / dr
      data[i + 1] = (data[i + 1]! - domainMin[1]!) / dg
      data[i + 2] = (data[i + 2]! - domainMin[2]!) / db
    }
  }

  return { size, title, data }
}

function sampleLut(lut: Lut3D, r: number, g: number, b: number): [number, number, number] {
  const n = lut.size
  const max = n - 1
  const rr = clamp01(r) * max
  const gg = clamp01(g) * max
  const bb = clamp01(b) * max

  const r0 = Math.floor(rr)
  const g0 = Math.floor(gg)
  const b0 = Math.floor(bb)
  const r1 = Math.min(max, r0 + 1)
  const g1 = Math.min(max, g0 + 1)
  const b1 = Math.min(max, b0 + 1)
  const fr = rr - r0
  const fg = gg - g0
  const fb = bb - b0

  const data = lut.data
  const at = (ri: number, gi: number, bi: number): [number, number, number] => {
    const i = (bi * n * n + gi * n + ri) * 3
    return [data[i]!, data[i + 1]!, data[i + 2]!]
  }

  const c000 = at(r0, g0, b0)
  const c100 = at(r1, g0, b0)
  const c010 = at(r0, g1, b0)
  const c110 = at(r1, g1, b0)
  const c001 = at(r0, g0, b1)
  const c101 = at(r1, g0, b1)
  const c011 = at(r0, g1, b1)
  const c111 = at(r1, g1, b1)

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const out: [number, number, number] = [0, 0, 0]
  for (let c = 0; c < 3; c++) {
    const c00 = lerp(c000[c]!, c100[c]!, fr)
    const c10 = lerp(c010[c]!, c110[c]!, fr)
    const c01 = lerp(c001[c]!, c101[c]!, fr)
    const c11 = lerp(c011[c]!, c111[c]!, fr)
    const c0 = lerp(c00, c10, fg)
    const c1 = lerp(c01, c11, fg)
    out[c] = lerp(c0, c1, fb)
  }
  return out
}

/**
 * Apply a 3D LUT to ImageData in place (expects 0–255 sRGB-ish samples).
 * `mix` blends original → LUT result (0 = untouched, 1 = full LUT).
 */
export function applyLutToImageData(imageData: ImageData, lut: Lut3D, mix = 1): void {
  const amount = Math.min(1, Math.max(0, mix))
  if (amount <= 0) return

  const { data } = imageData
  for (let i = 0; i < data.length; i += 4) {
    const sr = data[i]!
    const sg = data[i + 1]!
    const sb = data[i + 2]!
    const [r, g, b] = sampleLut(lut, sr / 255, sg / 255, sb / 255)
    const lr = r * 255
    const lg = g * 255
    const lb = b * 255
    data[i] = Math.min(255, Math.max(0, Math.round(sr + (lr - sr) * amount)))
    data[i + 1] = Math.min(255, Math.max(0, Math.round(sg + (lg - sg) * amount)))
    data[i + 2] = Math.min(255, Math.max(0, Math.round(sb + (lb - sb) * amount)))
  }
}

export function isCubeText(text: string): boolean {
  return /LUT_3D_SIZE\s+\d+/i.test(text)
}
