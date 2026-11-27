'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

interface Profile {
  id: string
  display_name: string | null
  email: string | null
  phone: string | null
  division: string | null
  profile_complete: boolean
  qr_token: string | null
  role: 'admin' | 'volunteer' | 'user'
}

interface Registration {
  id: string
  team_name: string | null
  payment_status: string
  created_at: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  events: { id: string; title?: string; name?: string } | null
  registration_members?: { id: string }[]
}

interface Props {
  profile: Profile | null
  registrations: Registration[]
}

export default function DashboardClient({ profile, registrations }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'cadet' | 'events'>('cadet')

  // Generate QR code client-side from the token (canvas API)
  useEffect(() => {
    const token = profile?.qr_token
    if (!token) return
    QRCode.toDataURL(token, { width: 220, margin: 2 })
      .then(setQrDataUrl)
      .catch((err) => console.error('Failed to generate QR data URL', err))
  }, [profile?.qr_token])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#CC892F] border-t-transparent animate-spin" />
          <span className="text-[#A89F91] text-xs tracking-widest uppercase">Syncing Cadet HQ…</span>
        </div>
      </div>
    )
  }

  const displayName = profile.display_name || 'Cadet'
  const profileComplete = profile.profile_complete ?? false
  const qrToken = profile.qr_token
  const role = profile.role || 'user'

  const initials = displayName
    .trim().split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  const isAdmin = role === 'admin'
  const isVolunteer = role === 'volunteer' || role === 'admin'

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5EFE6]">

      {/* Fixed Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#050505]/90 backdrop-blur-xl border-b border-[#3A291B]/60">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition" title="Back to Home">
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
              <path d="M20 3L5 9v10c0 9.5 6.4 18.4 15 21 8.6-2.6 15-11.5 15-21V9L20 3z" fill="#CC892F" opacity="0.2" stroke="#CC892F" strokeWidth="1.5"/>
              <path d="M20 10l-8 3.5v6c0 5.5 3.5 10.5 8 12 4.5-1.5 8-6.5 8-12v-6L20 10z" fill="#CC892F" opacity="0.5"/>
            </svg>
            <span className="font-serif text-sm tracking-wider gold-gradient-text">DHRUVA</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[#141311] border border-[#3A291B]/80 text-xs font-medium text-[#F5EFE6] hover:border-white/20 transition"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              <span className="hidden sm:inline">Home</span>
            </Link>
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
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#141311] border border-[#3A291B]/80 text-[#A89F91] hover:text-[#CC892F] transition"
              title="Sign out"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>

        {/* Top Navigation Tabs */}
        <div className="flex items-center border-t border-[#3A291B]/60 bg-[#0D0C0A]/60 px-2">
          <button
            onClick={() => setActiveTab('cadet')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase transition relative ${
              activeTab === 'cadet' ? 'text-[#CC892F]' : 'text-[#A89F91] hover:text-[#F5EFE6]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">military_tech</span>
            Cadet HQ
            {activeTab === 'cadet' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#CC892F] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase transition relative ${
              activeTab === 'events' ? 'text-[#CC892F]' : 'text-[#A89F91] hover:text-[#F5EFE6]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            Events
            {activeTab === 'events' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#CC892F] rounded-full" />
            )}
          </button>

          {isVolunteer && (
            <button
              onClick={() => router.push('/volunteer/scan')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase text-purple-400 hover:text-purple-300 transition relative"
            >
              <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
              Sentry
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => router.push('/admin/events')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase text-amber-400 hover:text-amber-300 transition relative"
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              Command
            </button>
          )}

          <Link
            href="/dashboard/profile"
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase text-[#A89F91] hover:text-[#F5EFE6] transition relative ml-auto"
          >
            <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
            Edit Profile
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-[102px] px-4 pb-10 max-w-2xl mx-auto">

        {/* ── CADET HQ TAB ─────────────────────────────────────────── */}
        {activeTab === 'cadet' && (
          <>
            <div className="mt-4 bg-[#0D0C0A]/80 backdrop-blur-xl border border-[#3A291B]/80 rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#CC892F]/30 to-[#CC892F]/10 border border-[#CC892F]/30 flex items-center justify-center">
                  <span className="font-serif text-2xl font-bold text-[#CC892F]">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-lg text-[#F5EFE6] truncate">{displayName}</p>
                  <p className="text-xs text-[#A89F91] truncate">{profile.email}</p>
                  {profile.phone && (
                    <p className="text-xs text-[#A89F91]/80 truncate mt-0.5">{profile.phone}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`inline-flex items-center h-5 px-2 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                      role === 'admin'
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        : role === 'volunteer'
                        ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                        : 'bg-[#CC892F]/15 border-[#CC892F]/30 text-[#CC892F]'
                    }`}>
                      {role}
                    </span>
                    {profile.division && (
                      <span className="inline-flex items-center h-5 px-2 rounded-full bg-white/5 border border-[#3A291B]/90 text-[9px] font-bold tracking-wider uppercase text-[#A89F91]">
                        {profile.division}
                      </span>
                    )}
                  </div>
                </div>
              </div>

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

            {qrDataUrl && (
              <div className="mt-4 bg-[#0D0C0A]/80 backdrop-blur-xl border border-[#3A291B]/80 rounded-2xl p-5 flex flex-col items-center gap-3">
                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91]">
                  Cadet QR Pass
                </p>
                <div className="p-3 bg-white rounded-xl">
                  <img src={qrDataUrl} alt="QR Code" className="w-44 h-44" />
                </div>
                <p className="text-[10px] text-[#A89F91] text-center max-w-[200px]">
                  Show this at checkpoints for event entry
                </p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link href="/dashboard/profile" className="flex flex-col gap-2 p-4 bg-[#0D0C0A]/80 border border-[#3A291B]/80 rounded-2xl hover:border-white/15 transition">
                <span className="material-symbols-outlined text-[#CC892F] text-[22px]">manage_accounts</span>
                <p className="text-xs font-semibold text-[#F5EFE6]">Edit Profile</p>
                <p className="text-[10px] text-[#A89F91]">Update battalion & details</p>
              </Link>
              <Link href="/events" className="flex flex-col gap-2 p-4 bg-[#0D0C0A]/80 border border-[#3A291B]/80 rounded-2xl hover:border-white/15 transition">
                <span className="material-symbols-outlined text-[#CC892F] text-[22px]">event</span>
                <p className="text-xs font-semibold text-[#F5EFE6]">Browse Events</p>
                <p className="text-[10px] text-[#A89F91]">View & register for events</p>
              </Link>
            </div>
          </>
        )}

        {/* ── EVENTS TAB ───────────────────────────────────────────── */}
        {activeTab === 'events' && (
          <div className="mt-4">
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91] mb-3">My Registrations</p>
            {registrations.length === 0 ? (
              <div className="bg-[#0D0C0A]/80 border border-[#3A291B]/80 rounded-2xl p-10 flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-[#A89F91] text-5xl">event_busy</span>
                <p className="text-[#A89F91] text-sm">No registrations yet</p>
                <p className="text-[#A89F91]/60 text-xs mt-1">Events you register for will appear here</p>
                <Link
                  href="/events"
                  className="mt-2 h-9 px-5 rounded-full gold-gradient-button text-xs font-bold tracking-wider uppercase flex items-center gap-2 hover:brightness-110 transition"
                >
                  <span className="material-symbols-outlined text-[16px]">search</span>
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {registrations.map((reg) => {
                  const eventTitle = reg.events?.title || reg.events?.name || 'Unknown Event'
                  const memberCount = reg.registration_members?.length || 1
                  const isVerified = reg.payment_status === 'verified' || reg.payment_status === 'paid'
                  const isPending = reg.payment_status === 'pending'
                  return (
                    <div key={reg.id} className="bg-[#141311] border border-[#3A291B]/60 rounded-xl px-4 py-3.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-[#F5EFE6] text-sm truncate">{eventTitle}</p>
                        {reg.team_name && <p className="text-xs text-[#A89F91] mt-0.5">Team: {reg.team_name}</p>}
                        <p className="text-xs text-[#A89F91]/70 mt-0.5">{memberCount} member(s)</p>
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
                        <p className="text-[10px] text-[#A89F91] mt-1">{new Date(reg.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
