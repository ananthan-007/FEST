import React from 'react'
import Link from 'next/link'
import { QrCode, LayoutDashboard, Home, LogOut } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import DhruvaLogo from '@/components/DhruvaLogo'

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#050505] text-[#F5EFE6] flex flex-col">
      <header className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-2xl border-b border-[#3A291B]/80">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <DhruvaLogo size="xs" showGlow={false} />
              <span className="font-serif text-sm sm:text-base font-bold tracking-[0.2em] gold-gradient-text">
                DHRUVA
              </span>
            </Link>
            <span className="bg-[#CC892F]/15 text-[#F4DD9F] border border-[#CC892F]/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Sentry Desk
            </span>
          </div>

          <nav aria-label="Volunteer Navigation" className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/volunteer/scan"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#CC892F]/20 border border-[#CC892F]/45 text-xs font-semibold text-[#F4DD9F] transition"
            >
              <QrCode className="w-3.5 h-3.5 text-[#E3B464]" />
              <span className="hidden sm:inline">Scanner</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141311] hover:bg-[#242321] border border-[#3A291B] text-xs font-semibold text-[#F5EFE6] transition"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#A89F91]" />
              <span className="hidden sm:inline">Cadet HQ</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141311] hover:bg-[#242321] border border-[#3A291B] text-xs font-semibold text-[#A89F91] hover:text-[#F4DD9F] transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/12 hover:bg-red-500/20 text-red-300 border border-red-500/25 text-xs font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
