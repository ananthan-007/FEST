import React from 'react'

export interface ParticipantProfile {
  id: string
  email?: string
  display_name?: string | null
  displayName?: string | null
  phone?: string | null
  division?: string | null
  ncc_unit?: string | null
  nccUnit?: string | null
  photo_url?: string | null
  photoUrl?: string | null
  role?: string
  qr_token?: string | null
  institution?: {
    id: string
    name: string
    battalion?: {
      id: string
      name: string
      ncc_group?: { id: string; name: string } | null
      group?: { id: string; name: string } | null
    } | null
  } | null
}

export interface ParticipantRegistration {
  event_id: string
  event_title: string
  participation_type: 'individual' | 'team' | string
  payment_status: 'verified' | 'pending' | 'failed' | string
  is_leader: boolean
  team_name?: string | null
  member_count?: number
}

interface ParticipantDetailViewProps {
  profile: ParticipantProfile
  registrations: ParticipantRegistration[]
}

export default function ParticipantDetailView({ profile, registrations }: ParticipantDetailViewProps) {
  const name = profile.display_name || profile.displayName || 'Unknown Cadet'
  const division = profile.division || null
  const nccUnit = profile.ncc_unit || profile.nccUnit || '—'
  const institutionName = profile.institution?.name || '—'
  const battalionName = profile.institution?.battalion?.name || '—'
  const groupName =
    profile.institution?.battalion?.ncc_group?.name ||
    profile.institution?.battalion?.group?.name ||
    '—'

  const initials = name
    .trim()
    .split(/\s+/)
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const divisionStyle = division
    ? {
        SD: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
        SW: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
        JD: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        JW: 'bg-pink-500/15 border-pink-500/30 text-pink-400',
      }[division] || 'bg-white/5 border-[#3A291B]/90 text-[#A89F91]'
    : ''

  return (
    <div className="bg-[#0D0C0A]/80 backdrop-blur-xl border border-[#3A291B]/80 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-[#141311] px-5 py-5 border-b border-[#3A291B]/60">
        <div className="flex items-center gap-4">
          {/* Monogram circle - strict military anonymity, no photo */}
          <div className="w-16 h-16 rounded-full bg-[#CC892F]/20 border border-[#CC892F]/30 flex items-center justify-center shrink-0">
            <span className="text-[#CC892F] text-xl font-bold tracking-wider">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-xl text-[#F5EFE6]">{name}</h2>
              {division && (
                <span
                  className={`inline-flex items-center h-5 px-2.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${divisionStyle}`}
                >
                  {division}
                </span>
              )}
            </div>
            <p className="text-xs text-[#A89F91] mt-0.5">{profile.email || 'No email provided'}</p>
            {profile.phone && <p className="text-xs text-[#A89F91]/70 mt-0.5">{profile.phone}</p>}
          </div>
        </div>
      </div>

      {/* Cadre & Institution Hierarchy */}
      <div className="px-5 py-4 border-b border-[#3A291B]/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'NCC Unit', value: nccUnit },
          { label: 'Institution', value: institutionName },
          { label: 'Battalion', value: battalionName },
          { label: 'NCC Group', value: groupName },
        ].map(({ label, value }) => (
          <div key={label}>
            <span className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[#A89F91] block mb-0.5">
              {label}
            </span>
            <span className="text-sm font-medium text-[#F5EFE6]">{value}</span>
          </div>
        ))}
      </div>

      {/* Registrations List */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91]">
            Registered Events
          </p>
          <span className="h-5 px-2 bg-[#CC892F]/15 border border-[#CC892F]/25 rounded-full text-[9px] font-bold text-[#F4DD9F]">
            {registrations.length}
          </span>
        </div>

        {registrations.length === 0 ? (
          <div className="py-6 text-center border border-dashed border-[#3A291B]/90 rounded-xl">
            <span className="material-symbols-outlined text-3xl text-[#A89F91]/30 block mb-2">event_busy</span>
            <p className="text-xs text-[#A89F91]">No event registrations found for this cadet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {registrations.map((reg, idx) => {
              const isVerified = reg.payment_status === 'verified' || reg.payment_status === 'paid'
              const isPending = reg.payment_status === 'pending'

              return (
                <div
                  key={`${reg.event_id}-${idx}`}
                  className="bg-[#141311] border border-[#3A291B]/60 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#F5EFE6] truncate">{reg.event_title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block h-4 px-2 bg-white/5 rounded-full text-[9px] font-semibold uppercase text-[#A89F91] capitalize">
                        {reg.participation_type}
                      </span>
                      <span
                        className={`inline-block h-4 px-2 rounded-full text-[9px] font-semibold uppercase ${
                          reg.is_leader ? 'bg-[#E3B464]/15 text-[#E3B464]' : 'text-[#A89F91]'
                        }`}
                      >
                        {reg.is_leader ? 'Leader' : 'Member'}
                      </span>
                      {reg.team_name && (
                        <span className="text-[9px] text-[#A89F91]">
                          Team: {reg.team_name} ({reg.member_count ?? 1})
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 h-6 px-3 rounded-full text-[10px] font-semibold border ${
                      isVerified
                        ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
                        : isPending
                        ? 'bg-amber-500/15 border-amber-500/25 text-amber-400'
                        : 'bg-red-500/15 border-red-500/25 text-red-400'
                    }`}
                  >
                    <span
                      className={`w-1 h-1 rounded-full ${
                        isVerified ? 'bg-emerald-400' : isPending ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                    />
                    {isVerified ? 'Verified' : isPending ? 'Pending' : reg.payment_status}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
