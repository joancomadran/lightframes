import React from 'react'
import { Composition } from 'remotion'
import { END } from './cues'
import { Promo } from './Promo'
import { FPS, H, W } from './theme'

export function Root() {
  return (
    <>
      <Composition id="Promo" component={Promo} durationInFrames={END} fps={FPS} width={W} height={H} defaultProps={{ music: true }} />
      <Composition id="PromoSilent" component={Promo} durationInFrames={END} fps={FPS} width={W} height={H} defaultProps={{ music: false }} />
    </>
  )
}
