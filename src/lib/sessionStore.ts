import { cloneEdits, type EditParams, type PhotoSession } from '../types/edits'

/*
 * The open photos survive a reload through IndexedDB. Photo files are big
 * (a camera RAW is tens of MB) and never change, so each is written once into
 * its own store; the session record that is rewritten after every edit holds
 * only names, edits and ratings.
 */

const DB_NAME = 'lightframes-session'
const DB_VERSION = 2
const STORE = 'session'
const FILES = 'files'
const KEY = 'current'

export type PersistedPhoto = {
  id: string
  name: string
  path: string
  fileName: string
  fileType: string
  edits: EditParams
  rating?: number
  flag?: PhotoSession['flag']
  /** Version 1 kept the file inline; read for old sessions, never written. */
  file?: Blob
}

export type PersistedSession = {
  photos: PersistedPhoto[]
  activeId: string | null
  selectedIds: string[]
  updatedAt: string
}

/** A restored photo with its file, whichever store it came from. */
export type RestoredPhoto = PersistedPhoto & { file: Blob }

/** Photo ids whose file is already in FILES, so saves skip rewriting it. */
const storedFiles = new Set<string>()

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
      if (!db.objectStoreNames.contains(FILES)) db.createObjectStore(FILES)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
  })
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'))
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'))
  })
}

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'))
  })
}

let saving: Promise<void> = Promise.resolve()

/**
 * Save the session; files are written only for photos not stored yet, and
 * dropped with their photo. Saves run one after another, so a slow first
 * save (all the files) can't make the next one write them again.
 */
export function saveSessionSnapshot(session: PersistedSession, files: Map<string, Blob>): Promise<void> {
  saving = saving.catch(() => {}).then(() => writeSession(session, files))
  return saving
}

async function writeSession(session: PersistedSession, files: Map<string, Blob>): Promise<void> {
  const db = await openDb()
  try {
    const tx = db.transaction([STORE, FILES], 'readwrite')
    const fileStore = tx.objectStore(FILES)
    const ids = new Set(session.photos.map((p) => p.id))
    for (const [id, file] of files) {
      if (!storedFiles.has(id)) fileStore.put(file, id)
    }
    for (const id of storedFiles) {
      if (!ids.has(id)) fileStore.delete(id)
    }
    tx.objectStore(STORE).put(session, KEY)
    await done(tx)
    storedFiles.clear()
    for (const id of ids) storedFiles.add(id)
  } finally {
    db.close()
  }
}

export async function loadSessionSnapshot(): Promise<(PersistedSession & { photos: RestoredPhoto[] }) | null> {
  const db = await openDb()
  try {
    const tx = db.transaction([STORE, FILES], 'readonly')
    const session = (await request(tx.objectStore(STORE).get(KEY))) as PersistedSession | undefined
    if (!session) return null
    const photos: RestoredPhoto[] = []
    for (const item of session.photos) {
      const file = item.file ?? ((await request(tx.objectStore(FILES).get(item.id))) as Blob | undefined)
      if (!file) continue
      photos.push({ ...item, file })
      // Old sessions kept files inline: they still have to be written once to FILES.
      if (!item.file) storedFiles.add(item.id)
    }
    return { ...session, photos }
  } finally {
    db.close()
  }
}

/** Forget the session and every stored file (queued behind any save in progress). */
export function clearSessionSnapshot(): Promise<void> {
  saving = saving.catch(() => {}).then(clearSession)
  return saving
}

async function clearSession(): Promise<void> {
  const db = await openDb()
  try {
    const tx = db.transaction([STORE, FILES], 'readwrite')
    tx.objectStore(STORE).delete(KEY)
    tx.objectStore(FILES).clear()
    await done(tx)
    storedFiles.clear()
  } finally {
    db.close()
  }
}

export function photosToPersisted(photos: PhotoSession[]): PersistedPhoto[] {
  return photos.map((photo) => ({
    id: photo.id,
    name: photo.name,
    path: photo.path,
    fileName: photo.file.name,
    fileType: photo.file.type,
    edits: cloneEdits(photo.edits),
    rating: photo.rating,
    flag: photo.flag,
  }))
}
