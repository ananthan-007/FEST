import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Razorpay from 'razorpay'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { registration_id } = await req.json()
    if (!registration_id) {
      return NextResponse.json({ error: 'registration_id is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data: reg, error: regError } = await adminClient
      .from('registrations')
      .select('id, leader_id, payment_status, events (id, fee)')
      .eq('id', registration_id)
      .single()

    if (regError || !reg) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    if (reg.leader_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: only team leader can initiate payment' }, { status: 403 })
    }

    const fee = Number((reg.events as any)?.fee ?? 0)
    if (fee <= 0) {
      return NextResponse.json({ error: 'This registration is free' }, { status: 400 })
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy',
    })

    const order = await razorpay.orders.create({
      amount: Math.round(fee * 100),
      currency: 'INR',
      receipt: registration_id.substring(0, 40),
    })

    await adminClient
      .from('registrations')
      .update({ razorpay_order_id: order.id })
      .eq('id', registration_id)

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
    })
  } catch (error: any) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create payment order' }, { status: 500 })
  }
}
