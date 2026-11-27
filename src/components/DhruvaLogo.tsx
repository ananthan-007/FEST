'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface DhruvaLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showGlow?: boolean
  className?: string
  priority?: boolean
}

const sizeMap = {
  xs: { px: 32, cls: 'w-8 h-8' },
  sm: { px: 40, cls: 'w-10 h-10' },
  md: { px: 64, cls: 'w-16 h-16' },
  lg: { px: 120, cls: 'w-28 h-28 sm:w-32 sm:h-32' },
  xl: { px: 192, cls: 'w-40 h-40 sm:w-48 sm:h-48' },
}

export default function DhruvaLogo({
  size = 'md',
  showGlow = true,
  className,
  priority = false,
}: DhruvaLogoProps) {
  const { px, cls } = sizeMap[size]

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center select-none shrink-0',
        cls,
        className
      )}
    >
      {showGlow && (
        <div
          aria-hidden="true"
          className="absolute inset-1 rounded-full bg-[radial-gradient(circle,rgba(227,180,100,0.38)_0%,rgba(204,137,47,0.16)_45%,transparent_72%)] blur-xl pointer-events-none"
        />
      )}
      <Image
        src="/images/dhruva-logo.jpg"
        alt="DHRUVA NCC Fest Logo"
        width={px}
        height={px}
        priority={priority}
        className="relative z-10 w-full h-full object-contain rounded-xl mix-blend-lighten drop-shadow-[0_0_18px_rgba(204,137,47,0.35)]"
      />
    </div>
  )
}
