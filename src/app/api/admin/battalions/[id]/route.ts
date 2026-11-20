import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateBattalion, deleteBattalion } from '@/lib/db/institution'

async function adminGuard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { user }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await adminGuard()
  if (guard.error) return guard.error
  const { name } = await request.json()
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  const battalion = await updateBattalion(params.id, name)
  return NextResponse.json(battalion)
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await adminGuard()
  if (guard.error) return guard.error
  await deleteBattalion(params.id)
  return NextResponse.json({ success: true })
}
