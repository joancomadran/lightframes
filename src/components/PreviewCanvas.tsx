import { useEffect, useRef } from 'react'
import { renderEditedImage } from '../lib/imageProcessing'
import type { EditParams } from '../types/edits'

type PreviewCanvasProps = {
  src: string | null
  edits: EditParams
  name?: string
}

export function PreviewCanvas({ src, edits, name }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const frameRef = useRef(0)

  useEffect(() => {
    if (!src) {
      imageRef.current = null
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx?.clearRect(0, 0, canvas.width, canvas.height)
        canvas.width = 0
        canvas.height = 0
      }
      return
    }

    let cancelled = false
    const img = new Image()
    img.src = src
    img.decode().then(() => {
      if (cancelled) return
      imageRef.current = img
      const canvas = canvasRef.current
      if (!canvas) return
      renderEditedImage(img, edits, canvas)
    })

    return () => {
      cancelled = true
    }
    // Only reload when source changes; edits handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  useEffect(() => {
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      const img = imageRef.current
      const canvas = canvasRef.current
      if (!img || !canvas || !src) return
      renderEditedImage(img, edits, canvas)
    })
    return () => cancelAnimationFrame(frameRef.current)
  }, [edits, src])

  if (!src) {
    return (
      <div className="preview preview--empty">
        <p className="preview__empty-title">Drop light into a frame</p>
        <p className="preview__empty-copy">
          Open JPEG or PNG files to preview edits live on the canvas.
        </p>
      </div>
    )
  }

  return (
    <div className="preview">
      <canvas ref={canvasRef} className="preview__canvas" aria-label={name ?? 'Preview'} />
    </div>
  )
}
