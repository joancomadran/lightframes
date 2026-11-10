import { track } from '@vercel/analytics'

/**
 * Cookieless Vercel Web Analytics custom events.
 * Props are short, low-cardinality strings. Never file names, image bytes,
 * EXIF, sizes, or any user or session identifier.
 * Every send is wrapped so analytics cannot throw or block the editor.
 */

export const EDITOR_TOOLS = [
  'adjustments',
  'color',
  'effects',
  'tone_curve',
  'crop',
  'rotate',
  'heal',
  'remove_objects',
  'liquify',
  'local',
  'subject_mask',
  'background',
  'presets',
  'copy_edits',
  'paste_edits',
  'batch_apply',
  'xmp_import',
  'lut_import',
  'compare',
  'collage',
  'carousel',
  'panorama',
  'upscale',
  'histogram',
] as const

export type EditorTool = (typeof EDITOR_TOOLS)[number]

/** On-device model runs. `cutout` is the shared subject model (background and subject masks). */
export type AiFeature = 'remove_objects' | 'cutout' | 'upscale'

export type AiFailReason = 'model_load' | 'out_of_memory' | 'unknown'

export type PhotoLoadFailReason = 'unsupported' | 'decode_error' | 'too_large' | 'unknown'

export type ExportFailReason = 'encode' | 'out_of_memory' | 'unknown'

export type BatchSizeBucket = '1' | '2-5' | '6-20' | '21+'

export type PresetImportTool = 'xmp_import' | 'lut_import' | 'presets'

type AnalyticsProps = Record<string, string>
type AnalyticsTransport = (name: string, props?: AnalyticsProps) => void

const ADJUSTMENT_KEYS = new Set([
  'exposure',
  'contrast',
  'highlights',
  'shadows',
  'whites',
  'blacks',
  'temperature',
  'tint',
  'vibrance',
  'saturation',
  'texture',
  'clarity',
  'dehaze',
])

const EFFECT_KEYS = new Set([
  'vignette',
  'vignetteMidpoint',
  'grain',
  'grainSize',
  'sharpening',
  'noiseReduction',
  'colorNoiseReduction',
])

const toolsUsed = new Set<string>()

function defaultTransport(name: string, props?: AnalyticsProps): void {
  if (props && Object.keys(props).length > 0) track(name, props)
  else track(name)
}

let transport: AnalyticsTransport = defaultTransport

function emit(name: string, props?: AnalyticsProps): void {
  try {
    transport(name, props)
  } catch {
    // Analytics must never throw or block the UI.
  }
}

function errorText(error: unknown): string {
  try {
    if (error instanceof Error) return error.message.toLowerCase()
    if (typeof error === 'string') return error.toLowerCase()
  } catch {
    // A hostile error object must not escape classification.
  }
  return ''
}

function isMemoryError(message: string): boolean {
  return /out of memory|allocation failed|invalid array length|array buffer|oom\b/.test(message)
}

/** Lowercased extension only (`CR2` → `cr2`). Anything else is `unknown`. */
export function fileExtension(fileName: string): string {
  try {
    const base = fileName.split(/[/\\]/).pop() ?? ''
    const dot = base.lastIndexOf('.')
    if (dot <= 0 || dot === base.length - 1) return 'unknown'
    const ext = base.slice(dot + 1).toLowerCase()
    return /^[a-z0-9]{1,8}$/.test(ext) ? ext : 'unknown'
  } catch {
    return 'unknown'
  }
}

export function batchSizeBucket(count: number): BatchSizeBucket {
  const n = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0
  if (n <= 1) return '1'
  if (n <= 5) return '2-5'
  if (n <= 20) return '6-20'
  return '21+'
}

export function coarseAiReason(error: unknown): AiFailReason {
  const message = errorText(error)
  if (isMemoryError(message)) return 'out_of_memory'
  if (
    /model download|download failed|download is corrupted|corrupted|worker crashed|onnx|webgpu|no available backend|failed to fetch|networkerror|wasm/.test(
      message,
    )
  ) {
    return 'model_load'
  }
  return 'unknown'
}

export function coarsePhotoLoadReason(error: unknown): PhotoLoadFailReason {
  const message = errorText(error)
  if (isMemoryError(message)) return 'too_large'
  if (/unsupported|not supported|unknown format|invalid file type/.test(message)) return 'unsupported'
  if (
    /decode|libraw|could not open|could not read|failed to encode|invalid image|not a valid|corrupt/.test(
      message,
    )
  ) {
    return 'decode_error'
  }
  return 'unknown'
}

export function coarseExportReason(error: unknown): ExportFailReason {
  const message = errorText(error)
  if (isMemoryError(message)) return 'out_of_memory'
  if (/canvas|blob|encode|zip|prepare image|could not create export|could not read the photo/.test(message)) {
    return 'encode'
  }
  return 'unknown'
}

