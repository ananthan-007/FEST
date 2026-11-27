'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Trophy,
  FolderTree,
  Landmark,
  ClipboardList,
  ShieldCheck,
  Settings,
  Menu,
  X,
  ArrowLeft,
  QrCode,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import DhruvaLogo from '@/components/DhruvaLogo'

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Events', href: '/admin/events', icon: Trophy, exact: false },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree, exact: false },
  { label: 'Institutions', href: '/admin/institutions', icon: Landmark, exact: false },
  { label: 'Registrations', href: '/admin/registrations', icon: ClipboardList, exact: false },
  { label: 'Volunteers', href: '/admin/volunteers', icon: ShieldCheck, exact: false },
  { label: 'Settings', href: '/admin/settings', icon: Settings, exact: false },
]

export default function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-[#3A291B]/80">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#12110F] border border-[#64401F]/60 flex items-center justify-center overflow-hidden">
              <DhruvaLogo size="xs" showGlow={false} />
            </div>
            <div>
              <p className="font-serif text-base gold-gradient-text tracking-widest leading-none">
                DHRUVA
              </p>
              <p className="text-[9px] font-semibold tracking-[0.18em] uppercase text-[#A89F91] mt-1">
                Admin Command
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="lg:hidden w-8 h-8 rounded-lg bg-[#242321] flex items-center justify-center text-[#A89F91] hover:text-[#F4DD9F]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <span className="inline-flex items-center h-5 px-2.5 bg-[#CC892F]/15 border border-[#CC892F]/40 rounded-full text-[9px] font-semibold tracking-wider uppercase text-[#F4DD9F] mt-3">
          Clearance: Alpha
        </span>
      </div>

      {/* Navigation */}
      <nav aria-label="Admin Navigation" className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#CC892F]/25 to-[#CC892F]/5 text-[#F4DD9F] border border-[#CC892F]/45 shadow-[0_0_20px_rgba(204,137,47,0.16)]'
                  : 'text-[#A89F91] hover:text-[#F5EFE6] hover:bg-[#242321]/55 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-[#E3B464]' : 'text-[#A89F91]'
                }`}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}

        <div className="pt-3 mt-3 border-t border-[#3A291B]/70 space-y-1">
          <p className="px-3.5 pb-1 text-[9px] font-bold tracking-[0.2em] uppercase text-[#A89F91]/70">
            Operations
          </p>
          <Link
            href="/volunteer/scan"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#E3B464] hover:bg-[#CC892F]/12 transition"
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span>Gate Scanner</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#A89F91] hover:text-[#F4DD9F] hover:bg-[#242321]/55 transition"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Cadet HQ</span>
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#3A291B]/80 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91]">
            HQ Sync: Online
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="text-xs text-[#A89F91] hover:text-[#F4DD9F] transition inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Public Site
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs text-red-300 hover:text-white transition inline-flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#050505] text-[#F5EFE6]">
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-40 h-14 px-4 border-b border-[#3A291B]/80 bg-[#0D0C0A]/95 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin menu"
            className="w-9 h-9 rounded-lg bg-[#242321] border border-[#3A291B] flex items-center justify-center text-[#F4DD9F]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-serif text-sm tracking-wider gold-gradient-text">
            DHRUVA Command
          </span>
        </div>
        <Link
          href="/"
          className="text-xs font-semibold text-[#A89F91] hover:text-[#F4DD9F] transition"
        >
          Exit to Site
        </Link>
      </header>

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 fixed left-0 top-0 h-screen bg-[#0D0C0A] backdrop-blur-2xl border-r border-[#3A291B]/80 flex-col z-50">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />
          <aside className="relative w-72 max-w-[85vw] h-full bg-[#0D0C0A] border-r border-[#3A291B] z-10">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
