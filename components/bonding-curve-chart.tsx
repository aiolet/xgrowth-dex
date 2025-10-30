"use client"

import { useEffect, useRef } from "react"

interface BondingCurveChartProps {
  progress: number
}

export function BondingCurveChart({ progress }: BondingCurveChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Draw bonding curve
    const padding = 20
    const width = rect.width - padding * 2
    const height = rect.height - padding * 2

    // Draw axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, padding + height)
    ctx.lineTo(padding + width, padding + height)
    ctx.stroke()

    // Draw curve
    ctx.strokeStyle = "hsl(var(--primary))"
    ctx.lineWidth = 2
    ctx.beginPath()

    for (let i = 0; i <= 100; i++) {
      const x = padding + (i / 100) * width
      // Quadratic bonding curve: y = x^2
      const normalizedY = Math.pow(i / 100, 1.5)
      const y = padding + height - normalizedY * height
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    // Draw progress indicator
    const progressX = padding + (progress / 100) * width
    const progressNormalizedY = Math.pow(progress / 100, 1.5)
    const progressY = padding + height - progressNormalizedY * height

    // Draw vertical line
    ctx.strokeStyle = "hsl(var(--accent))"
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(progressX, padding + height)
    ctx.lineTo(progressX, progressY)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw point
    ctx.fillStyle = "hsl(var(--accent))"
    ctx.beginPath()
    ctx.arc(progressX, progressY, 4, 0, Math.PI * 2)
    ctx.fill()

    // Draw labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
    ctx.font = "10px sans-serif"
    ctx.fillText("Supply", padding + width - 30, padding + height + 15)
    ctx.save()
    ctx.translate(padding - 10, padding + height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText("Price", 0, 0)
    ctx.restore()
  }, [progress])

  return <canvas ref={canvasRef} className="h-[200px] w-full" />
}
