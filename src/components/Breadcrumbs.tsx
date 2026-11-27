'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center flex-wrap gap-1.5 text-xs text-[#A89F91] ${className}`}
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1 hover:text-[#F4DD9F] transition-colors rounded-md px-1.5 py-1 hover:bg-[#242321]/60"
      >
        <Home className="w-3.5 h-3.5 text-[#CC892F]" />
        <span className="sr-only sm:not-sr-only">Home</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1
        return (
          <React.Fragment key={`${item.label}-${idx}`}>
            <ChevronRight className="w-3.5 h-3.5 text-[#64401F] shrink-0" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-[#F4DD9F] transition-colors rounded-md px-1.5 py-1 hover:bg-[#242321]/60 truncate max-w-[160px] sm:max-w-[240px]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? 'page' : undefined}
                className="text-[#F4DD9F] font-medium px-1.5 py-1 truncate max-w-[180px] sm:max-w-[280px]"
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
