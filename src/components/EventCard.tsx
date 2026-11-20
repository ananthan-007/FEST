'use client'

import React from 'react'
import Link from 'next/link'

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
  SD: { label: 'SD', className: 'bg-surface-container text-secondary border border-secondary/30' },
  SW: { label: 'SW', className: 'bg-surface-container text-pink-300 border border-pink-400/30' },
  JD: { label: 'JD', className: 'bg-surface-container text-emerald-300 border border-emerald-400/30' },
  JW: { label: 'JW', className: 'bg-surface-container text-purple-300 border border-purple-400/30' },
}

interface Props {
  event: Event
}

export default function EventCard({ event }: Props) {
  const feeNum = typeof event.fee === 'object' && event.fee !== null && 'toNumber' in event.fee
    ? (event.fee as { toNumber: () => number }).toNumber()
    : Number(event.fee ?? 0)

  const dateLabel = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : 'TBA'

  const feeLabel = feeNum > 0 ? `₹${feeNum}` : 'Free'
  const formatLabel = event.participationType === 'individual' ? 'Solo' : 'Squad'

  return (
    <article
      className="event-card group relative flex flex-col rounded-2xl overflow-hidden bg-surface-container-low/75 backdrop-blur-md border border-white/5 shadow-xl hover:border-primary-container/40 hover:shadow-[0_12px_32px_rgba(200,16,46,0.22)] transition-all duration-300 transform hover:-translate-y-1"
      data-category={event.category?.name?.toLowerCase() || 'all'}
      data-divisions={event.eligibleDivisions.join(',')}
      data-title={event.title}
    >
      {/* Poster Media Shell */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-surface-container-lowest">
        {event.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.posterUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-surface-container-high/40 to-surface-container-lowest text-on-surface-variant p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-primary-container mb-2">military_tech</span>
            <span className="font-serif text-sm tracking-widest uppercase text-slate-300">{event.title}</span>
          </div>
        )}

        {/* Ambient Poster Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080E1C] via-transparent to-black/50" />

        {/* Top Status Chip */}
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#080E1C]/85 backdrop-blur-md text-emerald-400 font-sans text-[11px] font-bold shadow-md border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Open</span>
          </span>
        </div>

        {/* Category Badge */}
        {event.category && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#080E1C]/85 backdrop-blur-md text-on-surface font-sans text-[11px] font-semibold border border-white/10">
            <span className="material-symbols-outlined text-[14px] text-primary">military_tech</span>
            <span className="truncate max-w-[120px]">{event.category.name}</span>
          </div>
        )}
      </div>

      {/* Content Footer */}
      <div className="p-4 flex flex-col justify-between flex-1 bg-surface-container-low/95">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-white tracking-wide group-hover:text-primary transition-colors line-clamp-1">
            {event.title}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1 tracking-wide">
            {feeLabel} · {dateLabel} · {formatLabel}
          </p>
          {event.venue && (
            <p className="text-[11px] text-slate-400 mt-1 truncate flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-primary">location_on</span>
              <span>{event.venue}</span>
            </p>
          )}
        </div>

        {/* Division Badges & Action */}
        <div className="mt-4 pt-3 flex items-center justify-between border-t border-white/5">
          <div className="flex items-center gap-1 flex-wrap">
            {event.eligibleDivisions.length > 0 ? (
              event.eligibleDivisions.map((div) => {
                const badge = divisionBadgeConfig[div] || { label: div, className: 'bg-surface-container text-slate-300' }
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
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-container text-slate-400 font-bold">
                ALL
              </span>
            )}
          </div>

          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1 text-primary hover:text-white text-xs font-bold uppercase tracking-wider transition-colors ml-2"
          >
            <span>Brief</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
