'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, UserCog } from 'lucide-react'
import RegistrationForm from '@/components/RegistrationForm'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { SpotlightCard } from '@/components/reactbits'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
  isActive?: boolean
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
          isActive: rawEvent.is_active !== false,
        }

        if (mappedEvent.isActive === false) {
          setError('Registration for this event is currently closed.')
          setLoading(false)
          return
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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#CC892F] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#A89F91] text-xs uppercase tracking-widest">
            Loading Registration Portal…
          </p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <SpotlightCard className="max-w-md w-full p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-[#E3B464] mx-auto mb-3" />
          <h2 className="text-xl font-serif text-[#F4DD9F] mb-2">Registration Unavailable</h2>
          <p className="text-sm text-[#A89F91] mb-6">{error || 'Event could not be found.'}</p>
          <Link href="/events">
            <Button>Return to Events</Button>
          </Link>
        </SpotlightCard>
      </div>
    )
  }

  if (userProfile && !userProfile.profileComplete) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <SpotlightCard className="max-w-md w-full p-8 text-center border-[#CC892F]/50">
          <div className="w-12 h-12 bg-[#CC892F]/15 border border-[#CC892F]/40 text-[#E3B464] rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCog className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif text-[#F4DD9F] mb-2">Profile Incomplete</h2>
          <p className="text-sm text-[#A89F91] mb-6">
            Complete your cadet record (NCC Group, Battalion, Institution &amp; Division) before
            enlisting in any competitive operations.
          </p>
          <Link href="/dashboard/profile">
            <Button>Complete Profile Now →</Button>
          </Link>
        </SpotlightCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5EFE6]">
      <SiteHeader />

      <main className="flex-1 max-w-2xl w-full mx-auto pt-24 pb-20 px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#A89F91] hover:text-[#F4DD9F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel &amp; Return
          </Link>
          <Badge variant="gold">Cadet Enlistment</Badge>
        </div>

        {/* Stepper / Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#CC892F]">
              STEP 01 OF 02 · EVENT REGISTRATION
            </span>
            <span className="text-[10px] text-[#A89F91] tracking-widest uppercase">
              {event.participationType} mode
            </span>
          </div>
          <div className="h-1 w-full bg-[#242321] rounded-full overflow-hidden">
            <div className="h-full w-1/2 gold-gradient-bg rounded-full shadow-[0_0_10px_#CC892F]" />
          </div>
          <h1 className="font-serif text-3xl gold-gradient-text mt-4 leading-tight">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs text-[#A89F91]">Eligible Divisions:</span>
            {(event.eligibleDivisions || []).map((d) => (
              <Badge key={d} variant="bronze">{d}</Badge>
            ))}
          </div>
        </div>

        {userProfile && <RegistrationForm event={event} userProfile={userProfile} />}
      </main>

      <SiteFooter />
    </div>
  )
}
