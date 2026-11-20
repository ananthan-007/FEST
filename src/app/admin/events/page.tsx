import Link from 'next/link'
import { cookies } from 'next/headers'
import DeleteEventButton from '@/components/admin/DeleteEventButton'

const DIVISION_COLORS: Record<string, string> = {
  SD: 'bg-blue-500/15 border border-blue-500/30 text-blue-400',
  SW: 'bg-purple-500/15 border border-purple-500/30 text-purple-400',
  JD: 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400',
  JW: 'bg-pink-500/15 border border-pink-500/30 text-pink-400',
}

async function getEvents() {
  const cookieStore = cookies()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/admin/events`, {
    headers: { Cookie: cookieStore.toString() },
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export default async function AdminEventsPage() {
  const events = await getEvents()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C8102E] block mb-1">
            Command Center
          </span>
          <h1 className="text-2xl font-serif text-[#DDE2F6]">Event Operations Directory</h1>
          <p className="text-xs text-[#8A94A8] mt-1">
            Manage competitive wings, eligible cadres, and operational divisions.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 h-11 px-6 bg-[#C8102E] hover:bg-[#A00B22] text-white rounded-full text-xs font-semibold uppercase tracking-wider shadow-[0_0_20px_rgba(200,16,46,0.35)] transition shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create Event
        </Link>
      </div>

      <div className="bg-[#0D1321]/80 backdrop-blur-xl border border-white/8 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5 text-left">
            <thead className="bg-[#161B2A]/90 text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8]">
              <tr>
                <th className="px-6 py-4">Title &amp; Venue</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Eligibility</th>
                <th className="px-6 py-4">Division Status</th>
                <th className="px-6 py-4">Registrations</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-[#DDE2F6]">
              {events.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#8A94A8]">
                    <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">
                      event_busy
                    </span>
                    No competitive operations registered.
                  </td>
                </tr>
              )}
              {(Array.isArray(events) ? events : []).map((event: any) => (
                <tr key={event.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-sm text-[#DDE2F6]">{event.title}</div>
                    {event.venue && (
                      <div className="text-[11px] text-[#8A94A8] flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {event.venue}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#DDE2F6]">{event.categories?.name ?? '—'}</div>
                    {event.sub_categories && (
                      <div className="text-[10px] text-[#8A94A8]">{event.sub_categories.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(event.eligible_divisions ?? []).map((div: string) => (
                        <span
                          key={div}
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            DIVISION_COLORS[div] ?? 'bg-white/5 text-[#8A94A8]'
                          }`}
                        >
                          {div}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(event.event_division_instances ?? []).map((inst: any) => (
                        <span
                          key={inst.id}
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            inst.status === 'active'
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                              : 'bg-red-500/15 border-red-500/30 text-red-400 line-through'
                          }`}
                        >
                          {inst.division}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="h-6 px-2.5 inline-flex items-center bg-white/5 rounded-full font-bold text-[#DDE2F6]">
                      {event._count?.registrations ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="h-8 px-3 rounded-full bg-white/5 hover:bg-white/10 text-[#ADC6FF] hover:text-white transition inline-flex items-center text-xs font-semibold"
                      >
                        Edit
                      </Link>
                      <DeleteEventButton
                        eventId={event.id}
                        hasRegistrations={(event._count?.registrations ?? 0) > 0}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
