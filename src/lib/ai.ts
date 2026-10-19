import type { AiReply, AiRequest, ModelId } from './ai.worker'

/*
 * Client for the on-device models in ai.worker.ts: one worker, a status per
 * model for the UI, and a version that bumps whenever a result lands so
 * renders that had to skip it can redo.
 */

export type { ModelId }

/** Must match the worker: the segmentation model's square input. */
export const SEGMENT_SIZE = 1024

export type AiStatus =
  | { phase: 'idle' }
  | { phase: 'downloading'; progress: number }
  | { phase: 'working' }
  | { phase: 'error'; message: string }

const IDLE: AiStatus = { phase: 'idle' }
const statuses: Record<ModelId, AiStatus> = { inpaint: IDLE, segment: IDLE }
const running: Record<ModelId, number> = { inpaint: 0, segment: 0 }
let version = 0
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function setStatus(model: ModelId, next: AiStatus) {
  statuses[model] = next
  emit()
}

export function subscribeAi(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const getAiStatus = (model: ModelId) => statuses[model]
export const getAiVersion = () => version

/** A model's output is ready for rendering: let subscribers redraw. */
export function bumpAiVersion(): void {
  version++
  emit()
}

let worker: Worker | null = null
let nextId = 1
const pending = new Map<
  number,
  { model: ModelId; resolve: (data: Uint8ClampedArray) => void; reject: (err: Error) => void }
>()

function settle(model: ModelId) {
  running[model]--
  if (running[model] === 0 && statuses[model].phase === 'working') setStatus(model, IDLE)
}

function getWorker(): Worker {
  if (worker) return worker
  worker = new Worker(new URL('./ai.worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = (e: MessageEvent<AiReply>) => {
    const reply = e.data
    if (reply.kind === 'progress') {
      setStatus(reply.model, { phase: 'downloading', progress: reply.total ? reply.loaded / reply.total : 0 })
    } else if (reply.kind === 'ready') {
      if (statuses[reply.model].phase === 'downloading') {
        setStatus(reply.model, running[reply.model] > 0 ? { phase: 'working' } : IDLE)
      }
    } else if (reply.kind === 'result') {
      const job = pending.get(reply.id)
      pending.delete(reply.id)
      if (!job) return
      settle(job.model)
      job.resolve(reply.data)
    } else {
      const job = reply.id !== null ? pending.get(reply.id) : undefined
      if (reply.id !== null) pending.delete(reply.id)
      if (job) settle(job.model)
      setStatus(reply.model, { phase: 'error', message: reply.message })
      job?.reject(new Error(reply.message))
    }
  }
  worker.onerror = (e) => {
    e.preventDefault()
    worker = null
    for (const job of pending.values()) {
      running[job.model] = 0
      setStatus(job.model, { phase: 'error', message: 'The AI worker crashed' })
      job.reject(new Error('The AI worker crashed'))
    }
    pending.clear()
  }
  return worker
}

/** Start downloading a model early (e.g. when its tool is picked). */
export function preloadModel(model: ModelId): void {
  getWorker().postMessage({ kind: 'load', model } satisfies AiRequest)
}

type Job = DistributiveOmit<Exclude<AiRequest, { kind: 'load' }>, 'id'>
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

/** Run a model; buffers in the job are transferred to the worker. */
export function runModel(job: Job): Promise<Uint8ClampedArray> {
  const model = job.kind
  return new Promise((resolve, reject) => {
    const id = nextId++
    pending.set(id, { model, resolve, reject })
    running[model]++
    if (statuses[model].phase !== 'downloading') setStatus(model, { phase: 'working' })
    const request = { ...job, id } as AiRequest
    const transfer: Transferable[] =
      job.kind === 'inpaint' ? [job.rgba.buffer, job.mask.buffer] : [job.rgba.buffer]
    getWorker().postMessage(request, transfer)
  })
}
