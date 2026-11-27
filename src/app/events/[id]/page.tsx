import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Award,
  BookOpen,
  CalendarDays,
  ChevronRight,
  IndianRupee,
  MapPin,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ConflictAlertWrapper from '@/components/ConflictAlertWrapper'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import Breadcrumbs from '@/components/Breadcrumbs'
import { SpotlightCard } from '@/components/reactbits'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const dateLabel = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-IN', { dateStyle: 'long' }) +
      (event.event_time ? ` ${event.event_time}` : '')
    : 'TBA'

  const feeNum = Number(event.fee ?? 0)
  const feeLabel = feeNum > 0 ? `₹${feeNum}` : 'Free'

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5EFE6]">
      <SiteHeader />

      <div className="pt-20 sm:pt-24 max-w-4xl w-full mx-auto px-4 sm:px-6">
        <Breadcrumbs
          items={[
            { label: 'Events', href: '/events' },
            { label: event.title },
          ]}
          className="mb-4"
        />
      </div>

      {/* Poster Hero */}
      <div className="relative h-72 sm:h-[400px] max-w-4xl w-full mx-auto sm:rounded-3xl overflow-hidden border-y sm:border border-[#3A291B]/90">
        {event.poster_url ? (
          <img src={event.poster_url} alt={event.title} className="w-full h-full object-cover object-top" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#242321]/70 to-[#050505] flex items-center justify-center">
            <Award className="w-16 h-16 text-[#CC892F]/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/45 to-transparent" />
        <Link
          href="/events"
          className="absolute top-4 left-4 h-9 px-3.5 inline-flex items-center gap-1.5 rounded-full bg-black/65 backdrop-blur-md border border-[#64401F]/60 text-xs font-semibold text-[#F4DD9F] hover:border-[#E3B464] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Events
        </Link>
        {event.sub_categories?.categories && (
          <div className="absolute bottom-4 left-4">
            <Badge variant="gold" className="px-3 py-1 backdrop-blur-md">
              {event.sub_categories.categories.name}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 mt-6 pb-16 space-y-5 flex-1">
        <ScrollReveal>
          <h1 className="font-serif text-3xl sm:text-4xl gold-gradient-text leading-tight">
            {event.title}
          </h1>
          {event.sub_categories && (
            <p className="text-[#A89F91] text-sm mt-1">{event.sub_categories.name}</p>
          )}
        </ScrollReveal>

        {/* Metadata capsule strip */}
        <ScrollReveal delay={0.05} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: CalendarDays, label: 'Date', value: dateLabel },
            { icon: MapPin, label: 'Venue', value: event.venue ?? 'TBA' },
            { icon: IndianRupee, label: 'Fee', value: feeLabel },
            { icon: Users, label: 'Format', value: event.participation_type },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-[#0D0C0A]/90 border border-[#3A291B]/80 rounded-2xl px-3.5 py-3">
              <Icon className="w-4 h-4 text-[#E3B464] mb-1.5" />
              <span className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[#A89F91] block">
                {label}
              </span>
              <span className="text-sm font-medium text-[#F5EFE6] capitalize">{value}</span>
            </div>
          ))}
        </ScrollReveal>

        <div className="border-t-2 border-dashed border-[#3A291B]/80 my-2" />

        {event.description && (
          <ScrollReveal delay={0.08}>
            <SpotlightCard className="px-5 py-4">
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#E3B464] mb-2">
                About The Event
              </p>
              <p className="text-[#F5EFE6] text-sm leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </SpotlightCard>
          </ScrollReveal>
        )}

        <ScrollReveal delay={0.1}>
          <Link
            href={`/events/${event.id}/rules`}
            className="flex items-center gap-3 bg-[#12110F] border border-[#3A291B] rounded-2xl px-5 py-4 hover:border-[#CC892F]/70 transition group"
          >
            <BookOpen className="w-5 h-5 text-[#E3B464]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#F4DD9F]">Full Rules &amp; Regulations</p>
              <p className="text-xs text-[#A89F91]">Read before registering</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#A89F91] group-hover:text-[#F4DD9F] transition" />
          </Link>
        </ScrollReveal>

        {event.event_division_instances && event.event_division_instances.length > 0 && (
          <ScrollReveal delay={0.12}>
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91] mb-3">
              Eligible Divisions
            </p>
            <div className="flex flex-wrap gap-2">
              {event.event_division_instances.map((inst: any) => (
                <span
                  key={inst.id}
                  className={`h-7 px-4 inline-flex items-center gap-1.5 rounded-full text-xs font-semibold border ${
                    inst.status === 'active'
                      ? 'bg-[#CC892F]/15 border-[#CC892F]/45 text-[#F4DD9F]'
                      : 'bg-[#12110F] border-[#3A291B] text-[#A89F91] line-through'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      inst.status === 'active' ? 'bg-[#E3B464]' : 'bg-[#A89F91]'
                    }`}
                  />
                  {inst.division}
                </span>
              ))}
            </div>
          </ScrollReveal>
        )}

        {event.prize_pool_groups && event.prize_pool_groups.length > 0 && (
          <ScrollReveal delay={0.14}>
            <SpotlightCard className="overflow-hidden">
              <div className="px-5 pt-4 pb-2">
                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#E3B464]">
                  Prize Pool
                </p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#3A291B]/70">
                    <th className="px-5 py-2.5 text-left text-[10px] font-semibold tracking-[0.12em] uppercase text-[#A89F91]">Group</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold tracking-[0.12em] uppercase text-[#A89F91]">1st</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold tracking-[0.12em] uppercase text-[#A89F91]">2nd</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold tracking-[0.12em] uppercase text-[#A89F91]">3rd</th>
                  </tr>
                </thead>
                <tbody>
                  {event.prize_pool_groups.map((pg: any, i: number) => (
                    <tr key={pg.id} className={`border-b border-[#3A291B]/50 last:border-0 ${i % 2 === 0 ? '' : 'bg-[#242321]/30'}`}>
                      <td className="px-5 py-3 font-medium text-[#F5EFE6]">{pg.name ?? `Group ${i + 1}`}</td>
                      <td className="px-4 py-3 text-[#F4DD9F] font-semibold">{pg.prize_1st ? `₹${Number(pg.prize_1st)}` : '—'}</td>
                      <td className="px-4 py-3 text-[#E3B464]">{pg.prize_2nd ? `₹${Number(pg.prize_2nd)}` : '—'}</td>
                      <td className="px-4 py-3 text-[#CC892F]">{pg.prize_3rd ? `₹${Number(pg.prize_3rd)}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SpotlightCard>
          </ScrollReveal>
        )}

        {/* CTA */}
        <div className="pt-2 pb-4">
          {event.is_active === false ? (
            <div className="h-14 w-full rounded-full bg-[#141311] border border-[#3A291B] text-[#A89F91] font-semibold text-xs uppercase tracking-wider flex items-center justify-center">
              Registration Closed
            </div>
          ) : !user ? (
            <Link href={`/auth/login?redirectTo=/events/${event.id}`} className="block">
              <Button size="lg" className="w-full h-14 text-sm">
                Sign In to Register
              </Button>
            </Link>
          ) : (
            <ConflictAlertWrapper
              eventId={event.id}
              conflictAlertEnabled={event.conflict_alert_enabled ?? false}
              userId={user.id}
            />
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
