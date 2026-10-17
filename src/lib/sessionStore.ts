import {
  DEFAULT_EDITS,
  cloneEdits,
  normalizeEdits,
  type EditParams,
  type PhotoSession,
} from '../types/edits'

const DB_NAME = 'lightframes-session'
const DB_VERSION = 1
const STORE = 'session'
const KEY = 'current'

export type PersistedPhoto = {
  id: string
  name: string
  path: string
  file: Blob
  fileName: string
  fileType: string
  edits: EditParams
}

export type PersistedSession = {
  photos: PersistedPhoto[]
  activeId: string | null
  selectedIds: string[]
  updatedAt: string
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
  })
}

export async function saveSessionSnapshot(session: PersistedSession): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(session, KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB write failed'))
  })
  db.close()
}

export async function loadSessionSnapshot(): Promise<PersistedSession | null> {
  const db = await openDb()
  const value = await new Promise<PersistedSession | null>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(KEY)
    req.onsuccess = () => resolve((req.result as PersistedSession | undefined) ?? null)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB read failed'))
  })
  db.close()
  return value
}

export async function clearSessionSnapshot(): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB clear failed'))
  })
  db.close()
}

export function photosToPersisted(photos: PhotoSession[]): PersistedPhoto[] {
  return photos.map((photo) => ({
    id: photo.id,
    name: photo.name,
    path: photo.path,
    file: photo.file,
    fileName: photo.file.name,
    fileType: photo.file.type,
    edits: cloneEdits(photo.edits),
  }))
}

export async function persistedToPhotos(
  persisted: PersistedPhoto[],
): Promise<PhotoSession[]> {
  const photos: PhotoSession[] = []
  for (const item of persisted) {
    const file =
      item.file instanceof File
        ? item.file
        : new File([item.file], item.fileName || item.name, {
            type: item.fileType || item.file.type || 'application/octet-stream',
          })
    const objectUrl = URL.createObjectURL(
      // Prefer already-decoded working JPEG when original was RAW and we stored the
      // decoded preview blob under the photo session — here we store original file.
      // Session restore re-opens the original; RAW will be re-decoded by caller.
      file,
    )
    const edits = normalizeEdits(item.edits) ?? cloneEdits(DEFAULT_EDITS)
    photos.push({
      id: item.id,
      name: item.name,
      path: item.path,
      objectUrl,
      file,
      edits,
      thumbnailUrl: objectUrl,
    })
  }
  return photos
}
