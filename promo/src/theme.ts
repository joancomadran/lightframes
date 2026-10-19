import { loadFont as loadBricolage } from '@remotion/google-fonts/BricolageGrotesque'
import { loadFont as loadFigtree } from '@remotion/google-fonts/Figtree'
import { staticFile } from 'remotion'

const display = loadBricolage('normal', { weights: ['500', '700', '800'], subsets: ['latin'] })
const ui = loadFigtree('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin'] })

/** Same tokens as the app's :root in src/index.css. */
export const C = {
  void: '#0c100e',
  app: '#121816',
  panel: '#171e1a',
  elevated: '#1e2822',
  hover: '#243028',
  line: 'rgba(200, 245, 96, 0.12)',
  lineStrong: 'rgba(232, 239, 228, 0.18)',
  lineSoft: 'rgba(232, 239, 228, 0.08)',
  text: '#e8efe4',
  muted: '#8f9c90',
  accent: '#c8f560',
  accentInk: '#141a12',
  tile: '#141a16',
}

export const F = {
  display: `${display.fontFamily}, Georgia, serif`,
  ui: `${ui.fontFamily}, 'Segoe UI', sans-serif`,
}

export const FPS = 60
export const W = 1920
export const H = 1080
/** 120 BPM at 60 fps: one beat is 30 frames, one bar 120. */
export const BEAT = 30
export const BAR = 120

export const img = {
  orig: (p: Photo) => staticFile(`samples/${p}.jpg`),
  hero: (p: Photo) => staticFile(`renders/${p}--hero.jpg`),
  preset: (p: Photo, id: string) => staticFile(`renders/${p}--${id}.jpg`),
  cutout: staticFile('renders/pagoda--cutout.png'),
  detailLo: staticFile('renders/pagoda--detail-lo.png'),
}

export type Photo = 'pagoda' | 'twelve-apostles' | 'opera-night'

export const PHOTOS: { id: Photo; w: number; h: number }[] = [
  { id: 'pagoda', w: 1601, h: 2400 },
  { id: 'twelve-apostles', w: 2400, h: 1601 },
  { id: 'opera-night', w: 1601, h: 2400 },
]

export const PRESETS: { id: string; name: string }[] = [
  { id: 'vintage', name: 'Vintage' },
  { id: 'japan-film', name: 'Japan Film' },
  { id: 'b-w-noir', name: 'B&W Noir' },
  { id: 'teal-orange', name: 'Teal & Orange' },
  { id: 'warm-film', name: 'Warm Film' },
  { id: 'moody-forest', name: 'Moody Forest' },
  { id: 'nordic', name: 'Nordic' },
  { id: 'old-money', name: 'Old Money' },
]
