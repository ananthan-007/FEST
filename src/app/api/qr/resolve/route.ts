import { NextResponse } from 'next/server'
import { verifyQRToken } from '@/lib/qr'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Role check: Admin or Volunteer only
    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!callerProfile || (callerProfile.role !== 'admin' && callerProfile.role !== 'volunteer')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    let payload: { userId: string }
    try {
      payload = verifyQRToken(token)
    } catch {
      return NextResponse.json({ error: 'Invalid or expired QR token' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Fetch cadet profile
    const { data: cadetProfile, error: profileErr } = await adminClient
      .from('profiles')
      .select(`
        *,
        institutions (
          id,
          name,
          battalions (
            id,
            name,
            ncc_groups (
              id,
              name
            )
          )
        )
      `)
      .eq('id', payload.userId)
      .single()

    if (profileErr || !cadetProfile) {
      return NextResponse.json({ error: 'Cadet profile not found' }, { status: 404 })
    }

    // Registrations as Leader
    const { data: leaderRegs } = await adminClient
      .from('registrations')
      .select(`
        id,
        team_name,
        participation_type,
        payment_status,
        events (
          id,
          title
        ),
        registration_members (
          id
        )
      `)
      .eq('leader_id', payload.userId)

    // Registrations as Member
    const { data: memberRows } = await adminClient
      .from('registration_members')
      .select(`
        registrations (
          id,
          team_name,
          participation_type,
          payment_status,
          events (
            id,
            title
          ),
          registration_members (
            id
          )
        )
      `)
      .eq('user_id', payload.userId)

    const registrations: any[] = []

    if (leaderRegs) {
      for (const reg of leaderRegs) {
        registrations.push({
          registration_id: reg.id,
          event_id: (reg.events as any)?.id,
          event_title: (reg.events as any)?.title,
          participation_type: reg.participation_type,
          payment_status: reg.payment_status,
          is_leader: true,
          team_name: reg.team_name,
          member_count: reg.registration_members?.length || 1,
        })
      }
    }

    if (memberRows) {
      for (const row of memberRows) {
        const reg = (row as any).registrations
        if (reg && !registrations.some((r) => r.registration_id === reg.id)) {
          registrations.push({
            registration_id: reg.id,
            event_id: reg.events?.id,
            event_title: reg.events?.title,
            participation_type: reg.participation_type,
            payment_status: reg.payment_status,
            is_leader: false,
            team_name: reg.team_name,
            member_count: reg.registration_members?.length || 1,
          })
        }
      }
    }

    return NextResponse.json({
      profile: {
        id: cadetProfile.id,
        displayName: cadetProfile.display_name,
        email: cadetProfile.email,
        phone: cadetProfile.phone,
        division: cadetProfile.division,
        nccUnit: cadetProfile.ncc_unit,
        photoUrl: cadetProfile.photo_url,
        institutionName: cadetProfile.institutions?.name,
        battalionName: cadetProfile.institutions?.battalions?.name,
        groupName: cadetProfile.institutions?.battalions?.ncc_groups?.name,
      },
      registrations,
    })
  } catch (err: any) {
    console.error('QR resolve error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
