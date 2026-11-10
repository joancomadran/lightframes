import test from 'node:test'
import assert from 'node:assert/strict'
import {
  batchSizeBucket,
  coarseAiReason,
  coarseExportReason,
  coarsePhotoLoadReason,
  fileExtension,
  presetImportTool,
  setAnalyticsTransportForTests,
  toolsForEditPatch,
  trackAiFeatureFailed,
  trackExportCompleted,
  trackPhotoLoadFailed,
  trackToolUsed,
} from '../src/lib/analytics.ts'

function capture() {
  const events = []
  setAnalyticsTransportForTests((name, props) => {
    events.push({ name, props: props ? { ...props } : undefined })
  })
  return events
}

test('tool_used is sent once per tool in a session', () => {
  const events = capture()
  trackToolUsed('crop')
  trackToolUsed('crop')
  trackToolUsed('rotate')
  trackToolUsed('crop')
  assert.deepEqual(events, [
    { name: 'tool_used', props: { tool: 'crop' } },
    { name: 'tool_used', props: { tool: 'rotate' } },
  ])
})

test('a throwing transport never escapes the helpers', () => {
  setAnalyticsTransportForTests(() => {
    throw new Error('analytics down')
  })
  assert.doesNotThrow(() => {
    trackToolUsed('heal')
    trackToolUsed('heal')
    trackPhotoLoadFailed('IMG_1234.CR2', 'decode_error')
    trackAiFeatureFailed('upscale', 'unknown')
    trackExportCompleted(3, 'jpeg')
  })
})

test('photo load failures keep only the extension and a coarse reason', () => {
  const events = capture()
  trackPhotoLoadFailed('vacation/IMG_1234.CR2', coarsePhotoLoadReason(new Error('Could not decode RAW file: IMG_1234.CR2')))
  trackPhotoLoadFailed('notes.TXT', 'unsupported')
  trackPhotoLoadFailed('no-extension', coarsePhotoLoadReason(new Error('RangeError: Array buffer allocation failed')))
  assert.deepEqual(events, [
    { name: 'photo_load_failed', props: { file_type: 'cr2', reason: 'decode_error' } },
    { name: 'photo_load_failed', props: { file_type: 'txt', reason: 'unsupported' } },
    { name: 'photo_load_failed', props: { file_type: 'unknown', reason: 'too_large' } },
  ])
  const blob = JSON.stringify(events)
  assert.equal(blob.includes('IMG_1234'), false)
  assert.equal(blob.includes('vacation'), false)
})

test('coarse reasons stay on the small enum', () => {
  assert.equal(coarseAiReason(new Error('Model download failed (404)')), 'model_load')
  assert.equal(coarseAiReason(new Error('The AI worker crashed')), 'model_load')
  assert.equal(coarseAiReason('onnxruntime failed to fetch'), 'model_load')
  assert.equal(coarseAiReason(new Error('Array buffer allocation failed')), 'out_of_memory')
  assert.equal(coarseAiReason(new Error('Could not read the photo')), 'unknown')

  assert.equal(coarsePhotoLoadReason(new Error('That file type is not supported')), 'unsupported')
  assert.equal(coarsePhotoLoadReason(new Error('LibRaw returned no RGB image')), 'decode_error')
  assert.equal(coarsePhotoLoadReason(new Error('something else')), 'unknown')
  assert.equal(coarsePhotoLoadReason(new Error('out of memory')), 'too_large')

  assert.equal(coarseExportReason(new Error('Could not create export canvas')), 'encode')
  assert.equal(coarseExportReason(new Error('out of memory')), 'out_of_memory')
  assert.equal(coarseExportReason(new Error('network blip')), 'unknown')
})

test('file extensions are lowercase and nothing else', () => {
  assert.equal(fileExtension('Photo.JPEG'), 'jpeg')
  assert.equal(fileExtension('C:\\Users\\me\\DSC.NEF'), 'nef')
  assert.equal(fileExtension('/home/me/roll.dng'), 'dng')
  assert.equal(fileExtension('.hidden'), 'unknown')
  assert.equal(fileExtension('noext'), 'unknown')
  assert.equal(fileExtension('weird.cr3 extra'), 'unknown')
})

test('export batch size is bucketed without dropping count or format', () => {
  const events = capture()
  trackExportCompleted(1, 'jpeg')
  trackExportCompleted(4, 'png')
  trackExportCompleted(12, 'webp')
  trackExportCompleted(21, 'jpeg')
  assert.deepEqual(events.map((event) => event.props), [
    { count: '1', format: 'jpeg', batch_size: '1' },
    { count: '4', format: 'png', batch_size: '2-5' },
    { count: '12', format: 'webp', batch_size: '6-20' },
    { count: '21', format: 'jpeg', batch_size: '21+' },
  ])
  assert.equal(batchSizeBucket(0), '1')
  assert.equal(batchSizeBucket(5), '2-5')
  assert.equal(batchSizeBucket(6), '6-20')
  assert.equal(batchSizeBucket(20), '6-20')
})

test('edit patches map to the tool that changed', () => {
  assert.deepEqual(toolsForEditPatch({ exposure: 0.4, contrast: 10 }), ['adjustments'])
  assert.deepEqual(toolsForEditPatch({ vignette: -20, grain: 10 }), ['effects'])
  assert.deepEqual(toolsForEditPatch({ hsl: {}, colorGrading: {} }).sort(), ['color'])
  assert.deepEqual(toolsForEditPatch({ toneCurve: { points: [] } }), ['tone_curve'])
  assert.deepEqual(toolsForEditPatch({ crop: { straighten: 2 } }), ['crop'])
  assert.deepEqual(toolsForEditPatch({ rotate: 90 }), ['rotate'])
  assert.deepEqual(toolsForEditPatch({ rotate: 90, crop: { x: 0 } }), ['rotate'])
  assert.deepEqual(toolsForEditPatch({ liquify: [{}] }), ['liquify'])
  assert.deepEqual(toolsForEditPatch({ background: { mode: 'blur' } }), ['background'])
  assert.deepEqual(toolsForEditPatch({ heal: [{ mode: 'remove' }, { mode: 'heal' }] }).sort(), ['heal', 'remove_objects'])
  assert.deepEqual(toolsForEditPatch({ heal: [] }), [])
  assert.deepEqual(
    toolsForEditPatch({ localAdjustments: [{ type: 'brush' }, { type: 'subject' }] }).sort(),
    ['local', 'subject_mask'],
  )
})

test('preset imports are classified without keeping the file name', () => {
  assert.equal(presetImportTool('look.xmp', ''), 'xmp_import')
  assert.equal(presetImportTool('look.cube', ''), 'lut_import')
  assert.equal(presetImportTool('backup.json', '{"name":"x"}'), 'presets')
  assert.equal(
    presetImportTool('untitled.txt', '<x:xmpmeta xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/">'),
    'xmp_import',
  )
  assert.equal(presetImportTool('untitled.txt', 'LUT_3D_SIZE 33\n'), 'lut_import')
})
