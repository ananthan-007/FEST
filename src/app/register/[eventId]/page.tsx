'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import RegistrationForm from '@/components/RegistrationForm'

interface EventData {
  id: string
  title: string
  participationType: 'individual' | 'team'
  eligibleDivisions: string[]
  institutionRestriction: string
  teamMin: number | null
  teamMax: number | null
  fee: number | string | null
  conflictAlertEnabled: boolean
}

interface UserProfile {
  id: string
  displayName: string | null
  division: string | null
  profileComplete: boolean
}

export default function RegisterEventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<EventData | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch event & user profile in parallel
        const [eventRes, profileRes] = await Promise.all([
          fetch(`/api/events/${eventId}`),
          fetch('/api/user/profile'),
        ])

        if (profileRes.status === 401) {
          router.push(`/auth/login?next=/register/${eventId}`)
          return
        }

        if (!eventRes.ok) {
          setError('Event not found or failed to load.')
          setLoading(false)
          return
        }

        if (!profileRes.ok) {
          setError('Failed to load cadet profile.')
          setLoading(false)
          return
        }

        const rawEvent = await eventRes.json()
        const profileData = await profileRes.json()

        const mappedEvent: EventData = {
          id: rawEvent.id,
          title: rawEvent.title,
          participationType: rawEvent.participation_type || rawEvent.participationType || 'individual',
          eligibleDivisions: Array.isArray(rawEvent.eligible_divisions)
            ? rawEvent.eligible_divisions
            : Array.isArray(rawEvent.eligibleDivisions)
            ? rawEvent.eligibleDivisions
            : [],
          institutionRestriction: rawEvent.institution_restriction || rawEvent.institutionRestriction || 'none',
          teamMin: rawEvent.team_min ?? rawEvent.teamMin ?? null,
          teamMax: rawEvent.team_max ?? rawEvent.teamMax ?? null,
          fee: rawEvent.fee ?? 0,
          conflictAlertEnabled: !!(rawEvent.conflict_alert_enabled ?? rawEvent.conflictAlertEnabled),
        }

        setEvent(mappedEvent)
        setUserProfile(profileData)
      } catch (err) {
        console.error(err)
        setError('An unexpected error occurred while loading.')
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      loadData()
    }
  }, [eventId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050A18] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#C8102E] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8A94A8] text-xs uppercase tracking-widest">
            Loading Registration Portal…
          </p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#050A18] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 bg-[#0D1321]/80 border border-white/8 rounded-2xl text-center shadow-2xl">
          <span className="material-symbols-outlined text-4xl text-[#C8102E] block mb-3">
            warning
          </span>
          <h2 className="text-xl font-serif text-[#DDE2F6] mb-2">Registration Unavailable</h2>
          <p className="text-sm text-[#8A94A8] mb-6">{error || 'Event could not be found.'}</p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-[#C8102E] hover:bg-[#A00B22] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition shadow-[0_0_20px_rgba(200,16,46,0.35)]"
          >
            Return to Events
          </Link>
        </div>
      </div>
    )
  }

  // Profile incomplete gate
  if (userProfile && !userProfile.profileComplete) {
    return (
      <div className="min-h-screen bg-[#050A18] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 bg-[#0D1321]/80 border border-amber-500/25 rounded-2xl shadow-2xl text-center">
          <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl">person_alert</span>
          </div>
          <h2 className="text-xl font-serif text-[#DDE2F6] mb-2">Profile Incomplete</h2>
          <p className="text-sm text-[#8A94A8] mb-6">
            Complete your cadet record (NCC Group, Battalion, Institution &amp; Division) before
            enlisting in any competitive operations.
          </p>
          <Link
            href="/dashboard/profile"
            className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-full transition shadow-lg"
          >
            Complete Profile Now →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050A18] text-[#DDE2F6] pb-24">
      {/* Top Header */}
      <header className="h-16 px-4 sm:px-8 border-b border-white/5 flex items-center justify-between bg-[#050A18]/80 backdrop-blur-xl sticky top-0 z-40">
        <Link
          href={`/events/${event.id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#8A94A8] hover:text-[#DDE2F6] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Cancel &amp; Return
        </Link>
        <span className="h-6 px-3 inline-flex items-center bg-[#C8102E]/15 border border-[#C8102E]/30 rounded-full text-[9px] font-semibold tracking-wider uppercase text-[#FFB3B1]">
          Cadet Enlistment
        </span>
      </header>

      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        {/* Stepper / Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#C8102E]">
              STEP 01 OF 02 · EVENT REGISTRATION
            </span>
            <span className="text-[10px] text-[#8A94A8] tracking-widest uppercase">
              {event.participationType} mode
            </span>
          </div>
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-[#C8102E] rounded-full shadow-[0_0_10px_#C8102E]" />
          </div>
          <h1 className="font-serif text-3xl text-[#DDE2F6] mt-4 leading-tight">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs text-[#8A94A8]">Eligible Divisions:</span>
            {(event.eligibleDivisions || []).map((d) => (
              <span
                key={d}
                className="h-5 px-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-semibold text-[#DDE2F6]"
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        {userProfile && <RegistrationForm event={event} userProfile={userProfile} />}
      </div>
    </div>
  )
}
