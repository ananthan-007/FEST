import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ConflictAlertWrapper from '@/components/ConflictAlertWrapper'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params

  const adminClient = createAdminClient()
  const { data: event } = await adminClient
    .from('events')
    .select(`
      *,
      sub_categories (
        id,
        name,
        categories (
          id,
          name
        )
      ),
      event_division_instances (*),
      prize_pool_groups (*)
    `)
    .eq('id', id)
    .single()

  if (!event) notFound()

  // Server-side session check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const dateLabel = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-IN', { dateStyle: 'long' }) +
      (event.event_time ? ` ${event.event_time}` : '')
    : 'TBA'

  const feeNum = Number(event.fee ?? 0)
  const feeLabel = feeNum > 0 ? `₹${feeNum}` : 'Free'

  return (
    <div className="min-h-screen bg-[#050A18] text-[#DDE2F6] pb-20">
      {/* Poster Hero */}
      <div className="relative h-72 sm:h-[420px] w-full overflow-hidden">
        {event.poster_url ? (
          <img src={event.poster_url} alt={event.title} className="w-full h-full object-cover object-top" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0D1321] to-[#050A18] flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-[#C8102E]/30">military_tech</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050A18] via-[#050A18]/50 to-transparent"/>
        {/* Back button */}
        <a href="/" className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </a>
        {/* Category badge */}
        {event.sub_categories?.categories && (
          <div className="absolute bottom-4 left-4">
            <span className="h-6 px-3 inline-flex items-center bg-[#C8102E]/20 border border-[#C8102E]/40 rounded-full text-[10px] font-semibold tracking-[0.14em] uppercase text-[#FFB3B1]">
              {event.sub_categories.categories.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-2 space-y-5">
        {/* Title */}
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#DDE2F6] leading-tight">{event.title}</h1>
          {event.sub_categories && (
            <p className="text-[#8A94A8] text-sm mt-1">{event.sub_categories.name}</p>
          )}
        </div>

        {/* Metadata capsule strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: 'calendar_month', label: 'Date', value: dateLabel },
            { icon: 'location_on', label: 'Venue', value: event.venue ?? 'TBA' },
            { icon: 'payments', label: 'Fee', value: feeLabel },
            { icon: 'groups', label: 'Format', value: event.participation_type },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-[#0D1321]/80 border border-white/5 rounded-2xl px-3 py-3">
              <span className="material-symbols-outlined text-[#C8102E] text-[18px] block mb-1">{icon}</span>
              <span className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] block">{label}</span>
              <span className="text-sm font-medium text-[#DDE2F6] capitalize">{value}</span>
            </div>
          ))}
        </div>

        {/* Dashed separator (perforated ticket feel) */}
        <div className="border-t-2 border-dashed border-white/10 my-2"/>

        {/* Description */}
        {event.description && (
          <section className="bg-[#0D1321]/60 border border-white/5 rounded-2xl px-5 py-4">
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-2">About The Event</p>
            <p className="text-[#DDE2F6] text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </section>
        )}

        {/* Rules link */}
        <a href={`/events/${event.id}/rules`} className="flex items-center gap-3 bg-[#161B2A] border border-white/5 rounded-2xl px-5 py-4 hover:border-[#C8102E]/30 transition group">
          <span className="material-symbols-outlined text-[#C8102E] text-[22px]">menu_book</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#DDE2F6]">Full Rules &amp; Regulations</p>
            <p className="text-xs text-[#8A94A8]">Read before registering</p>
          </div>
          <span className="material-symbols-outlined text-[#8A94A8] group-hover:text-[#C8102E] transition text-[20px]">chevron_right</span>
        </a>

        {/* Division instances */}
        {event.event_division_instances && event.event_division_instances.length > 0 && (
          <section>
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-3">Eligible Divisions</p>
            <div className="flex flex-wrap gap-2">
              {event.event_division_instances.map((inst: any) => (
                <span key={inst.id} className={`h-7 px-4 inline-flex items-center gap-1.5 rounded-full text-xs font-semibold border ${
                  inst.status === 'active'
                    ? 'bg-[#C8102E]/15 border-[#C8102E]/30 text-[#FFB3B1]'
                    : 'bg-white/5 border-white/10 text-[#8A94A8] line-through'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${inst.status === 'active' ? 'bg-[#C8102E]' : 'bg-[#8A94A8]'}`}/>
                  {inst.division}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Prize Pool */}
        {event.prize_pool_groups && event.prize_pool_groups.length > 0 && (
          <section className="bg-[#0D1321]/60 border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 pt-4 pb-2">
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8]">Prize Pool</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-5 py-2.5 text-left text-[10px] font-semibold tracking-[0.12em] uppercase text-[#8A94A8]">Group</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold tracking-[0.12em] uppercase text-[#8A94A8]">1st</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold tracking-[0.12em] uppercase text-[#8A94A8]">2nd</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold tracking-[0.12em] uppercase text-[#8A94A8]">3rd</th>
                </tr>
              </thead>
              <tbody>
                {event.prize_pool_groups.map((pg: any, i: number) => (
                  <tr key={pg.id} className={`border-b border-white/5 last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                    <td className="px-5 py-3 font-medium text-[#DDE2F6]">{pg.name ?? `Group ${i + 1}`}</td>
                    <td className="px-4 py-3 text-amber-400 font-semibold">{pg.prize_1st ? `₹${Number(pg.prize_1st)}` : '—'}</td>
                    <td className="px-4 py-3 text-[#8A94A8]">{pg.prize_2nd ? `₹${Number(pg.prize_2nd)}` : '—'}</td>
                    <td className="px-4 py-3 text-orange-400">{pg.prize_3rd ? `₹${Number(pg.prize_3rd)}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* CTA */}
        <div className="pt-2 pb-8">
          {!user ? (
            <a href={`/auth/login?redirectTo=/events/${event.id}`}
              className="flex items-center justify-center h-13 w-full bg-[#C8102E] hover:bg-[#A00B22] text-white font-bold rounded-full shadow-[0_0_24px_rgba(200,16,46,0.4)] transition text-sm tracking-wide py-4">
              Sign In to Register
            </a>
          ) : (
            <ConflictAlertWrapper
              eventId={event.id}
              conflictAlertEnabled={event.conflict_alert_enabled ?? false}
              userId={user.id}
            />
          )}
        </div>
      </div>
    </div>
  )
}
