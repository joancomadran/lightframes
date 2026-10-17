import type { WorkerReply, WorkerTask } from './develop.worker'

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never
export type PoolTask = DistributiveOmit<WorkerTask, 'id'>

type Pending = {
  resolve: (data: Uint8ClampedArray<ArrayBuffer>) => void
  reject: (error: Error) => void
}

const MAX_WORKERS = 6

let workers: Worker[] | null = null
let unavailable = false
let nextId = 1
let cursor = 0
const pending = new Map<number, Pending>()

function failAll(reason: string): void {
  unavailable = true
  for (const worker of workers ?? []) worker.terminate()
  workers = null
  for (const job of pending.values()) job.reject(new Error(reason))
  pending.clear()
}

function onReply(event: MessageEvent<WorkerReply>): void {
  const reply = event.data
  const job = pending.get(reply.id)
  if (!job) return
  pending.delete(reply.id)
  if ('error' in reply) job.reject(new Error(reply.error))
  else job.resolve(reply.data)
}

function getWorkers(): Worker[] | null {
  if (unavailable) return null
  if (workers) return workers
  if (typeof Worker === 'undefined') {
    unavailable = true
    return null
  }
  try {
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4
    const count = Math.max(1, Math.min(MAX_WORKERS, cores - 1))
    workers = Array.from({ length: count }, () => {
      const worker = new Worker(new URL('./develop.worker.ts', import.meta.url), { type: 'module' })
      worker.onmessage = onReply
      worker.onerror = (event) => {
        event.preventDefault()
        failAll('Develop worker crashed')
      }
      return worker
    })
  } catch {
    unavailable = true
    workers = null
  }
  return workers
}

/** Number of develop workers, or 0 when processing must stay on the main thread. */
export function poolSize(): number {
  return getWorkers()?.length ?? 0
}

/** Run one task on the next worker (round-robin). Buffers in `transfer` are moved, not copied. */
export function runInPool(
  task: PoolTask,
  transfer: Transferable[] = [],
): Promise<Uint8ClampedArray<ArrayBuffer>> {
  const pool = getWorkers()
  if (!pool) return Promise.reject(new Error('Workers unavailable'))
  const id = nextId++
  const worker = pool[cursor++ % pool.length]!
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    worker.postMessage({ ...task, id }, transfer)
  })
}
