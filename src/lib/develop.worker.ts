import type { EditParams } from '../types/edits'
import {
  applyDetail,
  applyEditsToImageData,
  type DetailMaps,
  type DetailRegion,
  type DevelopContext,
} from './imageProcessing'

export type DevelopTask = {
  id: number
  kind: 'develop'
  data: Uint8ClampedArray<ArrayBuffer>
  width: number
  rows: number
  edits: EditParams
  linear: { data: Uint16Array; scale: number } | null
  ctx: DevelopContext
}

export type DetailTask = {
  id: number
  kind: 'detail'
  data: Uint8ClampedArray<ArrayBuffer>
  width: number
  rows: number
  edits: EditParams
  region: DetailRegion
  maps: DetailMaps
  /** Rows of `data` to send back (the rest are margins). */
  coreStart: number
  coreEnd: number
}

export type WorkerTask = DevelopTask | DetailTask

export type WorkerReply =
  | { id: number; data: Uint8ClampedArray<ArrayBuffer> }
  | { id: number; error: string }

// The project compiles against the DOM lib, so describe the worker scope by hand.
const scope = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerTask>) => void) | null
  postMessage(message: WorkerReply, transfer?: Transferable[]): void
}

function run(task: WorkerTask): Uint8ClampedArray<ArrayBuffer> {
  if (task.kind === 'develop') {
    const imageData = new ImageData(task.data, task.width, task.rows)
    const linear = task.linear
      ? {
          kind: 'linear' as const,
          width: task.width,
          height: task.rows,
          data: task.linear.data,
          scale: task.linear.scale,
        }
      : undefined
    applyEditsToImageData(imageData, task.edits, linear, task.ctx)
    return imageData.data
  }
  applyDetail(task.data, task.width, task.rows, task.edits, task.region, task.maps)
  return task.data.slice(task.coreStart * task.width * 4, task.coreEnd * task.width * 4)
}

scope.onmessage = (event) => {
  const task = event.data
  try {
    const data = run(task)
    scope.postMessage({ id: task.id, data }, [data.buffer])
  } catch (err) {
    scope.postMessage({ id: task.id, error: err instanceof Error ? err.message : String(err) })
  }
}
