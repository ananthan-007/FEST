'use client'

import React from 'react'

interface ShinyTextProps {
  text: string
  disabled?: boolean
  speed?: number
  className?: string
}

/**
 * React Bits — ShinyText (Champagne & Metallic Gold sheen)
 */
export default function ShinyText({
  text,
  disabled = false,
  speed = 4,
  className = '',
}: ShinyTextProps) {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${
        disabled ? '' : 'animate-shine'
      } ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(120deg, rgba(204, 137, 47, 0.85) 35%, rgba(244, 221, 159, 1) 50%, rgba(204, 137, 47, 0.85) 65%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        animationDuration: `${speed}s`,
      }}
    >
      {text}
    </span>
  )
}
