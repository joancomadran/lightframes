import {
  DEFAULT_EDITS,
  cloneEdits,
  createDefaultColorGrading,
  createDefaultHsl,
  type EditParams,
  type Preset,
} from '../types/edits'

/** Curve points given in Lightroom's 0–255 scale. */
function curve255(...pairs: [number, number][]): EditParams['toneCurve'] {
  return { points: pairs.map(([x, y]) => ({ x: x / 255, y: y / 255 })) }
}

function filter(id: string, name: string, patch: Partial<EditParams>): Preset {
  return {
    id: `builtin:${id}`,
    name,
    edits: { ...cloneEdits(DEFAULT_EDITS), ...patch },
    createdAt: '2026-10-18T00:00:00.000Z',
  }
}

/** Read-only looks shipped with the app; values use Lightroom's slider scales. */
export const BUILTIN_PRESETS: Preset[] = [
  filter('vintage', 'Vintage', {
    exposure: 0.35,
    contrast: -21,
    highlights: 9,
    shadows: 40,
    whites: -24,
    blacks: 30,
    // Lifted blacks, softened whites and a gentle S.
    toneCurve: curve255([0, 22], [62, 47], [152, 118], [202, 179], [255, 228]),
    temperature: 20,
    tint: -10,
    vibrance: 20,
    saturation: -10,
    colorGrading: {
      ...createDefaultColorGrading(),
      shadows: { hue: 38, saturation: 8, luminance: 0 },
      midtones: { hue: 37, saturation: 33, luminance: 0 },
      highlights: { hue: 70, saturation: 15, luminance: 0 },
    },
    hsl: {
      ...createDefaultHsl(),
      reds: { hue: -51, saturation: -7, luminance: 33 },
      oranges: { hue: -23, saturation: 14, luminance: 10 },
      yellows: { hue: -40, saturation: 3, luminance: 1 },
      greens: { hue: -100, saturation: -10, luminance: 20 },
      aquas: { hue: 0, saturation: -30, luminance: 0 },
      blues: { hue: 0, saturation: 30, luminance: 0 },
      purples: { hue: 0, saturation: -30, luminance: 0 },
      magentas: { hue: 0, saturation: -15, luminance: 0 },
    },
    texture: 12,
    clarity: -10,
    dehaze: 10,
    noiseReduction: 4,
    colorNoiseReduction: 15,
  }),
  filter('old-money', 'Old Money', {
    contrast: 18,
    highlights: -40,
    shadows: 25,
    whites: 20,
    blacks: 15,
    tint: 6,
    vibrance: 10,
    saturation: -8,
    hsl: {
      ...createDefaultHsl(),
      reds: { hue: 0, saturation: -5, luminance: 10 },
      oranges: { hue: -9, saturation: 15, luminance: 19 },
      yellows: { hue: -17, saturation: -10, luminance: -8 },
      greens: { hue: -58, saturation: -33, luminance: -38 },
      blues: { hue: 0, saturation: -59, luminance: 0 },
      purples: { hue: 0, saturation: -40, luminance: 0 },
    },
  }),
  // Faded Japanese film with blue-leaning highlights.
  filter('japan-film', 'Japan Film', {
    contrast: -40,
    highlights: -20,
    whites: -20,
    blacks: 25,
    toneCurve: curve255([0, 14], [64, 60], [128, 126], [190, 190], [255, 248]),
    temperature: 15,
    tint: -20,
    vibrance: 30,
    saturation: -10,
    hsl: {
      ...createDefaultHsl(),
      reds: { hue: -10, saturation: 10, luminance: 0 },
      yellows: { hue: -30, saturation: -30, luminance: 0 },
      greens: { hue: 0, saturation: -35, luminance: 0 },
      aquas: { hue: 0, saturation: -50, luminance: 0 },
      blues: { hue: 0, saturation: -50, luminance: 0 },
      purples: { hue: 0, saturation: -20, luminance: 0 },
    },
    colorGrading: {
      ...createDefaultColorGrading(),
      midtones: { hue: 200, saturation: 15, luminance: 0 },
      highlights: { hue: 220, saturation: 25, luminance: 25 },
      global: { hue: 50, saturation: 30, luminance: 0 },
    },
    clarity: -20,
    dehaze: 10,
    grain: 25,
  }),
  // Dark, warm brown.
  filter('moody-brown', 'Moody Brown', {
    contrast: 20,
    highlights: -40,
    shadows: -20,
    blacks: -30,
    temperature: 10,
    tint: 5,
    hsl: {
      ...createDefaultHsl(),
      oranges: { hue: -5, saturation: 10, luminance: 0 },
      yellows: { hue: -21, saturation: -30, luminance: 0 },
      greens: { hue: 0, saturation: -60, luminance: 0 },
      blues: { hue: 0, saturation: -40, luminance: 0 },
    },
    texture: 10,
    grain: 15,
  }),
  // Soft analog look with faded blacks.
  filter('analog-dreamy', 'Analog Dreamy', {
    exposure: 0.1,
    contrast: -14,
    highlights: -32,
    shadows: -21,
    whites: -15,
    blacks: -34,
    toneCurve: curve255([0, 23], [69, 56], [125, 126], [181, 195], [255, 239]),
    vibrance: 18,
    saturation: -24,
    colorGrading: {
      ...createDefaultColorGrading(),
      shadows: { hue: 100, saturation: 16, luminance: 0 },
      midtones: { hue: 85, saturation: 10, luminance: 0 },
      highlights: { hue: 56, saturation: 33, luminance: 0 },
    },
    hsl: {
      ...createDefaultHsl(),
      oranges: { hue: 0, saturation: 22, luminance: 0 },
      greens: { hue: 10, saturation: -30, luminance: 0 },
      aquas: { hue: -31, saturation: 0, luminance: 0 },
      blues: { hue: -14, saturation: 0, luminance: 0 },
    },
    texture: 38,
    clarity: -40,
    dehaze: 4,
    vignette: -5,
    grain: 20,
  }),
  // Dark forest with teal-green shadows.
  filter('moody-forest', 'Moody Forest', {
    exposure: -0.25,
    contrast: 20,
    highlights: -55,
    shadows: 25,
    whites: -20,
    blacks: -35,
    temperature: -6,
    tint: 4,
    vibrance: -8,
    saturation: -12,
    hsl: {
      ...createDefaultHsl(),
      yellows: { hue: 35, saturation: -40, luminance: -20 },
      greens: { hue: 30, saturation: -35, luminance: -30 },
      aquas: { hue: -15, saturation: -20, luminance: 0 },
      blues: { hue: -10, saturation: -25, luminance: -18 },
    },
    colorGrading: {
      ...createDefaultColorGrading(),
      shadows: { hue: 165, saturation: 14, luminance: 0 },
      midtones: { hue: 150, saturation: 8, luminance: 0 },
      highlights: { hue: 45, saturation: 10, luminance: 0 },
      balance: -20,
    },
    texture: 8,
    clarity: 12,
    dehaze: 14,
    vignette: -18,
    grain: 18,
    sharpening: 35,
  }),
]

export function isBuiltinPreset(id: string): boolean {
  return id.startsWith('builtin:')
}
