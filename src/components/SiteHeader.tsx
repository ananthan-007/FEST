'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Home,
  CalendarDays,
  LayoutDashboard,
  UserCircle,
  Phone,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  LogIn,
  ShieldCheck,
  QrCode,
  Ticket,
  AlertTriangle,
  UserPlus,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import PillNav, { PillNavItem } from '@/components/reactbits/PillNav'
import StarBorder from '@/components/reactbits/StarBorder'
import DhruvaLogo from '@/components/DhruvaLogo'

interface HeaderProfile {
  displayName?: string | null
  role?: 'admin' | 'volunteer' | 'user'
  division?: string | null
  photoUrl?: string | null
  profileComplete?: boolean
}

export default function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<HeaderProfile | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
    } catch {
      // Ignore header profile fetch errors silently
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) fetchProfile()
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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

  useEffect(() => {
    setDropdownOpen(false)
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false)
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleSignOut = async () => {
    setDropdownOpen(false)
    setMobileMenuOpen(false)
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/')
    router.refresh()
  }

  const displayName = profile?.displayName || user?.user_metadata?.full_name || 'Cadet'
  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .map((w: string) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'C'

  const userRole = profile?.role || 'user'

  const resolvedActiveHref =
    pathname?.startsWith('/dashboard/profile')
      ? '/dashboard/profile'
      : pathname?.startsWith('/dashboard')
      ? '/dashboard'
      : pathname?.startsWith('/events') || pathname?.startsWith('/register')
      ? '/events'
      : pathname === '/'
      ? '/'
      : ''

  const navItems: PillNavItem[] = [
    { label: 'Home', href: '/', icon: <Home className="w-3.5 h-3.5" /> },
    { label: 'Events', href: '/events', icon: <CalendarDays className="w-3.5 h-3.5" /> },
    ...(user
      ? [
          {
            label: 'Cadet HQ',
            href: '/dashboard',
            icon: <LayoutDashboard className="w-3.5 h-3.5" />,
          },
          {
            label: 'Profile',
            href: '/dashboard/profile',
            icon: <UserCircle className="w-3.5 h-3.5" />,
          },
        ]
      : []),
    { label: 'Contact', href: '/#contact', icon: <Phone className="w-3.5 h-3.5" /> },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-2xl ${
        scrolled
          ? 'bg-[#050505]/95 border-b border-[#3A291B]/90 shadow-[0_12px_40px_rgba(0,0,0,0.8)]'
          : 'bg-[#050505]/80 border-b border-[#3A291B]/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-[72px] flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <Link
          aria-label="DHRUVA NCC Fest Home"
          href="/"
          className="flex items-center gap-2.5 group shrink-0"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#0D0C0A] border border-[#64401F]/60 group-hover:border-[#E3B464]/70 transition-colors overflow-hidden">
            <DhruvaLogo size="sm" showGlow={false} />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-sm sm:text-base font-bold tracking-[0.22em] gold-gradient-text leading-none">
              DHRUVA
            </span>
          </div>
        </Link>

        {/* Center: React Bits PillNav (Desktop) */}
        <div className="hidden md:flex items-center justify-center">
          <PillNav
            items={navItems}
            activeHref={resolvedActiveHref}
            layoutId="site-header-pill"
          />
        </div>

        {/* Right: Quick Role Links + Account / Auth + Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {user && userRole === 'admin' && (
            <Link
              href="/admin"
              className="hidden lg:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#CC892F]/15 hover:bg-[#CC892F]/25 border border-[#CC892F]/40 text-[#F4DD9F] text-[11px] font-semibold tracking-wider uppercase transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#E3B464]" />
              <span>Admin</span>
            </Link>
          )}
          {user && (userRole === 'admin' || userRole === 'volunteer') && (
            <Link
              href="/volunteer/scan"
              className="hidden xl:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#242321] hover:bg-[#3A291B]/70 border border-[#64401F]/60 text-[#E3B464] text-[11px] font-semibold tracking-wider uppercase transition"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scanner</span>
            </Link>
          )}

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
                className={`relative h-10 pl-1.5 pr-3 rounded-full border transition-all flex items-center gap-2 ${
                  dropdownOpen
                    ? 'bg-[#CC892F]/20 border-[#E3B464] text-[#F4DD9F] shadow-[0_0_20px_rgba(204,137,47,0.3)]'
                    : 'bg-[#12110F]/90 border-[#3A291B] text-[#F5EFE6] hover:border-[#CC892F]/70'
                }`}
              >
                {profile?.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={displayName}
                    className="w-7 h-7 rounded-full object-cover border border-[#E3B464]/40"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#CC892F] to-[#64401F] text-[#050505] text-[11px] flex items-center justify-center font-bold border border-[#F4DD9F]/40">
                    {initials}
                  </div>
                )}

                <span className="hidden sm:inline text-xs font-semibold tracking-wide max-w-[110px] truncate">
                  {displayName.split(' ')[0]}
                </span>

                {profile && profile.profileComplete === false && (
                  <span
                    title="Profile incomplete"
                    className="w-2 h-2 rounded-full bg-[#E3B464] animate-pulse"
                  />
                )}

                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#A89F91] transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180 text-[#F4DD9F]' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    role="menu"
                    className="absolute right-0 top-full mt-2.5 w-80 bg-[#0D0C0A] backdrop-blur-2xl border border-[#64401F]/80 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.95),0_0_30px_rgba(204,137,47,0.18)] p-4 text-left z-50"
                  >
                    {/* Top Profile Summary */}
                    <div className="flex items-start gap-3 pb-3 border-b border-[#3A291B]/70">
                      {profile?.photoUrl ? (
                        <img
                          src={profile.photoUrl}
                          alt={displayName}
                          className="w-11 h-11 rounded-full object-cover border border-[#CC892F]/60 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#F4DD9F] via-[#CC892F] to-[#64401F] flex items-center justify-center font-serif text-base font-bold text-[#050505] border border-[#F4DD9F]/40 shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-serif text-sm font-semibold text-[#F4DD9F] truncate">
                          {displayName}
                        </div>
                        <div className="text-[11px] font-mono text-[#A89F91] truncate mt-0.5">
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                              userRole === 'admin'
                                ? 'bg-[#CC892F]/20 text-[#F4DD9F] border-[#E3B464]/50'
                                : userRole === 'volunteer'
                                ? 'bg-[#64401F]/35 text-[#E3B464] border-[#CC892F]/40'
                                : 'bg-[#242321] text-[#F4DD9F] border-[#64401F]/60'
                            }`}
                          >
                            {userRole === 'admin'
                              ? 'Primary Admin'
                              : userRole === 'volunteer'
                              ? 'Sentry Volunteer'
                              : 'Cadet'}
                          </span>
                          {profile?.division && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#242321] text-[#F5EFE6] border border-[#3A291B]">
                              {profile.division}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Profile Incomplete Nudge */}
                    {profile && profile.profileComplete === false && (
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="mt-3 flex items-center gap-2.5 p-2.5 rounded-xl bg-[#CC892F]/12 border border-[#CC892F]/35 hover:bg-[#CC892F]/20 transition"
                      >
                        <AlertTriangle className="w-4 h-4 text-[#E3B464] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-[#F4DD9F]">
                            Complete Cadet Profile
                          </p>
                          <p className="text-[10px] text-[#A89F91] truncate">
                            Required before registering for events
                          </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-[#E3B464]" />
                      </Link>
                    )}

                    {/* Navigation Links */}
                    <div className="py-2 space-y-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#242321]/70 transition group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#CC892F]/15 border border-[#CC892F]/35 flex items-center justify-center text-[#E3B464]">
                          <Ticket className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-[#F5EFE6] group-hover:text-[#F4DD9F]">
                            Cadet HQ &amp; QR Pass
                          </div>
                          <div className="text-[10px] text-[#A89F91]">
                            Digital pass &amp; registered events
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#A89F91] group-hover:text-[#F4DD9F]" />
                      </Link>

                      <Link
                        href="/dashboard/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#242321]/70 transition group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#64401F]/25 border border-[#64401F]/50 flex items-center justify-center text-[#E3B464]">
                          <UserCircle className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-[#F5EFE6] group-hover:text-[#F4DD9F]">
                            Cadet Profile
                          </div>
                          <div className="text-[10px] text-[#A89F91]">
                            Institution, battalion &amp; details
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#A89F91] group-hover:text-[#F4DD9F]" />
                      </Link>

                      {userRole === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#242321]/70 transition group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#CC892F]/15 border border-[#CC892F]/40 flex items-center justify-center text-[#F4DD9F]">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-[#F5EFE6] group-hover:text-[#F4DD9F]">
                              Admin Command Center
                            </div>
                            <div className="text-[10px] text-[#A89F91]">
                              Manage events, institutions &amp; users
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#A89F91] group-hover:text-[#F4DD9F]" />
                        </Link>
                      )}

                      {(userRole === 'admin' || userRole === 'volunteer') && (
                        <Link
                          href="/volunteer/scan"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#242321]/70 transition group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#242321] border border-[#64401F]/60 flex items-center justify-center text-[#E3B464]">
                            <QrCode className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-[#F5EFE6] group-hover:text-[#F4DD9F]">
                              Gate QR Scanner
                            </div>
                            <div className="text-[10px] text-[#A89F91]">
                              Verify cadet entry &amp; passes
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#A89F91] group-hover:text-[#F4DD9F]" />
                        </Link>
                      )}
                    </div>

                    {/* Sign Out */}
                    <div className="pt-2 border-t border-[#3A291B]/70">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/25 text-xs font-bold tracking-wider uppercase transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-semibold tracking-wider uppercase text-[#F5EFE6] hover:text-[#F4DD9F] hover:bg-[#242321]/70 transition"
              >
                <LogIn className="w-3.5 h-3.5 text-[#E3B464]" />
                <span>Sign In</span>
              </Link>
              <StarBorder
                as={Link}
                href="/auth/register"
                color="#E3B464"
                speed="4s"
                className="h-9"
              >
                <span className="px-4 py-1.5 text-[11px] font-bold tracking-wider uppercase text-[#F4DD9F] flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-[#CC892F]" />
                  <span>Register</span>
                </span>
              </StarBorder>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden w-10 h-10 rounded-full bg-[#12110F] border border-[#3A291B] flex items-center justify-center text-[#F5EFE6] hover:text-[#F4DD9F] hover:border-[#CC892F]/70 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-[#3A291B] bg-[#050505]/95 backdrop-blur-2xl"
          >
            <nav aria-label="Mobile Navigation" className="px-4 py-4 space-y-1.5">
              {[
                { label: 'Home', href: '/', icon: Home },
                { label: 'Events & Competitions', href: '/events', icon: CalendarDays },
                ...(user
                  ? [
                      { label: 'Cadet HQ & QR Pass', href: '/dashboard', icon: LayoutDashboard },
                      { label: 'Cadet Profile', href: '/dashboard/profile', icon: UserCircle },
                    ]
                  : []),
                { label: 'Contact Headquarters', href: '/#contact', icon: Phone },
              ].map((item) => {
                const Icon = item.icon
                const active =
                  item.href === '/'
                    ? pathname === '/'
                    : item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname?.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      active
                        ? 'bg-[#CC892F]/20 text-[#F4DD9F] border border-[#CC892F]/45'
                        : 'text-[#A89F91] hover:text-[#F4DD9F] hover:bg-[#242321]/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-[#E3B464]' : ''}`} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}

              {user && userRole === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#F4DD9F] bg-[#CC892F]/15 border border-[#CC892F]/35"
                >
                  <ShieldCheck className="w-4 h-4 text-[#E3B464]" />
                  <span>Admin Command Center</span>
                </Link>
              )}

              {user && (userRole === 'admin' || userRole === 'volunteer') && (
                <Link
                  href="/volunteer/scan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#E3B464] bg-[#242321] border border-[#64401F]/60"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Gate QR Scanner</span>
                </Link>
              )}

              <div className="pt-2 border-t border-[#3A291B]/70">
                {user ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-300 border border-red-500/25 text-xs font-bold uppercase tracking-wider"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#242321] border border-[#3A291B] text-xs font-bold uppercase tracking-wider text-[#F5EFE6]"
                    >
                      <LogIn className="w-4 h-4 text-[#E3B464]" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl gold-gradient-button text-xs font-bold uppercase tracking-wider"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Register</span>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
