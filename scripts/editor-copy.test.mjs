import test from 'node:test'
import assert from 'node:assert/strict'
import { editorCopy, editorLangFromLocation } from '../src/lib/editorCopy.ts'
import pack from '../src/data/free-pack-looks.json' with { type: 'json' }
import { trackFreePackDownload, setAnalyticsTransportForTests } from '../src/lib/analytics.ts'

test('editor language follows the route when html lang is missing', () => {
  assert.equal(editorLangFromLocation('/editor', ''), 'en')
  assert.equal(editorLangFromLocation('/es/editor', ''), 'es')
  assert.equal(editorLangFromLocation('/es/editor', 'en'), 'en')
  assert.equal(editorLangFromLocation('/editor', 'es'), 'es')
})

test('empty-state copy keeps the tagline and never says 100% private', () => {
  const en = editorCopy('en')
  const es = editorCopy('es')
  assert.equal(en.empty.title, 'The open-source photo editor that stays on your device')
  assert.equal(es.empty.title, 'El editor de fotos open source que se queda en tu dispositivo')
  assert.equal(en.empty.nothingUploaded, 'Nothing uploaded')
  assert.equal(es.empty.nothingUploaded, 'Sin subir archivos')
  assert.deepEqual(
    en.empty.samples.map((sample) => sample.file),
    ['pagoda.jpg', 'twelve-apostles.jpg', 'opera-night.jpg'],
  )
  assert.deepEqual(
    es.empty.samples.map((sample) => sample.file),
    en.empty.samples.map((sample) => sample.file),
  )
  const blob = JSON.stringify({ en, es })
  assert.equal(blob.toLowerCase().includes('100% private'), false)
  assert.equal(blob.toLowerCase().includes('100 % privado'), false)
})

test('english status lines used by the editor stay exact', () => {
  const status = editorCopy('en').status
  assert.equal(status.loaded(1, 1, false), 'Loaded 1 image; 1 failed')
  assert.equal(status.loaded(2, 0, false), 'Loaded 2 images')
  assert.equal(status.loaded(1, 0, true), 'Added 1 image')
  assert.equal(status.couldNotOpen(1), 'Could not open 1 image')
  assert.equal(status.couldNotOpen(2), 'Could not open 2 images')
  assert.equal(status.openToBegin, 'Open images to begin')
  assert.equal(status.exportFailed, 'Export failed')
  assert.equal(editorCopy('es').status.loaded(1, 0, false), '1 imagen cargada')
  assert.equal(editorCopy('es').status.couldNotOpen(1), 'No se ha podido abrir 1 imagen')
})

test('the free pack is eight looks with Spanish names', () => {
  assert.equal(pack.looks.length, 8)
  assert.equal(pack.looks[0].name, 'Coastal Mist')
  assert.equal(pack.looks[0].nameEs, 'Bruma costera')
  assert.equal(editorCopy('es').presets.freePack, 'Pack gratis')
  assert.equal(editorCopy('en').presets.freePack, 'Free Pack')
})

test('the pack zip download event stays free_pack_download', () => {
  const events = []
  setAnalyticsTransportForTests((name, props) => {
    events.push({ name, props })
  })
  trackFreePackDownload('full-pack')
  assert.deepEqual(events, [{ name: 'free_pack_download', props: { look: 'full-pack' } }])
  setAnalyticsTransportForTests(null)
})
