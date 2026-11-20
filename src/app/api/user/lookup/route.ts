import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')?.trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ error: 'Email query parameter is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data: profile, error } = await adminClient
      .from('profiles')
      .select('id, display_name, email, division, profile_complete')
      .eq('email', email)
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: profile.id,
      displayName: profile.display_name || profile.email,
      email: profile.email,
      division: profile.division,
      profileComplete: profile.profile_complete,
    })
  } catch (error) {
    console.error('User lookup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