/** Which tool an edit patch actually changed. Empty lists (a clear) report nothing. */
export function toolsForEditPatch(patch: Record<string, unknown>): EditorTool[] {
  const tools = new Set<EditorTool>()
  for (const key of Object.keys(patch)) {
    if (ADJUSTMENT_KEYS.has(key)) tools.add('adjustments')
    else if (EFFECT_KEYS.has(key)) tools.add('effects')
    else if (key === 'hsl' || key === 'colorGrading') tools.add('color')
    else if (key === 'toneCurve') tools.add('tone_curve')
    else if (key === 'crop') {
      // A quarter-turn refits the crop in the same patch. That is rotation, not a crop.
      if (!Object.prototype.hasOwnProperty.call(patch, 'rotate')) tools.add('crop')
    } else if (key === 'rotate') tools.add('rotate')
    else if (key === 'liquify') tools.add('liquify')
    else if (key === 'background') tools.add('background')
    else if (key === 'localAdjustments') addMaskTools(tools, patch.localAdjustments)
    else if (key === 'heal') addHealTools(tools, patch.heal)
  }
  return [...tools]
}

function addMaskTools(tools: Set<EditorTool>, value: unknown): void {
  if (!Array.isArray(value) || value.length === 0) return
  let subject = false
  let other = false
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    if ((item as { type?: string }).type === 'subject') subject = true
    else other = true
  }
  if (subject) tools.add('subject_mask')
  if (other) tools.add('local')
}

function addHealTools(tools: Set<EditorTool>, value: unknown): void {
  if (!Array.isArray(value) || value.length === 0) return
  let remove = false
  let heal = false
  for (const spot of value) {
    if (!spot || typeof spot !== 'object') continue
    if ((spot as { mode?: string }).mode === 'remove') remove = true
    else heal = true
  }
  if (remove) tools.add('remove_objects')
  if (heal) tools.add('heal')
}

/** Same signals as the XMP / CUBE importers, kept local so this module stays free of editor imports. */
function looksLikeXmp(text: string): boolean {
  const head = text.slice(0, 2048)
  return /<x:xmpmeta\b/i.test(head) || /xmlns:crs=/i.test(head) || /<(?:crs|lr):[A-Za-z]/i.test(head)
}

function looksLikeCube(text: string): boolean {
  return /LUT_3D_SIZE\s+\d+/i.test(text.slice(0, 8192))
}

/** XMP and .cube imports are their own tools; JSON backups count as presets. */
export function presetImportTool(fileName: string, text: string): PresetImportTool {
  const ext = fileExtension(fileName)
  if (ext === 'xmp' || looksLikeXmp(text)) return 'xmp_import'
  if (ext === 'cube' || looksLikeCube(text)) return 'lut_import'
  return 'presets'
}

export function trackEditorOpened(): void {
  emit('editor_opened')
}

export function trackPhotoLoaded(fileType: 'raw' | 'jpeg' | 'png' | 'other'): void {
  emit('photo_loaded', { file_type: fileType })
}

export function trackPhotoLoadFailed(fileName: string, reason: PhotoLoadFailReason): void {
  emit('photo_load_failed', { file_type: fileExtension(fileName), reason })
}

export function trackExportCompleted(count: number, format: string): void {
  emit('export_completed', {
    count: String(count),
    format,
    batch_size: batchSizeBucket(count),
  })
}

export function trackExportFailed(format: string, reason: ExportFailReason): void {
  emit('export_failed', { format, reason })
}

export function trackPresetApplied(kind: 'builtin' | 'saved' | 'imported' | 'free_pack'): void {
  emit('preset_applied', { kind })
}

export function trackFreePackDownload(look: string): void {
  emit('free_pack_download', { look })
}

/** Once per tool for this page load. Repeat uses in the same editor session are dropped. */
export function trackToolUsed(tool: EditorTool): void {
  try {
    if (toolsUsed.has(tool)) return
    toolsUsed.add(tool)
    emit('tool_used', { tool })
  } catch {
    // Dedupe bookkeeping must not surface to the UI.
  }
}

export function trackEditTools(patch: Record<string, unknown>): void {
  try {
    for (const tool of toolsForEditPatch(patch)) trackToolUsed(tool)
  } catch {
    // Classification must not surface to the UI.
  }
}

export function trackLocalTool(type: string | undefined): void {
  trackToolUsed(type === 'subject' ? 'subject_mask' : 'local')
}

export function trackAiFeatureCompleted(feature: AiFeature): void {
  emit('ai_feature_completed', { feature })
}

export function trackAiFeatureFailed(feature: AiFeature, reason: AiFailReason): void {
  emit('ai_feature_failed', { feature, reason })
}

/** @internal Swaps the sender and clears the per-session tool dedupe. */
export function setAnalyticsTransportForTests(next: AnalyticsTransport | null): void {
  toolsUsed.clear()
  transport = next ?? defaultTransport
}
