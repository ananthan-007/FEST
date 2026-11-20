import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensureQRToken } from '@/lib/qr'

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (secret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex')

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
      }
    }

    const payload = JSON.parse(rawBody)
    const event = payload.event

    if (event === 'payment.captured') {
      const payment = payload.payload?.payment?.entity
      const orderId = payment?.order_id
      const paymentId = payment?.id

      if (orderId) {
        const adminClient = createAdminClient()
        const { data: reg } = await adminClient
          .from('registrations')
          .update({
            payment_status: 'verified',
            razorpay_payment_id: paymentId,
          })
          .eq('razorpay_order_id', orderId)
          .select('leader_id')
          .single()

        if (reg?.leader_id) {
          await ensureQRToken(reg.leader_id)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Razorpay webhook error:', error)
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 })
  }
}
