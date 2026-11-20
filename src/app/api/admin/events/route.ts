import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth/checkRole'

export async function GET() {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const adminClient = createAdminClient()
  // Select only the fields needed by the admin events list UI
  const { data: events, error } = await adminClient
    .from('events')
    .select(`
      id, title, description, poster_url, event_date, event_time,
      venue, fee, participation_type, eligible_divisions,
      team_min, team_max, team_fixed, institution_restriction,
      conflict_alert_enabled, subcategory_id, created_at,
      sub_categories (
        id,
        name,
        categories (
          id,
          name
        )
      ),
      event_division_instances (id, division, status),
      prize_pool_groups (id, name, divisions, prize_1st, prize_2nd, prize_3rd),
      registrations (count)
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(events ?? [], {
    headers: { 'Cache-Control': 'private, max-age=10, stale-while-revalidate=30' },
  })
}

export async function POST(req: Request) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const {
    title, description, poster_url, rules_content,
    event_date, event_time, venue, fee, participation_type,
    eligible_divisions, team_min, team_max, team_fixed,
    institution_restriction, conflict_alert_enabled,
    sub_category_id, prize_pools,
  } = body

  if (!title || !participation_type) {
    return NextResponse.json(
      { error: 'Title and participation_type are required' },
      { status: 400 }
    )
  }

  const adminClient = createAdminClient()

  const mappedRestriction =
    institution_restriction === 'one_per_institution'
      ? 'per_institution'
      : institution_restriction === 'one_per_institution_per_division'
      ? 'per_division'
      : ['none', 'per_institution', 'per_division'].includes(institution_restriction)
      ? institution_restriction
      : 'none'

  const { data: event, error: eventError } = await adminClient
    .from('events')
    .insert({
      title, description, poster_url, rules_content,
      event_date: event_date || null,
      event_time: event_time || null,
      venue,
      fee: fee ?? 0,
      participation_type,
      eligible_divisions: eligible_divisions || [],
      team_min: team_min ? parseInt(team_min, 10) : null,
      team_max: team_max ? parseInt(team_max, 10) : null,
      team_fixed: !!team_fixed,
      institution_restriction: mappedRestriction,
      conflict_alert_enabled: !!conflict_alert_enabled,
      subcategory_id: sub_category_id,
    })
    .select('id, title, created_at')
    .single()

  if (eventError) return NextResponse.json({ error: eventError.message }, { status: 500 })

  // Auto-create division instances
  if (Array.isArray(eligible_divisions) && eligible_divisions.length > 0) {
    const instances = eligible_divisions.map((div: string) => ({
      event_id: event.id,
      division: div,
      status: 'active',
    }))
    await adminClient.from('event_division_instances').insert(instances)
  }

  // Create prize pools if provided
  if (Array.isArray(prize_pools) && prize_pools.length > 0) {
    const pps = prize_pools.map((p: Record<string, unknown>) => ({
      event_id: event.id,
      name: p.label || p.name,
      divisions: p.divisions || [],
      prize_1st: p.first_prize ?? p.prize_1st ?? null,
      prize_2nd: p.second_prize ?? p.prize_2nd ?? null,
      prize_3rd: p.third_prize ?? p.prize_3rd ?? null,
    }))
    await adminClient.from('prize_pool_groups').insert(pps)
  }

  return NextResponse.json(event)
}
