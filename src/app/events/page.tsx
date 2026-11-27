import { createAdminClient } from '@/lib/supabase/admin'
import CategoryFilterPage from '@/components/CategoryFilterPage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EventsPage() {
  let events: any[] = []
  try {
    const supabase = createAdminClient()
    const { data: rawEvents } = await supabase
      .from('events')
      .select(`
        id, title, description, poster_url,
        participation_type, eligible_divisions,
        fee, event_date, event_time, venue,
        conflict_alert_enabled, is_active,
        sub_categories (
          id,
          name,
          categories (
            id,
            name
          )
        ),
        event_division_instances (
          id,
          division,
          status
        )
      `)
      .order('created_at', { ascending: true })

    if (rawEvents) {
      events = rawEvents.map((e: any) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        posterUrl: e.poster_url,
        participationType: e.participation_type,
        eligibleDivisions: e.eligible_divisions || [],
        fee: e.fee,
        eventDate: e.event_date,
        eventTime: e.event_time,
        venue: e.venue,
        conflictAlertEnabled: e.conflict_alert_enabled,
        isActive: e.is_active,
        category: e.sub_categories?.categories ?? null,
        subCategory: e.sub_categories ? { id: e.sub_categories.id, name: e.sub_categories.name } : null,
        divisionInstances: (e.event_division_instances || []).map((d: any) => ({
          id: d.id,
          division: d.division,
          status: d.status,
        })),
      }))
    }
  } catch (err) {
    console.warn('Failed to load events:', err)
  }

  return <CategoryFilterPage events={events} />
}
