'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, CalendarDays, LayoutDashboard, UserCircle } from 'lucide-react'

const MOBILE_TABS = [
  { label: 'Home', href: '/', icon: Home, exact: true },
  { label: 'Events', href: '/events', icon: CalendarDays, exact: false },
  { label: 'Cadet HQ', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Profile', href: '/dashboard/profile', icon: UserCircle, exact: false },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/volunteer') ||
    pathname?.startsWith('/auth')
  ) {
    return null
  }

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#3A291B]/90 bg-[#050505]/95 backdrop-blur-2xl pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
    >
      <div className="grid grid-cols-4 h-16 px-2">
        {MOBILE_TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname?.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-xl transition-colors ${
                isActive ? 'text-[#F4DD9F]' : 'text-[#A89F91] hover:text-[#F5EFE6]'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="mobile-bottom-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className="absolute inset-x-2 top-1.5 bottom-1.5 rounded-xl bg-[#CC892F]/18 border border-[#E3B464]/45"
                />
              )}
              <Icon
                className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? 'text-[#F4DD9F]' : ''
                }`}
              />
              <span className="relative z-10 text-[10px] font-semibold tracking-wider uppercase">
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
