import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth/checkRole'


export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const adminClient = createAdminClient()

  const { data: event, error } = await adminClient
    .from('events')
    .select(`
      *,
      sub_categories (*),
      event_division_instances (*),
      prize_pool_groups (*)
    `)
    .eq('id', id)
    .single()

  if (error || !event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  return NextResponse.json(event)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const {
    title,
    description,
    poster_url,
    rules_content,
    event_date,
    event_time,
    venue,
    fee,
    participation_type,
    eligible_divisions,
    team_min,
    team_max,
    team_fixed,
    institution_restriction,
    conflict_alert_enabled,
    sub_category_id,
  } = body

  const adminClient = createAdminClient()

  const updateData: any = {}
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description
  if (poster_url !== undefined) updateData.poster_url = poster_url
  if (rules_content !== undefined) updateData.rules_content = rules_content
  if (event_date !== undefined) updateData.event_date = event_date || null
  if (event_time !== undefined) updateData.event_time = event_time || null
  if (venue !== undefined) updateData.venue = venue
  if (fee !== undefined) updateData.fee = fee
  if (participation_type !== undefined) updateData.participation_type = participation_type
  if (team_min !== undefined) updateData.team_min = team_min ? parseInt(team_min, 10) : null
  if (team_max !== undefined) updateData.team_max = team_max ? parseInt(team_max, 10) : null
  if (team_fixed !== undefined) updateData.team_fixed = !!team_fixed
  if (institution_restriction !== undefined) {
    const mapped =
      institution_restriction === 'one_per_institution'
        ? 'per_institution'
        : institution_restriction === 'one_per_institution_per_division'
        ? 'per_division'
        : ['none', 'per_institution', 'per_division'].includes(institution_restriction)
        ? institution_restriction
        : 'none'
    updateData.institution_restriction = mapped
  }
  if (conflict_alert_enabled !== undefined) updateData.conflict_alert_enabled = !!conflict_alert_enabled
  if (sub_category_id !== undefined) updateData.subcategory_id = sub_category_id
  if (eligible_divisions !== undefined) updateData.eligible_divisions = eligible_divisions

  const { data: updatedEvent, error } = await adminClient
    .from('events')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-sync division instances if eligible_divisions was provided
  if (Array.isArray(eligible_divisions)) {
    const { data: existingInstances } = await adminClient
      .from('event_division_instances')
      .select('*')
      .eq('event_id', id)

    const existingDivMap = new Map((existingInstances || []).map((inst: any) => [inst.division, inst]))

    for (const div of eligible_divisions) {
      if (existingDivMap.has(div)) {
        const inst = existingDivMap.get(div)
        if (inst.status === 'cancelled') {
          await adminClient.from('event_division_instances').update({ status: 'active' }).eq('id', inst.id)
        }
      } else {
        await adminClient.from('event_division_instances').insert({
          event_id: id,
          division: div,
          status: 'active',
        })
      }
    }

    // Cancel removed divisions
    Array.from(existingDivMap.entries()).forEach(([div, inst]: [string, any]) => {
      if (!eligible_divisions.includes(div) && inst.status !== 'cancelled') {
        adminClient.from('event_division_instances').update({ status: 'cancelled' }).eq('id', inst.id)
      }
    })
  }

  return NextResponse.json(updatedEvent)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const adminClient = createAdminClient()

  const { count } = await adminClient
    .from('registrations')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', id)

  if (count && count > 0) {
    // Soft-delete if registrations exist
    await adminClient.from('events').update({ is_active: false }).eq('id', id)
    return NextResponse.json({ success: true, softDeleted: true })
  }

  const { error } = await adminClient.from('events').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
