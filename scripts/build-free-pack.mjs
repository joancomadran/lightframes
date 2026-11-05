#!/usr/bin/env node
/**
 * Builds the CC0 free presets & LUTs pack from src/data/free-pack-looks.json.
 *
 * CUBE files: 33³ LUTs sampled from a documented sRGB transform (exposure, contrast,
 * white balance, saturation, and a split-tone approximation of color grading).
 * XMP files: Camera Raw–compatible develop settings mapped from the same numbers.
 *
 * Run: node scripts/build-free-pack.mjs
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const pack = JSON.parse(readFileSync(join(root, 'src/data/free-pack-looks.json'), 'utf8'))

const OUT = join(root, 'public/downloads/free-presets-pack')
const THUMBS = join(root, 'public/site/looks/free-pack')

function clamp01(n) {
  return Math.min(1, Math.max(0, n))
}

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function linearToSrgb(c) {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055
}

function applyExposure(rgb, stops) {
  const m = 2 ** stops
  return rgb.map((c) => c * m)
}

function applyContrast(rgb, amount) {
  // amount in roughly -100..100 → pivot contrast around 0.18 linear
  const factor = 1 + amount / 100
  return rgb.map((c) => clamp01((c - 0.18) * factor + 0.18))
}

function applyTemperature(rgb, temp) {
  // temp slider -100..100 approximated as blue/yellow shift
  const t = temp / 100
  return [rgb[0] * (1 + t * 0.08), rgb[1], rgb[2] * (1 - t * 0.08)]
}

function applyTint(rgb, tint) {
  const t = tint / 100
  return [rgb[0], rgb[1] * (1 + t * 0.04), rgb[2] * (1 - t * 0.04)]
}

function applySaturation(rgb, sat) {
  const s = 1 + sat / 100
  const l = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
  return rgb.map((c) => clamp01(l + (c - l) * s))
}

function applySplitTone(rgb, grading) {
  if (!grading) return rgb
  const luma = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
  let out = [...rgb]
  const zones = [
    ['shadows', grading.shadows, luma < 0.33 ? 1 - luma / 0.33 : 0],
    ['highlights', grading.highlights, luma > 0.66 ? (luma - 0.66) / 0.34 : 0],
  ]
  for (const [, zone, weight] of zones) {
    if (!zone || weight <= 0) continue
    const hue = (zone.hue ?? 0) * (Math.PI / 180)
    const sat = (zone.saturation ?? 0) / 100
    const tint = [
      clamp01(0.5 + 0.5 * Math.cos(hue)),
      clamp01(0.5 + 0.5 * Math.cos(hue + (2 * Math.PI) / 3)),
      clamp01(0.5 + 0.5 * Math.cos(hue + (4 * Math.PI) / 3)),
    ]
    out = out.map((c, i) => clamp01(c + (tint[i] - 0.5) * sat * weight * 0.35))
  }
  return out
}

function transformPixel(rgb, edits) {
  let linear = rgb.map(srgbToLinear)
  if (edits.exposure) linear = applyExposure(linear, edits.exposure)
  linear = linear.map((c) => clamp01(c))
  linear = applyContrast(linear, edits.contrast ?? 0)
  linear = applyTemperature(linear, edits.temperature ?? 0)
  linear = applyTint(linear, edits.tint ?? 0)
  linear = applySaturation(linear, edits.saturation ?? 0)
  if (edits.vibrance) linear = applySaturation(linear, edits.vibrance * 0.6)
  linear = applySplitTone(linear, edits.colorGrading)
  return linear.map((c) => clamp01(linearToSrgb(c)))
}

function buildCube(look) {
  const size = 33
  const lines = [
    `# Lightframes free pack — ${look.name}`,
    `# Generated from documented sRGB transforms; CC0-1.0`,
    `TITLE "${look.name}"`,
    `LUT_3D_SIZE ${size}`,
    '',
  ]
  for (let b = 0; b < size; b++) {
    for (let g = 0; g < size; g++) {
      for (let r = 0; r < size; r++) {
        const rgb = [r / (size - 1), g / (size - 1), b / (size - 1)]
        const out = transformPixel(rgb, look.edits)
        lines.push(`${out[0].toFixed(6)} ${out[1].toFixed(6)} ${out[2].toFixed(6)}`)
      }
    }
  }
  return lines.join('\n') + '\n'
}

function xmpValue(n, digits = 4) {
  return Number(n).toFixed(digits)
}

function buildXmp(look) {
  const e = look.edits
  const cg = e.colorGrading ?? {}
  const shadow = cg.shadows ?? {}
  const high = cg.highlights ?? {}
  const mapExp = (v) => (v ?? 0) * (100 / 4)
  return `<?xml version="1.0" encoding="UTF-8"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
      crs:PresetType="Normal"
      crs:Version="15.4"
      crs:ProcessVersion="11.0"
      crs:WhiteBalance="As Shot"
      crs:Exposure2012="${xmpValue(mapExp(e.exposure))}"
      crs:Contrast2012="${xmpValue(e.contrast ?? 0, 0)}"
      crs:Highlights2012="${xmpValue(e.highlights ?? 0, 0)}"
      crs:Shadows2012="${xmpValue(e.shadows ?? 0, 0)}"
      crs:Whites2012="${xmpValue(e.whites ?? 0, 0)}"
      crs:Blacks2012="${xmpValue(e.blacks ?? 0, 0)}"
      crs:Temperature="${xmpValue(5000 + (e.temperature ?? 0) * 35, 0)}"
      crs:Tint="${xmpValue(e.tint ?? 0, 0)}"
      crs:Vibrance="${xmpValue(e.vibrance ?? 0, 0)}"
      crs:Saturation="${xmpValue(e.saturation ?? 0, 0)}"
      crs:Clarity2012="${xmpValue(e.clarity ?? 0, 0)}"
      crs:Dehaze="${xmpValue(e.dehaze ?? 0, 0)}"
      crs:Texture="${xmpValue(e.texture ?? 0, 0)}"
      crs:Sharpness="${xmpValue(e.sharpening ?? 0, 0)}"
      crs:LuminanceSmoothing="${xmpValue(e.noiseReduction ?? 0, 0)}"
      crs:PostCropVignetteAmount="${xmpValue(e.vignette ?? 0, 0)}"
      crs:GrainAmount="${xmpValue(e.grain ?? 0, 0)}"
      crs:ColorGradeShadowHue="${xmpValue(shadow.hue ?? 0, 0)}"
      crs:ColorGradeShadowSat="${xmpValue(shadow.saturation ?? 0, 0)}"
      crs:ColorGradeHighlightHue="${xmpValue(high.hue ?? 0, 0)}"
      crs:ColorGradeHighlightSat="${xmpValue(high.saturation ?? 0, 0)}"
      crs:ColorGradeBlending="${xmpValue(cg.blending ?? 50, 0)}"
      crs:SplitToningBalance="${xmpValue(cg.balance ?? 0, 0)}"
      crs:HasSettings="True">
      <crs:Name>${look.name}</crs:Name>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
`
}

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
mkdirSync(THUMBS, { recursive: true })

const manifest = []

for (const look of pack.looks) {
  const dir = join(OUT, look.id)
  mkdirSync(dir, { recursive: true })
  const xmpPath = join(dir, `${look.id}.xmp`)
  const cubePath = join(dir, `${look.id}.cube`)
  writeFileSync(xmpPath, buildXmp(look))
  writeFileSync(cubePath, buildCube(look))
  manifest.push({ id: look.id, name: look.name, xmp: `/downloads/free-presets-pack/${look.id}/${look.id}.xmp`, cube: `/downloads/free-presets-pack/${look.id}/${look.id}.cube` })
}

writeFileSync(join(OUT, 'README.txt'), `Lightframes free presets & LUTs pack\nLicense: ${pack.license}\n\nEach folder contains a Lightroom-compatible .xmp preset and a .cube 3D LUT (33³).\n`)

const zipPath = join(root, 'public/downloads/lightframes-free-presets-luts.zip')
try {
  execSync(`cd "${OUT}" && zip -r "${zipPath}" . -x README.txt`, { stdio: 'inherit' })
} catch {
  console.warn('zip command failed; install zip or create archive manually')
}

/** Preview thumbs via sharp when available */
await (async () => {
  try {
    const sharp = (await import('sharp')).default
    const sample = join(root, 'public/samples/pagoda.jpg')
    for (const look of pack.looks) {
      const { data, info } = await sharp(sample)
        .resize(480, null, { withoutEnlargement: true })
        .raw()
        .ensureAlpha()
        .toBuffer({ resolveWithObject: true })
      const outBuf = Buffer.alloc(info.width * info.height * 3)
      for (let y = 0; y < info.height; y++) {
        for (let x = 0; x < info.width; x++) {
          const i = (y * info.width + x) * info.channels
          const j = (y * info.width + x) * 3
          const rgb = [data[i] / 255, data[i + 1] / 255, data[i + 2] / 255]
          const out = transformPixel(rgb, look.edits)
          outBuf[j] = Math.round(out[0] * 255)
          outBuf[j + 1] = Math.round(out[1] * 255)
          outBuf[j + 2] = Math.round(out[2] * 255)
        }
      }
      await sharp(outBuf, { raw: { width: info.width, height: info.height, channels: 3 } })
        .jpeg({ quality: 82 })
        .toFile(join(THUMBS, `${look.id}.jpg`))
    }
    console.log('Generated preview thumbs with sharp')
  } catch (err) {
    console.warn('Preview generation skipped (install sharp for thumbs):', err.message)
  }
})()

console.log(`Wrote ${pack.looks.length} looks to ${OUT}`)
