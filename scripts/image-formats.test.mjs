import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { coarsePhotoLoadReason } from '../src/lib/analytics.ts'
import { editorCopy } from '../src/lib/editorCopy.ts'
import { imageInputAccept, imagePickerAccept, isSupportedImage } from '../src/lib/files.ts'
import { decodeHeicToJpegBlob, heicDecodeError, isHeicFile } from '../src/lib/heicDecode.ts'
import { imageForSession } from '../src/lib/imageImport.ts'
import { buildExportFilename } from '../src/lib/imageProcessing.ts'
import { DEFAULT_EXPORT_OPTIONS } from '../src/types/edits.ts'

const here = dirname(fileURLToPath(import.meta.url))
const tinyHeic = readFileSync(join(here, '../e2e/fixtures/tiny.heic'))

function file(name, type, bytes = [1, 2, 3]) {
  return new File([Uint8Array.from(bytes)], name, { type })
}

test('webp and heic files are accepted by extension and mime type', () => {
  assert.equal(isSupportedImage(file('shot.webp', '')), true)
  assert.equal(isSupportedImage(file('shot.WEBP', 'application/octet-stream')), true)
  assert.equal(isSupportedImage(file('download', 'image/webp')), true)
  assert.equal(isSupportedImage(file('IMG_1234.heic', '')), true)
  assert.equal(isSupportedImage(file('IMG_1234.HEIC', 'application/octet-stream')), true)
  assert.equal(isSupportedImage(file('IMG_1234.heif', '')), true)
  assert.equal(isSupportedImage(file('burst', 'image/heic')), true)
  assert.equal(isSupportedImage(file('burst', 'image/heif')), true)
  assert.equal(isSupportedImage(file('burst', 'image/heic-sequence')), true)
  assert.equal(isSupportedImage(file('notes.txt', 'text/plain')), false)
  assert.equal(isSupportedImage(file('photo.gif', 'image/gif')), false)
  assert.equal(isHeicFile(file('shot.webp', 'image/webp')), false)
  assert.equal(isHeicFile(file('photo.cr3', '')), false)
  assert.equal(isHeicFile(file('IMG_1234.heif', '')), true)
})

test('file pickers list webp and heic', () => {
  const accept = imageInputAccept()
  for (const token of ['.webp', '.WEBP', '.heic', '.HEIC', '.heif', '.HEIF', 'image/webp', 'image/heic', 'image/heif']) {
    assert.equal(accept.split(',').includes(token), true, token)
  }
  const picker = imagePickerAccept()
  assert.deepEqual(picker['image/webp'], ['.webp', '.WEBP'])
  assert.deepEqual(picker['image/heic'], ['.heic', '.HEIC'])
  assert.deepEqual(picker['image/heif'], ['.heif', '.HEIF'])
  assert.equal(picker['image/jpeg'].includes('.jpg'), true)
  assert.equal(picker['application/octet-stream'].includes('.cr3'), true)
})

test('webp stays the original file and is not sent through the heic decoder', async () => {
  const webp = file('frame.webp', 'image/webp')
  assert.equal(await imageForSession(webp), webp)
  const jpeg = file('frame.jpg', 'image/jpeg')
  assert.equal(await imageForSession(jpeg), jpeg)
})

test('heic decode uses the browser when it can, otherwise the lazy decoder', async () => {
  const heic = file('IMG_1234.heic', 'image/heic', tinyHeic)
  let wasmCalls = 0
  const native = new Blob([Uint8Array.from([9, 9, 9])], { type: 'image/jpeg' })
  const decoded = await decodeHeicToJpegBlob(heic, {
    tryNative: async () => native,
    decodeWithWasm: async () => {
      wasmCalls += 1
      return new Blob([Uint8Array.from([1])], { type: 'image/jpeg' })
    },
  })
  assert.equal(wasmCalls, 0)
  assert.equal(decoded, native)

  const calls = []
  const fallback = await decodeHeicToJpegBlob(file('IMG_5678.heif', 'image/heif'), {
    tryNative: async () => null,
    decodeWithWasm: async (blob) => {
      calls.push(blob)
      return new Blob([Uint8Array.from([4, 5])], { type: 'image/jpeg' })
    },
  })
  assert.equal(calls.length, 1)
  assert.equal(fallback.type, 'image/jpeg')
  assert.equal(fallback.size, 2)
})

test('a broken heic reports a decode error and does not invent a photo', async () => {
  const broken = file('broken.heic', 'image/heic', [0, 1, 2, 3])
  await assert.rejects(
    () =>
      decodeHeicToJpegBlob(broken, {
        tryNative: async () => null,
        decodeWithWasm: async () => {
          throw new Error('HEIF processing error')
        },
      }),
    (error) => {
      assert.equal(error instanceof Error, true)
      assert.match(error.message, /broken\.heic/)
      assert.match(error.message, /corrupted/)
      assert.equal(coarsePhotoLoadReason(error), 'decode_error')
      return true
    },
  )

  await assert.rejects(
    () =>
      decodeHeicToJpegBlob(file('empty.heif', 'image/heif'), {
        tryNative: async () => new Blob([], { type: 'image/jpeg' }),
        decodeWithWasm: async () => new Blob([], { type: 'image/jpeg' }),
      }),
    /empty\.heif/,
  )
  assert.match(heicDecodeError('IMG_1234.heic').message, /corrupted/)
})

test('export keeps the original file stem when the extension changes', () => {
  const jpeg = { ...DEFAULT_EXPORT_OPTIONS, format: 'jpeg' }
  assert.equal(buildExportFilename('IMG_1234.heic', jpeg), 'IMG_1234-edited.jpg')
  assert.equal(buildExportFilename('IMG_1234.HEIF', { ...jpeg, filenamePattern: '{name}' }), 'IMG_1234.jpg')
  assert.equal(buildExportFilename('frame.webp', { ...DEFAULT_EXPORT_OPTIONS, format: 'png' }), 'frame-edited.png')
  assert.equal(buildExportFilename('frame.webp', { ...DEFAULT_EXPORT_OPTIONS, format: 'webp' }), 'frame-edited.webp')
})

test('editor hints mention heic and webp in both languages', () => {
  for (const lang of ['en', 'es']) {
    const copy = editorCopy(lang)
    const hints = [copy.empty.features[0], copy.toolbar.openTitle, copy.filmstrip.openTitle, copy.status.unsupportedType].join('\n')
    assert.match(hints, /HEIC/)
    assert.match(hints, /WebP/)
    assert.match(copy.status.decodingHeicFile('IMG_1234.heic', 2, 3), /IMG_1234\.heic/)
    assert.match(copy.status.decodingHeicFile('IMG_1234.heic', 2, 3), /…/)
  }
  assert.equal(editorCopy('en').empty.nothingUploaded, 'Nothing uploaded')
  assert.equal(editorCopy('es').empty.nothingUploaded, 'Sin subir archivos')
  assert.equal(editorCopy('en').status.heicCorrupt('IMG_1234.heic').includes('corrupted'), true)
  assert.match(editorCopy('es').status.heicCorrupt('IMG_1234.heic'), /dañado/)
  assert.equal(editorCopy('en').status.decodingHeic(2), 'Decoding 2 HEIC files…')
  assert.equal(editorCopy('es').status.decodingHeic(1), 'Decodificando HEIC…')
})
