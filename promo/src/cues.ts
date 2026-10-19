/**
 * Shared timeline, in absolute frames at 60 fps (120 BPM → 30 frames a beat).
 * Imported by the composition and by scripts/music.ts so picture and sound
 * stay locked together. No Remotion imports here.
 */
export const FPS = 60
export const BEAT = 30
export const BAR = 120

export const INTRO = 0
export const LOGO = 180
export const SHOW = 300
export const RAPID = 2460
export const OUTRO = 2700
export const LOCKUP = 2880
export const END = 3060

/** Frames relative to SHOW (the continuous editor sequence). */
export const L = {
  adjust: 240,
  sliders: 270,
  compare: 480,
  batch: 600,
  copyClick: 648,
  wall: 690,
  pasteClick: 770,
  exportDlg: 860,
  exportClick: 888,
  presets: 960,
  presetsTab: 992,
  presetClick0: 1020,
  ai: 1320,
  retouchTab: 1338,
  removeClick: 1368,
  colorClick: 1470,
  swatchClicks: [1500, 1530, 1560],
  blurClick: 1600,
  upscale: 1680,
  collage: 1800,
  collageClick: 1836,
  layoutAt: [1880, 1910, 1940, 1970],
  aspectAt: [2000, 2030],
  carouselClick: 2070,
  end: 2160,
}

export const PRESET_CLICKS = Array.from({ length: 8 }, (_, i) => L.presetClick0 + i * 30)

/** UI clicks (absolute frames) for the click foley. */
export const CLICKS = [
  L.copyClick,
  L.pasteClick,
  L.exportClick,
  L.presetsTab,
  ...PRESET_CLICKS,
  L.retouchTab,
  L.removeClick,
  L.colorClick,
  ...L.swatchClicks,
  L.blurClick,
  L.collageClick,
  ...L.layoutAt,
  ...L.aspectAt,
  L.carouselClick,
].map((f) => f + SHOW)

/** Big camera moves (absolute frames, the moment the move starts). */
export const WHOOSHES = [
  SHOW + 200,
  SHOW + 472,
  SHOW + 604,
  SHOW + 690,
  SHOW + 856,
  SHOW + 950,
  SHOW + 1318,
  SHOW + 1672,
  SHOW + 1796,
  SHOW + 1848,
]

/** Rapid-fire feature cards: one per eighth note. */
export const RAPID_WORDS = [
  'RAW files',
  'Tone curve',
  'Color grading',
  'HSL mixer',
  'Masks',
  'Heal & clone',
  'Crop & straighten',
  'Grain & vignette',
  'Histogram',
  '.cube LUTs',
  'XMP presets',
  'Undo history',
  'Batch export',
  'Works offline',
  'Installable',
  'Free.',
]
export const RAPID_STEP = 15
