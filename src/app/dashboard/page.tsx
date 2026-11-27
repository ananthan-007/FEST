'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import QRCode from 'qrcode'
import {
  QrCode,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  UserCog,
  CalendarDays,
  Ticket,
  CheckCircle2,
  Clock,
  XCircle,
  Award,
} from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import Breadcrumbs from '@/components/Breadcrumbs'
import {
  SpotlightCard,
  TiltedCard,
  ShinyText,
  StarBorder,
} from '@/components/reactbits'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

interface Profile {
  id: string
  displayName: string | null
  email: string | null
  phone: string | null
  division: string | null
  nccUnit: string | null
  profileComplete: boolean
  photoUrl: string | null
  qrToken: string | null
  role: 'admin' | 'volunteer' | 'user'
  institution?: {
    id: string
    name: string
    battalion: {
      id: string
      name: string
      group: { id: string; name: string } | null
    } | null
  } | null
}

interface Registration {
  id: string
  team_name: string | null
  payment_status: string
  created_at: string
  events?: { id: string; title?: string; name?: string; event_date?: string | null; venue?: string | null } | null
  event?: { id: string; title?: string; name?: string; event_date?: string | null; venue?: string | null } | null
  registration_members?: { id: string }[]
  members?: { id: string }[]
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'registrations' ? 'registrations' : 'overview'

  const [profile, setProfile] = useState<Profile | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations'>(initialTab)

  useEffect(() => {
    Promise.all([
      fetch('/api/user/profile').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/user/registrations').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([p, regs]) => {
        setProfile(p)
        const token = p?.qrToken
        if (token) {
          QRCode.toDataURL(token, { width: 240, margin: 2 })
            .then(setQrDataUrl)
            .catch((err) => console.error('Failed to generate QR data URL', err))
        }
        setRegistrations(Array.isArray(regs) ? regs : [])
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#CC892F] border-t-transparent animate-spin" />
            <span className="text-[#A89F91] text-xs tracking-widest uppercase">
              Syncing Cadet HQ…
            </span>
          </div>
        </div>
      </div>
    )
  }

  const displayName = profile?.displayName || 'Cadet'
  const profileComplete = profile?.profileComplete ?? false
  const role = profile?.role || 'user'
  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .map((w: string) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'C'

  const isAdmin = role === 'admin'
  const isVolunteer = role === 'volunteer' || role === 'admin'

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5EFE6]">
      <SiteHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-24 pb-20 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs items={[{ label: 'Cadet HQ' }]} />

          <div className="flex items-center gap-2">
            {isVolunteer && (
              <Link
                href="/volunteer/scan"
                className="h-8 px-3.5 rounded-full bg-[#242321] hover:bg-[#3A291B]/70 border border-[#64401F]/60 text-[#E3B464] text-[11px] font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 transition"
              >
                <QrCode className="w-3.5 h-3.5" />
                Gate Scanner
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="h-8 px-3.5 rounded-full bg-[#CC892F]/15 hover:bg-[#CC892F]/25 border border-[#CC892F]/45 text-[#F4DD9F] text-[11px] font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#E3B464]" />
                Admin Panel
              </Link>
            )}
          </div>
        </div>

        {/* Hero Greeting + Sub-tabs */}
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#3A291B]/80 pb-5">
          <div>
            <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#CC892F] block mb-1">
              Command Dashboard
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#F5EFE6]">
              Welcome, <ShinyText text={displayName} speed={5} className="font-serif" />
            </h1>
          </div>

          <div className="inline-flex p-1 rounded-full bg-[#0D0C0A] border border-[#3A291B] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === 'overview'
                  ? 'gold-gradient-button'
                  : 'text-[#A89F91] hover:text-[#F4DD9F]'
              }`}
            >
              Overview &amp; QR Pass
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('registrations')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition inline-flex items-center gap-1.5 ${
                activeTab === 'registrations'
                  ? 'gold-gradient-button'
                  : 'text-[#A89F91] hover:text-[#F4DD9F]'
              }`}
            >
              <span>My Registrations</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/25 text-[10px]">
                {registrations.length}
              </span>
            </button>
          </div>
        </ScrollReveal>

