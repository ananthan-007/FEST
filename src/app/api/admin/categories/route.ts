import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdmin } from '@/lib/auth/checkRole'

// Only select fields needed by the UI — avoids fetching blob columns
export async function GET() {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const adminClient = createAdminClient()
  const { data: categories, error } = await adminClient
    .from('categories')
    .select('id, name, sub_categories(id, name)')
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(categories ?? [], {
    headers: {
      'Cache-Control': 'no-cache, no-store',
    },
  })
}

export async function POST(req: Request) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { name } = body
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('categories')
    .insert({ name })
    .select('id, name')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
