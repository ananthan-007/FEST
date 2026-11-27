'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Award, MapPin } from 'lucide-react'
import SpotlightCard from '@/components/reactbits/SpotlightCard'

type Division = { id: string; division: string; status: string }

type Event = {
  id: string
  title: string
  description: string | null
  posterUrl: string | null
  participationType: string
  eligibleDivisions: string[]
  fee: number | string | null | { toNumber?: () => number }
  eventDate?: Date | string | null
  eventTime?: string | null
  venue: string | null
  conflictAlertEnabled: boolean
  isActive: boolean
  category: { id: string; name: string } | null
  subCategory: { id: string; name: string } | null
  divisionInstances?: Division[]
}

const divisionBadgeConfig: Record<string, { label: string; className: string }> = {
  SD: { label: 'SD', className: 'bg-[#242321] text-[#F4DD9F] border border-[#64401F]/60' },
  SW: { label: 'SW', className: 'bg-[#242321] text-[#E3B464] border border-[#64401F]/60' },
  JD: { label: 'JD', className: 'bg-[#242321] text-emerald-300 border border-emerald-500/30' },
  JW: { label: 'JW', className: 'bg-[#242321] text-amber-200 border border-amber-500/30' },
}

interface Props {
  event: Event
}

export default function EventCard({ event }: Props) {
  const feeNum =
    typeof event.fee === 'object' && event.fee !== null && 'toNumber' in event.fee
      ? (event.fee as { toNumber: () => number }).toNumber()
      : Number(event.fee ?? 0)

  const dateLabel = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : 'TBA'

  const feeLabel = feeNum > 0 ? `₹${feeNum}` : 'Free'
  const formatLabel = event.participationType === 'individual' ? 'Solo' : 'Squad'

  return (
    <SpotlightCard
      spotlightColor="rgba(204, 137, 47, 0.24)"
      className="event-card group flex flex-col h-full bg-[#0D0C0A]/90 border-[#3A291B]/90 shadow-xl hover:border-[#CC892F]/70 hover:shadow-[0_12px_34px_rgba(204,137,47,0.2)] transition-all duration-300 transform hover:-translate-y-1"
      data-category={event.category?.name?.toLowerCase() || 'all'}
      data-divisions={event.eligibleDivisions.join(',')}
      data-title={event.title}
    >
      {/* Poster Media Shell */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#050505]">
        {event.posterUrl ? (
          <Image
            src={event.posterUrl}
            alt={event.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#242321]/45 to-[#050505] text-[#A89F91] p-6 text-center">
            <Award className="w-10 h-10 text-[#CC892F] mb-2" />
            <span className="font-serif text-sm tracking-widest uppercase text-[#F4DD9F]">
              {event.title}
            </span>
          </div>
        )}

        {/* Ambient Poster Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/55" />

        {/* Top Status Chip */}
        <div className="absolute top-3 right-3 z-10">
          {event.isActive !== false ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#050505]/85 backdrop-blur-md text-emerald-400 font-sans text-[11px] font-bold shadow-md border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Open</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#050505]/85 backdrop-blur-md text-[#A89F91] font-sans text-[11px] font-bold shadow-md border border-[#3A291B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A89F91]" />
              <span>Closed</span>
            </span>
          )}
        </div>

        {/* Category Badge */}
        {event.category && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#050505]/85 backdrop-blur-md text-[#F4DD9F] font-sans text-[11px] font-semibold border border-[#64401F]/60">
            <Award className="w-3.5 h-3.5 text-[#E3B464]" />
            <span className="truncate max-w-[120px]">{event.category.name}</span>
          </div>
        )}
      </div>

      {/* Content Footer */}
      <div className="p-4 flex flex-col justify-between flex-1 bg-[#0D0C0A]/95">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#F5EFE6] tracking-wide group-hover:text-[#F4DD9F] transition-colors line-clamp-1">
            {event.title}
          </h3>
          <p className="text-xs text-[#A89F91] mt-1 tracking-wide">
            {feeLabel} · {dateLabel} · {formatLabel}
          </p>
          {event.venue && (
            <p className="text-[11px] text-[#A89F91]/85 mt-1 truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#CC892F] shrink-0" />
              <span>{event.venue}</span>
            </p>
          )}
        </div>

        {/* Division Badges & Action */}
        <div className="mt-4 pt-3 flex items-center justify-between border-t border-[#3A291B]/60">
          <div className="flex items-center gap-1 flex-wrap">
            {event.eligibleDivisions.length > 0 ? (
              event.eligibleDivisions.map((div) => {
                const badge = divisionBadgeConfig[div] || {
                  label: div,
                  className: 'bg-[#242321] text-[#F5EFE6] border border-[#3A291B]',
                }
                return (
                  <span
                    key={div}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                )
              })
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#242321] text-[#A89F91] font-bold">
                ALL
              </span>
            )}
          </div>

          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1 text-[#E3B464] hover:text-[#F4DD9F] text-xs font-bold uppercase tracking-wider transition-colors ml-2"
          >
            <span>Brief</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </SpotlightCard>
  )
}
