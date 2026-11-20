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
      id, event_id, leader_id, division, payment_status,
      razorpay_order_id, razorpay_payment_id, created_at,
      events (
        id,
        title,
        subcategory_id,
        sub_categories (
          id,
          name,
          category_id
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

  // Push filters to DB — avoid loading all rows into JS then filtering
  if (eventId) query = query.eq('event_id', eventId)
  if (division) query = query.eq('division', division)
  if (paymentStatus) query = query.eq('payment_status', paymentStatus)

  const { data: registrations, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let result = registrations ?? []

  // category_id filter: no Supabase join-filter support, so filter in JS
  // but only after the DB already filtered by event/division/payment
  if (categoryId) {
    result = result.filter(
      (r: any) => r.events?.sub_categories?.category_id === categoryId
    )
  }

  return NextResponse.json(result)
}
