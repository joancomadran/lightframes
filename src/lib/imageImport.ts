import { decodeHeicToJpegBlob, isHeicFile } from './heicDecode'
import { decodeRawToJpegBlob, isRawFile } from './rawDecode'

/**
 * Blob the editor can paint. RAW and HEIC become JPEG; WebP, JPEG, and PNG
 * stay as the original file so export still has the full source.
 */
export async function imageForSession(file: File): Promise<Blob> {
  if (isRawFile(file)) return decodeRawToJpegBlob(file)
  if (isHeicFile(file)) return decodeHeicToJpegBlob(file)
  return file
}
