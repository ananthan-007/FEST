import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Use admin client — avoids auth handshake for public read
    const adminClient = createAdminClient()
    const { data: events, error } = await adminClient
      .from('events')
      .select(`
        id, title, description, poster_url, event_date, event_time,
        venue, fee, participation_type, eligible_divisions,
        team_min, team_max, subcategory_id,
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

    if (error) throw error
    return NextResponse.json(events ?? [], {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    })
  } catch (error) {
    console.error('[GET /api/events]', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}
