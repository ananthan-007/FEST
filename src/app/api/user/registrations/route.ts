import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Registrations as leader
    const { data: leaderRegs, error: leaderErr } = await adminClient
      .from('registrations')
      .select(`
        *,
        events (*),
        registration_members (*)
      `)
      .eq('leader_id', user.id)
      .order('created_at', { ascending: false })

    if (leaderErr) throw leaderErr

    // Registrations as member
    const { data: memberRows, error: memberErr } = await adminClient
      .from('registration_members')
      .select(`
        registrations (
          *,
          events (*),
          registration_members (*)
        )
      `)
      .eq('user_id', user.id)

    if (memberErr) throw memberErr

    const registrations: any[] = [...(leaderRegs || [])]

    if (memberRows) {
      for (const row of memberRows) {
        const reg = (row as any).registrations
        if (reg && !registrations.some((r) => r.id === reg.id)) {
          registrations.push(reg)
        }
      }
    }

    return NextResponse.json(registrations)
  } catch (err: any) {
    console.error('[GET /api/user/registrations]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
