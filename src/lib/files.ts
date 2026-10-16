const IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png'])

export function isSupportedImage(file: File): boolean {
  if (IMAGE_TYPES.has(file.type.toLowerCase())) return true
  const name = file.name.toLowerCase()
  return name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')
}

export async function pickImageFiles(): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,.jpg,.jpeg,.png'
    input.multiple = true
    input.onchange = () => {
      const files = Array.from(input.files ?? []).filter(isSupportedImage)
      resolve(files)
    }
    input.click()
  })
}

type DirectoryHandleLike = {
  values: () => AsyncIterableIterator<{
    kind: string
    getFile: () => Promise<File>
  }>
}

/** Open a folder when File System Access API is available; otherwise fall back to multi-file pick. */
export async function openImages(): Promise<File[]> {
  const w = window as Window & {
    showDirectoryPicker?: () => Promise<DirectoryHandleLike>
  }

  if (typeof w.showDirectoryPicker === 'function') {
    try {
      const handle = await w.showDirectoryPicker()
      const files: File[] = []
      for await (const entry of handle.values()) {
        if (entry.kind !== 'file') continue
        const file = await entry.getFile()
        if (isSupportedImage(file)) files.push(file)
      }
      files.sort((a, b) => a.name.localeCompare(b.name))
      if (files.length > 0) return files
    } catch (err) {
      // User cancelled or API denied — fall through to file picker
      if (err instanceof DOMException && err.name === 'AbortError') return []
    }
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
