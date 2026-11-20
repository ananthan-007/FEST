import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'not logged in' }, { status: 401 })

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email, role, display_name')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ user: { id: user.id, email: user.email }, profile, error })
}
