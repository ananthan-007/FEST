import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth/checkRole'
import Razorpay from 'razorpay'

export async function POST(req: Request) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { registration_id } = await req.json()
  if (!registration_id) {
    return NextResponse.json({ error: 'registration_id is required' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const { data: reg, error: regError } = await adminClient
    .from('registrations')
    .select('id, razorpay_order_id, payment_status, leader_id')
    .eq('id', registration_id)
    .single()

  if (regError || !reg) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
  }

  if (reg.payment_status === 'verified') {
    return NextResponse.json({ success: true, message: 'Already verified' })
  }

  if (!reg.razorpay_order_id) {
    return NextResponse.json({ error: 'No Razorpay order ID associated with registration' }, { status: 400 })
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy',
    })

    const payments = await razorpay.orders.fetchPayments(reg.razorpay_order_id)
    const captured = payments.items.find((p: any) => p.status === 'captured')

    if (!captured) {
      return NextResponse.json({ error: 'No captured payment found in Razorpay' }, { status: 400 })
    }

    await adminClient
      .from('registrations')
      .update({
        payment_status: 'verified',
        razorpay_payment_id: captured.id,
      })
      .eq('id', registration_id)

    return NextResponse.json({ success: true, payment_status: 'verified' })
  } catch (err: any) {
    console.error('Failed to verify payment via Razorpay:', err)
    return NextResponse.json({ error: err.message || 'Payment verification failed' }, { status: 500 })
  }
}
