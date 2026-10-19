import React from 'react'
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion'
import { END, OUTRO, RAPID, SHOW } from './cues'
import { Finish } from './fx/Finish'
import { EditorShow } from './scenes/EditorShow'
import { Intro } from './scenes/Intro'
import { Outro } from './scenes/Outro'
import { RapidFire } from './scenes/RapidFire'
import { C } from './theme'

export function Promo({ music = true }: { music?: boolean }) {
  return (
    <AbsoluteFill style={{ background: C.void }}>
      <Sequence from={0} durationInFrames={SHOW}>
        <Intro />
      </Sequence>
      <Sequence from={SHOW} durationInFrames={RAPID - SHOW}>
        <EditorShow />
      </Sequence>
      <Sequence from={RAPID} durationInFrames={OUTRO - RAPID}>
        <RapidFire />
      </Sequence>
      <Sequence from={OUTRO} durationInFrames={END - OUTRO}>
        <Outro />
      </Sequence>
      <Finish />
      {music && <Audio src={staticFile('music.wav')} />}
    </AbsoluteFill>
  )
}
