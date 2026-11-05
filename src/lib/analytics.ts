import { track } from '@vercel/analytics'

/** Cookieless Vercel Web Analytics custom events — no file names, paths, or image data. */

export function trackEditorOpened(): void {
  track('editor_opened')
}

export function trackPhotoLoaded(fileType: 'raw' | 'jpeg' | 'png' | 'other'): void {
  track('photo_loaded', { file_type: fileType })
}

export function trackExportCompleted(count: number, format: string): void {
  track('export_completed', { count: String(count), format })
}

export function trackPresetApplied(kind: 'builtin' | 'saved' | 'imported' | 'free_pack'): void {
  track('preset_applied', { kind })
}

export function trackFreePackDownload(look: string): void {
  track('free_pack_download', { look })
}
