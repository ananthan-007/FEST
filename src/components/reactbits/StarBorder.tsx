'use client'

import React from 'react'

type StarBorderProps<T extends React.ElementType> = {
  as?: T
  className?: string
  color?: string
  speed?: string
  children?: React.ReactNode
} & React.ComponentPropsWithoutRef<T>

/**
 * React Bits — StarBorder (DHRUVA Metallic Gold perimeter)
 */
export default function StarBorder<T extends React.ElementType = 'button'>({
  as,
  className = '',
  color = '#E3B464',
  speed = '5s',
  children,
  ...rest
}: StarBorderProps<T>) {
  const Component = as || 'button'

  return (
    <Component
      className={`relative inline-flex overflow-hidden rounded-full p-[1.5px] group ${className}`}
      {...(rest as any)}
    >
      <div
        className="pointer-events-none absolute w-[300%] h-[50%] opacity-85 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 16%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="pointer-events-none absolute w-[300%] h-[50%] opacity-85 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 16%)`,
          animationDuration: speed,
        }}
      />
      <div className="relative z-10 w-full h-full flex items-center justify-center rounded-full bg-gradient-to-b from-[#1D1A16] to-[#0B0A08] border border-[#64401F]/60 group-hover:border-[#E3B464]/70 transition-colors">
        {children}
      </div>
    </Component>
  )
}
