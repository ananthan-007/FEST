'use client'

import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface TiltedCardProps {
  children: React.ReactNode
  className?: string
  rotateAmplitude?: number
  scaleOnHover?: number
  showGlare?: boolean
}

const springConfig = {
  damping: 24,
  stiffness: 180,
  mass: 0.8,
}

/**
 * React Bits — TiltedCard
 * Interactive 3D perspective card with spring physics and specular glare.
 */
export default function TiltedCard({
  children,
  className = '',
  rotateAmplitude = 9,
  scaleOnHover = 1.015,
  showGlare = true,
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const rotateX = useSpring(useMotionValue(0), springConfig)
  const rotateY = useSpring(useMotionValue(0), springConfig)
  const scale = useSpring(1, springConfig)
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left - rect.width / 2
    const offsetY = e.clientY - rect.top - rect.height / 2

    const rotX = (offsetY / (rect.height / 2)) * -rotateAmplitude
    const rotY = (offsetX / (rect.width / 2)) * rotateAmplitude

    rotateX.set(rotX)
    rotateY.set(rotY)

    if (showGlare) {
      setGlare({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
        opacity: 0.14,
      })
    }
  }

  const handleMouseEnter = () => {
    scale.set(scaleOnHover)
  }

  const handleMouseLeave = () => {
    scale.set(1)
    rotateX.set(0)
    rotateY.set(0)
    setGlare((g) => ({ ...g, opacity: 0 }))
  }

  return (
    <div style={{ perspective: 1000 }} className="w-full">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
        }}
        className={`relative will-change-transform ${className}`}
      >
        {children}
        {showGlare && (
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
            style={{
              opacity: glare.opacity,
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.45), transparent 55%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  )
}
