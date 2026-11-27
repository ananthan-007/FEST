'use client'

import React, { useRef, useEffect, useCallback } from 'react'

interface ClickSparkProps {
  sparkColor?: string
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  duration?: number
  children: React.ReactNode
  className?: string
}

interface Spark {
  x: number
  y: number
  angle: number
  startTime: number
}

/**
 * React Bits — ClickSpark
 * Canvas-based radial spark burst on pointer clicks.
 */
export default function ClickSpark({
  sparkColor = '#F4DD9F',
  sparkSize = 9,
  sparkRadius = 18,
  sparkCount = 8,
  duration = 400,
  children,
  className = '',
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparksRef = useRef<Spark[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const resize = () => {
      const { width, height } = parent.getBoundingClientRect()
      canvas.width = width
      canvas.height = height
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(parent)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const draw = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime
        if (elapsed >= duration) return false

        const progress = elapsed / duration
        const eased = 1 - Math.pow(1 - progress, 3)
        const distance = eased * sparkRadius
        const lineLength = sparkSize * (1 - eased)

        const x1 = spark.x + distance * Math.cos(spark.angle)
        const y1 = spark.y + distance * Math.sin(spark.angle)
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle)
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle)

        ctx.strokeStyle = sparkColor
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()

        return true
      })

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [sparkColor, sparkSize, sparkRadius, duration])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const now = performance.now()

      const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
        x,
        y,
        angle: (2 * Math.PI * i) / sparkCount,
        startTime: now,
      }))

      sparksRef.current.push(...newSparks)
    },
    [sparkCount]
  )

  return (
    <div onClick={handleClick} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-50 h-full w-full"
      />
      {children}
    </div>
  )
}
