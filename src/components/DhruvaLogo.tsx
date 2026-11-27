'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface DhruvaLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
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
      <Image
        src="/images/dhruva-logo.jpg"
        alt="DHRUVA NCC Fest Logo"
        width={px}
        height={px}
        priority={priority}
        className="w-full h-full object-contain rounded-xl mix-blend-lighten"
      />
    </div>
  )
}
