import type { AiReply, AiRequest, ModelId } from './aiModels'

/*
 * Client for the on-device models: the CPU worker (ai.worker.ts: inpaint,
 * segment) and the WebGPU one (upscale.worker.ts), a status per model for the
 * UI, and a version that bumps whenever a result lands so renders that had to
 * skip it can redo.
 */

export type { ModelId }

/** Must match the worker: the segmentation model's square input. */
export const SEGMENT_SIZE = 1024

export type AiStatus =
  | { phase: 'idle' }
  | { phase: 'downloading'; progress: number }
  | { phase: 'working'; progress?: number }
  | { phase: 'error'; message: string }

const IDLE: AiStatus = { phase: 'idle' }
const statuses: Record<ModelId, AiStatus> = { inpaint: IDLE, segment: IDLE, upscale: IDLE }
const running: Record<ModelId, number> = { inpaint: 0, segment: 0, upscale: 0 }
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

type Pending = {
  model: ModelId
  resolve: (data: Uint8ClampedArray) => void
  reject: (err: Error) => void
  onProgress?: (fraction: number) => void
}

let nextId = 1
const pending = new Map<number, Pending>()

function settle(model: ModelId) {
  running[model]--
  if (running[model] === 0 && statuses[model].phase === 'working') setStatus(model, IDLE)
}

function onReply(e: MessageEvent<AiReply>) {
  const reply = e.data
  if (reply.kind === 'progress') {
    setStatus(reply.model, { phase: 'downloading', progress: reply.total ? reply.loaded / reply.total : 0 })
  } else if (reply.kind === 'ready') {
    if (statuses[reply.model].phase === 'downloading') {
      setStatus(reply.model, running[reply.model] > 0 ? { phase: 'working' } : IDLE)
    }
  } else if (reply.kind === 'step') {
    const job = pending.get(reply.id)
    if (!job) return
    const progress = reply.done / reply.total
    setStatus(job.model, { phase: 'working', progress })
    job.onProgress?.(progress)
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

type WorkerSlot = { worker: Worker | null; create: () => Worker }

// Two workers: upscaling needs the (bigger) WebGPU build of the runtime, the rest doesn't.
const cpu: WorkerSlot = {
  worker: null,
  create: () => new Worker(new URL('./ai.worker.ts', import.meta.url), { type: 'module' }),
}
const gpu: WorkerSlot = {
  worker: null,
  create: () => new Worker(new URL('./upscale.worker.ts', import.meta.url), { type: 'module' }),
}

function getWorker(model: ModelId): Worker {
  const slot = model === 'upscale' ? gpu : cpu
  if (slot.worker) return slot.worker
  const worker = slot.create()
  worker.onmessage = onReply
  worker.onerror = (e) => {
    e.preventDefault()
    slot.worker = null
    for (const [id, job] of pending) {
      if ((job.model === 'upscale') !== (slot === gpu)) continue
      pending.delete(id)
      running[job.model] = 0
      setStatus(job.model, { phase: 'error', message: 'The AI worker crashed' })
      job.reject(new Error('The AI worker crashed'))
    }
  }
  slot.worker = worker
  return worker
}

/** Start downloading a model early (e.g. when its tool is picked). */
export function preloadModel(model: ModelId): void {
  getWorker(model).postMessage({ kind: 'load', model } satisfies AiRequest)
}

type Job = DistributiveOmit<Exclude<AiRequest, { kind: 'load' }>, 'id'>
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

/** Run a model; buffers in the job are transferred to the worker. */
export function runModel(job: Job, onProgress?: (fraction: number) => void): Promise<Uint8ClampedArray> {
  const model = job.kind
  return new Promise((resolve, reject) => {
    const id = nextId++
    pending.set(id, { model, resolve, reject, onProgress })
    running[model]++
    if (statuses[model].phase !== 'downloading') setStatus(model, { phase: 'working' })
    const request = { ...job, id } as AiRequest
    const transfer: Transferable[] =
      job.kind === 'inpaint' ? [job.rgba.buffer, job.mask.buffer] : [job.rgba.buffer]
    getWorker(model).postMessage(request, transfer)
  })
}
