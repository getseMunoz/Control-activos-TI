'use client'

import { useRef, useEffect, useCallback } from 'react'

export function SignaturePad() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hiddenInputRef = useRef<HTMLInputElement>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function initCtx() {
      ctx!.fillStyle = '#ffffff'
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)
      ctx!.strokeStyle = '#1e293b'
      ctx!.fillStyle = '#1e293b'
      ctx!.lineWidth = 2.5
      ctx!.lineCap = 'round'
      ctx!.lineJoin = 'round'
    }

    initCtx()

    function getPos(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect()
      return {
        x: (e.clientX - rect.left) * (canvas!.width / rect.width),
        y: (e.clientY - rect.top) * (canvas!.height / rect.height),
      }
    }

    function onPointerDown(e: PointerEvent) {
      isDrawing.current = true
      canvas!.setPointerCapture(e.pointerId)
      const pos = getPos(e)
      lastPos.current = pos
      ctx!.beginPath()
      ctx!.arc(pos.x, pos.y, ctx!.lineWidth / 2, 0, Math.PI * 2)
      ctx!.fill()
    }

    function onPointerMove(e: PointerEvent) {
      if (!isDrawing.current || !lastPos.current) return
      const pos = getPos(e)
      ctx!.beginPath()
      ctx!.moveTo(lastPos.current.x, lastPos.current.y)
      ctx!.lineTo(pos.x, pos.y)
      ctx!.stroke()
      lastPos.current = pos
    }

    function onPointerUp() {
      if (!isDrawing.current) return
      isDrawing.current = false
      lastPos.current = null
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = canvas!.toDataURL('image/png')
      }
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
    }
  }, [])

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#1e293b'
    ctx.fillStyle = '#1e293b'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = ''
    }
  }, [])

  return (
    <div className="space-y-2">
      <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
        Firma de quien recibe el equipo
      </p>
      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden',
          background: 'white',
        }}
      >
        <canvas
          ref={canvasRef}
          width={640}
          height={200}
          style={{
            display: 'block',
            width: '100%',
            height: '200px',
            cursor: 'crosshair',
            touchAction: 'none',
          }}
        />
      </div>
      <button
        type="button"
        onClick={handleClear}
        style={{
          fontSize: '12px',
          color: '#64748b',
          background: 'none',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '4px 10px',
          cursor: 'pointer',
        }}
      >
        Limpiar firma
      </button>
      <input ref={hiddenInputRef} type="hidden" name="deliverySignatureData" />
    </div>
  )
}