        {/* Profile incomplete alert */}
        {!profileComplete && (
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-4 p-4 rounded-2xl bg-[#CC892F]/12 border border-[#CC892F]/40 hover:bg-[#CC892F]/18 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#CC892F]/20 border border-[#E3B464]/45 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-[#E3B464]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#F4DD9F]">
                Complete your Cadet Profile to unlock event registration
              </p>
              <p className="text-xs text-[#A89F91] mt-0.5">
                Add your phone number, division, and NCC institution hierarchy.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#F4DD9F] group-hover:translate-x-0.5 transition-transform">
              Complete Now <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        )}

        {activeTab === 'overview' ? (
          <ScrollReveal delay={0.05} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Tilted Digital QR Pass */}
            <div className="lg:col-span-5">
              <TiltedCard rotateAmplitude={7} scaleOnHover={1.01}>
                <SpotlightCard
                  spotlightColor="rgba(204, 137, 47, 0.28)"
                  className="p-6 flex flex-col items-center text-center"
                >
                  <div className="w-full flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#E3B464]">
                      DHRUVA · Cadet Pass
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#242321] border border-[#64401F]/60 text-[#F4DD9F]">
                      {profile?.division || 'No Div'}
                    </span>
                  </div>

                  {qrDataUrl ? (
                    <div className="p-3.5 bg-[#F5EFE6] rounded-2xl shadow-[0_0_30px_rgba(204,137,47,0.22)] mb-4">
                      <img src={qrDataUrl} alt="Cadet QR Pass" className="w-44 h-44" />
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-2xl bg-[#141311] border border-dashed border-[#64401F]/60 flex flex-col items-center justify-center gap-2 mb-4 text-[#A89F91]">
                      <QrCode className="w-10 h-10 opacity-45 text-[#CC892F]" />
                      <span className="text-xs">QR Pass unavailable</span>
                    </div>
                  )}

                  <p className="font-serif text-lg text-[#F4DD9F]">{displayName}</p>
                  <p className="text-xs text-[#A89F91] mt-0.5 truncate max-w-full">
                    {profile?.institution?.name || 'Institution not assigned'}
                  </p>
                </SpotlightCard>
              </TiltedCard>
            </div>

            {/* Right: Profile Summary + Quick Actions */}
            <div className="lg:col-span-7 space-y-5">
              <SpotlightCard className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {profile?.photoUrl ? (
                      <img
                        src={profile.photoUrl}
                        alt={displayName}
                        className="w-16 h-16 rounded-2xl object-cover border border-[#64401F]/70 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#CC892F]/35 to-[#382313] border border-[#CC892F]/50 flex items-center justify-center shrink-0">
                        <span className="font-serif text-2xl font-bold text-[#F4DD9F]">
                          {initials}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2 className="font-serif text-xl text-[#F4DD9F] truncate">{displayName}</h2>
                      <p className="text-xs text-[#A89F91] truncate">{profile?.email}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#CC892F]/15 border border-[#CC892F]/40 text-[#F4DD9F]">
                          {role}
                        </span>
                        {profile?.nccUnit && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#242321] border border-[#3A291B] text-[#F5EFE6]">
                            {profile.nccUnit}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/profile"
                    className="h-9 px-4 rounded-full bg-[#242321] hover:bg-[#3A291B]/70 border border-[#64401F]/60 text-xs font-semibold text-[#F4DD9F] inline-flex items-center gap-1.5 shrink-0 transition"
                  >
                    <UserCog className="w-3.5 h-3.5 text-[#E3B464]" />
                    Edit Profile
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-[#3A291B]/70 text-xs">
                  <div className="p-3 rounded-xl bg-[#141311] border border-[#3A291B]/70">
                    <span className="text-[10px] uppercase tracking-wider text-[#A89F91] block">
                      NCC Group
                    </span>
                    <span className="text-[#F5EFE6] font-medium mt-0.5 block truncate">
                      {profile?.institution?.battalion?.group?.name || 'Not set'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#141311] border border-[#3A291B]/70">
                    <span className="text-[10px] uppercase tracking-wider text-[#A89F91] block">
                      Battalion
                    </span>
                    <span className="text-[#F5EFE6] font-medium mt-0.5 block truncate">
                      {profile?.institution?.battalion?.name || 'Not set'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#141311] border border-[#3A291B]/70">
                    <span className="text-[10px] uppercase tracking-wider text-[#A89F91] block">
                      Registrations
                    </span>
                    <span className="text-[#F4DD9F] font-semibold mt-0.5 block">
                      {registrations.length} Active
                    </span>
                  </div>
                </div>
              </SpotlightCard>

              {/* Quick Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/events" className="block group">
                  <SpotlightCard className="p-5 h-full hover:border-[#CC892F]/70 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-[#CC892F]/15 border border-[#CC892F]/40 flex items-center justify-center text-[#E3B464] mb-3">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#F4DD9F] group-hover:text-white transition-colors flex items-center justify-between">
                      Browse Competitions
                      <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
                    </h3>
                    <p className="text-xs text-[#A89F91] mt-1">
                      Explore drill, cultural, and adventure events open for your division.
                    </p>
                  </SpotlightCard>
                </Link>

                <Link href="/dashboard/profile" className="block group">
                  <SpotlightCard className="p-5 h-full hover:border-[#E3B464]/60 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-[#242321] border border-[#64401F]/60 flex items-center justify-center text-[#F4DD9F] mb-3">
                      <UserCog className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#F4DD9F] group-hover:text-white transition-colors flex items-center justify-between">
                      Manage Cadet Dossier
                      <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
                    </h3>
                    <p className="text-xs text-[#A89F91] mt-1">
                      Update your phone, division, and institutional hierarchy.
                    </p>
                  </SpotlightCard>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <SpotlightCard className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="font-serif text-xl text-[#F4DD9F]">Event Registrations</h2>
                <p className="text-xs text-[#A89F91] mt-0.5">
                  Track verification and payment status for all your enlisted events.
                </p>
              </div>
              <StarBorder as={Link} href="/events" color="#E3B464" className="h-9">
                <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#F4DD9F] inline-flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#CC892F]" />
                  Register for Event
                </span>
              </StarBorder>
            </div>

            {registrations.length === 0 ? (
              <div className="py-14 flex flex-col items-center text-center gap-3 border border-dashed border-[#3A291B] rounded-2xl">
                <Ticket className="w-10 h-10 text-[#CC892F]/60" />
                <p className="text-sm font-medium text-[#F5EFE6]">No event registrations yet</p>
                <p className="text-xs text-[#A89F91] max-w-xs">
                  Browse the DHRUVA events and enlist in individual or squad competitions.
                </p>
                <Link
                  href="/events"
                  className="mt-2 h-9 px-5 rounded-full gold-gradient-button text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition"
                >
                  Explore Events
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((reg) => {
                  const ev = reg.events ?? reg.event
                  const eventTitle = ev?.title || ev?.name || 'Untitled Event'
                  const memberCount =
                    reg.registration_members?.length || reg.members?.length || 1
                  const isVerified =
                    reg.payment_status === 'verified' || reg.payment_status === 'paid'
                  const isPending = reg.payment_status === 'pending'

                  return (
                    <div
                      key={reg.id}
                      className="bg-[#141311] border border-[#3A291B]/80 hover:border-[#CC892F]/55 rounded-xl px-4 py-3.5 flex items-center justify-between gap-4 transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {ev?.id ? (
                            <Link
                              href={`/events/${ev.id}`}
                              className="font-medium text-[#F5EFE6] hover:text-[#F4DD9F] text-sm truncate transition-colors"
                            >
                              {eventTitle}
                            </Link>
                          ) : (
                            <p className="font-medium text-[#F5EFE6] text-sm truncate">
                              {eventTitle}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#A89F91] mt-1 flex-wrap">
                          {reg.team_name && <span>Team: {reg.team_name}</span>}
                          <span>{memberCount} member(s)</span>
                          {ev?.venue && <span>• {ev.venue}</span>}
                          <span>• {new Date(reg.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-semibold shrink-0 border ${
                          isVerified
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                            : isPending
                            ? 'bg-[#CC892F]/15 border-[#CC892F]/40 text-[#F4DD9F]'
                            : 'bg-red-500/15 border-red-500/30 text-red-300'
                        }`}
                      >
                        {isVerified ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : isPending ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {isVerified ? 'Verified' : isPending ? 'Pending' : reg.payment_status}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </SpotlightCard>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#CC892F] border-t-transparent animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
