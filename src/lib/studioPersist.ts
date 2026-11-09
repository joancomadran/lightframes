import type { CarouselDoc } from './carousel'
import type { CollageDoc } from './collage'
import { packStudioState as packStudioStateImpl, unpackStudioState as unpackStudioStateImpl } from './studioState.js'

/** Layout kept in the local editor session, including each photo's rotation. */
export type PackedStudio = {
  format: 'collage' | 'carousel'
  collage: CollageDoc | null
  carousel: CarouselDoc | null
}

export function packStudioState(state: {
  format?: string | null
  collage?: CollageDoc | null
  carousel?: CarouselDoc | null
}): PackedStudio {
  return packStudioStateImpl(state) as PackedStudio
}

export function unpackStudioState(raw: unknown): PackedStudio | null {
  return unpackStudioStateImpl(raw) as PackedStudio | null
}
