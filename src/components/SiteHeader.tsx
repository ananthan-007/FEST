'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SiteHeader() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
    } catch (e) {
      console.error('Failed to load profile in header', e)
    }
  }

  useEffect(() => {
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        fetchProfile()
      }
    })

    // 2. Real-time auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        fetchProfile()
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  // Handle outside click & escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    setIsOpen(false)
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/')
    router.refresh()
  }

  const initialLetter =
    profile?.displayName?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    'C'

  const userRole = profile?.role || 'user'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl bg-[#050A18]/85 border-b border-white/5 shadow-lg shadow-black/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Left Desktop Nav Links */}
        <nav aria-label="Primary Left" className="hidden md:flex items-center space-x-6 text-[11px] font-bold tracking-[0.25em] text-slate-300 uppercase">
          <Link href="/" className="hover:text-white transition-colors duration-200">Home</Link>
          <Link href="/events" className="hover:text-white transition-colors duration-200">Events</Link>
          <a href="#contact" className="hover:text-white transition-colors duration-200">Contact</a>
        </nav>

        {/* Center Logo — shield only, no FEST text */}
        <Link aria-label="FEST NCC Festival Home" href="/" className="flex flex-col items-center group py-1">
          <div className="flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
            <svg width="28" height="32" viewBox="0 0 40 46" fill="none" className="drop-shadow-[0_0_10px_rgba(200,16,46,0.6)]">
              <path d="M20 2L4 8v12c0 11 7 20.5 16 23.5C29 40.5 36 31 36 20V8L20 2z" fill="#C8102E" opacity="0.2" stroke="#C8102E" strokeWidth="1.5"/>
              <path d="M20 8l-9 3.5v8c0 6.5 4 12 9 14 5-2 9-7.5 9-14v-8L20 8z" fill="#C8102E" opacity="0.5"/>
              <path d="M15 20l3.5 3.5L26 16" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-serif text-sm tracking-[0.25em] text-[#DDE2F6]">NCC FEST</span>
          </div>
          <span className="text-[8px] tracking-[0.28em] font-semibold text-slate-400 uppercase mt-0.5">Kerala Directorate</span>
        </Link>

        {/* Right Desktop Nav Links & Action */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          <nav aria-label="Primary Right" className="hidden md:flex items-center space-x-6 text-[11px] font-bold tracking-[0.25em] text-slate-300 uppercase">
            <Link href="/dashboard" className="hover:text-white transition-colors duration-200">Dashboard</Link>
          </nav>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Cadet User Profile Button */}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                className={`glass-pill px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] font-bold tracking-wider uppercase rounded-full transition-all flex items-center gap-2 ${
                  isOpen
                    ? 'border-[#C8102E] text-white shadow-[0_0_20px_rgba(200,16,46,0.4)] bg-[#C8102E]/20'
                    : 'text-white hover:border-[#C8102E]/80 shadow-[0_0_16px_rgba(200,16,46,0.25)]'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#C8102E] to-[#7A0B1C] text-white text-[10px] flex items-center justify-center font-bold border border-white/20 shadow-inner">
                  {initialLetter}
                </div>
                <span className="hidden sm:inline font-serif font-semibold tracking-wider text-slate-100">
                  {profile?.displayName?.split(' ')[0] || 'Cadet HQ'}
                </span>
                <span className={`material-symbols-outlined text-[16px] text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {/* Profile & Ticket Dialog Box */}
              {isOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 sm:w-84 bg-[#0D1321]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(200,16,46,0.2)] p-4 text-left z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Top Profile Card */}
                  <div className="flex items-start gap-3 pb-3 border-b border-white/8">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C8102E] via-[#910B22] to-[#500612] flex items-center justify-center font-serif text-lg font-bold text-white border border-[#C8102E]/50 shadow-[0_0_16px_rgba(200,16,46,0.4)] shrink-0">
                      {initialLetter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-serif text-base font-semibold text-[#DDE2F6] truncate">
                        {profile?.displayName || 'Cadet Personnel'}
                      </div>
                      <div className="text-[11px] font-mono text-[#8A94A8] truncate mt-0.5">
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {/* Role Badge */}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                            userRole === 'admin'
                              ? 'bg-[#C8102E]/20 text-[#FFB3B1] border-[#C8102E]/40'
                              : userRole === 'volunteer'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          }`}
                        >
                          {userRole === 'admin' ? 'Primary Admin' : userRole === 'volunteer' ? 'Sentry Volunteer' : 'Cadet'}
                        </span>

                        {/* Division Badge */}
                        {profile?.division && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-white/5 text-slate-300 border border-white/10">
                            {profile.division}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="py-2 space-y-1">
                    {/* My Tickets */}
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#C8102E]/15 border border-[#C8102E]/30 flex items-center justify-center text-[#FFB3B1] group-hover:bg-[#C8102E]/25 transition">
                        <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-[#DDE2F6] group-hover:text-white transition">
                          My Tickets &amp; ID
                        </div>
                        <div className="text-[10px] text-[#8A94A8]">
                          Tactical pass, QR &amp; registered events
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-sm text-[#8A94A8] group-hover:text-white transition">
                        chevron_right
                      </span>
                    </Link>

                    {/* Profile Link */}
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/25 transition">
                        <span className="material-symbols-outlined text-[18px]">account_circle</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-[#DDE2F6] group-hover:text-white transition">
                          Cadet Profile
                        </div>
                        <div className="text-[10px] text-[#8A94A8]">
                          Institution, battalion &amp; details
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-sm text-[#8A94A8] group-hover:text-white transition">
                        chevron_right
                      </span>
                    </Link>

                    {/* Admin Access if applicable */}
                    {userRole === 'admin' && (
                      <Link
                        href="/admin/events"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/25 transition">
                          <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-[#DDE2F6] group-hover:text-white transition">
                            Admin Command Center
                          </div>
                          <div className="text-[10px] text-[#8A94A8]">
                            Manage events, users &amp; settings
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-sm text-[#8A94A8] group-hover:text-white transition">
                          chevron_right
                        </span>
                      </Link>
                    )}

                    {/* Scanner Access if Volunteer or Admin */}
                    {(userRole === 'admin' || userRole === 'volunteer') && (
                      <Link
                        href="/volunteer/scan"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/25 transition">
                          <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-[#DDE2F6] group-hover:text-white transition">
                            Scanner Sentry Desk
                          </div>
                          <div className="text-[10px] text-[#8A94A8]">
                            Scan attendee QR tickets
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-sm text-[#8A94A8] group-hover:text-white transition">
                          chevron_right
                        </span>
                      </Link>
                    )}
                  </div>

                  {/* Sign Out CTA */}
                  <div className="pt-2 border-t border-white/8">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#C8102E]/15 hover:bg-[#C8102E]/25 text-[#FFB3B1] border border-[#C8102E]/30 text-xs font-bold tracking-wider uppercase transition shadow-sm"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="glass-pill px-3.5 py-1.5 sm:px-4 sm:py-2 text-[11px] font-bold tracking-wider text-slate-200 uppercase rounded-full hover:border-[#C8102E]/80 hover:text-white transition-all shadow-[0_0_16px_rgba(200,16,46,0.25)] flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] text-[#C8102E]">login</span>
              <span>Cadet Entry</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
