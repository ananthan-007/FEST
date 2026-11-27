import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensureQRToken } from '@/lib/qr'
import Razorpay from 'razorpay'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // 1. Fetch user profile
    const { data: profile, error: profileErr } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // 2. Profile completion gate
    if (!profile.profile_complete) {
      return NextResponse.json(
        { error: 'Profile incomplete. Please complete your profile before registering.', redirect: '/dashboard/profile' },
        { status: 422 }
      )
    }

    const body = await req.json()
    const { event_id, team_name, member_emails, force_conflict } = body

    if (!event_id) {
      return NextResponse.json({ error: 'event_id is required' }, { status: 400 })
    }

    // 3. Fetch event
    const { data: event, error: eventErr } = await adminClient
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single()

    if (eventErr || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.is_active === false) {
      return NextResponse.json({ error: 'Registration for this event is currently closed.' }, { status: 422 })
    }

    // 4. Fest-wide deadline enforcement
    const { data: setting } = await adminClient
      .from('app_settings')
      .select('value')
      .eq('key', 'registration_deadline')
      .single()

    if (setting?.value) {
      const deadline = new Date(setting.value)
      if (new Date() > deadline) {
        return NextResponse.json({ error: 'Registration deadline for the fest has passed.' }, { status: 422 })
      }
    }

    // 5. Division eligibility
    const eligibleDivs: string[] = event.eligible_divisions || []
    if (!profile.division || !eligibleDivs.includes(profile.division)) {
      return NextResponse.json(
        { error: `Cadet division (${profile.division}) is not eligible for this event.` },
        { status: 422 }
      )
    }

    // 6. Duplicate registration check (as leader or member)
    const { data: existingLeader } = await adminClient
      .from('registrations')
      .select('id, payment_status, razorpay_order_id')
      .eq('event_id', event_id)
      .eq('leader_id', user.id)
      .neq('payment_status', 'failed')
      .maybeSingle()

    if (existingLeader) {
      // If payment is already verified, block re-registration
      if (existingLeader.payment_status === 'verified') {
        return NextResponse.json({ error: 'You are already registered for this event.' }, { status: 409 })
      }

      // If payment is still pending, resume the existing registration
      const fee = Number(event.fee ?? 0)
      if (fee <= 0) {
        // Free event — just verify it
        await adminClient.from('registrations').update({ payment_status: 'verified' }).eq('id', existingLeader.id)
        const token = await ensureQRToken(user.id)
        return NextResponse.json({
          success: true,
          registration_id: existingLeader.id,
          payment_status: 'verified',
          qr_token: token,
        })
      }

      // Paid event: return existing or create new Razorpay order
      let orderId = existingLeader.razorpay_order_id
      let orderAmount: number | undefined
      let orderCurrency = 'INR'

      if (orderId) {
        // Try to fetch order details from Razorpay to get amount
        try {
          const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'dummy',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy',
          })
          const existing = await razorpay.orders.fetch(orderId)
          orderAmount = Number(existing.amount)
          orderCurrency = String(existing.currency)
        } catch {
          // Razorpay fetch failed; create a new order below
          orderId = null
        }
      }

      if (!orderId) {
        // Create a fresh Razorpay order
        try {
          const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'dummy',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy',
          })
          const order = await razorpay.orders.create({
            amount: Math.round(fee * 100),
            currency: 'INR',
            receipt: existingLeader.id.substring(0, 40),
          })
          orderId = order.id
          orderAmount = Number(order.amount)
          orderCurrency = String(order.currency)
          await adminClient.from('registrations').update({ razorpay_order_id: orderId }).eq('id', existingLeader.id)
        } catch {
          return NextResponse.json({
            success: true,
            registration_id: existingLeader.id,
            payment_status: 'pending',
          })
        }
      }

      return NextResponse.json({
        success: true,
        registration_id: existingLeader.id,
        payment_status: 'pending',
        razorpay_order_id: orderId,
        amount: orderAmount ?? Math.round(fee * 100),
        currency: orderCurrency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        already_registered: true,
      })
    }

    const { data: existingMember } = await adminClient
      .from('registration_members')
      .select('id, registrations!inner(event_id, payment_status)')
      .eq('user_id', user.id)
      .eq('registrations.event_id', event_id)
      .neq('registrations.payment_status', 'failed')
      .maybeSingle()

    if (existingMember) {
      return NextResponse.json({ error: 'You are already registered as a team member for this event.' }, { status: 409 })
    }

    // 7. Conflict Alert Stage 2: Parallel Event Conflict Check
    if (!force_conflict) {
      const { data: parallelLinks } = await adminClient
        .from('parallel_event_links')
        .select('event_a_id, event_b_id')
        .or(`event_a_id.eq.${event_id},event_b_id.eq.${event_id}`)

      const linkedEventIds: string[] = []
      for (const link of parallelLinks || []) {
        linkedEventIds.push(link.event_a_id === event_id ? link.event_b_id : link.event_a_id)
      }

      if (linkedEventIds.length > 0) {
        // Check leader registrations
        const { data: conflictingLeaderRegs } = await adminClient
          .from('registrations')
          .select('event_id, events(id, title)')
          .eq('leader_id', user.id)
          .in('event_id', linkedEventIds)
          .neq('payment_status', 'failed')

        // Check member registrations
        const { data: conflictingMemberRows } = await adminClient
          .from('registration_members')
          .select('registrations!inner(event_id, payment_status, events(id, title))')
          .eq('user_id', user.id)
          .in('registrations.event_id', linkedEventIds)
          .neq('registrations.payment_status', 'failed')

        const conflicts: { id: string; title: string }[] = []

        if (conflictingLeaderRegs) {
          for (const reg of conflictingLeaderRegs) {
            conflicts.push({ id: reg.event_id, title: (reg.events as any)?.title || 'Parallel Event' })
          }
        }

        if (conflictingMemberRows) {
          for (const row of conflictingMemberRows) {
            const reg = (row as any).registrations
            if (reg && !conflicts.some((c) => c.id === reg.event_id)) {
              conflicts.push({ id: reg.event_id, title: reg.events?.title || 'Parallel Event' })
            }
          }
        }

        if (conflicts.length > 0) {
          return NextResponse.json(
            {
              conflict: true,
              conflicting_events: conflicts,
              message: 'Scheduling conflict detected with existing registrations.',
            },
            { status: 409 }
          )
        }
      }
    }

    // 8. Validate team members if team event
    const memberProfiles: { id: string; email: string; displayName: string }[] = []
    if (event.participation_type === 'team') {
      const emails: string[] = Array.isArray(member_emails)
        ? member_emails.map((e: string) => e.trim().toLowerCase()).filter(Boolean)
        : []

      const minMembers = (event.team_min || 1) - 1 // leader is member 1
      const maxMembers = (event.team_max || 100) - 1

      if (emails.length < minMembers) {
        return NextResponse.json(
          { error: `Team must have at least ${event.team_min} members including leader.` },
          { status: 400 }
        )
      }

      if (emails.length > maxMembers) {
        return NextResponse.json(
          { error: `Team cannot exceed ${event.team_max} members including leader.` },
          { status: 400 }
        )
      }

      for (const email of emails) {
        if (email === profile.email.toLowerCase()) {
          return NextResponse.json({ error: 'Do not add yourself as an additional team member.' }, { status: 400 })
        }

        const { data: memberProfile } = await adminClient
          .from('profiles')
          .select('id, email, display_name')
          .eq('email', email)
          .single()

        if (!memberProfile) {
          return NextResponse.json({ error: `Member email not found: ${email}` }, { status: 400 })
        }

        memberProfiles.push({
          id: memberProfile.id,
          email: memberProfile.email,
          displayName: memberProfile.display_name || memberProfile.email,
        })
      }
    }

    // 9. Insert registration (triggers check_institution_restriction on public.registrations)
    const { data: newReg, error: insertError } = await adminClient
      .from('registrations')
      .insert({
        event_id,
        leader_id: user.id,
        team_name: event.participation_type === 'team' ? team_name || 'Team' : null,
        participation_type: event.participation_type,
        division: profile.division,
        institution_id: profile.institution_id,
        payment_status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      if (insertError.message.includes('INSTITUTION_LIMIT_EXCEEDED')) {
        return NextResponse.json(
          { error: 'Institution limit reached: only 1 team per institution is permitted for this event.' },
          { status: 409 }
        )
      }
      if (insertError.message.includes('INSTITUTION_DIVISION_LIMIT_EXCEEDED')) {
        return NextResponse.json(
          { error: `Institution limit reached: only 1 team per institution in ${profile.division} is permitted.` },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    // 10. Lock division after first registration
    if (!profile.division_locked) {
      await adminClient.from('profiles').update({ division_locked: true }).eq('id', user.id)
    }

    // 11. Insert team members
    const memberInserts = [
      { registration_id: newReg.id, user_id: user.id, role: 'leader' },
      ...memberProfiles.map((m) => ({
        registration_id: newReg.id,
        user_id: m.id,
        role: 'member',
      })),
    ]

    await adminClient.from('registration_members').insert(memberInserts)

    // 12. Handle payment / QR token
    const fee = Number(event.fee ?? 0)

    if (fee <= 0) {
      // Free event: instantly verify
      await adminClient.from('registrations').update({ payment_status: 'verified' }).eq('id', newReg.id)
      const token = await ensureQRToken(user.id)
      return NextResponse.json({
        success: true,
        registration_id: newReg.id,
        payment_status: 'verified',
        qr_token: token,
      })
    }

    // Paid event: create Razorpay order
    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'dummy',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy',
      })

      const order = await razorpay.orders.create({
        amount: Math.round(fee * 100),
        currency: 'INR',
        receipt: newReg.id.substring(0, 40),
      })

      await adminClient.from('registrations').update({ razorpay_order_id: order.id }).eq('id', newReg.id)

      return NextResponse.json({
        success: true,
        registration_id: newReg.id,
        payment_status: 'pending',
        razorpay_order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      })
    } catch {
      return NextResponse.json({
        success: true,
        registration_id: newReg.id,
        payment_status: 'pending',
      })
    }
  } catch (err: any) {
    console.error('Registration error:', err)
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 })
  }
}
