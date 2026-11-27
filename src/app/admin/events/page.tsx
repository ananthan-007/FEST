import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CalendarDays, MapPin, Pencil, Plus, Trophy } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth/checkRole'
import DeleteEventButton from '@/components/admin/DeleteEventButton'
import EventStatusSwitch from '@/components/admin/EventStatusSwitch'
import { SpotlightCard, ShinyText } from '@/components/reactbits'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

const DIVISION_COLORS: Record<string, string> = {
  SD: 'bg-[#242321] border border-[#CC892F]/50 text-[#F4DD9F]',
  SW: 'bg-[#242321] border border-[#E3B464]/50 text-[#E3B464]',
  JD: 'bg-[#242321] border border-emerald-500/35 text-emerald-300',
  JW: 'bg-[#242321] border border-amber-500/35 text-amber-200',
}

export default async function AdminEventsPage() {
  const admin = await checkAdmin()
  if (!admin) redirect('/unauthorized')

  const adminClient = createAdminClient()
  const { data: events } = await adminClient
    .from('events')
    .select(`
      id, title, venue, event_date, event_time, fee,
      participation_type, eligible_divisions, is_active, created_at,
      sub_categories (
        id,
        name,
        categories (
          id,
          name
        )
      ),
      event_division_instances (id, division, status),
      registrations (count)
    `)
    .order('created_at', { ascending: false })

  const eventList = Array.isArray(events) ? events : []

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#3A291B]/80 pb-5">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#CC892F] block mb-1">
            Command Center
          </span>
          <h1 className="text-3xl font-serif text-[#F5EFE6]">
            Event <ShinyText text="Operations" speed={5} className="font-serif" />
          </h1>
          <p className="text-xs text-[#A89F91] mt-1">
            Manage competitive disciplines, eligible divisions, fees, and registration counts.
          </p>
        </div>
        <Link href="/admin/events/new" className="shrink-0">
          <Button size="sm">
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </Link>
      </div>

      <SpotlightCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#3A291B]/70 text-left">
            <thead className="bg-[#141311]/95 text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91]">
              <tr>
                <th className="px-6 py-4">Event &amp; Details</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Eligibility</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Registrations</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A291B]/60 text-xs text-[#F5EFE6]">
              {eventList.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-[#A89F91]">
                    <Trophy className="w-9 h-9 mx-auto mb-2 opacity-35 text-[#CC892F]" />
                    No competitive operations registered yet.
                  </td>
                </tr>
              )}
              {eventList.map((event: any) => {
                const categoryName = event.sub_categories?.categories?.name || 'Uncategorized'
                const subCategoryName = event.sub_categories?.name
                const regCount = Array.isArray(event.registrations)
                  ? Number(event.registrations[0]?.count ?? 0)
                  : 0
                const feeNum = Number(event.fee ?? 0)

                return (
                  <tr key={event.id} className="hover:bg-[#242321]/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-[#F4DD9F]">
                          {event.title || 'Untitled Event'}
                        </span>
                        <Badge variant="outline" className="text-[9px] capitalize">
                          {event.participation_type || 'individual'}
                        </Badge>
                        {event.is_active === false && (
                          <Badge variant="danger" className="text-[9px]">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-[#A89F91] flex items-center gap-3 mt-1 flex-wrap">
                        <span>{feeNum > 0 ? `₹${feeNum}` : 'Free'}</span>
                        {event.event_date && (
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="w-3 h-3 text-[#CC892F]" />
                            {new Date(event.event_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        )}
                        {event.venue && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#CC892F]" />
                            {event.venue}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-[#F5EFE6]">{categoryName}</div>
                      {subCategoryName && (
                        <div className="text-[10px] text-[#A89F91] mt-0.5">{subCategoryName}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(event.eligible_divisions ?? []).length > 0 ? (
                          event.eligible_divisions.map((div: string) => (
                            <span
                              key={div}
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                DIVISION_COLORS[div] ?? 'bg-[#242321] text-[#A89F91]'
                              }`}
                            >
                              {div}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[#A89F91]">All</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <EventStatusSwitch
                        eventId={event.id}
                        initialActive={event.is_active !== false}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <span className="h-6 px-2.5 inline-flex items-center bg-[#242321] border border-[#3A291B] rounded-full font-bold text-[#F4DD9F]">
                        {regCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="h-8 px-3 rounded-full bg-[#242321] hover:bg-[#3A291B]/70 border border-[#64401F]/60 text-[#F4DD9F] transition inline-flex items-center gap-1.5 text-[11px] font-semibold"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </Link>
                        <DeleteEventButton
                          eventId={event.id}
                          hasRegistrations={regCount > 0}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SpotlightCard>
    </div>
  )
}
