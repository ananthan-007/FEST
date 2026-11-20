import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const adminClient = createAdminClient()

    const { data: event, error } = await adminClient
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
        prize_pool_groups (*),
        parallel_event_links_a:parallel_event_links!parallel_event_links_event_a_id_fkey (*),
        parallel_event_links_b:parallel_event_links!parallel_event_links_event_b_id_fkey (*)
      `)
      .eq('id', id)
      .single()

    if (error || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...event,
      participationType: event.participation_type,
      eligibleDivisions: event.eligible_divisions,
      institutionRestriction: event.institution_restriction,
      teamMin: event.team_min,
      teamMax: event.team_max,
      conflictAlertEnabled: event.conflict_alert_enabled,
    })
  } catch (error) {
    console.error('[GET /api/events/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}
