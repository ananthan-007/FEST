'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  display_name: string | null
  email: string | null
  phone: string | null
  division: string | null
  profile_complete: boolean
  photo_url: string | null
  qr_token: string | null
  role: 'admin' | 'volunteer' | 'user'
  displayName?: string
  profileComplete?: boolean
  qrToken?: string | null
}

interface Registration {
  id: string
  team_name: string | null
  payment_status: string
  created_at: string
  event: { id: string; name?: string; title?: string } | null
  registration_members?: { id: string }[]
  members?: { id: string }[]
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'cadet' | 'events' | 'profile'>('cadet')

  useEffect(() => {
    Promise.all([
      fetch('/api/user/profile').then(r => r.json()),
      fetch('/api/user/registrations').then(r => r.json()),
    ]).then(([p, regs]) => {
      setProfile(p)
      const token = p?.qr_token || p?.qrToken
      if (token) {
        QRCode.toDataURL(token, { width: 220, margin: 2 })
          .then(setQrDataUrl)
          .catch(err => console.error('Failed to generate QR data URL', err))
      }
      setRegistrations(Array.isArray(regs) ? regs : [])
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050A18] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#C8102E] border-t-transparent animate-spin" />
          <span className="text-[#8A94A8] text-xs tracking-widest uppercase">Syncing Cadet HQ…</span>
        </div>
      </div>
    )
  }

  const displayName = profile?.display_name || profile?.displayName || 'Cadet'
  const profileComplete = profile?.profile_complete ?? profile?.profileComplete ?? false
  const qrToken = profile?.qr_token || profile?.qrToken
  const role = profile?.role || 'user'

  const initials = displayName
    .trim().split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  const isAdmin = role === 'admin'
  const isVolunteer = role === 'volunteer' || role === 'admin'

  return (
    <div className="min-h-screen bg-[#050A18] text-[#DDE2F6]">

      {/* Fixed Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#050A18]/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
              <path d="M20 3L5 9v10c0 9.5 6.4 18.4 15 21 8.6-2.6 15-11.5 15-21V9L20 3z" fill="#C8102E" opacity="0.2" stroke="#C8102E" strokeWidth="1.5"/>
              <path d="M20 10l-8 3.5v6c0 5.5 3.5 10.5 8 12 4.5-1.5 8-6.5 8-12v-6L20 10z" fill="#C8102E" opacity="0.5"/>
            </svg>
            <span className="font-serif text-sm tracking-wider text-[#DDE2F6]">FEST</span>
            <span className="text-[10px] font-semibold tracking-[0.14em] text-[#8A94A8]">11.0</span>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <span className="hidden sm:inline-flex items-center h-5 px-2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-bold tracking-wider uppercase">
                Admin
              </span>
            )}
            {isVolunteer && !isAdmin && (
              <span className="hidden sm:inline-flex items-center h-5 px-2 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[9px] font-bold tracking-wider uppercase">
                Volunteer
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#161B2A] border border-white/8 text-[#8A94A8] hover:text-[#C8102E] transition"
              title="Sign out"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>

        {/* Top Navigation Tabs */}
        <div className="flex items-center border-t border-white/5 bg-[#0D1321]/60 px-2">
          {/* Cadet tab — always */}
          <button
            onClick={() => setActiveTab('cadet')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase transition relative ${
              activeTab === 'cadet'
                ? 'text-[#C8102E]'
                : 'text-[#8A94A8] hover:text-[#DDE2F6]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">military_tech</span>
            Cadet HQ
            {activeTab === 'cadet' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C8102E] rounded-full" />
            )}
          </button>

          {/* Events tab */}
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase transition relative ${
              activeTab === 'events'
                ? 'text-[#C8102E]'
                : 'text-[#8A94A8] hover:text-[#DDE2F6]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            Events
            {activeTab === 'events' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C8102E] rounded-full" />
            )}
          </button>

          {/* Sentry tab — volunteer / admin */}
          {isVolunteer && (
            <button
              onClick={() => router.push('/volunteer/scan')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase text-purple-400 hover:text-purple-300 transition relative"
            >
              <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
              Sentry
            </button>
          )}

          {/* Command tab — admin only */}
          {isAdmin && (
            <button
              onClick={() => router.push('/admin/events')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase text-amber-400 hover:text-amber-300 transition relative"
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              Command
            </button>
          )}

          {/* Profile tab */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase transition relative ml-auto ${
              activeTab === 'profile'
                ? 'text-[#C8102E]'
                : 'text-[#8A94A8] hover:text-[#DDE2F6]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person</span>
            Profile
            {activeTab === 'profile' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C8102E] rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content — padded below fixed header (h-14 + tab bar ~40px = ~102px) */}
      <main className="pt-[102px] px-4 pb-10 max-w-2xl mx-auto">

        {/* ── CADET HQ TAB ─────────────────────────────────────────── */}
        {activeTab === 'cadet' && (
          <>
            {/* Identity card */}
            <div className="mt-4 bg-[#0D1321]/80 backdrop-blur-xl border border-white/8 rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C8102E]/30 to-[#C8102E]/10 border border-[#C8102E]/30 flex items-center justify-center">
                  <span className="font-serif text-2xl font-bold text-[#C8102E]">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-lg text-[#DDE2F6] truncate">{displayName}</p>
                  <p className="text-xs text-[#8A94A8] truncate">{profile?.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`inline-flex items-center h-5 px-2 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                      role === 'admin'
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        : role === 'volunteer'
                        ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                        : 'bg-[#C8102E]/15 border-[#C8102E]/30 text-[#C8102E]'
                    }`}>
                      {role}
                    </span>
                    {profile?.division && (
                      <span className="inline-flex items-center h-5 px-2 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold tracking-wider uppercase text-[#8A94A8]">
                        {profile.division}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile complete warning */}
              {!profileComplete && (
                <Link
                  href="/dashboard/profile"
                  className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/15 transition"
                >
                  <span className="material-symbols-outlined text-amber-400 text-[20px]">warning</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-amber-300">Profile Incomplete</p>
                    <p className="text-[10px] text-amber-400/70 mt-0.5">Complete your profile to register for events</p>
                  </div>
                  <span className="material-symbols-outlined text-amber-400/50 text-sm">chevron_right</span>
                </Link>
              )}
            </div>

            {/* QR Code */}
            {qrDataUrl && (
              <div className="mt-4 bg-[#0D1321]/80 backdrop-blur-xl border border-white/8 rounded-2xl p-5 flex flex-col items-center gap-3">
                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8]">
                  Cadet QR Pass
                </p>
                <div className="p-3 bg-white rounded-xl">
                  <img src={qrDataUrl} alt="QR Code" className="w-44 h-44" />
                </div>
                <p className="text-[10px] text-[#8A94A8] text-center max-w-[200px]">
                  Show this at checkpoints for event entry
                </p>
              </div>
            )}

            {/* Quick links */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href="/dashboard/profile"
                className="flex flex-col gap-2 p-4 bg-[#0D1321]/80 border border-white/8 rounded-2xl hover:border-white/15 transition"
              >
                <span className="material-symbols-outlined text-[#C8102E] text-[22px]">manage_accounts</span>
                <p className="text-xs font-semibold text-[#DDE2F6]">Edit Profile</p>
                <p className="text-[10px] text-[#8A94A8]">Update battalion & details</p>
              </Link>
              <Link
                href="/events"
                className="flex flex-col gap-2 p-4 bg-[#0D1321]/80 border border-white/8 rounded-2xl hover:border-white/15 transition"
              >
                <span className="material-symbols-outlined text-[#C8102E] text-[22px]">event</span>
                <p className="text-xs font-semibold text-[#DDE2F6]">Browse Events</p>
                <p className="text-[10px] text-[#8A94A8]">View & register for events</p>
              </Link>
            </div>
          </>
        )}

        {/* ── EVENTS TAB ───────────────────────────────────────────── */}
        {activeTab === 'events' && (
          <div className="mt-4">
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-3">My Registrations</p>
            {registrations.length === 0 ? (
              <div className="bg-[#0D1321]/80 border border-white/8 rounded-2xl p-10 flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-[#8A94A8] text-5xl">event_busy</span>
                <p className="text-[#8A94A8] text-sm">No registrations yet</p>
                <p className="text-[#8A94A8]/60 text-xs mt-1">Events you register for will appear here</p>
                <Link
                  href="/events"
                  className="mt-2 h-9 px-5 rounded-full bg-[#C8102E] text-white text-xs font-bold tracking-wider uppercase flex items-center gap-2 hover:bg-[#A00B22] transition"
                >
                  <span className="material-symbols-outlined text-[16px]">search</span>
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {registrations.map((reg) => {
                  const eventTitle = reg.event?.title || reg.event?.name || 'Unknown Event'
                  const memberCount = reg.registration_members?.length || reg.members?.length || 1
                  const isVerified = reg.payment_status === 'verified' || reg.payment_status === 'paid'
                  const isPending = reg.payment_status === 'pending'
                  return (
                    <div key={reg.id} className="bg-[#161B2A] border border-white/5 rounded-xl px-4 py-3.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-[#DDE2F6] text-sm truncate">{eventTitle}</p>
                        {reg.team_name && <p className="text-xs text-[#8A94A8] mt-0.5">Team: {reg.team_name}</p>}
                        <p className="text-xs text-[#8A94A8]/70 mt-0.5">{memberCount} member(s)</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`inline-flex items-center gap-1 h-6 px-3 rounded-full text-[10px] font-semibold ${
                          isVerified ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400' :
                          isPending  ? 'bg-amber-500/15 border border-amber-500/25 text-amber-400' :
                          'bg-red-500/15 border border-red-500/25 text-red-400'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${isVerified ? 'bg-emerald-400' : isPending ? 'bg-amber-400' : 'bg-red-400'}`} />
                          {isVerified ? 'Verified' : isPending ? 'Pending' : reg.payment_status}
                        </span>
                        <p className="text-[10px] text-[#8A94A8] mt-1">{new Date(reg.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE TAB ──────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="mt-4 space-y-3">
            <div className="bg-[#0D1321]/80 border border-white/8 rounded-2xl p-5">
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-4">Account Details</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#8A94A8] text-[18px]">person</span>
                  <div>
                    <p className="text-[10px] text-[#8A94A8] uppercase tracking-wider">Name</p>
                    <p className="text-sm text-[#DDE2F6]">{displayName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#8A94A8] text-[18px]">mail</span>
                  <div>
                    <p className="text-[10px] text-[#8A94A8] uppercase tracking-wider">Email</p>
                    <p className="text-sm text-[#DDE2F6]">{profile?.email || '—'}</p>
                  </div>
                </div>
                {profile?.phone && (
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#8A94A8] text-[18px]">phone</span>
                    <div>
                      <p className="text-[10px] text-[#8A94A8] uppercase tracking-wider">Phone</p>
                      <p className="text-sm text-[#DDE2F6]">{profile.phone}</p>
                    </div>
                  </div>
                )}
                {profile?.division && (
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#8A94A8] text-[18px]">military_tech</span>
                    <div>
                      <p className="text-[10px] text-[#8A94A8] uppercase tracking-wider">Division</p>
                      <p className="text-sm text-[#DDE2F6]">{profile.division}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 px-4 py-3.5 bg-[#0D1321]/80 border border-white/8 rounded-2xl hover:border-white/15 transition"
            >
              <span className="material-symbols-outlined text-[#C8102E] text-[20px]">edit</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#DDE2F6]">Edit Profile</p>
                <p className="text-[10px] text-[#8A94A8]">Update battalion, institution & contact details</p>
              </div>
              <span className="material-symbols-outlined text-[#8A94A8] text-sm">chevron_right</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#C8102E]/15 hover:bg-[#C8102E]/25 text-[#FFB3B1] border border-[#C8102E]/30 text-sm font-bold tracking-wider uppercase transition"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign Out
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
