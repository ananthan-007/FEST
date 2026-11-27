'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export interface PillNavItem {
  label: string
  href: string
  icon?: React.ReactNode
  badge?: string | number
}

interface PillNavProps {
  items: PillNavItem[]
  activeHref: string
  layoutId?: string
  className?: string
  onItemClick?: (href: string) => void
}

/**
 * React Bits — PillNav (DHRUVA Gold Active Pill)
 */
export default function PillNav({
  items,
  activeHref,
  layoutId = 'reactbits-pill-nav',
  className = '',
  onItemClick,
}: PillNavProps) {
  return (
    <nav
      aria-label="Primary Navigation"
      className={`inline-flex items-center gap-1 p-1 rounded-full bg-[#100F0D]/90 border border-[#3A291B]/90 backdrop-blur-xl shadow-inner ${className}`}
    >
      {items.map((item) => {
        const isActive =
          item.href === '/'
            ? activeHref === '/'
            : item.href.startsWith('/#')
            ? activeHref === item.href
            : activeHref.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onItemClick?.(item.href)}
            className={`relative px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              isActive ? 'text-[#050505]' : 'text-[#A89F91] hover:text-[#F4DD9F]'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[#81501F] via-[#CC892F] to-[#E3B464] shadow-[0_0_18px_rgba(204,137,47,0.45)]"
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-bold">
                  {item.badge}
                </span>
              )}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
