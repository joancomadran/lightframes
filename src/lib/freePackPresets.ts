import pack from '../data/free-pack-looks.json'
import {
  DEFAULT_EDITS,
  cloneEdits,
  createDefaultColorGrading,
  type EditParams,
  type Preset,
} from '../types/edits'

type PackLook = (typeof pack.looks)[number]

function mergeEdits(patch: PackLook['edits']): EditParams {
  const edits = cloneEdits(DEFAULT_EDITS)
  const { hsl, colorGrading, toneCurve, ...rest } = patch as PackLook['edits'] & {
    hsl?: Partial<EditParams['hsl']>
    colorGrading?: Partial<EditParams['colorGrading']>
    toneCurve?: EditParams['toneCurve']
  }
  Object.assign(edits, rest)
  if (hsl) {
    for (const key of Object.keys(hsl) as (keyof EditParams['hsl'])[]) {
      edits.hsl[key] = { ...edits.hsl[key], ...hsl[key]! }
    }
  }
  if (colorGrading) {
    edits.colorGrading = { ...createDefaultColorGrading(), ...edits.colorGrading, ...colorGrading }
    for (const zone of ['shadows', 'midtones', 'highlights', 'global'] as const) {
      if (colorGrading[zone]) {
        edits.colorGrading[zone] = { ...edits.colorGrading[zone], ...colorGrading[zone]! }
      }
    }
  }
  if (toneCurve) edits.toneCurve = toneCurve
  return edits
}

export const FREE_PACK_LICENSE = pack.license

export const FREE_PACK_LOOKS = pack.looks.map((look) => ({
  id: look.id,
  name: look.name,
  nameEs: look.nameEs,
  description: look.description,
  descriptionEs: look.descriptionEs,
}))

/** Presets applied in the editor via ?look=<id> — same values as the downloadable pack. */
export const FREE_PACK_PRESETS: Preset[] = pack.looks.map((look) => ({
  id: `freepack:${look.id}`,
  name: look.name,
  edits: mergeEdits(look.edits),
  createdAt: '2026-11-05T00:00:00.000Z',
}))

export function isFreePackPreset(id: string): boolean {
  return id.startsWith('freepack:')
}

export function freePackPresetBySlug(slug: string): Preset | undefined {
  return FREE_PACK_PRESETS.find((p) => p.id === `freepack:${slug}`)
}
