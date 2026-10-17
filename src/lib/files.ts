const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/x-sony-arw',
  'image/arw',
])

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.arw'] as const

export function isSupportedImage(file: File): boolean {
  const name = file.name.toLowerCase()
  if (IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext))) return true
  if (file.type && IMAGE_TYPES.has(file.type.toLowerCase())) return true
  return false
}

type OpenFilePickerWindow = Window & {
  showOpenFilePicker?: (options?: {
    multiple?: boolean
    types?: Array<{
      description?: string
      accept: Record<string, string[]>
    }>
  }) => Promise<Array<{ getFile: () => Promise<File> }>>
  showDirectoryPicker?: () => Promise<{
    values: () => AsyncIterableIterator<{
      kind: string
      getFile: () => Promise<File>
    }>
  }>
}

async function pickWithOpenFilePicker(): Promise<File[] | null> {
  const w = window as OpenFilePickerWindow
  if (typeof w.showOpenFilePicker !== 'function') return null

  try {
    const handles = await w.showOpenFilePicker({
      multiple: true,
      types: [
        {
          description: 'Images',
          accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            // Empty MIME + extension is the reliable way to surface Sony RAW
            'application/octet-stream': ['.arw', '.ARW'],
            'image/x-sony-arw': ['.arw', '.ARW'],
          },
        },
      ],
    })
    const files: File[] = []
    for (const handle of handles) {
      const file = await handle.getFile()
      if (isSupportedImage(file)) files.push(file)
    }
    return files
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return []
    return null
  }
}

export async function pickImageFiles(): Promise<File[]> {
  const fromPicker = await pickWithOpenFilePicker()
  if (fromPicker !== null) return fromPicker

  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    // Extension-first accept: MIME-only filters often hide .ARW on macOS
    input.accept = '.jpg,.jpeg,.png,.arw,.ARW,image/jpeg,image/png'
    input.multiple = true

    let settled = false
    const finish = (files: File[]) => {
      if (settled) return
      settled = true
      resolve(files)
    }

    input.onchange = () => {
      finish(Array.from(input.files ?? []).filter(isSupportedImage))
    }
    // Cancel does not always fire change — settle on next focus either way
    window.addEventListener(
      'focus',
      () => {
        window.setTimeout(() => {
          finish(Array.from(input.files ?? []).filter(isSupportedImage))
        }, 400)
      },
      { once: true },
    )
    input.click()
  })
}

async function pickImageFolder(): Promise<File[] | null> {
  const w = window as OpenFilePickerWindow
  if (typeof w.showDirectoryPicker !== 'function') return null

  try {
    const handle = await w.showDirectoryPicker()
    const files: File[] = []
    for await (const entry of handle.values()) {
      if (entry.kind !== 'file') continue
      const file = await entry.getFile()
      if (isSupportedImage(file)) files.push(file)
    }
    files.sort((a, b) => a.name.localeCompare(b.name))
    return files
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return []
    return null
  }
}

/**
 * Open images via multi-file picker (ARW-friendly).
 * Hold Alt/Option while clicking to open a folder instead.
 */
export async function openImages(opts?: { folder?: boolean }): Promise<File[]> {
  if (opts?.folder) {
    const folderFiles = await pickImageFolder()
    if (folderFiles !== null) return folderFiles
  }
  return pickImageFiles()
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
