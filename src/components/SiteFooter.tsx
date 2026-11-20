import React from 'react'
import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#05070D]/95 backdrop-blur-md pt-12 pb-10 px-4 mt-auto" id="contact">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Monogram and Branding */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-black text-lg tracking-[0.25em] text-white">FEST</span>
            <span className="text-xs text-primary font-mono font-bold bg-primary-container/20 px-2 py-0.5 rounded-full">11.0</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 tracking-wider">
            © 2025 FEST · Kerala Directorate NCC. All rights reserved.
          </p>
        </div>

        {/* Footer Policy Links */}
        <nav aria-label="Footer Navigation" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
          <Link href="/#events" className="hover:text-white transition-colors">Competitions</Link>
          <a href="#rules" className="hover:text-white transition-colors">Rules &amp; Guidelines</a>
          <a href="#support" className="hover:text-white transition-colors">Safety Protocol</a>
          <Link href="/auth/login" className="hover:text-white transition-colors">Cadet Portal</Link>
        </nav>
      </div>
    </footer>
  )
}
