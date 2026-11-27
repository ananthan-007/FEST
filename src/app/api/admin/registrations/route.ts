import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth/checkRole'

export async function GET(req: Request) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get('category_id')
  const eventId = searchParams.get('event_id')
  const division = searchParams.get('division')
  const paymentStatus = searchParams.get('payment_status')

  const adminClient = createAdminClient()
  let query = adminClient
    .from('registrations')
    .select(`
      id, event_id, leader_id, team_name, participation_type, division, payment_status,
      razorpay_order_id, razorpay_payment_id, created_at,
      events (
        id,
        title,
        subcategory_id,
        sub_categories (
          id,
          name,
          category_id,
          categories (
            id,
            name
          )
        )
      ),
      leader:profiles!registrations_leader_id_fkey (
        id,
        display_name,
        email,
        phone,
        division,
        institutions (
          id,
          name
        )
      ),
      registration_members (
        id,
        user_id,
        role,
        user:profiles!registration_members_user_id_fkey (
          id,
          display_name,
          email
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(500)

  if (eventId) query = query.eq('event_id', eventId)
  if (division) query = query.eq('division', division)
  if (paymentStatus) query = query.eq('payment_status', paymentStatus)

  const { data: registrations, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let result = registrations ?? []

  if (categoryId) {
    result = result.filter(
      (r: any) => r.events?.sub_categories?.category_id === categoryId
    )
  }

  const formatted = result.map((r: any) => {
    const leader = Array.isArray(r.leader) ? r.leader[0] : r.leader
    const membersRaw = Array.isArray(r.registration_members) ? r.registration_members : []
    const members = membersRaw.map((m: any) => {
      const u = Array.isArray(m.user) ? m.user[0] : m.user
      return {
        id: m.id,
        user_id: m.user_id,
        name: u?.display_name || u?.email || 'Cadet',
        email: u?.email || '',
        role: m.role,
      }
    })

    return {
      id: r.id,
      event_id: r.event_id,
      event_title: r.events?.title || 'Untitled Event',
      category_id: r.events?.sub_categories?.category_id ?? null,
      category_name: r.events?.sub_categories?.categories?.name ?? r.events?.sub_categories?.name ?? null,
      cadet_name: leader?.display_name || leader?.email || 'Unknown Cadet',
      cadet_email: leader?.email || '',
      cadet_phone: leader?.phone || '',
      division: r.division,
      participation_type: r.participation_type,
      team_name: r.team_name,
      member_count: members.length || 1,
      payment_status: r.payment_status,
      razorpay_order_id: r.razorpay_order_id,
      institution_name: leader?.institutions?.name || 'No Institution',
      created_at: r.created_at,
      members,
    }
  })

  return NextResponse.json(formatted)
}
