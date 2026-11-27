'use client'

import React, { useRef, useState } from 'react'

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
}

/**
 * React Bits — SpotlightCard (DHRUVA Obsidian & Metallic Gold)
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(204, 137, 47, 0.2)',
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!divRef.current || isFocused) return
    const rect = divRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={() => {
        setIsFocused(true)
        setOpacity(0.6)
      }}
      onBlur={() => {
        setIsFocused(false)
        setOpacity(0)
      }}
      onMouseEnter={() => setOpacity(0.75)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-2xl border border-[#3A291B]/90 bg-[#0D0C0A]/90 backdrop-blur-xl shadow-[0_14px_36px_rgba(0,0,0,0.65)] ${className}`}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px z-20 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(520px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 48%)`,
        }}
      />
      {children}
    </div>
  )
}
