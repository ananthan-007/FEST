import React from 'react'
import Link from 'next/link'
import MobileBottomNav from './MobileBottomNav'
import DhruvaLogo from './DhruvaLogo'

export default function SiteFooter() {
  return (
    <>
      <footer
        className="relative z-10 border-t border-[#3A291B]/80 bg-[#050505]/95 backdrop-blur-md pt-10 pb-24 md:pb-10 px-4 sm:px-6 mt-auto"
        id="contact"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#3A291B]/50">
          <div className="flex items-center gap-2.5">
            <DhruvaLogo size="sm" showGlow={false} />
            <div>
              <span className="font-serif font-black text-base tracking-[0.24em] gold-gradient-text block">
                DHRUVA
              </span>
              <span className="text-[11px] text-[#A89F91]">
                Kerala NCC Directorate
              </span>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-6 text-xs text-[#A89F91]">
            <Link href="/" className="hover:text-[#F4DD9F] transition-colors">
              Home
            </Link>
            <Link href="/events" className="hover:text-[#F4DD9F] transition-colors">
              Events
            </Link>
            <Link href="/dashboard" className="hover:text-[#F4DD9F] transition-colors">
              Cadet HQ
            </Link>
            <Link href="/dashboard/profile" className="hover:text-[#F4DD9F] transition-colors">
              Profile
            </Link>
            <a href="mailto:fest@ncckerala.org" className="hover:text-[#F4DD9F] transition-colors">
              fest@ncckerala.org
            </a>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#A89F91]">
          <p>© {new Date().getFullYear()} DHRUVA · Kerala NCC Directorate</p>
          <p className="tracking-wider uppercase text-[10px] text-[#E3B464]">Unity &amp; Discipline</p>
        </div>
      </footer>

      <MobileBottomNav />
    </>
  )
}
