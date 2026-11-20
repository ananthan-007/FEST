import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth/checkRole'

export async function GET(req: Request) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')

  const adminClient = createAdminClient()
  let query = adminClient
    .from('profiles')
    .select(`
      id,
      email,
      display_name,
      role,
      division,
      ncc_unit,
      institutions (
        id,
        name
      )
    `)
    .limit(20)

  if (search) {
    query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data: users, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(users || [])
}
